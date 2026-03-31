###############################################################################
# Compliance Scanner - Terraform Variables
###############################################################################

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-west-2"
}

variable "environment" {
  description = "Deployment environment (staging or production)"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "compliance-scanner"
}

variable "db_instance_class" {
  description = "RDS instance class for PostgreSQL"
  type        = string
  default     = "db.t3.medium"
}

variable "db_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "compliance_scanner"
}

variable "db_username" {
  description = "Master username for the PostgreSQL database"
  type        = string
  default     = "csadmin"
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "opensearch_instance_type" {
  description = "OpenSearch instance type"
  type        = string
  default     = "t3.small.search"
}

variable "ecs_cpu" {
  description = "CPU units for the ECS Fargate task (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "ecs_memory" {
  description = "Memory (MiB) for the ECS Fargate task"
  type        = number
  default     = 1024
}

variable "domain_name" {
  description = "Optional custom domain name for the application"
  type        = string
  default     = ""
}

variable "cognito_callback_urls" {
  description = "List of allowed callback URLs for Cognito"
  type        = list(string)
  default     = ["http://localhost:3000/auth/callback"]
}

variable "cors_allowed_origins" {
  description = "List of allowed CORS origins for S3 and API"
  type        = list(string)
  default     = ["http://localhost:3000"]
}
