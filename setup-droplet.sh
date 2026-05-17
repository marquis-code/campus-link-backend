#!/bin/bash

# ==============================================================================
# Kudihub DigitalOcean Droplet Automated Setup Script (Traefik v3.6 Adapted)
# ==============================================================================
# This script configures a fresh Ubuntu Droplet for production Docker deployments.
# Run on the Droplet using: chmod +x setup-droplet.sh && ./setup-droplet.sh
# ==============================================================================

set -e

# Output Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Kudihub Backend Droplet Setup (Traefik) ===${NC}"

# 1. Update and Upgrade packages
echo -e "\n${YELLOW}[1/6] Updating system package index...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# 2. Install essential dependencies
echo -e "\n${YELLOW}[2/6] Installing core utilities (curl, git, ufw)...${NC}"
sudo apt-get install -y curl git ufw ca-certificates gnupg lsb-release

# 3. Create LetsEncrypt storage directory on the host
echo -e "\n${YELLOW}[3/6] Initializing letsencrypt data directories...${NC}"
mkdir -p letsencrypt
touch letsencrypt/acme.json
chmod 600 letsencrypt/acme.json # Strict permissions required by Traefik
echo -e "${GREEN}✔ LetsEncrypt acme.json initialized with 600 permissions.${NC}"

# 4. Install Docker Engine
echo -e "\n${YELLOW}[4/6] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    # Download and run the official Docker installer script
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✔ Docker installed successfully.${NC}"
else
    echo -e "${GREEN}✔ Docker is already installed.${NC}"
fi

# 5. Configure Docker user permissions
echo -e "\n${YELLOW}[5/6] Adding current user to the Docker group...${NC}"
if ! groups $USER | grep &>/dev/null '\bdocker\b'; then
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✔ User added to docker group. (Will take effect on next login or running 'newgrp docker').${NC}"
else
    echo -e "${GREEN}✔ User is already in the docker group.${NC}"
fi

# 6. Configure Host Security Firewall (UFW)
echo -e "\n${YELLOW}[6/6] Securing Droplet host with UFW Firewall...${NC}"
# Reset firewall rules
sudo ufw --force reset

# Set default policies (Deny all incoming, allow all outgoing)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow standard web server traffic
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
sudo ufw --force enable

# Show status
sudo ufw status verbose

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}✔ Droplet Host Setup Completed Successfully!${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "${YELLOW}IMPORTANT NEXT STEPS:${NC}"
echo -e "1. Log out of your SSH session and log back in to apply Docker group changes."
echo -e "2. Clone your git repository onto the droplet."
echo -e "3. Create a '.env' file from the '.env.example' in the application folder."
echo -e "4. Execute the deployment script: './deploy.sh' to spin up your stack."
echo -e "${GREEN}======================================================================${NC}"
