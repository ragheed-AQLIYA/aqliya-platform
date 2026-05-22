# AQLIYA Developer Guide

## Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm 10+

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Environment setup
cp .env.example .env.local
# Edit .env.local with your PostgreSQL credentials

# 3. Database setup
npx prisma generate
npx prisma db push

# 4. Start development server
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/        # Public marketing pages
│   ├── audit/              # AuditOS dashboard
│   ├── decisions/          # DecisionOS workspace
│   ├── api/                # API routes
│   └── ...
├── components/             # React components
│   ├── audit/              # Audit-specific components
│   ├── enterprise/         # Shared enterprise components
│   ├── platform/           # Platform-level components
│   └── ui/                 # shadcn/ui primitives
├── actions/                # Server Actions
├── lib/                    # Business logic, models, services
├── types/                  # TypeScript type definitions
└── __tests__/              # Test files

messages/                   # i18n translation files (ar, en, tr)
docs/                       # Documentation
scripts/                    # Utility scripts
prisma/                     # Database schema and migrations
```

## Key Architecture Principles

### Arabic-First RTL
- Default language is Arabic (`ar`), `dir="rtl"`
- All layouts use logical CSS properties (`start-*`/`end-*`, `ms-*`/`me-*`, `ps-*`/`pe-*`)
- i18n via `next-intl` with `localePrefix: "never"` (cookie-based)

### i18n
- Translation files: `messages/{ar,en,tr}.json`
- Components use `useTranslations("namespace.key")`
- Locale switching via `NEXT_LOCALE` cookie

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npx tsc --noEmit` | TypeScript check |
| `npm run test:i18n` | Check for untranslated English strings |
| `npm run rtl:audit` | Audit RTL CSS issues |
| `npm run cy:open` | Open Cypress E2E tests |
| `npm run cy:run` | Run Cypress E2E tests headlessly |
| `npm run analyze` | Run bundle analysis |
| `npm run test:integration` | Run Jest tests |

## Deployment

### Vercel
Push to GitHub → Vercel auto-deploys via `.github/workflows/ci.yml` + `preview.yml`.

### Docker
```bash
docker compose up -d
```

## Environment Variables

See `.env.example` for all required variables.

## Products
- **AuditOS** — Financial audit and intelligence system (first proof product)
- **DecisionOS** — Decision governance system
- **LocalContentOS** — Local content tracking system
- **SalesOS** — Sales intelligence system
- **SimulationOS** — Scenario simulation system
- **Custom Systems** — Bespoke institutional systems

## Governance
- **AI assists. Humans decide. Evidence governs.**
- All AI outputs require human approval before action
- Every decision is traceable: source → process → output → approval
