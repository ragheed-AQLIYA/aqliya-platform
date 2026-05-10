# Deployment Guide

## Target: Vercel + Neon PostgreSQL

**Rationale**: The app is a Next.js 16.2.4 project using NextAuth.js v5 with Prisma and PostgreSQL.
Vercel provides native Next.js optimization, edge-ready serverless functions, and
zero-config deployment. Neon provides a serverless PostgreSQL database with
connection pooling, which is required for Prisma Driver Adapter (`@prisma/adapter-pg`) in serverless environments.

---

## Prerequisites

1. **Vercel account** — https://vercel.com
2. **Neon account** — https://neon.tech (or any managed PostgreSQL)
3. **GitHub repository** connected to Vercel

---

## Step 1: Provision Database (Neon)

```bash
# 1. Create a Neon project via Dashboard or CLI
#    Region: closest to your target audience (e.g., US East, EU West)
#    Database name: aqliya

# 2. Get connection string from Neon Dashboard → Connect
#    Format: postgresql://user:pass@ep-xxx.region.aws.neon.tech/aqliya?sslmode=require
```

**Important**: Use the pooled connection string (ends in `-pooler`) when using Prisma
Driver Adapter in serverless, or add `?pgbouncer=true&connect_timeout=10` to the
standard connection string. Example:

```
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/aqliya?pgbouncer=true&connect_timeout=10&schema=public"
```

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (recommended)

1. Push code to GitHub
2. Go to https://vercel.com → Add New → Project
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npx prisma generate && next build` (override default)
5. Add environment variables (see ENVIRONMENT.md):
   - `DATABASE_URL` — from Neon
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `https://<your-project>.vercel.app`
6. Deploy

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="$(openssl rand -base64 32)" \
  -e NEXTAUTH_URL="https://<project>.vercel.app"
```

## Step 3: Run Database Migrations

After first deployment, apply migrations:

```bash
# Via Vercel CLI (run locally)
npx prisma migrate deploy

# Or via Vercel Post-Deploy hook (Neon)
# Connect Neon to the project and run:
npx prisma db push
npx tsx prisma/seed.ts
```

You can also run the seed via Vercel CLI:

```bash
vercel env pull .env.production
npx prisma db push
npx tsx prisma/seed.ts
```

## Step 4: Redeploy

Push a new commit to trigger automatic redeployment, or use:

```bash
vercel --prod
```

---

## Post-Deploy Smoke Test Checklist

Run these checks after deployment:

### Auth
- [ ] Navigate to `/login` — login page loads
- [ ] Login as `admin@aqliya.com` / `admin123` — redirects to `/decisions`
- [ ] Login as `sara@aqliya.com` / `operator123` — redirects to `/decisions`
- [ ] Login as `mohammad@aqliya.com` / `viewer123` — redirects to `/decisions`
- [ ] Visit `/session-test` — confirms id, email, role, organizationId in session

### Organization scoping
- [ ] Same-org viewer can access published recommendation
- [ ] Cross-org viewer is denied (404)
- [ ] Unpublished recommendation is denied (404)

### Routes
- [ ] `/` — home page loads
- [ ] `/decisions` — decision list loads
- [ ] `/decisions/new` — new decision form loads
- [ ] `/login` — login page loads
- [ ] `/api/auth/session` — returns `null` when unauthenticated

### Health check
- [ ] `GET /api/auth/session` returns 200
- [ ] Static pages (`.next/server/pages/*.html`) are pre-rendered
- [ ] No 5xx errors in browser console

---

## Alternative: Docker Deployment

If Vercel is not viable, use Docker + managed PostgreSQL:

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
```

```bash
# Build and run
docker build -t aqliya-app .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="..." \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NODE_ENV=production \
  aqliya-app
```

For production Docker deployments, add a reverse proxy (nginx/Caddy) and use
a process manager (PM2) or orchestration (Kubernetes/Nomad).
