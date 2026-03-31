import * as Joi from 'joi';

/**
 * Joi validation schema for environment variables.
 * Ensures all required config is present at startup.
 */
export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'staging').default('development'),
  PORT: Joi.number().default(4000),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: Joi.string().required().description('PostgreSQL connection string'),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),

  // AWS Core
  AWS_REGION: Joi.string().default('eu-west-1'),
  AWS_ACCESS_KEY_ID: Joi.string().optional().allow('').default(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional().allow('').default(''),

  // AWS S3
  AWS_S3_BUCKET: Joi.string().default('compliance-scanner-documents'),
  AWS_S3_ENDPOINT: Joi.string().optional().allow(''),

  // AWS Cognito
  AWS_COGNITO_USER_POOL_ID: Joi.string().optional().allow('').default(''),
  AWS_COGNITO_CLIENT_ID: Joi.string().optional().allow('').default(''),
  AWS_COGNITO_REGION: Joi.string().optional(),

  // AWS SES
  AWS_SES_FROM_EMAIL: Joi.string().default('noreply@compliancescanner.io'),
  AWS_SES_REGION: Joi.string().optional(),

  // OpenAI
  OPENAI_API_KEY: Joi.string().optional().allow('').default(''),
  OPENAI_MODEL: Joi.string().default('gpt-4-turbo-preview'),
  OPENAI_EMBEDDING_MODEL: Joi.string().default('text-embedding-3-small'),
  OPENAI_MAX_TOKENS: Joi.number().default(4096),
  OPENAI_TEMPERATURE: Joi.number().min(0).max(2).default(0.1),

  // OpenSearch
  OPENSEARCH_NODE: Joi.string().default('http://localhost:9200'),
  OPENSEARCH_USERNAME: Joi.string().default('admin'),
  OPENSEARCH_PASSWORD: Joi.string().default('admin'),
  OPENSEARCH_INDEX_PREFIX: Joi.string().default('compliance'),

  // JWT
  JWT_SECRET: Joi.string().default('change-me-in-production'),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  // Integrations
  SLACK_WEBHOOK_URL: Joi.string().optional().allow(''),
  TEAMS_WEBHOOK_URL: Joi.string().optional().allow(''),

  // Upload
  MAX_FILE_SIZE: Joi.number().default(52428800),
  ALLOWED_MIME_TYPES: Joi.string().optional(),
});
