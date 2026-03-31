import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  // Configure Winston logger
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            return `${timestamp} [${context || 'Application'}] ${level}: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`;
          }),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, { logger });
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS', 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-Id'],
    credentials: true,
    maxAge: 86400,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global validation pipe - validates all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter for consistent error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // WebSocket adapter for real-time notifications
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger API documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Compliance Scanner API')
    .setDescription(
      'Enterprise compliance management platform API. ' +
        'Provides endpoints for managing regulations, projects, tasks, audits, ' +
        'risk assessments, policies, AI-powered analysis, and more.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your Cognito JWT token',
      },
      'bearer',
    )
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Regulations', 'Regulation lifecycle management')
    .addTag('Projects', 'Compliance project management')
    .addTag('Tasks', 'Task management with dependencies')
    .addTag('Audits', 'Audit programme management')
    .addTag('Impact Assessments', 'Regulatory impact assessments')
    .addTag('Policies', 'Policy document management')
    .addTag('Documents', 'Document storage and OCR')
    .addTag('Evidence', 'Evidence collection and management')
    .addTag('Risks', 'Risk register and assessment')
    .addTag('Controls', 'Control framework management')
    .addTag('Obligations', 'Regulatory obligations tracking')
    .addTag('Workflows', 'Automation workflow engine')
    .addTag('Notifications', 'Real-time notifications')
    .addTag('Dashboard', 'Dashboard and analytics')
    .addTag('AI', 'AI-powered analysis and generation')
    .addTag('Search', 'Full-text and faceted search')
    .addTag('Reports', 'Report generation and export')
    .addTag('Settings', 'System settings')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  logger.log(`Compliance Scanner API running on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
