import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { subDays, addDays, startOfMonth, endOfMonth, format } from 'date-fns';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();

    const [
      totalRegulations,
      activeRegulations,
      totalProjects,
      activeProjects,
      overdueTasks,
      totalTasks,
      openAudits,
      openRisks,
      criticalRisks,
      pendingAssessments,
      expiringPolicies,
    ] = await Promise.all([
      this.prisma.regulation.count(),
      this.prisma.regulation.count({
        where: { status: { in: ['ENACTED', 'EFFECTIVE'] } },
      }),
      this.prisma.project.count(),
      this.prisma.project.count({
        where: { status: 'IN_PROGRESS' },
      }),
      this.prisma.task.count({
        where: {
          status: { notIn: ['DONE', 'CANCELLED'] },
          dueDate: { lt: now },
        },
      }),
      this.prisma.task.count(),
      this.prisma.audit.count({
        where: { status: { in: ['PLANNED', 'IN_PROGRESS', 'FIELDWORK'] } },
      }),
      this.prisma.risk.count({
        where: { isActive: true, status: { notIn: ['RED'] } },
      }),
      this.prisma.risk.count({
        where: { isActive: true, inherentScore: { gte: 20 } },
      }),
      this.prisma.impactAssessment.count({
        where: { approvalStatus: 'PENDING' },
      }),
      this.prisma.policy.count({
        where: {
          isArchived: false,
          expiryDate: { lte: addDays(now, 30), gte: now },
        },
      }),
    ]);

    return {
      regulations: { total: totalRegulations, active: activeRegulations },
      projects: { total: totalProjects, active: activeProjects },
      tasks: { total: totalTasks, overdue: overdueTasks },
      audits: { open: openAudits },
      risks: { open: openRisks, critical: criticalRisks },
      assessments: { pending: pendingAssessments },
      policies: { expiring: expiringPolicies },
    };
  }

  async getUpcomingRegulations() {
    return this.prisma.regulation.findMany({
      where: {
        isArchived: false,
        enforcementDate: {
          gte: new Date(),
          lte: addDays(new Date(), 90),
        },
      },
      select: {
        id: true, title: true, slug: true, enforcementDate: true,
        impactLevel: true, lifecycleStage: true, status: true,
        country: { select: { id: true, name: true } },
      },
      orderBy: { enforcementDate: 'asc' },
      take: 20,
    });
  }

  async getOverdueActions() {
    const overdueTasks = await this.prisma.task.findMany({
      where: {
        status: { notIn: ['DONE', 'CANCELLED'] },
        dueDate: { lt: new Date() },
      },
      select: {
        id: true, title: true, status: true, priority: true, dueDate: true,
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });

    return overdueTasks;
  }

  async getComplianceMaturity() {
    const [
      controls,
      obligations,
      risks,
      policies,
      audits,
    ] = await Promise.all([
      this.prisma.control.findMany({
        where: { isActive: true },
        select: { effectiveness: true },
      }),
      this.prisma.obligation.findMany({
        where: { isActive: true },
        select: { status: true },
      }),
      this.prisma.risk.findMany({
        where: { isActive: true },
        select: { inherentScore: true, residualScore: true },
      }),
      this.prisma.policy.findMany({
        where: { isArchived: false, status: { not: 'ARCHIVED' } },
        select: { status: true, expiryDate: true },
      }),
      this.prisma.audit.findMany({
        select: { readinessScore: true },
      }),
    ]);

    // Control effectiveness score (0-100) - effectiveness is a Float? field
    const testedControls = controls.filter(
      (c) => c.effectiveness !== null && c.effectiveness !== undefined,
    );
    const controlScore = testedControls.length > 0
      ? testedControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / testedControls.length
      : 0;

    // Obligation compliance score - status is TaskStatus enum
    const compliantObligations = obligations.filter(
      (o) => o.status === 'DONE',
    ).length;
    const obligationScore = obligations.length > 0
      ? (compliantObligations / obligations.length) * 100
      : 0;

    // Risk mitigation score
    const mitigatedRisks = risks.filter((r) => r.residualScore !== null);
    const riskScore = mitigatedRisks.length > 0
      ? mitigatedRisks.reduce((sum, r) => {
          const inherent = r.inherentScore || 1;
          const reduction = r.residualScore !== null
            ? ((inherent - (r.residualScore || 0)) / inherent) * 100
            : 0;
          return sum + reduction;
        }, 0) / mitigatedRisks.length
      : 50;

    const currentPolicies = policies.filter(
      (p) => p.status === 'APPROVED' || p.status === 'PUBLISHED',
    ).length;
    const policyScore = policies.length > 0
      ? (currentPolicies / policies.length) * 100
      : 0;

    const auditScores = audits.filter((a) => a.readinessScore !== null);
    const auditScore = auditScores.length > 0
      ? auditScores.reduce((sum, a) => sum + (a.readinessScore || 0), 0) / auditScores.length
      : 0;

    const overallScore = Math.round(
      controlScore * 0.25 +
      obligationScore * 0.25 +
      riskScore * 0.20 +
      policyScore * 0.15 +
      auditScore * 0.15,
    );

    return {
      overallScore,
      breakdown: {
        controlEffectiveness: Math.round(controlScore),
        obligationCompliance: Math.round(obligationScore),
        riskMitigation: Math.round(riskScore),
        policyCurrency: Math.round(policyScore),
        auditReadiness: Math.round(auditScore),
      },
      level: overallScore >= 80 ? 'OPTIMIZED' :
             overallScore >= 60 ? 'MANAGED' :
             overallScore >= 40 ? 'DEFINED' :
             overallScore >= 20 ? 'DEVELOPING' : 'INITIAL',
    };
  }

  async getRiskHeatmap() {
    const risks = await this.prisma.risk.findMany({
      where: { isActive: true },
      select: {
        id: true, title: true, categoryId: true,
        likelihood: true, consequence: true, inherentScore: true,
      },
    });

    return risks.map((r) => ({
      id: r.id,
      title: r.title,
      categoryId: r.categoryId,
      x: r.consequence,
      y: r.likelihood,
      value: r.inherentScore,
    }));
  }

  async getTrends() {
    const months: any[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subDays(now, i * 30));
      const monthEnd = endOfMonth(monthStart);
      const label = format(monthStart, 'MMM yyyy');

      const [newRegulations, completedTasks, newRisks] = await Promise.all([
        this.prisma.regulation.count({
          where: { createdAt: { gte: monthStart, lte: monthEnd } },
        }),
        this.prisma.task.count({
          where: {
            status: 'DONE',
            updatedAt: { gte: monthStart, lte: monthEnd },
          },
        }),
        this.prisma.risk.count({
          where: { createdAt: { gte: monthStart, lte: monthEnd } },
        }),
      ]);

      months.push({
        month: label,
        newRegulations,
        completedTasks,
        newRisks,
      });
    }

    return months;
  }

  async getKPIs() {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const [
      taskCompletionRate,
      avgRiskScore,
      obligationComplianceRate,
      auditFindingClosureRate,
    ] = await Promise.all([
      this.prisma.task.findMany({
        where: { updatedAt: { gte: thirtyDaysAgo } },
        select: { status: true },
      }),
      this.prisma.risk.aggregate({
        where: { isActive: true },
        _avg: { inherentScore: true },
      }),
      this.prisma.obligation.findMany({
        where: { isActive: true },
        select: { status: true },
      }),
      this.prisma.finding.findMany({
        select: { status: true },
      }),
    ]);

    const completedTasks = taskCompletionRate.filter((t) => t.status === 'DONE').length;
    const totalRecentTasks = taskCompletionRate.length;

    const compliantObligations = obligationComplianceRate.filter((o) => o.status === 'DONE').length;
    const totalObligations = obligationComplianceRate.length;

    const closedFindings = auditFindingClosureRate.filter(
      (f) => f.status === 'CLOSED' || f.status === 'REMEDIATED',
    ).length;
    const totalFindings = auditFindingClosureRate.length;

    return {
      taskCompletionRate: totalRecentTasks > 0
        ? Math.round((completedTasks / totalRecentTasks) * 100) : 0,
      averageRiskScore: Math.round(avgRiskScore._avg.inherentScore || 0),
      obligationComplianceRate: totalObligations > 0
        ? Math.round((compliantObligations / totalObligations) * 100) : 0,
      findingClosureRate: totalFindings > 0
        ? Math.round((closedFindings / totalFindings) * 100) : 0,
    };
  }

  async getTopRisks() {
    return this.prisma.risk.findMany({
      where: { isActive: true },
      select: {
        id: true, title: true, categoryId: true, likelihood: true,
        consequence: true, inherentScore: true, status: true,
        owner: { select: { id: true, name: true } },
      },
      orderBy: { inherentScore: 'desc' },
      take: 10,
    });
  }

  async getCountryOverview() {
    const regulationsByCountry = await this.prisma.regulation.groupBy({
      by: ['countryId'],
      where: { isArchived: false },
      _count: { id: true },
    });

    const countryIds = regulationsByCountry.map((r) => r.countryId);
    const countries = await this.prisma.country.findMany({
      where: { id: { in: countryIds } },
      select: { id: true, name: true, code: true },
    });

    const countryMap = new Map(countries.map((c) => [c.id, c]));

    return regulationsByCountry.map((r) => ({
      country: countryMap.get(r.countryId) || { id: r.countryId, name: 'Unknown' },
      regulationCount: r._count.id,
    }));
  }

  async getBusinessAreaOverview() {
    const businessAreas = await this.prisma.businessArea.findMany({
      include: {
        _count: {
          select: {
            regulations: true,
          },
        },
      },
    });

    return businessAreas.map((ba) => ({
      id: ba.id,
      name: ba.name,
      regulationCount: ba._count.regulations,
    }));
  }

  /**
   * Get AI usage statistics: total tokens, cost, request count,
   * breakdown by action, and daily trend for the last 30 days.
   */
  async getAIUsage() {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    // Aggregate totals
    const totals = await this.prisma.aILog.aggregate({
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        cost: true,
      },
      _count: { id: true },
    });

    // Last 30 days totals
    const last30Days = await this.prisma.aILog.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        cost: true,
      },
      _count: { id: true },
    });

    // Last 7 days totals (for trend comparison)
    const last7Days = await this.prisma.aILog.aggregate({
      where: { createdAt: { gte: sevenDaysAgo } },
      _sum: {
        totalTokens: true,
        cost: true,
      },
      _count: { id: true },
    });

    // Previous 7 days (for trend %)
    const prev7Days = await this.prisma.aILog.aggregate({
      where: {
        createdAt: { gte: subDays(now, 14), lt: sevenDaysAgo },
      },
      _sum: {
        totalTokens: true,
        cost: true,
      },
      _count: { id: true },
    });

    // Breakdown by action
    const byAction = await this.prisma.aILog.groupBy({
      by: ['action'],
      _sum: { totalTokens: true, cost: true },
      _count: { id: true },
      orderBy: { _sum: { totalTokens: 'desc' } },
    });

    // Daily trend for last 30 days
    const dailyLogs = await this.prisma.aILog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, totalTokens: true, cost: true },
      orderBy: { createdAt: 'asc' },
    });

    // Bucket into days
    const dailyMap = new Map<string, { tokens: number; cost: number; requests: number }>();
    for (let i = 29; i >= 0; i--) {
      const day = format(subDays(now, i), 'MMM dd');
      dailyMap.set(day, { tokens: 0, cost: 0, requests: 0 });
    }
    for (const log of dailyLogs) {
      const day = format(log.createdAt, 'MMM dd');
      const entry = dailyMap.get(day);
      if (entry) {
        entry.tokens += log.totalTokens || 0;
        entry.cost += Number(log.cost || 0);
        entry.requests += 1;
      }
    }
    const dailyTrend = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      tokens: data.tokens,
      cost: Math.round(data.cost * 10000) / 10000,
      requests: data.requests,
    }));

    // Average latency
    const latencyAgg = await this.prisma.aILog.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo } },
      _avg: { latency: true },
    });

    // Compute trend percentage (this week vs last week)
    const currentCost = Number(last7Days._sum.cost || 0);
    const previousCost = Number(prev7Days._sum.cost || 0);
    const costTrend = previousCost > 0
      ? Math.round(((currentCost - previousCost) / previousCost) * 100)
      : 0;

    const currentTokens = last7Days._sum.totalTokens || 0;
    const previousTokens = prev7Days._sum.totalTokens || 0;
    const tokenTrend = previousTokens > 0
      ? Math.round(((currentTokens - previousTokens) / previousTokens) * 100)
      : 0;

    return {
      allTime: {
        totalTokens: totals._sum.totalTokens || 0,
        promptTokens: totals._sum.promptTokens || 0,
        completionTokens: totals._sum.completionTokens || 0,
        totalCost: Math.round(Number(totals._sum.cost || 0) * 10000) / 10000,
        totalRequests: totals._count.id,
      },
      last30Days: {
        totalTokens: last30Days._sum.totalTokens || 0,
        promptTokens: last30Days._sum.promptTokens || 0,
        completionTokens: last30Days._sum.completionTokens || 0,
        totalCost: Math.round(Number(last30Days._sum.cost || 0) * 10000) / 10000,
        totalRequests: last30Days._count.id,
      },
      trends: {
        costTrend,
        tokenTrend,
      },
      avgLatencyMs: Math.round(latencyAgg._avg.latency || 0),
      byAction: byAction.map((a) => ({
        action: a.action,
        tokens: a._sum.totalTokens || 0,
        cost: Math.round(Number(a._sum.cost || 0) * 10000) / 10000,
        requests: a._count.id,
      })),
      dailyTrend,
    };
  }
}
