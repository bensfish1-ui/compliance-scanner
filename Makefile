.PHONY: dev backend frontend db-migrate db-seed db-studio build test lint \
       docker-build docker-up docker-down terraform-init terraform-plan terraform-apply clean

# ─── Development ──────────────────────────────────────────────────────────────

dev: ## Start all services for local development
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis opensearch localstack
	@echo "Waiting for services to be healthy..."
	@sleep 5
	$(MAKE) -j2 backend frontend

backend: ## Start backend service only
	cd backend && npm run start:dev

frontend: ## Start frontend service only
	cd frontend && npm run dev

# ─── Database ─────────────────────────────────────────────────────────────────

db-migrate: ## Run Prisma database migrations
	cd backend && npx prisma migrate dev

db-seed: ## Seed the database with sample data
	cd backend && npx prisma db seed

db-studio: ## Open Prisma Studio GUI
	cd backend && npx prisma studio

db-reset: ## Reset database and re-seed
	cd backend && npx prisma migrate reset --force

db-generate: ## Generate Prisma client
	cd backend && npx prisma generate

# ─── Build ────────────────────────────────────────────────────────────────────

build: ## Build both backend and frontend
	$(MAKE) build-backend
	$(MAKE) build-frontend

build-backend: ## Build backend only
	cd backend && npm run build

build-frontend: ## Build frontend only
	cd frontend && npm run build

# ─── Test ─────────────────────────────────────────────────────────────────────

test: ## Run all tests
	$(MAKE) test-backend
	$(MAKE) test-frontend

test-backend: ## Run backend tests
	cd backend && npm run test

test-frontend: ## Run frontend lint (tests)
	cd frontend && npm run lint

test-e2e: ## Run backend end-to-end tests
	cd backend && npm run test:e2e

test-cov: ## Run backend tests with coverage
	cd backend && npm run test:cov

# ─── Lint ─────────────────────────────────────────────────────────────────────

lint: ## Lint all code
	$(MAKE) lint-backend
	$(MAKE) lint-frontend

lint-backend: ## Lint backend code
	cd backend && npm run lint

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint

format: ## Format all code
	cd backend && npm run format

# ─── Docker ───────────────────────────────────────────────────────────────────

docker-build: ## Build Docker images
	docker compose build

docker-up: ## Start all Docker containers
	docker compose up -d

docker-down: ## Stop all Docker containers
	docker compose down

docker-logs: ## Tail Docker container logs
	docker compose logs -f

docker-dev: ## Start Docker with dev overrides
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

docker-dev-down: ## Stop Docker dev containers
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# ─── Terraform ────────────────────────────────────────────────────────────────

terraform-init: ## Initialize Terraform
	cd infrastructure/terraform && terraform init

terraform-plan: ## Plan Terraform changes
	cd infrastructure/terraform && terraform plan -out=tfplan

terraform-apply: ## Apply Terraform changes
	cd infrastructure/terraform && terraform apply tfplan

terraform-destroy: ## Destroy Terraform infrastructure (use with caution)
	cd infrastructure/terraform && terraform destroy

terraform-fmt: ## Format Terraform files
	cd infrastructure/terraform && terraform fmt -recursive

terraform-validate: ## Validate Terraform configuration
	cd infrastructure/terraform && terraform validate

# ─── Setup ────────────────────────────────────────────────────────────────────

install: ## Install all dependencies
	cd backend && npm install
	cd frontend && npm install

setup: install db-generate ## Full project setup
	@echo "Project setup complete. Run 'make dev' to start development."

# ─── Clean ────────────────────────────────────────────────────────────────────

clean: ## Clean all build artifacts and containers
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v --remove-orphans
	rm -rf backend/dist backend/node_modules backend/coverage
	rm -rf frontend/.next frontend/out frontend/node_modules
	rm -rf infrastructure/terraform/.terraform infrastructure/terraform/tfplan

# ─── Help ─────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
