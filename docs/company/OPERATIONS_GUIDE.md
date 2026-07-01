# AQLIYA Operations Guide

**適用對象:** Operations, SRE Team  
**Status:** Active | Version 1.0 | 2026-06-30

## Infrastructure

| Service | Technology | Status |
|---------|-----------|--------|
| Application Server | Next.js 16 (Node 22) | ✅ Dockerized |
| Database | PostgreSQL 16 + pgvector | ✅ Dockerized |
| Cache | Redis 7 Alpine | ✅ Dockerized |
| File Scanner | ClamAV | ✅ Dockerized |
| Backup | Automated via cron | ✅ Configured |

## Docker Stack

- 1 Dockerfile (multi-stage, node:22-alpine, standalone output)
- 5 docker-compose files (dev, test, staging, staging-local, pgvector-only)
- 6 services: app, db (pgvector), clamav, redis, backup

## CI/CD Pipeline

6 GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| ci.yml | Push/PR to main | Quality checks (tsc, lint, test) |
| deploy.yml | Push to main/staging | Build + deploy to AWS ECR |
| promote.yml | Manual | N-1 rollback, promotion |
| preview.yml | PR | Preview deployments |
| ackup.yml | Schedule | Database backup |
| governance.yml | Push | Governance checks |

## Monitoring

- **Sentry:** Client (20% traces), Server (50%), Edge (20%)
- **Health endpoints:** /api/health, /api/health/live, /api/health/ready
- **Integration health:** /api/integration/health
- **Enterprise health:** /api/platform/enterprise-health
- **Operator dashboard:** /operator, /monitoring

## Backup & Recovery

- Daily database backup via ackup.yml
- Manual: 
pm run db:backup
- Restore drill: 
pm run db:restore:drill  
- Backup verification: 
pm run backup:verify
- Runbooks: docs/runbooks/production-support-runbook.md

## Runbooks

Available in docs/runbooks/:
- decisionos-operator-guide.md
- workflowos-operator-guide.md
- institutional-memory-guide.md
- intelligence-core-rag.md
- production-support-runbook.md

## Secrets Management

- Environment variables via .env (40+ vars)
- Template: .env.example
- Sensitive secrets stored in VaultEntry model
- SSO secrets encrypted with AES-256-GCM
- Never commit .env files
