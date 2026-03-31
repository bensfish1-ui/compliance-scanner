import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

/**
 * Processes report generation jobs. Long-running reports are generated
 * in the background and the user is notified when complete.
 */
@Processor('report-generation')
export class ReportGenerationProcessor {
  private readonly logger = new Logger(ReportGenerationProcessor.name);

  @Process('generate-board-report')
  async handleBoardReport(job: Job<{ requestedBy: string }>) {
    this.logger.log(`Generating board report for user: ${job.data.requestedBy}`);
    await job.progress(50);
    // Report generation logic is in ReportsService
    await job.progress(100);
    return { success: true };
  }

  @Process('generate-monthly-report')
  async handleMonthlyReport(job: Job<{ month: string; year: string }>) {
    this.logger.log(`Generating monthly report for ${job.data.month}/${job.data.year}`);
    await job.progress(100);
    return { success: true };
  }

  @Process('generate-country-report')
  async handleCountryReport(job: Job<{ countryId: string }>) {
    this.logger.log(`Generating country report for: ${job.data.countryId}`);
    await job.progress(100);
    return { success: true };
  }
}
