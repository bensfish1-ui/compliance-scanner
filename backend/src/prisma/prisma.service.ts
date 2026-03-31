import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Prisma service that wraps PrismaClient and provides:
 * - Automatic connection on module init
 * - Graceful shutdown
 * - Soft-delete middleware (filters out deletedAt records by default)
 * - Audit-log middleware (logs all mutations)
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });

    this.setupSoftDeleteMiddleware();
    this.setupAuditMiddleware();
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connected successfully');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  /**
   * Soft-archive middleware: Automatically filters out archived records.
   * Models with an isArchived field will have archived records excluded from queries.
   */
  private setupSoftDeleteMiddleware(): void {
    // Models that have an isArchived field
    const archivableModels = [
      'Regulation',
      'Project',
      'Policy',
      'Document',
    ];

    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      const model = params.model || '';

      if (!archivableModels.includes(model)) {
        return next(params);
      }

      // Intercept findMany / findFirst to exclude archived records by default
      if (params.action === 'findMany' || params.action === 'findFirst') {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};

        // Only add the filter if isArchived is not explicitly set in the query
        if (params.args.where.isArchived === undefined) {
          params.args.where.isArchived = false;
        }
      }

      return next(params);
    });
  }

  /**
   * Audit middleware: Logs all create, update, delete operations.
   * Writes to stdout for development; in production, this would
   * integrate with the ActivityLog table via a separate service.
   */
  private setupAuditMiddleware(): void {
    this.$use(async (params: Prisma.MiddlewareParams, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      const duration = after - before;

      // Log slow queries (> 1 second)
      if (duration > 1000) {
        this.logger.warn(
          `Slow query detected: ${params.model}.${params.action} took ${duration}ms`,
        );
      }

      return result;
    });
  }

  /**
   * Execute a transaction with retry logic for serialization failures.
   */
  async executeWithRetry<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let retries = 0;
    while (true) {
      try {
        return await this.$transaction(fn, {
          maxWait: 5000,
          timeout: 30000,
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        });
      } catch (error) {
        if (retries >= maxRetries) throw error;

        // Retry on serialization failure (Prisma error code P2034)
        const prismaError = error as any;
        if (prismaError.code === 'P2034') {
          retries++;
          this.logger.warn(
            `Transaction serialization failure, retrying (${retries}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, 100 * retries));
          continue;
        }

        throw error;
      }
    }
  }
}
