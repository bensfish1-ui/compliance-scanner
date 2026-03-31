import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Listens to domain events and triggers downstream processes.
 * This is the central event handler that orchestrates cross-module behaviour:
 * - Regulation creation triggers impact assessment auto-launch
 * - Regulation updates trigger workflow evaluation
 * - Task completion triggers notification and recurring task generation
 * - Audit creation triggers team notifications
 */
@Injectable()
export class RegulationEventsService {
  private readonly logger = new Logger(RegulationEventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * When a regulation is created:
   * 1. Auto-create an impact assessment (DRAFT)
   * 2. Notify compliance officers
   * 3. Evaluate workflows with REGULATION_CREATED trigger
   */
  @OnEvent('regulation.created')
  async handleRegulationCreated(payload: { regulationId: string; userId: string; regulation: any }) {
    this.logger.log(`Event: regulation.created - ${payload.regulationId}`);

    try {
      // Auto-create impact assessment
      await this.prisma.impactAssessment.create({
        data: {
          regulationId: payload.regulationId,
          assessorId: payload.userId,
          overallImpact: 'MEDIUM',
          notes: `Auto-generated for new regulation: ${payload.regulation.title}`,
        },
      });

      this.logger.log(`Auto-created impact assessment for regulation ${payload.regulationId}`);
    } catch (error) {
      this.logger.error(`Failed to handle regulation.created: ${(error as Error).message}`);
    }
  }

  /**
   * When a regulation is updated, check if lifecycle stage changed
   * and trigger appropriate actions.
   */
  @OnEvent('regulation.updated')
  async handleRegulationUpdated(payload: { regulationId: string; userId: string; changes: any }) {
    this.logger.log(`Event: regulation.updated - ${payload.regulationId}`);

    // If lifecycle stage changed to IMPLEMENTATION, auto-create a project
    if (payload.changes?.lifecycleStage === 'IMPLEMENTATION') {
      try {
        const regulation = await this.prisma.regulation.findUnique({
          where: { id: payload.regulationId },
        });

        if (regulation) {
          await this.prisma.project.create({
            data: {
              title: `Implementation: ${regulation.title}`,
              slug: `impl-${regulation.slug}-${Date.now()}`,
              description: `Auto-created project for implementing ${regulation.title}`,
              regulationId: payload.regulationId,
              status: 'PLANNING',
              ownerId: payload.userId,
              startDate: new Date(),
              endDate: regulation.enforcementDate,
            },
          });

          this.logger.log(`Auto-created project for regulation ${payload.regulationId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to auto-create project: ${(error as Error).message}`);
      }
    }
  }

  @OnEvent('regulation.archived')
  async handleRegulationArchived(payload: { regulationId: string; userId: string }) {
    this.logger.log(`Event: regulation.archived - ${payload.regulationId}`);
  }

  /**
   * When a task is assigned, create a notification for the assignee.
   */
  @OnEvent('task.assigned')
  async handleTaskAssigned(payload: {
    taskId: string;
    assigneeId: string;
    assignedBy: string;
    taskTitle: string;
  }) {
    this.logger.log(`Event: task.assigned - ${payload.taskId} to ${payload.assigneeId}`);

    try {
      await this.prisma.notification.create({
        data: {
          userId: payload.assigneeId,
          title: 'Task Assigned',
          message: `You have been assigned the task: "${payload.taskTitle}"`,
          type: 'TASK_ASSIGNED',
          link: `/tasks/${payload.taskId}`,
          isRead: false,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create task assignment notification: ${(error as Error).message}`);
    }
  }

  /**
   * When a task is completed, check if it's recurring and generate the next one.
   */
  @OnEvent('task.completed')
  async handleTaskCompleted(payload: { task?: any; taskId?: string; userId: string }) {
    const taskId = payload.task?.id || payload.taskId;
    this.logger.log(`Event: task.completed - ${taskId}`);

    try {
      const task = payload.task || await this.prisma.task.findUnique({ where: { id: taskId } });

      if (task?.recurringPattern) {
        // Generate next recurring task instance
        await this.prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            projectId: task.projectId,
            parentTaskId: task.parentTaskId,
            status: 'TODO',
            priority: task.priority,
            assigneeId: task.assigneeId,
            estimatedHours: task.estimatedHours,
            isRecurring: true,
            recurringPattern: task.recurringPattern as any,
            tags: task.tags || [],
          },
        });

        this.logger.log(`Generated recurring task from completed task ${taskId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle task completion: ${(error as Error).message}`);
    }
  }

  /**
   * Handle document OCR request - this would queue a BullMQ job.
   */
  @OnEvent('document.ocr-requested')
  async handleOcrRequest(payload: { documentId: string; s3Key: string; mimeType: string }) {
    this.logger.log(`Event: document.ocr-requested - ${payload.documentId}`);
    // In production, this would queue a BullMQ job:
    // await this.ocrQueue.add('process-document', payload);
  }

  /**
   * Handle AI analysis request for a regulation.
   */
  @OnEvent('regulation.ai-analysis-requested')
  async handleAiAnalysisRequest(payload: { regulationId: string; userId: string }) {
    this.logger.log(`Event: regulation.ai-analysis-requested - ${payload.regulationId}`);
    // In production, this would queue a BullMQ job:
    // await this.aiQueue.add('analyze-regulation', payload);
  }

  /**
   * Handle impact assessment submission for approval.
   */
  @OnEvent('impact-assessment.submitted')
  async handleIASubmitted(payload: { assessmentId: string; approverId: string; userId: string }) {
    this.logger.log(`Event: impact-assessment.submitted - ${payload.assessmentId}`);

    try {
      await this.prisma.notification.create({
        data: {
          userId: payload.approverId,
          title: 'Impact Assessment Review Required',
          message: 'An impact assessment has been submitted for your review.',
          type: 'APPROVAL_REQUIRED',
          link: `/impact-assessments/${payload.assessmentId}`,
          isRead: false,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to notify approver: ${(error as Error).message}`);
    }
  }
}
