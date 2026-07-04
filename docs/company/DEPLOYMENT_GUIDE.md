# AQLIYA Deployment Guide

**適用對象:** DevOps, Client IT  
**Status:** Active | Version 1.0 | 2026-06-30

## Prerequisites

- Node.js 22+
- PostgreSQL 16 with pgvector extension
- Redis 7 (optional, fallback to in-memory)
- Docker (recommended for local dev)

## Environment Variables

40+ env vars configured in .env.example. Key groups:
- Database: DATABASE_URL
- Auth: AUTH_SECRET, NEXTAUTH_SECRET
- AI: AI_PROVIDER, ANTHROPIC_API_KEY, OPENAI_API_KEY
- Storage: STORAGE_PROVIDER (local/S3)
- Rate Limiting: RATE_LIMITER (memory/redis)
- Monitoring: SENTRY_DSN

## Cloud Deployment (AWS)

Target: me-south-1 region

`ash
# Build and push to ECR
npm run build
docker build -t aqliya-app .
docker tag aqliya-app:latest 
docker push 

# Deploy via ECS (automated via deploy.yml)
`

## Docker Deployment

`ash
docker compose up -d db
npm run build
npm run start
`

## Migration Procedure

`ash
# Generate migration after schema changes
npx prisma migrate dev --name <description>

# Apply to production
npx prisma migrate deploy

# Seed data
npx prisma db seed
`

## Health Check

After deployment, verify:
1. GET /api/health → 200
2. GET /api/health/ready → DB connected
3. 
px tsc --noEmit → 0 errors
4. 
pm run build → passes
5. 
pm run demo:smoke → passes
6. Runbook: docs/runbooks/production-support-runbook.md

## Important Notes
- CSP headers configured in 
ext.config.mjs
- Rate limiting via RATE_LIMITER env
- SSO operator setup required (not L6 automated; L5 pilot-ready with operator keys)
- No production On-Prem package yet
