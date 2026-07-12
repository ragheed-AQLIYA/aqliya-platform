# On-Premise Deployment Guide

> **Status:** Draft — v0.1
> **Last Updated:** 2026-07-11
> **Note:** This guide describes the strategic On-Premise deployment direction.
> Current implementation uses ECS Fargate (cloud). On-Premise package is planned for v0.2.

## Overview

AQLIYA can be deployed in private/on-premise environments using Docker Compose.
This guide covers the architecture, prerequisites, and deployment steps.

## Architecture

The on-premise deployment uses the same Docker Compose configuration as development:

| Service     | Role                          | Image                     |
|-------------|-------------------------------|---------------------------|
| app         | Next.js application           | Build from Dockerfile     |
| db          | PostgreSQL 16 + pgvector      | pgvector/pgvector:pg16    |
| redis       | Cache + rate limiter backend  | redis:7-alpine            |
| clamav      | File virus scanning           | clamav/clamav:1.3         |
| backup      | Scheduled database backups    | Build from Dockerfile     |

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- Node.js 22+ (for build only)
- 4 GB RAM minimum, 8 GB recommended
- 20 GB free disk space
- Network access to:
  - Docker Hub (for pulling images)
  - ClamAV mirror (db.local.clamav.net)
  - Anthropic API (if AI features enabled)
  - OpenAI API (if AI features enabled)

## Deployment Steps

### 1. Clone and Build
```bash
git clone https://github.com/aqliya/platform.git aqliya
cd aqliya
cp .env.example .env
# Edit .env with your configuration
npm install
npm run build
```

### 2. Configure Environment
Required variables in .env:
- AUTH_SECRET (openssl rand -base64 32)
- DOWNLOAD_TOKEN_SECRET (openssl rand -base64 32)
- DATABASE_URL
- REDIS_URL (optional, falls back to in-memory)
- SCANNER_PROVIDER (clamav or none)

### 3. Start Services
```bash
docker compose up -d
```

### 4. Run Database Migrations
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5. Verify
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/ready
```

## Air-Gapped Deployment

For environments without internet access:

1. Pull all Docker images on a connected machine:
```bash
docker pull pgvector/pgvector:pg16
docker pull redis:7-alpine
docker pull clamav/clamav:1.3
docker save pgvector/pgvector:pg16 redis:7-alpine clamav/clamav:1.3 > images.tar
```

2. Transfer images.tar to the air-gapped environment:
```bash
docker load < images.tar
```

3. Build the application image on the air-gapped machine (source code only):
```bash
# Transfer source code via USB drive or internal git
npm ci
npm run build
docker build -t aqliya-app .
```

4. Configure environment and start:
```bash
docker compose -f docker-compose.yml -f docker-compose.air-gap.yml up -d
```

Note: AI features require API key configuration. In air-gapped mode, use a local AI provider or leave FF_AI_REAL_PROVIDERS unset.

## Security Considerations

- All passwords must be changed from defaults
- REDIS_PASSWORD must be set for multi-instance deployments
- HTTPS should be terminated at a reverse proxy (nginx, Traefik, or Caddy)
- Regular backups must be configured (see docs/operations/backup-restore-procedure.md)
- ClamAV requires regular freshclam updates (can be scheduled via cron)

## Limitations (v0.1)

- No built-in SSL/TLS termination (requires reverse proxy)
- No horizontal scaling (single instance)
- No automated backup orchestration (use cron)
- No monitoring dashboard for on-premise (use docker logs)
- ClamAV virus definitions must be updated manually in air-gapped mode

## Reference

- docker-compose.yml: https://github.com/aqliya/platform/blob/main/docker-compose.yml
- Runbook: Backup/Restore: docs/operations/backup-restore-procedure.md
- Runbook: Production Deployment: docs/operations/production-deployment-runbook.md
- Infrastructure Blueprint: docs/infrastructure/AQLIYA_AWS_FOUNDATION_BLUEPRINT.md
