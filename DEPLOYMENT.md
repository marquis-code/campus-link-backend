# Kudihub (CampusLink) Backend Production Deployment Guide - Traefik v3.6

This guide details the step-by-step instructions to deploy the Kudihub NestJS backend to a **DigitalOcean Droplet** using Docker, Docker Compose, Redis, and **Traefik v3.6** with automatic SSL routing.

---

## 📋 System Requirements & Recommendations

*   **Host OS:** Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (x64)
*   **Recommended Hardware Specs:**
    *   **Minimum:** 1 vCPU, 2GB RAM, 25GB SSD (Recommended).
    *   *Note:* If you use a 1GB RAM droplet, the NestJS TypeScript compiler (`npm run build`) may occasionally run out of memory. If this happens, you can easily enable a swap file on the droplet (detailed below) to support the build.

---

## 🌐 Step 1: Point Your Domain DNS

Before provisioning Traefik, point your API domain name (e.g., `api.kudihub.com`) to the Droplet's public IP address:

1. Log into your Domain DNS Provider (e.g., Namecheap, GoDaddy, Cloudflare).
2. Add an **A Record**:
    *   **Host:** `api` (or `@` if using the root domain)
    *   **Value:** `192.34.58.210`
    *   **TTL:** Automatic or 120 seconds.

---

## 🔑 Step 2: Access Your Droplet via SSH

Connect to your droplet via terminal:
```bash
ssh root@192.34.58.210
```

---

## ⚙️ Step 3: Host Machine Provisioning

We provided a `setup-droplet.sh` script to configure the host machine automatically (install Docker, Git, secure the firewall, and prepare the Traefik SSL directories).

1. Clone your backend repository onto the droplet:
    ```bash
    git clone <your-git-repo-url> /var/www/kudihub-backend
    cd /var/www/kudihub-backend
    ```
2. Make the setup script executable and run it:
    ```bash
    chmod +x setup-droplet.sh
    ./setup-droplet.sh
    ```
3. **Log out of your SSH session and log back in** to apply Docker permissions to your user!
    ```bash
    exit
    ssh root@YOUR_DROPLET_IP
    cd /var/www/kudihub-backend
    ```

---

## 📝 Step 4: Configure Production Environment Variables

1. Copy the environment template file:
    ```bash
    cp .env.example .env
    ```
2. Edit the `.env` file to add your actual production credentials:
    ```bash
    nano .env
    ```
3. Set your production domain, ACME email, and correct third-party API keys (Cloudinary, Resend, Firebase, Paystack, MONGODB_URI):
    *   `DOMAIN=api.yourdomain.com`
    *   `ACME_EMAIL=hello@yourdomain.com`
    *   `PORT=3000`
    *   `REDIS_URL=redis://redis:6379`
    *   `MONGODB_URI=mongodb+srv://...`
4. Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit Nano.

---

## 🚀 Step 5: Hot-Deploying the Application

Run the automated deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

### What this script does automatically:
1. Validates that the `.env` configuration file is present.
2. Checks for Git updates (`git pull`).
3. Runs `docker compose` to compile and launch services:
    *   Compiles NestJS under a multi-stage Alpine Node 22 build.
    *   Spins up **Traefik v3.6** which listens on port 80/443 and auto-provisions SSL certificates via the Let's Encrypt TLS challenge.
    *   Spins up **Redis** configured with custom snapshot saving (`--save 20 1`).
4. Conducts an automated active healthcheck at `http://localhost:[PORT]/api/health` to verify NestJS, Redis, and MongoDB are fully integrated.
5. Cleans up dangling Docker build caches and images to save disk space.

---

## 📊 Step 6: Status Monitoring & Logging

Use these helpful commands on your Droplet to monitor runtime state:

### Check Running Containers
```bash
docker compose ps
```

### View Real-time Application Logs
```bash
docker compose logs -f api
```

### View Traefik Routing & SSL logs
```bash
docker compose logs -f reverse-proxy
```

### Restart All Services
```bash
docker compose restart
```

---

## 💡 Troubleshooting & Tips

### ⚡ 1. Memory issues during build (1GB RAM Droplets)
If the build process hangs or fails on a low-RAM droplet, run these commands to set up a 2GB virtual memory swap file:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 🔒 2. Checking Active Firewall Rules
The setup script configures a UFW firewall that blocks all traffic except SSH (22), HTTP (80), and HTTPS (443). To check rules:
```bash
sudo ufw status
```

### 🌍 3. Checking API Health Status
You can check real-time connection status by hitting your health endpoint in the browser or terminal:
```bash
curl https://api.yourdomain.com/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "uptime": 128.45,
  "timestamp": "2026-05-17T10:18:00.000Z",
  "services": {
    "database": "connected",
    "cache": "healthy"
  }
}
```

---

## 🤖 Step 7: Automated CI/CD with GitHub Actions

Every push to your `main` or `master` branches automatically builds the application container inside GitHub's robust cloud environment and safely pushes it to GitHub Container Registry (GHCR). It then signs into your DigitalOcean Droplet over SSH and executes a zero-downtime reload!

### 🔑 1. Setup SSH Keypair for GitHub Actions
To allow GitHub Actions to safely authenticate into your Droplet without typing passwords:

1.  On your **local machine** (or Droplet), generate a new SSH keypair:
    ```bash
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key
    ```
2.  Add the generated **public key** to your Droplet's authorized keys list:
    ```bash
    cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    chmod 700 ~/.ssh
    ```
3.  Keep the **private key** (`~/.ssh/github_deploy_key`) safe. You will copy this private key to GitHub Secrets in the next step.

### 🔒 2. Configure GitHub Repository Secrets
1. Navigate to your Kudihub Backend GitHub Repository.
2. Go to **Settings** -> **Secrets and variables** -> **Actions** -> click **New repository secret**.
3. Create the following four secrets:

| Secret Name | Value Example | Description |
| :--- | :--- | :--- |
| **`PROD_SSH_HOST`** | `192.34.58.210` | Your Droplet's Public IP address |
| **`PROD_SSH_USER`** | `root` | Typically `root` (or your non-root deployment username) |
| **`PROD_SSH_KEY`** | `-----BEGIN OPENSSH PRIVATE KEY----- ...` | The complete contents of `~/.ssh/github_deploy_key` |
| **`PROD_SSH_PORT`** | `22` | Typically `22` (default SSH port) |

### 🛠️ 3. How the Pipeline Runs
Once the secrets are in place, making a push to the `main` or `master` branches triggers the workflow defined in `.github/workflows/deploy.yml`:
1.  **Build Phase (on GitHub):** Builds the high-efficiency TypeScript production container and pushes it to `ghcr.io/marquis-code/campus-link-backend:<branch>`.
2.  **Deploy Phase (on Droplet):** Connects via SSH, runs `git pull` to sync configuration files, authenticates the droplet with GHCR, pulls the fresh image, and restarts the backend with zero downtime (`up -d --force-recreate`).
3.  **Logs Audit:** To monitor active builds, visit the **Actions** tab on your GitHub repository page.

