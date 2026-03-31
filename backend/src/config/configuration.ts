/**
 * Typed application configuration.
 * All environment variables are centralized here and injected via ConfigService.
 */
export const configuration = () => ({
  // Application
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000',

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  // AWS
  aws: {
    region: process.env.AWS_REGION || 'eu-west-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'compliance-scanner-documents',
      endpoint: process.env.AWS_S3_ENDPOINT, // For LocalStack
    },
    cognito: {
      userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      clientId: process.env.AWS_COGNITO_CLIENT_ID,
      region: process.env.AWS_COGNITO_REGION || process.env.AWS_REGION || 'eu-west-1',
    },
    ses: {
      fromEmail: process.env.AWS_SES_FROM_EMAIL || 'noreply@compliancescanner.io',
      region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'eu-west-1',
    },
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.1'),
  },

  // OpenSearch
  opensearch: {
    node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
    username: process.env.OPENSEARCH_USERNAME || 'admin',
    password: process.env.OPENSEARCH_PASSWORD || 'admin',
    indexPrefix: process.env.OPENSEARCH_INDEX_PREFIX || 'compliance',
  },

  // JWT (for internal tokens, Cognito handles primary auth)
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Slack / Teams integration
  integrations: {
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    teamsWebhookUrl: process.env.TEAMS_WEBHOOK_URL,
  },

  // File upload limits
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB default
    allowedMimeTypes: (
      process.env.ALLOWED_MIME_TYPES ||
      'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ).split(','),
  },
});

export type AppConfig = ReturnType<typeof configuration>;
