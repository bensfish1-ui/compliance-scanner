###############################################################################
# Compliance Scanner - Terraform Outputs
###############################################################################

# VPC
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

# RDS
output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

# Redis
output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_cluster.main.cache_nodes[0].port
}

# OpenSearch
output "opensearch_endpoint" {
  description = "OpenSearch domain endpoint"
  value       = aws_opensearch_domain.main.endpoint
}

output "opensearch_dashboard_endpoint" {
  description = "OpenSearch Dashboards endpoint"
  value       = aws_opensearch_domain.main.dashboard_endpoint
}

# S3
output "documents_bucket_name" {
  description = "S3 bucket name for document storage"
  value       = aws_s3_bucket.documents.id
}

output "documents_bucket_arn" {
  description = "S3 bucket ARN for document storage"
  value       = aws_s3_bucket.documents.arn
}

output "frontend_bucket_name" {
  description = "S3 bucket name for frontend static hosting"
  value       = aws_s3_bucket.frontend.id
}

# CloudFront
output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_distribution_url" {
  description = "CloudFront distribution domain name"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

# ALB
output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.main.arn
}

# Cognito
output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.main.arn
}

output "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.main.id
}

# ECR
output "ecr_repository_url" {
  description = "ECR repository URL for backend image"
  value       = aws_ecr_repository.backend.repository_url
}

# ECS
output "ecs_cluster_name" {
  description = "ECS Fargate cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS Fargate cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "ECS backend service name"
  value       = aws_ecs_service.backend.name
}

# SQS
output "sqs_background_jobs_queue_url" {
  description = "SQS background jobs queue URL"
  value       = aws_sqs_queue.background_jobs.url
}

output "sqs_document_processing_queue_url" {
  description = "SQS document processing queue URL"
  value       = aws_sqs_queue.document_processing.url
}

# SNS
output "sns_notifications_topic_arn" {
  description = "SNS notifications topic ARN"
  value       = aws_sns_topic.notifications.arn
}

# Secrets
output "database_url_secret_arn" {
  description = "ARN of the database URL secret in Secrets Manager"
  value       = aws_secretsmanager_secret.database_url.arn
}
