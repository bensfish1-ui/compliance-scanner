import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkflowDto, WorkflowConditionDto } from './dto/create-workflow.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateWorkflowDto, user: AuthenticatedUser) {
    return this.prisma.workflow.create({
      data: {
        name: dto.name,
        description: dto.description,
        trigger: dto.triggerType as any,
        conditions: dto.conditions as any,
        actions: dto.actions as any,
        isActive: dto.isActive ?? true,
        ownerId: user.sub,
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { createdAt: 'desc' },
        include: {
          _count: { select: { executions: true } },
        },
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        executions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!workflow) throw new NotFoundException(`Workflow ${id} not found`);
    return workflow;
  }

  async update(id: string, dto: Partial<CreateWorkflowDto>, _user: AuthenticatedUser) {
    await this.findOne(id);
    const { triggerType, ...rest } = dto;
    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...rest,
        ...(triggerType ? { trigger: triggerType as any } : {}),
        conditions: dto.conditions as any,
        actions: dto.actions as any,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.workflow.delete({ where: { id } });
  }

  async manualTrigger(id: string, context: Record<string, any>, user: AuthenticatedUser) {
    const workflow = await this.findOne(id);

    if (!workflow.isActive) {
      throw new NotFoundException('Workflow is not active');
    }

    return this.executeWorkflow(workflow, context, user.sub);
  }

  async getExecutionHistory(workflowId: string, query: PaginationQueryDto) {
    const [data, total] = await Promise.all([
      this.prisma.workflowExecution.findMany({
        where: { workflowId },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workflowExecution.count({ where: { workflowId } }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async evaluateTriggers(triggerType: string, context: Record<string, any>) {
    const workflows = await this.prisma.workflow.findMany({
      where: { trigger: triggerType as any, isActive: true },
    });

    for (const workflow of workflows) {
      const conditions = (workflow.conditions as unknown as WorkflowConditionDto[]) || [];
      const conditionsMet = this.evaluateConditions(conditions, context);

      if (conditionsMet) {
        this.logger.log(`Workflow "${workflow.name}" triggered by ${triggerType}`);
        await this.executeWorkflow(workflow, context, 'system');
      }
    }
  }

  private evaluateConditions(conditions: WorkflowConditionDto[], context: Record<string, any>): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every((condition) => {
      const fieldValue = this.getNestedValue(context, condition.field);
      const targetValue = condition.value;

      switch (condition.operator) {
        case 'equals':
          return fieldValue === targetValue;
        case 'not_equals':
          return fieldValue !== targetValue;
        case 'contains':
          return String(fieldValue).includes(String(targetValue));
        case 'gt':
          return Number(fieldValue) > Number(targetValue);
        case 'lt':
          return Number(fieldValue) < Number(targetValue);
        case 'gte':
          return Number(fieldValue) >= Number(targetValue);
        case 'lte':
          return Number(fieldValue) <= Number(targetValue);
        case 'in':
          return Array.isArray(targetValue) && targetValue.includes(fieldValue);
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null;
        default:
          this.logger.warn(`Unknown condition operator: ${condition.operator}`);
          return false;
      }
    });
  }

  private async executeWorkflow(workflow: any, context: Record<string, any>, triggeredBy: string) {
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        triggeredBy,
        input: context as any,
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    try {
      const actions = (workflow.actions as any[]) || [];
      const results: any[] = [];

      for (const action of actions) {
        const result = await this.executeAction(action, context);
        results.push(result);
      }

      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          output: results as any,
          completedAt: new Date(),
        },
      });

      return execution;
    } catch (error) {
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: (error as Error).message,
          completedAt: new Date(),
        },
      });

      this.logger.error(`Workflow execution ${execution.id} failed: ${(error as Error).message}`);
      throw error;
    }
  }

  private async executeAction(action: any, context: Record<string, any>): Promise<any> {
    switch (action.type) {
      case 'SEND_NOTIFICATION':
        this.eventEmitter.emit('workflow.send-notification', {
          ...action.config,
          context,
        });
        return { type: action.type, status: 'queued' };

      case 'SEND_EMAIL':
        this.eventEmitter.emit('workflow.send-email', {
          ...action.config,
          context,
        });
        return { type: action.type, status: 'queued' };

      case 'CREATE_TASK':
        this.eventEmitter.emit('workflow.create-task', {
          ...action.config,
          context,
        });
        return { type: action.type, status: 'queued' };

      case 'UPDATE_STATUS':
        this.eventEmitter.emit('workflow.update-status', {
          ...action.config,
          context,
        });
        return { type: action.type, status: 'queued' };

      case 'CREATE_IMPACT_ASSESSMENT':
        this.eventEmitter.emit('workflow.create-impact-assessment', {
          ...action.config,
          context,
        });
        return { type: action.type, status: 'queued' };

      case 'TRIGGER_AI_ANALYSIS':
        this.eventEmitter.emit('workflow.trigger-ai-analysis', {
          ...action.config,
          context,
        });
        return { type: action.type, status: 'queued' };

      default:
        this.logger.warn(`Unknown workflow action type: ${action.type}`);
        return { type: action.type, status: 'skipped', reason: 'unknown action type' };
    }
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
