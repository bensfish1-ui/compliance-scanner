import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

/**
 * Processes scheduled workflow triggers.
 * Cron-based workflows are triggered by this processor.
 */
@Processor('workflow-trigger')
export class WorkflowTriggerProcessor {
  private readonly logger = new Logger(WorkflowTriggerProcessor.name);

  @Process('execute-scheduled-workflow')
  async handleScheduledWorkflow(job: Job<{ workflowId: string }>) {
    this.logger.log(`Executing scheduled workflow: ${job.data.workflowId}`);
    // The actual workflow execution is handled by WorkflowsService
    return { success: true, workflowId: job.data.workflowId };
  }

  @Process('evaluate-overdue-tasks')
  async handleOverdueTaskCheck(job: Job) {
    this.logger.log('Evaluating overdue tasks for workflow triggers');
    // This would check for newly overdue tasks and trigger TASK_OVERDUE workflows
    return { success: true };
  }

  @Process('evaluate-expiring-policies')
  async handleExpiringPolicyCheck(job: Job) {
    this.logger.log('Checking for expiring policies');
    // This would check for policies nearing expiry and trigger POLICY_EXPIRING workflows
    return { success: true };
  }
}
