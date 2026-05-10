# AQLIYA Decision OS - MVP Scope

## What Was Built

### Core Modules Implemented

1. **Organization Management**
   - Organization model with users
   - User roles (ADMIN, MEMBER, VIEWER)
   - Basic org profile

2. **Decision Workspace**
   - Decision model with full lifecycle
   - Decision types (TENDER)
   - Decision status flow (DRAFT → IN_REVIEW → APPROVED/REJECTED)
   - Full relational data: Objectives, Constraints, Assumptions, Alternatives, Risks

3. **Tender Decision Module**
   - TenderProfile (one-to-one with Decision)
   - Client/organization details
   - Financial data (contract value, estimated cost, margin)
   - Capacity data (required vs available)
   - Strategic fit score (0-100)
   - Risk level (LOW, MEDIUM, HIGH)

4. **Simulation Engine MVP**
   - Rule-based scenario comparison
   - Three scenarios: Best Case, Expected Case, Worst Case
   - Calculates 6 scores:
     - Feasibility Score
     - Financial Score (weight: 30%)
     - Capacity Score (weight: 25%)
     - Risk Score (weight: 25%)
     - Strategic Fit Score (weight: 20%)
     - Overall Decision Score
   - Scenario adjustments (±10-20% per scenario)

5. **Recommendation Engine MVP**
   - Generates recommendation type:
     - GO (Overall ≥ 75)
     - GO_WITH_CONDITIONS (55-74)
     - NO_GO (< 55)
   - Confidence Score (based on data completeness, scenario consistency, risk clarity)
   - Reasoning text
   - Conditions (for GO_WITH_CONDITIONS)
   - Risk notes

6. **Governance Layer**
   - Decision owner assignment
   - Reviewer assignment
   - Approver assignment
   - Audit Log (action, entity, before/after metadata, timestamp)
   - Approval workflow (PENDING, APPROVED, REJECTED)
   - Version history placeholder

7. **Decision Report**
   - Full structured report page
   - Executive Summary
   - Decision context (Tender details)
   - All inputs (Objectives, Constraints, Assumptions, Alternatives, Risks)
   - Scenario comparison table
   - Score breakdown
   - Final recommendation
   - Conditions
   - Governance trail (Audit Log)
   - Print-friendly layout

---

## What Was NOT Built (Out of Scope)

### Explicitly Excluded:
- ❌ **Authentication/Authorization system** - Using mock-user-id for now
- ❌ **Multi-tenant complexity** - Basic org support only
- ❌ **Sales OS module** - Not part of this MVP
- ❌ **Advanced AI features** - Rule-based only, no ML/LLM
- ❌ **Integrations** - No external systems
- ❌ **Monte Carlo simulation** - Simple rule-based only
- ❌ **PDF export** - Print CSS only
- ❌ **Billing/Subscription** - Not needed for MVP
- ❌ **Mobile app** - Web only

---

## Architecture Decisions

### Database
- **PostgreSQL** (configured) → **SQLite** (dev/testing)
- Using **Prisma v7** with driver adapters
- Adapter: `@prisma/adapter-better-sqlite3` for development

### Frontend
- **Next.js 16.2.4** (App Router)
- **TypeScript** strict mode
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **RTL support** (Arabic language)
- **"use client"** directives for interactive components

### State Management
- Server Components by default
- Client Components only where needed (forms, interactive UI)
- Server Actions for data mutations
- No global state management (yet)

### Validation
- **Zod** schemas in `src/lib/validation/`
- TypeScript types in `src/lib/types/`

---

## Data Models (13 Models)

1. **Organization** - Tenant container
2. **User** - System users with roles
3. **Decision** - Core decision entity
4. **Objective** - Decision objectives (one-to-many)
5. **Constraint** - Decision constraints (one-to-many)
6. **Assumption** - Decision assumptions (one-to-many)
7. **Alternative** - Decision alternatives (one-to-many)
8. **Risk** - Decision risks with levels (one-to-many)
9. **TenderProfile** - Tender-specific data (one-to-one)
10. **Scenario** - Simulation scenarios (one-to-many)
11. **SimulationResult** - Scenario results (one-to-one with Scenario)
12. **Recommendation** - Decision recommendation (one-to-one)
13. **Approval** - Approval workflow (one-to-many)
14. **AuditLog** - Full audit trail (one-to-many)
15. **DecisionReport** - Report storage (one-to-many)

---

## Server Actions

### `src/actions/decisions.ts`
- `getDecisions()` - List all decisions
- `getDecisionById(id)` - Full decision with all relations
- `createDecision(data)` - Create new decision
- `updateDecisionStatus(id, status)` - Update status

### `src/actions/tender.ts`
- `getTenderProfile(decisionId)` - Get tender profile
- `createOrUpdateTenderProfile(decisionId, data, userId)` - Save tender + audit log

### `src/actions/simulation.ts`
- `runSimulationAndRecommendation(decisionId)` - Run all scenarios + generate recommendation
- `getSimulationResults(decisionId)` - Get simulation results

---

## Known Technical Debt

1. **Authentication** - Hardcoded `"mock-user-id"` in tender.ts
2. **Organizations pages** - Still using mock data
3. **Settings page** - Still using mock data
4. **Prisma v7 migration** - Schema adapted but no PostgreSQL migrations run yet
5. **Error handling** - Basic, needs improvement
6. **Form validation UI** - No visual feedback for validation errors
7. **Loading states** - Basic, needs improvement
8. **Next.js warning** - Multiple lockfiles detected (package-lock.json in root and project)
9. **TypeScript strictness** - Some `any` types used in pages for flexibility

---

## Next Steps (Priority Order)

### Phase 1: Core Completion
1. **Test full flow** via `npm run dev`
   - Create decision → Fill tender → Run simulation → Check report
2. **Add simple auth** - Replace mock-user-id
3. **Connect Organizations pages** - Build `actions/organizations.ts`

### Phase 2: Polish & UX
4. **Improve error handling** - Better error messages
5. **Add loading states** - Skeleton loaders
6. **Form validation UI** - Show Zod errors in forms
7. **Add toasts/notifications** - Success/error feedback

### Phase 3: Future Scope (Not Now)
8. **PostgreSQL setup** - Run migrations
9. **Multi-tenant hardening** - Proper org isolation
10. **Advanced simulations** - Monte Carlo (future)
11. **AI integration** - LLM for reasoning (future)
12. **PDF export** - Generate PDF reports
13. **Integrations** - CRM, ERP, etc. (future)
