import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateObligationDto } from './dto/create-obligation.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ObligationsService {
  private readonly logger = new Logger(ObligationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateObligationDto, _user: AuthenticatedUser) {
    return this.prisma.obligation.create({
      data: {
        title: dto.title,
        description: dto.description,
        regulationId: dto.regulationId,
        requirement: dto.sectionReference,
        status: dto.status as any,
        dueDate: dto.deadline ? new Date(dto.deadline) : null,
        ownerId: dto.ownerId,
        priority: dto.priority as any,
      },
      include: {
        regulation: { select: { id: true, title: true } },
        owner: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(query: PaginationQueryDto & { regulationId?: string; status?: string }) {
    const where: any = {};
    if (query.regulationId) where.regulationId = query.regulationId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.obligation.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { priority: 'desc' },
        include: {
          regulation: { select: { id: true, title: true } },
          owner: { select: { id: true, name: true } },
          _count: { select: { controls: true } },
        },
      }),
      this.prisma.obligation.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const obligation = await this.prisma.obligation.findUnique({
      where: { id },
      include: {
        regulation: true,
        owner: true,
        controls: true,
      },
    });
    if (!obligation) throw new NotFoundException(`Obligation ${id} not found`);
    return obligation;
  }

  async update(id: string, dto: Partial<CreateObligationDto>, _user: AuthenticatedUser) {
    await this.findOne(id);
    const { sectionReference, deadline, priority, ...rest } = dto;
    return this.prisma.obligation.update({
      where: { id },
      data: {
        ...rest,
        status: rest.status as any,
        ...(sectionReference !== undefined ? { requirement: sectionReference } : {}),
        ...(deadline !== undefined ? { dueDate: deadline ? new Date(deadline) : null } : {}),
        ...(priority !== undefined ? { priority: priority as any } : {}),
      },
      include: { regulation: true, owner: true, controls: true },
    });
  }

  async delete(id: string, _user: AuthenticatedUser) {
    await this.findOne(id);
    return this.prisma.obligation.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
