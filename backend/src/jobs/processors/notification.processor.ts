import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Processes batched notification jobs (email digests, bulk notifications).
 */
@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('send-email-notification')
  async handleEmailNotification(job: Job<{ to: string; subject: string; body: string }>) {
    this.logger.log(`Sending email notification to: ${job.data.to}`);
    // SES email sending is handled by NotificationsService
    // This processor handles bulk/queued email jobs
    return { success: true, to: job.data.to };
  }

  @Process('send-digest')
  async handleDigest(job: Job<{ userId: string; period: 'daily' | 'weekly' }>) {
    this.logger.log(`Generating ${job.data.period} digest for user: ${job.data.userId}`);

    const unreadNotifications = await this.prisma.notification.findMany({
      where: { userId: job.data.userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (unreadNotifications.length === 0) {
      return { success: true, message: 'No unread notifications' };
    }

    // In production, this would compile and send an email digest
    return {
      success: true,
      userId: job.data.userId,
      notificationCount: unreadNotifications.length,
    };
  }

  @Process('send-bulk-notification')
  async handleBulkNotification(job: Job<{ userIds: string[]; title: string; message: string; type: string }>) {
    this.logger.log(`Sending bulk notification to ${job.data.userIds.length} users`);

    const notifications = job.data.userIds.map((userId) => ({
      userId,
      title: job.data.title,
      message: job.data.message,
      type: job.data.type as NotificationType,
      isRead: false,
    }));

    await this.prisma.notification.createMany({ data: notifications });

    return { success: true, sent: notifications.length };
  }
}
