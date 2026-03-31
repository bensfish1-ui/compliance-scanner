import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class RisksService {
  private readonly logger = new Logger(RisksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRiskDto, user: AuthenticatedUser) {
    const inherentScore = dto.likelihood * dto.consequence;

    return this.prisma.risk.create({
      data: {
        title: dto.title,
        description: dto.description,
        categoryId: (dto as any).categoryId || null,
        status: dto.status as any,
        likelihood: dto.likelihood as any,
        consequence: dto.consequence as any,
        inherentScore,
        residualScore: dto.residualLikelihood && dto.residualConsequence
          ? dto.residualLikelihood * dto.residualConsequence
          : null,
        ownerId: dto.ownerId || user.sub,
        businessAreaId: dto.businessAreaId,
        mitigationPlan: dto.mitigationPlan,
        ...(dto.controlIds && dto.controlIds.length > 0
          ? { controls: { create: dto.controlIds.map((cid) => ({ controlId: cid })) } }
          : {}),
      },
      include: {
        owner: { select: { id: true, name: true } },
        controls: true,
      },
    });
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
      this.prisma.risk.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { inherentScore: 'desc' },
        include: {
          owner: { select: { id: true, name: true } },
          _count: { select: { controls: true } },
        },
      }),
      this.prisma.risk.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const risk = await this.prisma.risk.findUnique({
      where: { id },
      include: {
        owner: true,
        controls: { include: { control: true } },
      },
    });
    if (!risk) throw new NotFoundException(`Risk ${id} not found`);
    return risk;
  }

  async update(id: string, dto: Partial<CreateRiskDto>, _user: AuthenticatedUser) {
    await this.findOne(id);

    const inherentScore = dto.likelihood && dto.consequence
      ? (dto.likelihood as number) * (dto.consequence as number)
      : undefined;

    const residualScore = dto.residualLikelihood && dto.residualConsequence
      ? dto.residualLikelihood * dto.residualConsequence
      : undefined;

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.likelihood !== undefined) data.likelihood = dto.likelihood;
    if (dto.consequence !== undefined) data.consequence = dto.consequence;
    if (dto.mitigationPlan !== undefined) data.mitigationPlan = dto.mitigationPlan;
    if (dto.businessAreaId !== undefined) data.businessAreaId = dto.businessAreaId;
    if (inherentScore !== undefined) data.inherentScore = inherentScore;
    if (residualScore !== undefined) data.residualScore = residualScore;

    return this.prisma.risk.update({
      where: { id },
      data,
      include: { owner: true, controls: true },
    });
  }

  async delete(id: string, _user: AuthenticatedUser) {
    await this.findOne(id);
    return this.prisma.risk.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getRiskMatrixData() {
    const risks = await this.prisma.risk.findMany({
      where: { isActive: true },
      select: {
        id: true, title: true, likelihood: true, consequence: true,
        inherentScore: true, status: true, categoryId: true,
      },
    });

    const matrix: Record<string, any[]> = {};
    for (let l = 1; l <= 5; l++) {
      for (let c = 1; c <= 5; c++) {
        const key = `${l}-${c}`;
        matrix[key] = risks.filter(
          (r: any) => r.likelihood === l && r.consequence === c,
        );
      }
    }

    return {
      matrix,
      totalRisks: risks.length,
      criticalRisks: risks.filter((r) => (r.inherentScore || 0) >= 20).length,
      highRisks: risks.filter((r) => (r.inherentScore || 0) >= 12 && (r.inherentScore || 0) < 20).length,
      mediumRisks: risks.filter((r) => (r.inherentScore || 0) >= 6 && (r.inherentScore || 0) < 12).length,
      lowRisks: risks.filter((r) => (r.inherentScore || 0) < 6).length,
    };
  }

  async getHeatmapData() {
    const risks = await this.prisma.risk.findMany({
      where: { isActive: true },
      select: {
        id: true, title: true, categoryId: true, likelihood: true,
        consequence: true, inherentScore: true,
        residualScore: true,
      },
    });

    const byCategory: Record<string, any[]> = {};
    for (const risk of risks) {
      const cat = risk.categoryId || 'uncategorized';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({
        id: risk.id,
        title: risk.title,
        x: risk.consequence,
        y: risk.likelihood,
        value: risk.inherentScore,
        residualValue: risk.residualScore,
      });
    }

    return { categories: byCategory, totalRisks: risks.length };
  }

  async addControl(riskId: string, controlId: string) {
    return this.prisma.riskControl.create({
      data: { riskId, controlId },
    });
  }

  async removeControl(riskId: string, controlId: string) {
    return this.prisma.riskControl.deleteMany({
      where: { riskId, controlId },
    });
  }
}
