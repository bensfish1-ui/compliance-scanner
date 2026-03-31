import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditDto, CreateFindingDto, CreateCAPADto } from './dto/create-audit.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuditsService {
  private readonly logger = new Logger(AuditsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ────────── Audit CRUD ──────────

  async create(dto: CreateAuditDto, user: AuthenticatedUser) {
    const audit = await this.prisma.audit.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type as unknown as AuditType,
        status: dto.status as any,
        leadAuditorId: dto.leadAuditorId!,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        readinessScore: dto.readinessScore,
        isRecurring: !!dto.recurrenceRule,
        recurringPattern: dto.recurrenceRule ? { rule: dto.recurrenceRule } : undefined,
        ...(dto.regulationIds && dto.regulationIds.length > 0
          ? { regulationId: dto.regulationIds[0] }
          : {}),
      },
      include: { leadAuditor: true, regulation: true },
    });

    this.eventEmitter.emit('audit.created', { audit, userId: user.sub });
    return audit;
  }

  async findAll(query: PaginationQueryDto) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.audit.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { createdAt: 'desc' },
        include: {
          leadAuditor: { select: { id: true, name: true } },
          _count: { select: { findings: true } },
        },
      }),
      this.prisma.audit.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { id },
      include: {
        leadAuditor: true,
        regulation: true,
        findings: {
          include: {
            owner: { select: { id: true, name: true } },
            capas: true,
          },
          orderBy: { severity: 'desc' },
        },
      },
    });
    if (!audit) throw new NotFoundException(`Audit ${id} not found`);
    return audit;
  }

  async update(id: string, dto: Partial<CreateAuditDto>, user: AuthenticatedUser) {
    await this.findOne(id);
    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.leadAuditorId !== undefined) data.leadAuditorId = dto.leadAuditorId;
    if (dto.readinessScore !== undefined) data.readinessScore = dto.readinessScore;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.recurrenceRule !== undefined) {
      data.recurringPattern = dto.recurrenceRule ? { rule: dto.recurrenceRule } : null;
    }
    return this.prisma.audit.update({
      where: { id },
      data,
      include: { leadAuditor: true, regulation: true },
    });
  }

  async delete(id: string, _user: AuthenticatedUser) {
    await this.findOne(id);
    return this.prisma.audit.delete({
      where: { id },
    });
  }

  // ────────── Findings CRUD ──────────

  async createFinding(auditId: string, dto: CreateFindingDto, _user: AuthenticatedUser) {
    await this.findOne(auditId);

    return this.prisma.finding.create({
      data: {
        auditId,
        title: dto.title,
        description: dto.description,
        severity: dto.severity as any,
        status: dto.status as any,
        recommendation: dto.recommendation,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        ownerId: dto.ownerId,
      },
      include: { owner: true },
    });
  }

  async updateFinding(findingId: string, dto: Partial<CreateFindingDto>, _user: AuthenticatedUser) {
    return this.prisma.finding.update({
      where: { id: findingId },
      data: {
        ...dto,
        severity: dto.severity as any,
        status: dto.status as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async deleteFinding(findingId: string, _user: AuthenticatedUser) {
    return this.prisma.finding.delete({
      where: { id: findingId },
    });
  }

  // ────────── CAPA CRUD ──────────

  async createCAPA(findingId: string, dto: CreateCAPADto, _user: AuthenticatedUser) {
    return this.prisma.cAPA.create({
      data: {
        findingId,
        title: dto.title,
        description: dto.description,
        type: dto.isCorrective === false ? 'PREVENTIVE' : 'CORRECTIVE',
        status: dto.status as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        ownerId: dto.ownerId!,
      },
    });
  }

  async updateCAPA(capaId: string, dto: Partial<CreateCAPADto>, _user: AuthenticatedUser) {
    const { isCorrective, ...rest } = dto;
    return this.prisma.cAPA.update({
      where: { id: capaId },
      data: {
        ...rest,
        status: rest.status as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        ...(isCorrective !== undefined ? { type: isCorrective ? 'CORRECTIVE' as const : 'PREVENTIVE' as const } : {}),
      },
    });
  }

  async deleteCAPA(capaId: string, _user: AuthenticatedUser) {
    return this.prisma.cAPA.delete({
      where: { id: capaId },
    });
  }

  // ────────── Readiness Score Calculation ──────────

  async calculateReadinessScore(auditId: string) {
    const audit = await this.findOne(auditId);

    const findings = audit.findings || [];
    const totalFindings = findings.length;
    const closedFindings = findings.filter(
      (f: any) => f.status === 'CLOSED' || f.status === 'REMEDIATED',
    ).length;

    const evidenceCoverage = totalFindings > 0
      ? (closedFindings / totalFindings) * 100
      : 100;

    const findingResolutionRate = totalFindings > 0
      ? (closedFindings / totalFindings) * 100
      : 100;

    const score = Math.round(
      evidenceCoverage * 0.4 +
      findingResolutionRate * 0.3 +
      80 * 0.2 +
      90 * 0.1
    );

    await this.prisma.audit.update({
      where: { id: auditId },
      data: { readinessScore: score },
    });

    return {
      auditId,
      readinessScore: score,
      breakdown: {
        evidenceCoverage: Math.round(evidenceCoverage),
        findingResolutionRate: Math.round(findingResolutionRate),
        controlEffectiveness: 80,
        documentationCompleteness: 90,
      },
      totalFindings,
      closedFindings,
    };
  }

  async getCalendarData(startDate: string, endDate: string) {
    const audits = await this.prisma.audit.findMany({
      where: {
        OR: [
          { startDate: { gte: new Date(startDate), lte: new Date(endDate) } },
          { endDate: { gte: new Date(startDate), lte: new Date(endDate) } },
        ],
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        leadAuditor: { select: { name: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    return audits.map((a) => ({
      id: a.id,
      title: a.title,
      start: a.startDate,
      end: a.endDate,
      type: a.type,
      status: a.status,
      auditor: a.leadAuditor?.name,
      color: a.type === 'EXTERNAL' ? '#EF4444' : '#3B82F6',
    }));
  }

  async triggerAIQuestionGeneration(auditId: string, user: AuthenticatedUser) {
    const audit = await this.findOne(auditId);

    this.eventEmitter.emit('audit.ai-questions-requested', {
      auditId,
      auditTitle: audit.title,
      auditType: audit.type,
      regulationId: audit.regulation?.id || null,
      userId: user.sub,
    });

    return { message: 'AI question generation queued', auditId };
  }
}
