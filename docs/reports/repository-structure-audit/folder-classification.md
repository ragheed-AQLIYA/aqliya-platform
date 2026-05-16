# Folder Classification

## Root

| Folder/File | Type | Purpose | Status | Action |
|-------------|------|---------|--------|--------|
| `./` (root config files) | config | Project configuration (package.json, tsconfig, next.config, eslint, jest, middleware) | active | keep |
| `.github/` | config | CI/CD workflows | active | keep |
| `.husky/` | config | Git hooks (pre-commit lint-staged) | active | keep |
| `.opencode/` | config | OpenCode agent configuration | active | keep |
| `backups/` | data | Manual database backup storage | active | keep |
| `cypress/` | test | E2E tests | active | keep |
| `i18n/` | config | Internationalization request handler | active | keep |
| `messages/` | asset | Translation files (ar, en, tr) | active | keep |

## `src/` — Source Code

| Subfolder | Type | Purpose | Status | Action |
|-----------|------|---------|--------|--------|
| `src/app/` | route | Next.js App Router — all routes, layouts, pages | active | keep |
| `src/components/` | component | React UI components by domain | active | keep |
| `src/actions/` | action | Server Actions (database operations) | active | keep |
| `src/lib/` | domain | Business logic, engines, services | active | keep |
| `src/types/` | types | TypeScript type definitions | active | keep |
| `src/__mocks__/` | test | Jest module mocks | active | keep |
| `src/__tests__/` | test | Unit, integration, component tests | active | keep |

### `src/app/` — Route Groups

| Subfolder | Type | Purpose | Status | Action |
|-----------|------|---------|--------|--------|
| `(marketing)/` | route | Public marketing pages | active | keep |
| `(dashboard)/` | route | Authenticated dashboard (DecisionOS) | active | keep |
| `audit/` | route | AuditOS workspace | active | keep |
| `auditos/` | route | AuditOS guided demo (public) | active | keep |
| `sales/` | route | SalesOS shell | prototype | review |
| `api/` | route | API endpoints | active | keep |
| `login/` | route | Authentication page | active | keep |
| `published/` | route | Public recommendation pages | active | keep |
| `access-denied/` | route | Access denied page | active | keep |

### `src/components/` — Component Groups

| Subfolder | Type | Purpose | Status | Action |
|-----------|------|---------|--------|--------|
| `ui/` | component | shadcn/ui primitives (button, card, input, etc.) | active | keep |
| `audit/` | component | AuditOS workspace components (~25 files) | active | keep |
| `decisions/` | component | DecisionOS components | active | keep |
| `enterprise/` | component | Shared enterprise UI (~30 files) | active | keep |
| `platform/` | component | Platform shell (header, sidebar, a11y, analytics) | active | keep |
| `layout/` | component | App layout (header, sidebar, footer) | active | keep |
| `intelligence/` | component | Intelligence indicators (confidence, risk, signal) | active | keep |
| `entity/` | component | Entity components (header, icon, timeline) | active | keep |
| `visuals/` | component | Marketing visual diagrams | active | review |
| `workspace/` | component | Workspace components | active | keep |
| `forms/` | component | Form components | active | keep |

### `src/lib/` — Domain Logic Groups

| Subfolder | Type | Product | Purpose | Status | Action |
|-----------|------|---------|---------|--------|--------|
| `ai/` | engine | AQLIYA Core | AI Orchestration (deterministic, cloud stub, local stub) | active | keep |
| `audit/` | domain | AuditOS | AuditOS domain logic (~30 files) | active | keep |
| `decision/` | domain | DecisionOS | DecisionOS domain logic (~20 files) | active | keep |
| `governance/` | engine | Shared | Governance Engine (approval, escalation, provenance) | active | keep |
| `platform/` | domain | AQLIYA Core | Platform services (navigation, workspace) | active | keep |
| `recommendation/` | engine | AuditOS | Recommendation Engine | active | keep |
| `simulation/` | engine | Simulation | Simulation Engine | active | keep |
| `validation/` | domain | Shared | Zod validation schemas | active | keep |
| `types/` | types | DecisionOS | Decision type definitions | active | keep |

## `prisma/` — Database

| Subfolder/File | Type | Purpose | Status | Action |
|----------------|------|---------|--------|--------|
| `schema.prisma` | db | All database models | active | keep |
| `migrations/` | db | 7 migration folders | active | keep |
| `seed.ts` | db | Main seed data | active | keep |
| `seed-audit.ts` | db | AuditOS seed data | active | keep |

## `docs/` — Documentation

| Subfolder | Type | Authority | Purpose | Status | Action |
|-----------|------|-----------|---------|--------|--------|
| `official/` | docs | HIGHEST | v1.1 official identity, architecture, rules, glossary, roadmap | active | keep |
| `source-of-truth/` | docs | v1.0 | Architecture, taxonomy, routes, product status | active | keep |
| `systems/` | docs | v1.0 | Per-system docs (AuditOS, DecisionOS, SalesOS, LocalContentOS) | active | keep |
| `theoretical-reference/` | docs | v1.0 | Full theoretical foundation (21 sections, ~400 files) | supporting | keep (massive, but intentional) |
| `pilot/` | docs | operational | Pilot execution docs and reports | active | archive old sessions |
| `product/` | docs | v1.0 | Product definition packs | supporting | review/merge |
| `reports/` | docs | historical | Prior reports and audits | supporting | keep |
| `commercial/` | docs | operational | Commercial/demo materials | supporting | review |
| `commercial-pack/` | docs | operational | Commercial pack | supporting | review |
| `execution/` | docs | operational | Engineering execution docs | supporting | review |
| `operations/` | docs | operational | Operations docs | supporting | review |
| `runtime-prototypes/` | docs | operational | Runtime prototyping docs | supporting | review |
| `content/` | docs | marketing | Website content drafts | needs-review | archive (outdated) |
| `releases/` | docs | historical | Release notes | supporting | keep |
| `prototype-planning/` | docs | historical | Prototype specifications | supporting | review |
| `technical/` | docs | operational | Technical audits | supporting | keep |
| `api/` | docs | operational | API docs | needs-review | review |
| `company/` | docs | operational | Company docs | needs-review | review |
| `numbered folders/` | docs | pre-v1.1 | Legacy numbered docs | legacy | archive/move |

## `public/` — Static Assets

| Subfolder | Type | Purpose | Status | Action |
|-----------|------|---------|--------|--------|
| `brand/` | asset | Brand logo kit (PNG, PDF, SVG) | active | keep |

## `scripts/` — Utility Scripts

| Subfolder/File | Type | Purpose | Status | Action |
|----------------|------|---------|--------|--------|
| All scripts | script | Health checks, backups, scoring, monitoring, audits | active | keep |
