import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RegulationsModule } from './modules/regulations/regulations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AuditsModule } from './modules/audits/audits.module';
import { ImpactAssessmentsModule } from './modules/impact-assessments/impact-assessments.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { RisksModule } from './modules/risks/risks.module';
import { ControlsModule } from './modules/controls/controls.module';
import { ObligationsModule } from './modules/obligations/obligations.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AiModule } from './modules/ai/ai.module';
import { SearchModule } from './modules/search/search.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HorizonScanningModule } from './modules/horizon-scanning/horizon-scanning.module';
import { JobsModule } from './jobs/jobs.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    // Global configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),

    // Rate limiting - 100 requests per 60 seconds by default
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Cron jobs and scheduled tasks
    ScheduleModule.forRoot(),

    // Event emitter for domain events
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // In-memory cache (swap to redis store in production)
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default TTL
    }),

    // BullMQ for background job processing
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', ''),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 200,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [ConfigService],
    }),

    // Core modules
    PrismaModule,

    // Feature modules
    AuthModule,
    RegulationsModule,
    ProjectsModule,
    TasksModule,
    AuditsModule,
    ImpactAssessmentsModule,
    PoliciesModule,
    DocumentsModule,
    EvidenceModule,
    RisksModule,
    ControlsModule,
    ObligationsModule,
    WorkflowsModule,
    NotificationsModule,
    DashboardModule,
    AiModule,
    SearchModule,
    ReportsModule,
    SettingsModule,
    HorizonScanningModule,

    // Background jobs
    JobsModule,

    // Domain events
    EventsModule,
  ],
})
export class AppModule {}
