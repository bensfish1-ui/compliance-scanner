import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateControlDto } from './dto/create-control.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ControlsService {
  private readonly logger = new Logger(ControlsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateControlDto, _user: AuthenticatedUser) {
    return this.prisma.control.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        effectiveness: dto.effectiveness !== undefined ? parseFloat(String(dto.effectiveness)) : null,
        ownerId: dto.ownerId!,
        testFrequency: dto.frequency,
        lastTestedDate: dto.lastTestedDate ? new Date(dto.lastTestedDate) : null,
        nextTestDate: dto.nextTestDate ? new Date(dto.nextTestDate) : null,
        ...(dto.obligationIds && dto.obligationIds.length > 0
          ? { obligations: { create: dto.obligationIds.map((oid) => ({ obligationId: oid })) } }
          : {}),
      },
      include: { owner: true, obligations: true },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.control.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { createdAt: 'asc' },
        include: {
          owner: { select: { id: true, name: true } },
          _count: { select: { obligations: true, risks: true } },
        },
      }),
      this.prisma.control.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const control = await this.prisma.control.findUnique({
      where: { id },
      include: {
        owner: true,
        obligations: { include: { obligation: { select: { id: true, title: true, regulation: { select: { id: true, title: true } } } } } },
        risks: { include: { risk: { select: { id: true, title: true, inherentScore: true } } } },
      },
    });
    if (!control) throw new NotFoundException(`Control ${id} not found`);
    return control;
  }

  async update(id: string, dto: Partial<CreateControlDto>, _user: AuthenticatedUser) {
    await this.findOne(id);
    const { obligationIds, frequency, effectiveness, ...rest } = dto;
    return this.prisma.control.update({
      where: { id },
      data: {
        ...rest,
        ...(effectiveness !== undefined ? { effectiveness: parseFloat(String(effectiveness)) } : {}),
        ...(frequency !== undefined ? { testFrequency: frequency } : {}),
        lastTestedDate: dto.lastTestedDate ? new Date(dto.lastTestedDate) : undefined,
        nextTestDate: dto.nextTestDate ? new Date(dto.nextTestDate) : undefined,
      },
      include: { owner: true, obligations: true },
    });
  }

  async delete(id: string, _user: AuthenticatedUser) {
    await this.findOne(id);
    return this.prisma.control.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getEffectivenessStats() {
    const controls = await this.prisma.control.findMany({
      where: { isActive: true },
      select: { effectiveness: true },
    });

    const total = controls.length;
    const effective = controls.filter((c) => (c.effectiveness || 0) >= 70).length;
    const partial = controls.filter((c) => (c.effectiveness || 0) >= 40 && (c.effectiveness || 0) < 70).length;
    const ineffective = controls.filter((c) => (c.effectiveness || 0) > 0 && (c.effectiveness || 0) < 40).length;
    const notTested = controls.filter((c) => c.effectiveness === null).length;

    return {
      total,
      byEffectiveness: [
        { effectiveness: 'EFFECTIVE', count: effective, percentage: total > 0 ? Math.round((effective / total) * 100) : 0 },
        { effectiveness: 'PARTIALLY_EFFECTIVE', count: partial, percentage: total > 0 ? Math.round((partial / total) * 100) : 0 },
        { effectiveness: 'INEFFECTIVE', count: ineffective, percentage: total > 0 ? Math.round((ineffective / total) * 100) : 0 },
        { effectiveness: 'NOT_TESTED', count: notTested, percentage: total > 0 ? Math.round((notTested / total) * 100) : 0 },
      ],
    };
  }

  async addObligation(controlId: string, obligationId: string) {
    return this.prisma.controlObligation.create({
      data: { controlId, obligationId },
    });
  }

  async removeObligation(controlId: string, obligationId: string) {
    return this.prisma.controlObligation.deleteMany({
      where: { controlId, obligationId },
    });
  }
}
