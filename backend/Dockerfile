# ═══════════════════════════════════════════════════════════
# Multi-stage Dockerfile for Compliance Scanner Backend
# Stage 1: Build the application
# Stage 2: Production image with minimal footprint
# ═══════════════════════════════════════════════════════════

# ── Stage 1: Builder ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (tesseract, etc.)
RUN apk add --no-cache python3 make g++

# Copy package files first for better layer caching
COPY package.json package-lock.json* yarn.lock* ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production


# ── Stage 2: Production ──────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime dependencies for Tesseract OCR
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Create log directory
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
