import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Processes recurring audit scheduling.
 * Checks for audits with recurrence rules and creates new audit instances.
 */
@Processor('audit-scheduler')
export class AuditSchedulerProcessor {
  private readonly logger = new Logger(AuditSchedulerProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('schedule-recurring-audits')
  async handleRecurringAudits(job: Job) {
    this.logger.log('Processing recurring audit scheduling');

    const recurringAudits = await this.prisma.audit.findMany({
      where: {
        isRecurring: true,
        recurringPattern: { not: Prisma.JsonNullValueFilter.JsonNull },
        status: 'COMPLETED',
      },
    });

    let created = 0;
    for (const audit of recurringAudits) {
      try {
        // Create a new audit instance based on the recurring template
        await this.prisma.audit.create({
          data: {
            title: `${audit.title} (Recurring)`,
            description: audit.description,
            type: audit.type,
            status: 'PLANNED',
            leadAuditorId: audit.leadAuditorId,
            isRecurring: true,
            recurringPattern: audit.recurringPattern as any,
            startDate: new Date(), // Would be calculated from recurrence pattern
          },
        });
        created++;
      } catch (error) {
        this.logger.error(`Failed to create recurring audit from ${audit.id}: ${(error as Error).message}`);
      }
    }

    this.logger.log(`Created ${created} recurring audit instances`);
    return { success: true, created };
  }
}
