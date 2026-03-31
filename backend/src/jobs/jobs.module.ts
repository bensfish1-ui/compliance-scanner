import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RegulationSyncProcessor } from './processors/regulation-sync.processor';
import { OcrProcessor } from './processors/ocr.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { ReportGenerationProcessor } from './processors/report-generation.processor';
import { AiAnalysisProcessor } from './processors/ai-analysis.processor';
import { AuditSchedulerProcessor } from './processors/audit-scheduler.processor';
import { WorkflowTriggerProcessor } from './processors/workflow-trigger.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'regulation-sync' },
      { name: 'ocr' },
      { name: 'notifications' },
      { name: 'report-generation' },
      { name: 'ai-analysis' },
      { name: 'audit-scheduler' },
      { name: 'workflow-trigger' },
    ),
  ],
  providers: [
    RegulationSyncProcessor,
    OcrProcessor,
    NotificationProcessor,
    ReportGenerationProcessor,
    AiAnalysisProcessor,
    AuditSchedulerProcessor,
    WorkflowTriggerProcessor,
  ],
  exports: [BullModule],
})
export class JobsModule {}
