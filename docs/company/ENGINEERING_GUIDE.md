# AQLIYA Engineering Guide

**適用對象:** Developers, Architects  
**Status:** Active | Version 1.0 | 2026-06-30

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Database | PostgreSQL 16 + pgvector |
| ORM | Prisma 7 |
| Auth | NextAuth v5 |
| UI | Tailwind CSS 4 + shadcn/ui |
| Testing | Jest + Cypress |
| Package Manager | npm |

## Repository Structure

`
aqliya/
├── src/
│   ├── app/           # Routes (App Router)
│   ├── actions/       # Server Actions
│   ├── components/    # UI Components
│   ├── lib/           # Business Logic
│   │   ├── core/      # Intelligence Core (12 engines) ← CANONICAL
│   │   ├── platform/  # Platform Services
│   │   ├── governance/# Governance Framework
│   │   ├── auth/      # Auth, MFA, SSO, SCIM
│   │   └── ...        # Product-specific libs
│   └── __tests__/     # Co-located tests
├── prisma/
│   ├── schema.prisma  # 240 models, 27 enums
│   └── seed*.ts       # 9 seed files
├── docs/
│   ├── official/          # Doctrine (Vision, Taxonomy, etc.)
│   ├── source-of-truth/   # Product Status, Route Strategy
│   ├── assets/            # Product reference files
│   ├── evidence/          # Audits, Reports, Validation
│   ├── archive/           # Historical docs
│   └── company/           # Company guides [YOU ARE HERE]
├── scripts/           # 200+ operational scripts
└── infra/             # Terraform (AWS me-south-1)
`

## Architecture Layers

`
Client (Browser)
  ↓
Next.js (Server Components / Client Components)
  ↓
Server Actions → Services → Intelligence Core
  ↓
Prisma → PostgreSQL 16 + pgvector
`

## Key Patterns

### Server/Client Boundary
- **Server-only:** Prisma, DB services, auth, filesystem, AI providers
- **Client:** UI components with 'use client'
- **Correct path:** Client → Server Action → Domain Service → DB
- **Forbidden:** Client → Domain Service → Prisma

### Route Patterns
- Marketing: src/app/(marketing)/*
- Authenticated: src/app/(dashboard)/*
- Product workspace: src/app/{product}/*

### AI Governance
Every AI feature MUST:
1. Include source input references
2. Log the prompt and model used
3. Require human review before final output
4. Include confidence/limitation notes
5. Log to audit trail

## Intelligence Core (12 Engines)

All accessible via @/lib/core/:
- AI Engine → @/lib/core/ai/
- Workflow Engine → @/lib/core/workflow/
- Evidence Core → @/lib/core/evidence/
- Knowledge Engine → @/lib/core/knowledge/
- Institutional Memory → @/lib/core/memory/
- Policy/ABAC → @/lib/core/policy/
- Events/Outbox → @/lib/core/events/
- Core Audit → @/lib/core/audit/
- Decision Engine → @/lib/core/decision/
- Signals → @/lib/core/signals/
- Governance → @/lib/core/governance/
- Contracts → @/lib/core/contracts/

## Development Workflow

`ash
# Setup
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npx prisma db seed

# Development
npm run dev           # or: npx next dev --webpack

# Validation
npx tsc --noEmit
npm run lint -- --quiet
npm test
npm run build

# Database changes
npx prisma migrate dev --name <description>
`

## Testing Standards
- Unit tests: src/__tests__/unit/
- Integration tests: src/__tests__/integration/
- E2E tests: cypress/
- Tests co-located with source code
- Jest for unit/integration, Cypress for E2E

## Commit Conventions
`
feat|fix|docs|refactor|test|chore(scope): description

Examples:
feat(auditos): add evidence versioning
fix(auth): resolve MFA token expiration
docs(architecture): update ADR-001
`

## Required Pre-commit Checks
1. 
px tsc --noEmit — 0 errors
2. 
pm run lint -- --quiet — 0 errors
3. 
pm test — all passing (or explain skips)
4. Update docs if changing architecture or routes
