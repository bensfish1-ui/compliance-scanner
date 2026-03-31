import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { differenceInDays } from 'date-fns';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateProjectDto, user: AuthenticatedUser) {
    const project = await this.prisma.project.create({
      data: {
        title: dto.name,
        slug: dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        description: dto.description,
        regulationId: dto.regulationId,
        status: dto.status as any,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        budget: dto.budget,
        spent: dto.budgetSpent || 0,
        ownerId: dto.managerId || user.sub,
        progress: dto.progress || 0,
      },
      include: {
        regulation: true,
        owner: true,
      },
    });

    this.eventEmitter.emit('project.created', { project, userId: user.sub });
    return project;
  }

  async createFromRegulation(regulationId: string, userId: string) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
    });

    if (!regulation) {
      throw new NotFoundException(`Regulation ${regulationId} not found`);
    }

    return this.prisma.project.create({
      data: {
        title: `Implementation: ${regulation.title}`,
        slug: `impl-${regulation.slug}-${Date.now()}`,
        description: `Compliance project for implementing ${regulation.title}`,
        regulationId: regulation.id,
        status: 'PLANNING',
        ownerId: userId,
        startDate: new Date(),
        endDate: regulation.enforcementDate,
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
      this.prisma.project.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { createdAt: 'desc' },
        include: {
          regulation: { select: { id: true, title: true } },
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        regulation: true,
        owner: true,
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            subtasks: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, _user: AuthenticatedUser) {
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto as any),
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: { regulation: true, owner: true },
    });
  }

  async delete(id: string, _user: AuthenticatedUser) {
    await this.findOne(id);
    return this.prisma.project.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async getGanttData(projectId: string) {
    const project = await this.findOne(projectId);

    const ganttTasks = project.tasks.map((task: any) => ({
      id: task.id,
      name: task.title,
      start: task.startDate?.toISOString() || project.startDate?.toISOString(),
      end: task.dueDate?.toISOString() || project.endDate?.toISOString(),
      progress: 0,
      dependencies: [],
      type: 'task',
      assignee: task.assignee?.name,
      status: task.status,
      color: this.getStatusColor(task.status),
    }));

    return {
      projectId,
      projectName: project.title,
      startDate: project.startDate,
      endDate: project.endDate,
      tasks: ganttTasks,
    };
  }

  async getKanbanData(projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        _count: { select: { subtasks: true } },
      },
      orderBy: { order: 'asc' },
    });

    const columns: Record<string, any[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
      BLOCKED: [],
    };

    for (const task of tasks) {
      const status = task.status || 'TODO';
      if (!columns[status]) columns[status] = [];
      columns[status].push(task);
    }

    return { projectId, columns };
  }

  async getBudgetTracking(projectId: string) {
    const project = await this.findOne(projectId);

    const budget = Number(project.budget) || 0;
    const spent = Number(project.spent) || 0;
    const remaining = budget - spent;
    const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;

    const progress = project.progress || 0;
    const isOnBudget = progress >= percentUsed;

    return {
      projectId,
      budget,
      spent,
      remaining,
      percentUsed: Math.round(percentUsed * 100) / 100,
      progress,
      isOnBudget,
      forecast: budget > 0 && progress > 0 ? (spent / progress) * 100 : null,
    };
  }

  async calculateProgress(projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId, parentTaskId: null },
    });

    if (tasks.length === 0) return { progress: 0, taskCounts: {} };

    const statusCounts: Record<string, number> = {};
    let completedCount = 0;

    for (const task of tasks) {
      const status = task.status || 'TODO';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (status === 'DONE') completedCount++;
    }

    const overallProgress = Math.round((completedCount / tasks.length) * 100);

    await this.prisma.project.update({
      where: { id: projectId },
      data: { progress: overallProgress },
    });

    return {
      progress: overallProgress,
      totalTasks: tasks.length,
      taskCounts: statusCounts,
    };
  }

  async detectSlippage(projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        status: { notIn: ['DONE', 'CANCELLED'] },
        dueDate: { lt: new Date() },
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return tasks.map((task: any) => ({
      ...task,
      daysOverdue: task.dueDate ? differenceInDays(new Date(), task.dueDate) : 0,
    }));
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      TODO: '#6B7280',
      IN_PROGRESS: '#3B82F6',
      IN_REVIEW: '#F59E0B',
      DONE: '#10B981',
      BLOCKED: '#EF4444',
      CANCELLED: '#9CA3AF',
    };
    return colors[status] || '#6B7280';
  }
}
