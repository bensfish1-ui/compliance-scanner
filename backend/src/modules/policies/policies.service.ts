import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePolicyDto, user: AuthenticatedUser) {
    return this.prisma.policy.create({
      data: {
        title: dto.title,
        slug: dto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        description: dto.description,
        content: dto.content,
        status: dto.status as any,
        version: dto.version || 1,
        ownerId: dto.ownerId || user.sub,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        reviewDate: dto.nextReviewDate ? new Date(dto.nextReviewDate) : null,
        tags: dto.category ? [dto.category] : [],
      },
      include: { owner: true },
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
      this.prisma.policy.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true } },
        },
      }),
      this.prisma.policy.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
      include: {
        owner: true,
        regulations: true,
      },
    });
    if (!policy) throw new NotFoundException(`Policy ${id} not found`);
    return policy;
  }

  async update(id: string, dto: Partial<CreatePolicyDto>, _user: AuthenticatedUser) {
    await this.findOne(id);
    const { category, nextReviewDate, ...rest } = dto;
    return this.prisma.policy.update({
      where: { id },
      data: {
        ...rest,
        status: rest.status as any,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        ...(nextReviewDate !== undefined ? { reviewDate: nextReviewDate ? new Date(nextReviewDate) : null } : {}),
      },
      include: { owner: true },
    });
  }

  async delete(id: string, _user: AuthenticatedUser) {
    await this.findOne(id);
    return this.prisma.policy.update({
      where: { id },
      data: { isArchived: true, status: 'ARCHIVED' },
    });
  }

  async createNewVersion(id: string, content: string, _changelog: string, _user: AuthenticatedUser) {
    const policy = await this.findOne(id);

    // Update the policy with new content and incremented version
    return this.prisma.policy.update({
      where: { id },
      data: {
        content,
        version: policy.version + 1,
        status: 'DRAFT',
        approvalHistory: {
          ...(policy.approvalHistory as any || {}),
          [`v${policy.version}`]: {
            content: policy.content,
            status: policy.status,
            archivedAt: new Date().toISOString(),
          },
        },
      },
    });
  }

  async submitForApproval(id: string, _approverId: string, _user: AuthenticatedUser) {
    const policy = await this.findOne(id);
    if (policy.status !== 'DRAFT') {
      throw new BadRequestException('Only draft policies can be submitted for approval');
    }

    return this.prisma.policy.update({
      where: { id },
      data: { status: 'IN_REVIEW' },
    });
  }

  async processApproval(id: string, approved: boolean, _user: AuthenticatedUser) {
    const policy = await this.findOne(id);
    if (policy.status !== 'IN_REVIEW') {
      throw new BadRequestException('Policy is not pending review');
    }

    return this.prisma.policy.update({
      where: { id },
      data: {
        status: approved ? 'APPROVED' : 'DRAFT',
      },
    });
  }

  async getExpiringPolicies(withinDays: number = 30) {
    const futureDate = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000);

    return this.prisma.policy.findMany({
      where: {
        isArchived: false,
        expiryDate: { lte: futureDate, gte: new Date() },
        status: { not: 'ARCHIVED' },
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async getPoliciesDueForReview() {
    return this.prisma.policy.findMany({
      where: {
        isArchived: false,
        reviewDate: { lte: new Date() },
        status: { in: ['APPROVED', 'PUBLISHED'] },
      },
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { reviewDate: 'asc' },
    });
  }

  async compareVersions(_policyId: string, _versionA: number, _versionB: number) {
    // Version comparison is done via approvalHistory JSON field
    throw new BadRequestException('Version comparison not supported in current schema');
  }
}
