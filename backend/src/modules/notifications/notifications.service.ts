import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  entityType?: string;
  entityId?: string;
  link?: string;
  priority?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly sesClient: SESClient;
  private readonly fromEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
    private readonly configService: ConfigService,
  ) {
    this.sesClient = new SESClient({
      region: this.configService.get<string>('aws.ses.region', 'eu-west-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId', ''),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey', ''),
      },
    });
    this.fromEmail = this.configService.get<string>('aws.ses.fromEmail', 'noreply@compliancescanner.io');
  }

  async createNotification(params: CreateNotificationParams) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type as NotificationType,
        link: params.link,
        isRead: false,
        metadata: {
          ...(params.entityType ? { entityType: params.entityType } : {}),
          ...(params.entityId ? { entityId: params.entityId } : {}),
          ...(params.priority ? { priority: params.priority } : {}),
        },
      },
    });

    // Push real-time notification via WebSocket
    this.gateway.sendToUser(params.userId, {
      id: notification.id,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  async getUserNotifications(userId: string, query: PaginationQueryDto & { unreadOnly?: boolean }) {
    const where: any = { userId };
    if (query.unreadOnly) where.isRead = false;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async sendEmail(to: string, subject: string, htmlBody: string, textBody?: string) {
    try {
      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: htmlBody, Charset: 'UTF-8' },
            ...(textBody ? { Text: { Data: textBody, Charset: 'UTF-8' } } : {}),
          },
        },
      });

      await this.sesClient.send(command);
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
    }
  }

  async sendSlackNotification(message: string, channel?: string) {
    const webhookUrl = this.configService.get<string>('integrations.slackWebhookUrl');
    if (!webhookUrl) {
      this.logger.debug('Slack webhook URL not configured, skipping');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          ...(channel ? { channel } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status}`);
      }

      this.logger.log('Slack notification sent');
    } catch (error) {
      this.logger.error(`Failed to send Slack notification: ${(error as Error).message}`);
    }
  }

  async sendTeamsNotification(title: string, message: string) {
    const webhookUrl = this.configService.get<string>('integrations.teamsWebhookUrl');
    if (!webhookUrl) {
      this.logger.debug('Teams webhook URL not configured, skipping');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '@type': 'MessageCard',
          '@context': 'http://schema.org/extensions',
          summary: title,
          themeColor: '0076D7',
          title,
          sections: [{ activityTitle: title, text: message }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Teams webhook failed: ${response.status}`);
      }

      this.logger.log('Teams notification sent');
    } catch (error) {
      this.logger.error(`Failed to send Teams notification: ${(error as Error).message}`);
    }
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }
}
