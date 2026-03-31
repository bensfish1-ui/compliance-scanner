import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, BulkStatusUpdateDto, ReorderTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateTaskDto, user: AuthenticatedUser) {
    // Validate dependency tasks exist
    if (dto.dependencyIds && dto.dependencyIds.length > 0) {
      const deps = await this.prisma.task.findMany({
        where: { id: { in: dto.dependencyIds }, projectId: dto.projectId },
      });
      if (deps.length !== dto.dependencyIds.length) {
        throw new BadRequestException('One or more dependency tasks not found in this project');
      }
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        parentTaskId: dto.parentTaskId,
        status: dto.status as any,
        priority: dto.priority as any,
        assigneeId: dto.assigneeId,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        estimatedHours: dto.estimatedHours,
        actualHours: dto.actualHours || 0,
        order: dto.orderIndex || 0,
        isRecurring: !!dto.recurrenceRule,
        recurringPattern: dto.recurrenceRule ? { rule: dto.recurrenceRule } : undefined,
        tags: dto.tags || [],
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        subtasks: true,
      },
    });

    // Create task dependencies
    if (dto.dependencyIds && dto.dependencyIds.length > 0) {
      await this.prisma.taskDependency.createMany({
        data: dto.dependencyIds.map((depId) => ({
          taskId: task.id,
          dependsOnTaskId: depId,
        })),
      });
    }

    this.eventEmitter.emit('task.created', { task, userId: user.sub });

    if (dto.assigneeId) {
      this.eventEmitter.emit('task.assigned', {
        taskId: task.id,
        assigneeId: dto.assigneeId,
        assignedBy: user.sub,
        taskTitle: task.title,
      });
    }

    return task;
  }

  async findAll(query: PaginationQueryDto & { projectId?: string; assigneeId?: string; status?: string }) {
    const where: any = {};

    if (query.projectId) where.projectId = query.projectId;
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.status) where.status = query.status;
    if (!query.search) where.parentTaskId = null;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { order: 'asc' },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, title: true } },
          _count: { select: { subtasks: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        parentTask: { select: { id: true, title: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: AuthenticatedUser) {
    const existing = await this.findOne(id);

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto as any),
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
    });

    if (dto.assigneeId && dto.assigneeId !== existing.assigneeId) {
      this.eventEmitter.emit('task.assigned', {
        taskId: task.id,
        assigneeId: dto.assigneeId,
        assignedBy: user.sub,
        taskTitle: task.title,
      });
    }

    if (dto.status === 'DONE' && existing.status !== 'DONE') {
      this.eventEmitter.emit('task.completed', { task, userId: user.sub });
    }

    return task;
  }

  async delete(id: string, _user: AuthenticatedUser) {
    await this.findOne(id);
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async getSubtasks(parentTaskId: string) {
    return this.prisma.task.findMany({
      where: { parentTaskId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async generateRecurringTask(taskId: string) {
    const task = await this.findOne(taskId);

    if (!task.recurringPattern) {
      throw new BadRequestException('Task does not have a recurrence pattern');
    }

    const newTask = await this.prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        parentTaskId: task.parentTaskId,
        status: 'TODO',
        priority: task.priority,
        assigneeId: task.assigneeId,
        estimatedHours: task.estimatedHours,
        order: task.order,
        isRecurring: true,
        recurringPattern: task.recurringPattern as any,
        tags: task.tags as string[],
      },
    });

    this.logger.log(`Generated recurring task ${newTask.id} from template ${taskId}`);
    return newTask;
  }

  async bulkStatusUpdate(dto: BulkStatusUpdateDto, _user: AuthenticatedUser) {
    const result = await this.prisma.task.updateMany({
      where: { id: { in: dto.taskIds } },
      data: { status: dto.status as any },
    });

    for (const taskId of dto.taskIds) {
      if (dto.status === 'DONE') {
        this.eventEmitter.emit('task.completed', { taskId, userId: _user.sub });
      }
    }

    return { updated: result.count };
  }

  async reorderTasks(reorders: ReorderTaskDto[], _user: AuthenticatedUser) {
    const updates = reorders.map((r) =>
      this.prisma.task.update({
        where: { id: r.taskId },
        data: {
          order: r.orderIndex,
          ...(r.status ? { status: r.status as any } : {}),
        },
      }),
    );

    await this.prisma.$transaction(updates);
    return { reordered: reorders.length };
  }

  async logTime(taskId: string, hours: number, _user: AuthenticatedUser) {
    const task = await this.findOne(taskId);

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        actualHours: (task.actualHours || 0) + hours,
      },
    });
  }
}
