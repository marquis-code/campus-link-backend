#!/bin/bash

# ==============================================================================
# Kudihub Backend Production Docker Automated Deployment Script (Traefik v3.6)
# ==============================================================================
# Run this script on the droplet to pull changes, rebuild, and hot-restart services.
# Run using: chmod +x deploy.sh && ./deploy.sh
# ==============================================================================

set -e

# Output Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Kudihub Backend Deployment (Traefik) ===${NC}"

# 1. Verify that the production .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: '.env' file not found in current directory!${NC}"
    echo -e "${YELLOW}Please create a '.env' file based on '.env.example' and fill in production keys before deploying.${NC}"
    exit 1
fi

# Load port configuration from .env file (default to 3000 if not found)
PORT=$(grep -E "^PORT=" .env | cut -d'=' -f2 | tr -d '"'\'' ' || true)
if [ -z "$PORT" ]; then
    PORT=3000
fi

# Detect current git branch name to pull the correct container tag from GHCR
if [ -d .git ]; then
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD || true)
    if [ ! -z "$GIT_BRANCH" ] && [ "$GIT_BRANCH" != "HEAD" ]; then
        export IMAGE_TAG="$GIT_BRANCH"
        echo -e "${GREEN}✔ Detected git branch: $IMAGE_TAG. Pulling matching tag from GHCR.${NC}"
    fi
fi
if [ -z "$IMAGE_TAG" ]; then
    export IMAGE_TAG="master"
    echo -e "${YELLOW}ℹ Could not detect git branch. Falling back to IMAGE_TAG=master.${NC}"
fi

# 3. Pull and launch services in detached mode
echo -e "\n${YELLOW}[1/3] Pulling and launching Docker containers from GHCR...${NC}"
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate --remove-orphans

echo -e "${GREEN}✔ Docker containers successfully pulled and launched in detached mode.${NC}"

# 4. Perform an active Health check to verify NestJS app is fully booted and healthy
echo -e "\n${YELLOW}[2/3] Running health checks... (waiting for NestJS API to boot)${NC}"

HEALTH_URL="http://localhost:${PORT}/api/health"
MAX_ATTEMPTS=15
ATTEMPT=1
SUCCESS=0

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo -e "Attempt $ATTEMPT/$MAX_ATTEMPTS: Hitting $HEALTH_URL..."
    
    # Check if app is responding with HTTP status 200
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || true)
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo -e "${GREEN}✔ NestJS Application is HEALTHY! (HTTP 200)${NC}"
        SUCCESS=1
        break
    elif [ "$HTTP_STATUS" -eq 503 ]; then
        echo -e "${RED}❌ Application is UNHEALTHY! (HTTP 503 - DB or Cache Down)${NC}"
        # Dump failure logs from container for immediate visibility
        docker compose logs api --tail=20
        exit 1
    else
        echo -e "Status code: $HTTP_STATUS. App is still starting up, sleeping for 4 seconds..."
        sleep 4
    fi
    ATTEMPT=$((ATTEMPT+1))
done

if [ $SUCCESS -ne 1 ]; then
    echo -e "${RED}❌ Error: NestJS Application did not become healthy in time (timeout).${NC}"
    echo -e "${YELLOW}Dumping application container logs to diagnose:${NC}"
    docker compose logs api --tail=50
    exit 1
fi

# 5. Clean up old dangling images and builders (important for DO Droplet disk space!)
echo -e "\n${YELLOW}[3/3] Pruning dangling Docker assets and build cache...${NC}"
docker image prune -f
docker builder prune -f
echo -e "${GREEN}✔ Docker system prune completed.${NC}"

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}✔ Kudihub Backend Successfully Deployed and Verified!${NC}"
echo -e "${GREEN}======================================================================${NC}"
docker compose ps
echo -e "${GREEN}======================================================================${NC}"
