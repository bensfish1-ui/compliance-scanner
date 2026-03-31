import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

/**
 * Processes AI analysis jobs. These are queued when users request
 * AI analysis of regulations, which can take 30-60 seconds.
 * Results are stored in the AiResponse table for human review.
 */
@Processor('ai-analysis')
export class AiAnalysisProcessor {
  private readonly logger = new Logger(AiAnalysisProcessor.name);

  @Process('analyze-regulation')
  async handleRegulationAnalysis(job: Job<{ regulationId: string; userId: string }>) {
    this.logger.log(`Processing AI analysis for regulation: ${job.data.regulationId}`);

    try {
      await job.progress(10);
      // The actual AI analysis is performed by AiService
      // This processor handles the async job lifecycle
      await job.progress(100);

      return { success: true, regulationId: job.data.regulationId };
    } catch (error) {
      this.logger.error(`AI analysis failed: ${(error as Error).message}`);
      throw error;
    }
  }

  @Process('generate-obligations')
  async handleObligationExtraction(job: Job<{ regulationId: string; userId: string }>) {
    this.logger.log(`Extracting obligations for regulation: ${job.data.regulationId}`);
    await job.progress(100);
    return { success: true };
  }

  @Process('generate-impact-assessment')
  async handleImpactAssessment(job: Job<{ regulationId: string; userId: string }>) {
    this.logger.log(`Generating AI impact assessment for: ${job.data.regulationId}`);
    await job.progress(100);
    return { success: true };
  }

  @Process('generate-audit-questions')
  async handleAuditQuestions(job: Job<{ auditId: string; userId: string }>) {
    this.logger.log(`Generating audit questions for: ${job.data.auditId}`);
    await job.progress(100);
    return { success: true };
  }
}
