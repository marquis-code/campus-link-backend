# ── Build Stage ──
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install ALL dependencies (dev included, needed for nest build)
RUN npm ci

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# ── Production Stage ──
FROM node:22-alpine

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Install curl for healthchecking in the final runner stage
RUN apk add --no-cache curl

# Don't run as root for container breakout prevention
USER node

# Expose internal API port
EXPOSE 3000

# Health check to ensure the NestJS API is responding to network requests
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application using standard npm start script
CMD ["npm", "run", "start:prod"]
