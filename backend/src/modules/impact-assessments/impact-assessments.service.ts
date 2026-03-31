import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateImpactAssessmentDto, ScoringFactorDto } from './dto/create-impact-assessment.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ImpactAssessmentsService {
  private readonly logger = new Logger(ImpactAssessmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateImpactAssessmentDto, user: AuthenticatedUser) {
    const overallImpact = this.calculateOverallImpact(dto.scoringFactors);

    const assessment = await this.prisma.impactAssessment.create({
      data: {
        regulationId: dto.regulationId,
        assessorId: dto.assessorId || user.sub,
        overallImpact,
        departmentImpacts: dto.scoringFactors as any,
        gapAnalysis: dto.gapAnalysis ? { analysis: dto.gapAnalysis } : undefined,
        approvedById: dto.approverId,
        notes: dto.description,
        approvalStatus: (dto.status as any) || 'PENDING',
      },
      include: {
        regulation: { select: { id: true, title: true } },
        assessor: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    this.eventEmitter.emit('impact-assessment.created', { assessment, userId: user.sub });
    return assessment;
  }

  async autoLaunchForRegulation(regulationId: string, userId: string) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
    });

    if (!regulation) return;

    return this.prisma.impactAssessment.create({
      data: {
        regulationId,
        assessorId: userId,
        overallImpact: 'MEDIUM',
        notes: `Auto-generated impact assessment for regulation: ${regulation.title}`,
        approvalStatus: 'PENDING',
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.impactAssessment.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { createdAt: 'desc' },
        include: {
          regulation: { select: { id: true, title: true } },
          assessor: { select: { id: true, name: true } },
        },
      }),
      this.prisma.impactAssessment.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const ia = await this.prisma.impactAssessment.findUnique({
      where: { id },
      include: {
        regulation: true,
        assessor: true,
        approvedBy: true,
      },
    });
    if (!ia) throw new NotFoundException(`Impact Assessment ${id} not found`);
    return ia;
  }

  async update(id: string, dto: Partial<CreateImpactAssessmentDto>, _user: AuthenticatedUser) {
    await this.findOne(id);

    const overallImpact = dto.scoringFactors
      ? this.calculateOverallImpact(dto.scoringFactors)
      : undefined;

    return this.prisma.impactAssessment.update({
      where: { id },
      data: {
        ...(overallImpact ? { overallImpact } : {}),
        ...(dto.scoringFactors ? { departmentImpacts: dto.scoringFactors as any } : {}),
        ...(dto.gapAnalysis !== undefined ? { gapAnalysis: { analysis: dto.gapAnalysis } } : {}),
        ...(dto.description !== undefined ? { notes: dto.description } : {}),
        ...(dto.approverId ? { approvedById: dto.approverId } : {}),
      },
      include: { regulation: true, assessor: true, approvedBy: true },
    });
  }

  async delete(id: string, _user: AuthenticatedUser) {
    await this.findOne(id);
    return this.prisma.impactAssessment.delete({
      where: { id },
    });
  }

  async getGapAnalysis(id: string) {
    const ia = await this.findOne(id);

    const obligations = await this.prisma.obligation.findMany({
      where: { regulationId: ia.regulationId, isActive: true },
      include: { controls: { include: { control: true } } },
    });

    const gaps = obligations.map((obl: any) => {
      const hasControls = obl.controls && obl.controls.length > 0;
      const effectiveControls = obl.controls?.filter(
        (c: any) => c.control?.effectiveness && c.control.effectiveness >= 50,
      );

      return {
        obligationId: obl.id,
        obligationTitle: obl.title,
        hasControls,
        controlCount: obl.controls?.length || 0,
        effectiveControlCount: effectiveControls?.length || 0,
        gapStatus: !hasControls ? 'NO_CONTROLS' : effectiveControls?.length === 0 ? 'INEFFECTIVE' : 'COVERED',
      };
    });

    const totalObligations = gaps.length;
    const coveredObligations = gaps.filter((g) => g.gapStatus === 'COVERED').length;
    const coveragePercentage = totalObligations > 0 ? (coveredObligations / totalObligations) * 100 : 0;

    return {
      assessmentId: id,
      regulationId: ia.regulationId,
      gaps,
      summary: {
        totalObligations,
        coveredObligations,
        uncoveredObligations: totalObligations - coveredObligations,
        coveragePercentage: Math.round(coveragePercentage),
      },
    };
  }

  async submitForApproval(id: string, approverId: string, _user: AuthenticatedUser) {
    const ia = await this.findOne(id);

    if (ia.approvalStatus !== 'PENDING' && ia.approvalStatus !== 'REJECTED') {
      throw new BadRequestException('Only pending or rejected assessments can be submitted');
    }

    const updated = await this.prisma.impactAssessment.update({
      where: { id },
      data: {
        approvalStatus: 'PENDING',
        approvedById: approverId,
      },
    });

    this.eventEmitter.emit('impact-assessment.submitted', {
      assessmentId: id,
      approverId,
      userId: _user.sub,
    });

    return updated;
  }

  async processApproval(id: string, approved: boolean, comments: string, _user: AuthenticatedUser) {
    const ia = await this.findOne(id);

    if (ia.approvalStatus !== 'PENDING') {
      throw new BadRequestException('Assessment is not pending review');
    }

    return this.prisma.impactAssessment.update({
      where: { id },
      data: {
        approvalStatus: approved ? 'APPROVED' : 'REJECTED',
        approvedAt: approved ? new Date() : null,
        notes: comments || ia.notes,
      },
    });
  }

  async triggerAIScoring(id: string, user: AuthenticatedUser) {
    await this.findOne(id);

    this.eventEmitter.emit('impact-assessment.ai-scoring-requested', {
      assessmentId: id,
      userId: user.sub,
    });

    return { message: 'AI scoring queued', assessmentId: id };
  }

  private calculateOverallImpact(factors?: ScoringFactorDto[]): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NEGLIGIBLE' {
    if (!factors || factors.length === 0) return 'MEDIUM';

    let weightedSum = 0;
    let totalWeight = 0;

    for (const factor of factors) {
      const weight = factor.weight || 1 / factors.length;
      weightedSum += factor.score * weight;
      totalWeight += weight;
    }

    const avgScore = totalWeight > 0 ? weightedSum / totalWeight : 3;

    if (avgScore >= 4.5) return 'CRITICAL';
    if (avgScore >= 3.5) return 'HIGH';
    if (avgScore >= 2.5) return 'MEDIUM';
    if (avgScore >= 1.5) return 'LOW';
    return 'NEGLIGIBLE';
  }
}
