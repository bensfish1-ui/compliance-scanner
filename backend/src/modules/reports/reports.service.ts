import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import { createObjectCsvStringifier } from 'csv-writer';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const s3Endpoint = this.configService.get<string>('aws.s3.endpoint');
    this.s3Client = new S3Client({
      region: this.configService.get<string>('aws.region', 'eu-west-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId', ''),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey', ''),
      },
      ...(s3Endpoint ? { endpoint: s3Endpoint, forcePathStyle: true } : {}),
    });
    this.bucket = this.configService.get<string>('aws.s3.bucket', 'compliance-scanner-documents');
  }

  async generateBoardReport(): Promise<{ downloadUrl: string; fileName: string }> {
    const [summary, maturity, topRisks, upcomingRegs] = await Promise.all([
      this.getDashboardSummary(),
      this.getMaturityData(),
      this.getTopRisksData(),
      this.getUpcomingRegulationsData(),
    ]);

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(24).text('Compliance Board Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${format(new Date(), 'dd MMMM yyyy')}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(16).text('Executive Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Total Regulations: ${summary.regulations.total} (${summary.regulations.active} active)`);
    doc.text(`Active Projects: ${summary.projects.active} of ${summary.projects.total}`);
    doc.text(`Overdue Tasks: ${summary.tasks.overdue} of ${summary.tasks.total}`);
    doc.text(`Open Audits: ${summary.audits.open}`);
    doc.text(`Open Risks: ${summary.risks.open} (${summary.risks.critical} critical)`);
    doc.moveDown();

    doc.fontSize(16).text('Compliance Maturity', { underline: true });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Overall Score: ${maturity.overallScore}/100 (${maturity.level})`);
    doc.text(`Control Effectiveness: ${maturity.breakdown.controlEffectiveness}%`);
    doc.text(`Obligation Compliance: ${maturity.breakdown.obligationCompliance}%`);
    doc.text(`Risk Mitigation: ${maturity.breakdown.riskMitigation}%`);
    doc.text(`Policy Currency: ${maturity.breakdown.policyCurrency}%`);
    doc.text(`Audit Readiness: ${maturity.breakdown.auditReadiness}%`);
    doc.moveDown();

    doc.fontSize(16).text('Top 10 Risks', { underline: true });
    doc.moveDown();
    doc.fontSize(10);
    for (const risk of topRisks) {
      doc.text(`[Score: ${risk.inherentScore}] ${risk.title} - ${risk.status}`);
    }
    doc.moveDown();

    doc.fontSize(16).text('Upcoming Regulation Deadlines', { underline: true });
    doc.moveDown();
    doc.fontSize(10);
    for (const reg of upcomingRegs) {
      const deadline = reg.enforcementDate
        ? format(new Date(reg.enforcementDate), 'dd MMM yyyy')
        : 'No deadline';
      doc.text(`${reg.title} (Deadline: ${deadline})`);
    }

    doc.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return this.uploadReport(buffer, 'board-report', 'application/pdf', 'pdf');
  }

  async generateMonthlyReport(): Promise<{ downloadUrl: string; fileName: string }> {
    const [regulations, tasks, risks, audits] = await Promise.all([
      this.prisma.regulation.findMany({
        where: { isArchived: false },
        select: {
          title: true, slug: true, status: true, impactLevel: true,
          lifecycleStage: true, enforcementDate: true,
          country: { select: { name: true } },
        },
        orderBy: { enforcementDate: 'asc' },
      }),
      this.prisma.task.findMany({
        select: {
          title: true, status: true, priority: true, dueDate: true,
          project: { select: { title: true } },
          assignee: { select: { name: true } },
        },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.risk.findMany({
        where: { isActive: true },
        select: {
          title: true, categoryId: true, status: true, likelihood: true,
          consequence: true, inherentScore: true,
          owner: { select: { name: true } },
        },
        orderBy: { inherentScore: 'desc' },
      }),
      this.prisma.audit.findMany({
        select: {
          title: true, type: true, status: true, startDate: true, endDate: true,
          readinessScore: true,
        },
        orderBy: { startDate: 'desc' },
      }),
    ]);

    const workbook = XLSX.utils.book_new();

    const regData = regulations.map((r: any) => ({
      'Slug': r.slug,
      'Title': r.title,
      'Status': r.status,
      'Impact': r.impactLevel,
      'Stage': r.lifecycleStage,
      'Country': r.country?.name || '',
      'Deadline': r.enforcementDate ? format(new Date(r.enforcementDate), 'yyyy-MM-dd') : '',
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(regData), 'Regulations');

    const taskData = tasks.map((t: any) => ({
      'Title': t.title,
      'Project': t.project?.title || '',
      'Status': t.status,
      'Priority': t.priority,
      'Assignee': t.assignee?.name || '',
      'Due Date': t.dueDate ? format(new Date(t.dueDate), 'yyyy-MM-dd') : '',
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(taskData), 'Tasks');

    const riskData = risks.map((r: any) => ({
      'Title': r.title,
      'Category': r.categoryId,
      'Status': r.status,
      'Likelihood': r.likelihood,
      'Consequence': r.consequence,
      'Score': r.inherentScore,
      'Owner': r.owner?.name || '',
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(riskData), 'Risks');

    const auditData = audits.map((a: any) => ({
      'Title': a.title,
      'Type': a.type,
      'Status': a.status,
      'Start Date': a.startDate ? format(new Date(a.startDate), 'yyyy-MM-dd') : '',
      'End Date': a.endDate ? format(new Date(a.endDate), 'yyyy-MM-dd') : '',
      'Readiness Score': a.readinessScore || '',
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(auditData), 'Audits');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return this.uploadReport(
      buffer,
      'monthly-compliance-report',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xlsx',
    );
  }

  async generateCsvExport(entityType: string): Promise<{ downloadUrl: string; fileName: string }> {
    let data: any[] = [];
    let headers: Array<{ id: string; title: string }> = [];

    switch (entityType) {
      case 'regulations':
        data = await this.prisma.regulation.findMany({
          where: { isArchived: false },
          include: { country: true, regulator: true },
        });
        headers = [
          { id: 'slug', title: 'Slug' },
          { id: 'title', title: 'Title' },
          { id: 'status', title: 'Status' },
          { id: 'impactLevel', title: 'Impact Level' },
          { id: 'lifecycleStage', title: 'Lifecycle Stage' },
        ];
        break;

      case 'tasks':
        data = await this.prisma.task.findMany({
          include: { project: true, assignee: true },
        });
        headers = [
          { id: 'title', title: 'Title' },
          { id: 'status', title: 'Status' },
          { id: 'priority', title: 'Priority' },
        ];
        break;

      case 'risks':
        data = await this.prisma.risk.findMany({
          where: { isActive: true },
          include: { owner: true },
        });
        headers = [
          { id: 'title', title: 'Title' },
          { id: 'categoryId', title: 'Category' },
          { id: 'status', title: 'Status' },
          { id: 'likelihood', title: 'Likelihood' },
          { id: 'consequence', title: 'Consequence' },
          { id: 'inherentScore', title: 'Score' },
        ];
        break;

      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    const csvStringifier = createObjectCsvStringifier({ header: headers });
    const csvContent =
      csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);

    const buffer = Buffer.from(csvContent, 'utf-8');
    return this.uploadReport(buffer, `${entityType}-export`, 'text/csv', 'csv');
  }

  async generateCountryReport(countryId: string): Promise<{ downloadUrl: string; fileName: string }> {
    const country = await this.prisma.country.findUnique({ where: { id: countryId } });
    const regulations = await this.prisma.regulation.findMany({
      where: { countryId, isArchived: false },
      include: {
        obligations: true,
        projects: true,
      },
    });

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(20).text(`Compliance Report: ${country?.name || 'Unknown Country'}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Generated: ${format(new Date(), 'dd MMMM yyyy')}`);
    doc.moveDown(2);

    doc.fontSize(14).text(`Total Regulations: ${regulations.length}`);
    doc.moveDown();

    for (const reg of regulations) {
      doc.fontSize(12).text(`${reg.slug} - ${reg.title}`, { underline: true });
      doc.fontSize(10).text(`Status: ${reg.status} | Impact: ${reg.impactLevel} | Stage: ${reg.lifecycleStage}`);
      doc.text(`Obligations: ${reg.obligations?.length || 0} | Projects: ${reg.projects?.length || 0}`);
      doc.moveDown();
    }

    doc.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return this.uploadReport(buffer, `country-report-${country?.code || countryId}`, 'application/pdf', 'pdf');
  }

  async generateAuditReadinessReport(auditId: string): Promise<{ downloadUrl: string; fileName: string }> {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        findings: { include: { capas: true } },
        regulation: true,
        leadAuditor: true,
      },
    });

    if (!audit) throw new Error('Audit not found');

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(20).text(`Audit Readiness Report: ${audit.title}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Type: ${audit.type}`);
    doc.text(`Lead Auditor: ${audit.leadAuditor?.name || 'Unassigned'}`);
    doc.text(`Status: ${audit.status}`);
    doc.text(`Readiness Score: ${audit.readinessScore || 'Not calculated'}%`);
    doc.moveDown();

    doc.fontSize(14).text('Findings Summary', { underline: true });
    doc.moveDown();

    const findings = audit.findings || [];
    doc.fontSize(11).text(`Total Findings: ${findings.length}`);
    doc.text(`Open: ${findings.filter((f: any) => f.status === 'OPEN').length}`);
    doc.text(`Remediated: ${findings.filter((f: any) => f.status === 'REMEDIATED' || f.status === 'CLOSED').length}`);
    doc.moveDown();

    for (const finding of findings) {
      doc.fontSize(11).text(`[${finding.severity}] ${finding.title}`, { underline: true });
      doc.fontSize(10).text(`Status: ${finding.status}`);
      if (finding.description) doc.text(`Description: ${finding.description}`);
      const capas = (finding as any).capas || [];
      if (capas.length > 0) {
        doc.text(`CAPAs: ${capas.length}`);
      }
      doc.moveDown(0.5);
    }

    doc.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    return this.uploadReport(buffer, `audit-readiness-${auditId}`, 'application/pdf', 'pdf');
  }

  // ────────── Helpers ──────────

  private async uploadReport(
    buffer: Buffer,
    filePrefix: string,
    contentType: string,
    extension: string,
  ): Promise<{ downloadUrl: string; fileName: string }> {
    const fileName = `${filePrefix}-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.${extension}`;
    const s3Key = `reports/${uuidv4()}/${fileName}`;

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
    }));

    const downloadUrl = await getSignedUrl(
      this.s3Client,
      new GetObjectCommand({ Bucket: this.bucket, Key: s3Key }),
      { expiresIn: 3600 },
    );

    return { downloadUrl, fileName };
  }

  private async getDashboardSummary() {
    const now = new Date();
    const [totalReg, activeReg, totalProj, activeProj, overdueTasks, totalTasks, openAudits, openRisks, critRisks] = await Promise.all([
      this.prisma.regulation.count({ where: { isArchived: false } }),
      this.prisma.regulation.count({ where: { isArchived: false, status: { in: ['ENACTED', 'EFFECTIVE'] } } }),
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] }, dueDate: { lt: now } } }),
      this.prisma.task.count(),
      this.prisma.audit.count({ where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } } }),
      this.prisma.risk.count({ where: { isActive: true } }),
      this.prisma.risk.count({ where: { isActive: true, inherentScore: { gte: 20 } } }),
    ]);
    return {
      regulations: { total: totalReg, active: activeReg },
      projects: { total: totalProj, active: activeProj },
      tasks: { total: totalTasks, overdue: overdueTasks },
      audits: { open: openAudits },
      risks: { open: openRisks, critical: critRisks },
    };
  }

  private async getMaturityData() {
    return {
      overallScore: 65,
      level: 'MANAGED',
      breakdown: {
        controlEffectiveness: 70,
        obligationCompliance: 60,
        riskMitigation: 55,
        policyCurrency: 80,
        auditReadiness: 60,
      },
    };
  }

  private async getTopRisksData() {
    return this.prisma.risk.findMany({
      where: { isActive: true },
      select: { title: true, categoryId: true, inherentScore: true, status: true },
      orderBy: { inherentScore: 'desc' },
      take: 10,
    });
  }

  private async getUpcomingRegulationsData() {
    return this.prisma.regulation.findMany({
      where: {
        isArchived: false,
        enforcementDate: { gte: new Date(), lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
      },
      select: { title: true, enforcementDate: true },
      orderBy: { enforcementDate: 'asc' },
    });
  }
}
