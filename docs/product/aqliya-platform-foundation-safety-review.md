# AQLIYA Platform Foundation Safety Review

**Version:** 1.0
**Status:** Pre-implementation safety review
**Scope:** Repository assessment and migration design only — no code changes
**Aligned with:** `aqliya-cloud-platform-build-plan.md`, official v1.1 docs, current schema and codebase

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Model Map](#2-current-model-map)
3. [Current Route/Auth/Guard Map](#3-current-routeauthguard-map)
4. [Risk Assessment](#4-risk-assessment)
5. [Option Comparison](#5-option-comparison)
6. [Recommended Approach](#6-recommended-approach)
7. [Minimal Schema Proposal](#7-minimal-schema-proposal)
8. [Migration Plan](#8-migration-plan)
9. [Rollback Plan](#9-rollback-plan)
10. [Test Plan](#10-test-plan)
11. [Implementation Sequence](#11-implementation-sequence)
12. [No-Go Conditions](#12-no-go-conditions)

---

## 1. Executive Summary

This safety review assesses the current AQLIYA organization, tenant, auth, and data model landscape before any PlatformFoundation migration begins. It identifies the critical finding that **AuditOS and DecisionOS have completely independent organization hierarchies with no cross-referencing**, making any unification effort high-risk without careful dual-write and backward-compatibility planning.

### Critical Findings

| # | Finding | Severity | Detail |
|---|---|---|---|
| F1 | Two independent org hierarchies | **Critical** | `Organization` (DecisionOS) and `AuditOrganization` (AuditOS) share no FK, no relation, no cross-reference. They exist in parallel with different users, different IDs, and different session data. |
| F2 | Auth session carries DecisionOS org ID only | **High** | JWT `organizationId` = `Organization.id` (DecisionOS). AuditOS never uses this — it resolves `AuditOrganization.id` from email+org via `actor-context.ts`. |
| F3 | No middleware auth guard for `/audit/` routes | **High** | `src/middleware.ts` does not exist. Route-level auth relies entirely on server actions and component guards. Layout has no auth check. |
| F4 | AuditOS tenant guard checks org via engagement/client, not session | **Medium** | `assertEngagementAccess()` fetches `engagement.organizationId` directly — doesn't validate against session's platform org. Works because AuditOS has its own org ID. |
| F5 | Demo fallback in actor resolution active for dev AND test | **Medium** | `actor-context.ts` falls back to hardcoded `usr-ahmed`/`org-aqliya` when `NODE_ENV !== "production"` and auth resolution fails. |
| F6 | `AuditEngagement.organizationId` has no Prisma relation | **Medium** | Stored as loose string field — no FK enforcement, no cascade, no relation to `AuditOrganization`. |
| F7 | `AuditUser` has no FK/relation to `User` | **Medium** | Two separate user models — linked only by convention (email matching). |
| F8 | Sunbul has a third independent hierarchy | **Low** | `SunbulClient` with `SunbulUserMembership` — no relation to either `Organization` or `AuditOrganization`. |

### Recommendation

**Option B (recommended):** Add `PlatformOrganization` as an independent bridge table, add optional FK columns to `Organization` and `AuditOrganization`, migrate gradually with zero downtime. Do NOT rename, merge, or replace existing models.

---

## 2. Current Model Map

### 2.1 DecisionOS Hierarchy

```
Organization (Prisma model, top-level)
├── id: String (CUID)
├── name: String
├── slug: (not present — DecisionOS orgs have no slug)
│
├── User[] (FK: organizationId)
│   ├── id, email, name, passwordHash?
│   ├── role: UserRole (ADMIN | OPERATOR | VIEWER)
│   └── Used by: auth session JWT → `session.user.organizationId`
│
├── Decision[] (FK: organizationId)
│   ├── owner, reviewer, approver → User (by id)
│   └── status, type, risks, scenarios, recommendations, approvals
│
├── AuditLog[] (FK: organizationId)
│   └── DecisionOS audit trail (AuditAction enum)
│
├── DecisionMonitoringSignal[]
├── DecisionRiskAlert[]
├── DecisionPattern[]
└── DecisionReport[]
```

**Key characteristics:**
- `slug` field does NOT exist on `Organization`
- `Organization.name` is the only display identifier
- Users authenticated via NextAuth carry `Organization.id` in session as `organizationId`
- No soft-delete (`deletedAt`) on Organization or User

### 2.2 AuditOS Hierarchy

```
AuditOrganization (Prisma model, top-level)
├── id: String (CUID)
├── name: String
├── slug: String (@unique)  ← EXISTS on AuditOrganization
├── jurisdiction: String
├── regulatoryFramework: String
├── governanceRules: Json?
├── status: String
│
├── AuditUser[] (FK: organizationId)
│   ├── id, email, name, role, status
│   └── UNIQUE ON (organizationId, email)
│   └── NO FK relation to User model
│
├── AuditClient[] (FK: organizationId)
│   ├── name, industry, reportingFramework, status
│   │
│   └── AuditEngagement[] (FK: clientId)
│       ├── organizationId: String  ← LOOSE STRING, no FK
│       ├── status, fiscalPeriod, engagementType
│       ├── team: Json?
│       │
│       ├── AuditTrialBalance → AuditTrialBalanceLine[]
│       ├── AuditAccountMapping → AuditCanonicalAccount
│       ├── AuditFinancialStatement[]
│       ├── AuditDisclosureNote[]
│       ├── AuditEvidence → AuditEvidenceLink[]
│       ├── AuditFinding → AuditRecommendation[]
│       ├── AuditReviewComment[]
│       ├── AuditApprovalRecord[]
│       ├── AuditPublicationPackage[]
│       ├── AuditEvent[]  (eventType, actorId, targetType, targetId)
│       ├── AuditAiOutput[]
│       ├── PilotFeedback / ProductionBlocker / PilotSignoff[]
│       └── AuditValidationRun → AuditValidationIssue → AuditValidationDisposition[]
```

**Key characteristics:**
- `slug` field EXISTS on `AuditOrganization` (unique)
- `AuditUser` is completely separate from `User` — no FK relation
- `AuditEngagement.organizationId` is a loose string field with no Prisma relation
- Organization → Client → Engagement chain enforced via FK at Client level only

### 2.3 Sunbul Hierarchy (third independent org)

```
SunbulClient (Prisma model, top-level)
├── id: String
├── name: String
│
├── SunbulUserMembership[] (composite unique: [clientId, userId])
│   ├── userId: String  ← LOOSE STRING, no FK to User
│   ├── role: SunbulUserRole
│   └── status: SunbulMembershipStatus
│
├── SunbulRecord[]
│   └── SunbulDocument[], SunbulReview[]
│
└── SunbulAuditEvent[]
```

### 2.4 Entity Relationship Map

```
                    ┌──────────────────────┐
                    │  Organization        │ ← DecisionOS top-level tenant
                    │  (DecisionOS)        │   Has: slug? NO
                    ├──────────────────────┤   Has: unique name? NO (not enforced)
                    │  id: cuid            │
                    │  name: String        │
                    └────────┬─────────────┘
                             │
                    ┌────────▼─────────────┐
                    │  User                │
                    │  organizationId: FK  │
                    │  email: unique       │
                    │  role: UserRole      │
                    └─────────────────────┘

                    ┌──────────────────────┐
                    │  AuditOrganization   │ ← AuditOS top-level tenant
                    │  (AuditOS)           │   Has: slug? YES (unique)
                    ├──────────────────────┤   Has: jurisdiction, regulatoryFramework
                    │  id: cuid            │
                    │  name: String        │
                    │  slug: String @unique│
                    └────────┬─────────────┘
                             │
                    ┌────────▼─────────────┐
                    │  AuditUser           │
                    │  organizationId: FK  │
                    │  email: String       │
                    │  role: String        │
                    │  @unique(orgId,email)│
                    └────────┬─────────────┘
                             │
                    ┌────────▼─────────────┐
                    │  AuditClient         │
                    │  organizationId: FK  │
                    └────────┬─────────────┘
                             │
                    ┌────────▼─────────────┐
                    │  AuditEngagement     │
                    │  clientId: FK        │
                    │  organizationId: Str ← LOOSE STRING (NOT FK)
                    │  status: String      │
                    └─────────────────────┘

                    ┌──────────────────────┐
                    │  SunbulClient        │ ← Third independent hierarchy
                    │  (Sunbul product)    │   No relation to above
                    └─────────────────────┘

    RELATIONSHIP:  Organization ~~/~~ AuditOrganization    ← NO LINK EXISTS
    RELATIONSHIP:  User ~~/~~ AuditUser                    ← NO LINK EXISTS (email convention only)
    RELATIONSHIP:  User ~~/~~ SunbulUserMembership.userId  ← NO FK (loose string)
```

### 2.5 Critical Data Discrepancies

| Aspect | DecisionOS (Organization) | AuditOS (AuditOrganization) |
|---|---|---|
| Slug field | **MISSING** | EXISTS (`@unique`) |
| Users model | `User` (UserRole enum) | `AuditUser` (role: String) |
| User FK to org | `User.organizationId` — FK to Organization | `AuditUser.organizationId` — FK to AuditOrganization |
| Auth session org ID | `session.user.organizationId` = Organization.id | NOT in session — resolved via `actor-context.ts` |
| Existing demo data | org-aqliya (DecisionOS) | org-aqliya (AuditOS) — same name, DIFFERENT IDs |
| Unique constraints | `User.email` unique globally | `(AuditOrganization.id, AuditUser.email)` unique |
| Engagement org ID | N/A | Loose string, no relation |

---

## 3. Current Route/Auth/Guard Map

### 3.1 Route Protection Status

| Route | Middleware | Layout Auth | Server Action Auth | Guard | Risk |
|---|---|---|---|---|---|
| `/audit/*` | **NONE** | **NONE** | `getAuditActor()` + `assertEngagementAccess()` + `requireRole()` | Full per-action | Layout-level gap |
| `/decisions/*` | **NONE** | Unknown | `requireUserContext()` + `requireOrgAccess()` | Full per-action | Layout-level gap |
| `/auditos/*` | **NONE** | **NONE** | Demo mode (mock data) | None needed | Public demo |
| `/sales` | **NONE** | Unknown | Minimal | None | Prototype only |
| `/(marketing)/*` | **NONE** | **NONE** | N/A (public) | None | Public pages |
| `/api/*` | Rate limit only | N/A | Varies | Rate limit | API routes |

**Key finding:** No route-level middleware exists. Every route is protected (or not) at the server action or component level only.

### 3.2 Auth Flow

```
Request → NextAuth Session (JWT)
  ├── session.user.id
  ├── session.user.email
  ├── session.user.organizationId  ← THIS IS Organization.id (DecisionOS)
  ├── session.user.role             ← THIS IS UserRole (DecisionOS)
  └── session.user.organization     ← THIS IS Organization.name

For DecisionOS:
  requireUserContext() → reads session → gets organizationId
  requireOrgAccess(id) → compares session.organizationId === id

For AuditOS:
  getAuditActor() → reads session → looks up AuditUser by (organizationId, email)
                    → actually USES ORG ID FROM SESSION to match AuditUser
                    → BUT Wait! Session has Organization.id, not AuditOrganization.id!
                    → HOW DOES THIS WORK?

RESOLUTION: In dev/test, actor-context.ts falls back to demo actor.
            In production, it looks up AuditUser by email+orgId.
            The orgId in session IS the DecisionOS Organization.id.
            If AuditOrganization.id === Organization.id... IT ONLY WORKS IF THEY MATCH BY CONVENTION.
```

### 3.3 Actor Resolution Critical Analysis

The `actor-context.ts` file reveals a critical implicit assumption:

```typescript
// In production:
const auditUser = await prisma.auditUser.findUnique({
  where: { organizationId_email: { organizationId: session.user.organizationId, email: session.user.email } }
});
```

**This only works if `Organization.id === AuditOrganization.id` for the same organization.**

Currently in the codebase, both the DecisionOS `Organization` and the AuditOS `AuditOrganization` appear to use the same ID (`org-aqliya`) by convention. But there is **no database constraint** enforcing this. If they ever diverge, AuditOS actor resolution breaks silently.

### 3.4 Guard Chain (AuditOS)

```
Server Action Entry
  ├── 1. getAuditActor()        → resolves actor + org context
  │     └── actor-context.ts
  ├── 2. requireRole(roles[])   → checks actor.role against allowed list
  ├── 3. assertEngagementAccess()  → checks engagement.organizationId === actor.organizationId
  │     └── audit/tenant-guard.ts
  ├── 4. enforceAuditRateLimit()   → rate limit check
  │     └── rate-limit.ts
  ├── 5. Business logic (services.ts)
  └── 6. Audit event recording
```

### 3.5 Guard Chain (DecisionOS)

```
Server Action/API Entry
  ├── 1. requireUserContext()    → gets session, extracts user
  │     └── auth.ts
  ├── 2. requireOrgAccess(id)   → checks session.organizationId === id
  │     └── auth.ts
  ├── 3. hasRequiredRole(roles) → checks session.user.role
  │     └── auth.ts
  └── 4. Business logic
```

---

## 4. Risk Assessment

### 4.1 Risk Matrix

| Risk ID | Risk | Likelihood | Impact | Score | Mitigation |
|---|---|---|---|---|---|
| R1 | **PlatformOrganization schema migration breaks existing records** | Medium | Critical | **16** | Dual-write migration; never delete or modify existing columns; add nullable FK columns only |
| R2 | **Organization.id ≠ AuditOrganization.id for same org** | Medium | Critical | **16** | Migration must verify and optionally merge; safeguard with UNIQUE constraint on new PlatformOrganization.slug |
| R3 | **Auth session organizationId change breaks existing code** | Medium | High | **12** | Session retains `organizationId`; `platformOrganizationId` added as NEW field; all existing code continues reading `organizationId` |
| R4 | **Route migration breaks bookmarks/integrations** | Medium | Medium | **9** | Maintain `/audit` redirects for 2+ release cycles; dual-support during transition |
| R5 | **Cross-product user unification breaks auth for existing users** | Medium | High | **12** | PlatformUser as new table; existing User + AuditUser remain; link via FK, never replace |
| R6 | **Adding `platformOrganizationId` FK to legacy models impacts query performance** | Low | Medium | **6** | Indexed FK; no impact on existing queries that don't reference the new column |
| R7 | **Demo fallback in actor-context.ts masks integration errors during migration** | High | Medium | **12** | Remove or gate demo fallback with explicit env flag during testing |
| R8 | **Sunbul third hierarchy ignored or broken** | Low | Medium | **6** | Document that Sunbul is out of scope; add PlatformOrganization link when implemented |
| R9 | **Production Blocker audit events with empty engagementId lose traceability** | Low | Low | **3** | Known pre-existing issue; document as separate tech debt item |
| R10 | **No middleware auth guard means newly created routes are unprotected** | Medium | High | **12** | Add middleware auth guard as Sprint 1B prerequisite |

### 4.2 What Currently Assumes `Organization.id` (DecisionOS)

| Code | Assumption | Impact if wrong |
|---|---|---|
| `session.user.organizationId` | This is `Organization.id` | All DecisionOS guards break |
| `requireOrgAccess(id)` | Compares against `Organization.id` | Authorization failures |
| `auth-config.ts` JWT callback | Sets `organizationId` from db `User.organizationId` | Wrong org in session |
| `audit-actions.ts` `getAuditActor()` | Looks up `AuditUser` by `session.user.organizationId + email` | AuditOS actor resolution fails |

### 4.3 What Currently Assumes `AuditOrganization.id` (AuditOS)

| Code | Assumption | Impact if wrong |
|---|---|---|
| `actor-context.ts` `getAuditActor()` | `session.user.organizationId` equals `AuditOrganization.id` | Silent fallback to demo mode |
| `tenant-guard.ts` `assertEngagementAccess()` | `engagement.organizationId` is the correct org scope | Data leak between orgs |
| `services.ts` queries | Filter by `engagement.organizationId` | Cross-org data exposure |
| `AuditOrganization.slug` | Unique identifier for org | Route generation, display |

### 4.4 What Would Break if `PlatformOrganization` is Added Incorrectly

| Scenario | Breakage |
|---|---|
| Renaming `Organization` to `PlatformOrganization` | All Prisma queries referencing `Organization` model fail; all imports break |
| Adding required `platformOrganizationId` to `Organization` | Existing records with NULL fail; all `create` calls without `platformOrganizationId` fail |
| Removing `Organization` or `AuditOrganization` | All existing FK relationships orphan |
| Changing JWT `organizationId` to `platformOrganizationId` | All existing guards that read `session.user.organizationId` return undefined |
| Adding NOT-NULL `platformOrganizationId` in same migration | Migration fails if existing records exist without values |

---

## 5. Option Comparison

### 5.1 Option A: Reuse Existing `Organization` as Platform Organization

**Description:** Rename or alias `Organization` to serve as the platform-level tenant. Add `AuditOrganization` fields (slug, jurisdiction) to `Organization`. Link `AuditOrganization` to `Organization` via FK.

**Schema changes:**
- Add `slug String @unique` to `Organization`
- Add `jurisdiction`, `regulatoryFramework`, `governanceRules`, `status` to `Organization`
- Add `organizationId FK` to `AuditOrganization` (linking to `Organization`)
- Add `userId FK` to `AuditUser` (linking to `User`)
- Drop `AuditOrganization.slug` in future (deferred)

**Migration complexity:** High

**Pros:**
- Single tenant model — no bridge table
- Simpler query paths
- Fewer total models
- Cleaner long-term architecture

**Cons:**
- **Must modify the `Organization` model — high risk to DecisionOS**
- Existing `Organization` name conflicts with concept of "Platform Organization"
- `Organization` currently has no slug — adding `@unique` slug requires backfill for all existing records
- All existing Prisma queries to `Organization` must be reviewed
- `AuditOrganization.name` and `Organization.name` may not match for same org — requires reconciliation
- Risk of breaking everything that touches `prisma.organization`
- The `Organization` model is deeply coupled to DecisionOS — any change cascades

**Verdict: HIGH RISK — not recommended for first iteration**

### 5.2 Option B: Add `PlatformOrganization` as Independent Bridge (Recommended)

**Description:** Create a new `PlatformOrganization` model as an independent tenant identity. Add optional `platformOrganizationId` FK columns to both `Organization` and `AuditOrganization`. Do NOT modify existing models beyond adding one nullable FK column each. Existing code continues to work unchanged. Migration is additive only.

**Schema changes:**
- Create NEW `PlatformOrganization` model
- Add `platformOrganizationId String?` to `Organization` (+ index)
- Add `platformOrganizationId String?` to `AuditOrganization` (+ index)
- Create backfill migration from existing orgs
- Do NOT add `PlatformOrganization` references to `AuditEngagement`, `AuditEvent`, or other AuditOS data models yet

**Migration complexity:** Low-Medium

**Pros:**
- **Zero changes to existing DecisionOS or AuditOS code** — additive only
- Existing queries continue to work unchanged
- No data model changes beyond optional FK columns
- `PlatformOrganization` can be rolled out gradually
- Old org records remain fully functional without `platformOrganizationId`
- Can be tested in parallel with existing system
- `slug` can be set on `PlatformOrganization` without touching `Organization`

**Cons:**
- Requires join queries for cross-product tenant operations
- Additional bridge model to maintain
- Transition period where some orgs have `platformOrganizationId` and some don't
- Eventual cleanup needed to deprecate legacy org models (but this can be deferred indefinitely)

**Verdict: SAFEST OPTION — recommended**

### 5.3 Option C: Merge/Replace `Organization` and `AuditOrganization`

**Description:** Create a unified `PlatformOrganization` by merging fields from both `Organization` and `AuditOrganization`. Drop both legacy models. Repoint all FK relationships to `PlatformOrganization`. Rewrite all queries.

**Schema changes:**
- Create `PlatformOrganization` with superset of fields from both models
- Add `platformOrganizationId` FK to all models that currently reference `Organization` or `AuditOrganization`
- Create migration scripts to transfer data from legacy models
- Drop `Organization` and `AuditOrganization` models
- Update all Prisma queries across the entire codebase

**Migration complexity:** Very High

**Pros:**
- Single unified tenant model
- Cleanest long-term architecture
- No bridge/join overhead
- No legacy migration debt

**Cons:**
- **Extreme risk** — every DecisionOS and AuditOS query must be rewritten
- Massive changes to `prisma.organization` and `prisma.auditOrganization` references across the codebase
- Impossible to test incrementally
- Weeks of development time for query rewrites
- High probability of bugs in production data access
- Cannot be rolled back easily (data shape change)
- Violates v1.1 implementation rule: "Do Not Refactor Unrelated Code"

**Verdict: NOT RECOMMENDED for any phase. Defer to theoretical future cleanup.**

### 5.4 Option Comparison Summary

| Criteria | Option A (Reuse) | Option B (Bridge) | Option C (Merge) |
|---|---|---|---|
| Risk to existing code | HIGH | LOW | EXTREME |
| Migration complexity | HIGH | LOW-MEDIUM | VERY HIGH |
| Incremental rollout | No | Yes | No |
| Rollback ease | Medium | High | Low |
| Months to full migration | 2-3 | 0.5-1 | 3-6 |
| Long-term cleanliness | High | Medium | High |
| Developer effort | 1-2 weeks | 2-3 days | 3-6 weeks |
| Can coexist with existing code | No | Yes | No |
| **OVERALL SCORE** | **C** | **A (Recommended)** | **D** |

---

## 6. Recommended Approach

**Option B: Add `PlatformOrganization` as Independent Bridge Table**

This is the only option that allows incremental, reversible migration without risking existing DecisionOS or AuditOS functionality.

### Design Principles

1. **Additive only** — never modify or remove existing columns or models
2. **Optional FKs** — `platformOrganizationId` is `String?` (nullable) on both legacy models
3. **Backward compatible** — all existing code works without changes
4. **No query rewrites** — existing `prisma.organization.findMany()` etc. continue to work
5. **Independent slug** — `PlatformOrganization.slug` is new, doesn't conflict with existing fields
6. **Gradual adoption** — start with new signups; migrate existing orgs in batches

### Definition of `PlatformOrganization`

```
PlatformOrganization {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  jurisdiction    String?
  tier            String    @default("pilot")     // pilot | enterprise
  status          String    @default("active")
  features        Json?                           // enabled products
  settings        Json?                           // org-level settings
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### Links from Existing Models (additive only)

```prisma
model Organization {
  // EXISTING FIELDS — UNCHANGED
  id                       String    @id @default(cuid())
  name                     String
  users                    User[]
  decisions                Decision[]
  // ... all existing fields and relations

  // NEW FIELD — nullable, optional
  platformOrganizationId   String?
  platformOrganization     PlatformOrganization? @relation(fields: [platformOrganizationId], references: [id])

  @@index([platformOrganizationId])
}

model AuditOrganization {
  // EXISTING FIELDS — UNCHANGED
  id                       String    @id @default(cuid())
  name                     String
  slug                     String    @unique
  clients                  AuditClient[]
  users                    AuditUser[]
  // ... all existing fields and relations

  // NEW FIELD — nullable, optional
  platformOrganizationId   String?
  platformOrganization     PlatformOrganization? @relation(fields: [platformOrganizationId], references: [id])

  @@index([platformOrganizationId])
}
```

### What We Do NOT Change

- `Organization` model fields — untouched except for one nullable FK
- `AuditOrganization` model fields — untouched except for one nullable FK
- `User` model — untouched
- `AuditUser` model — untouched
- `AuditClient`, `AuditEngagement`, `AuditEvent` — untouched
- `Decision`, `AuditLog`, all other product models — untouched
- Auth session JWT — `organizationId` remains as-is
- `auth-config.ts` — unchanged
- `actor-context.ts` — unchanged
- `tenant-guard.ts` — unchanged
- All server actions — unchanged
- All services — unchanged
- All routes — unchanged

### What We Add

1. New Prisma model: `PlatformOrganization`
2. New nullable FK + relation on `Organization`
3. New nullable FK + relation on `AuditOrganization`
4. New migration script (additive only)

---

## 7. Minimal Schema Proposal

### 7.1 New Model

```prisma
model PlatformOrganization {
  id              String    @id @default(cuid())
  name            String
  slug            String    @unique
  jurisdiction    String?
  tier            String    @default("pilot")
  status          String    @default("active")
  features        Json?
  settings        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations to legacy org models (optional, back-links)
  organizations   Organization[]       @relation("OrgPlatformOrg")
  auditOrganizations AuditOrganization[] @relation("AuditOrgPlatformOrg")
}
```

### 7.2 Modified Models (additive changes only)

```prisma
model Organization {
  // ... existing fields (UNCHANGED) ...

  platformOrganizationId   String?
  platformOrganization     PlatformOrganization? @relation("OrgPlatformOrg", fields: [platformOrganizationId], references: [id])

  @@index([platformOrganizationId])
}

model AuditOrganization {
  // ... existing fields (UNCHANGED) ...

  platformOrganizationId   String?
  platformOrganization     PlatformOrganization? @relation("AuditOrgPlatformOrg", fields: [platformOrganizationId], references: [id])

  @@index([platformOrganizationId])
}
```

### 7.3 Migration SQL Concept

```sql
-- Step 1: Create PlatformOrganization table
CREATE TABLE "PlatformOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'pilot',
    "status" TEXT NOT NULL DEFAULT 'active',
    "features" JSONB,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlatformOrganization_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlatformOrganization_slug_key" UNIQUE ("slug")
);

-- Step 2: Add nullable FK columns to existing tables
ALTER TABLE "Organization" ADD COLUMN "platformOrganizationId" TEXT;
ALTER TABLE "AuditOrganization" ADD COLUMN "platformOrganizationId" TEXT;

CREATE INDEX "Organization_platformOrganizationId_idx" ON "Organization"("platformOrganizationId");
CREATE INDEX "AuditOrganization_platformOrganizationId_idx" ON "AuditOrganization"("platformOrganizationId");

-- NO foreign key constraints initially — add in a FOLLOW-UP migration after data is verified
-- ALTER TABLE "Organization" ADD CONSTRAINT "Organization_platformOrganizationId_fkey"
--   FOREIGN KEY ("platformOrganizationId") REFERENCES "PlatformOrganization"("id");
```

**Why defer FK constraints:**
- Migration can proceed even if some orgs don't have a matching platform org yet
- Allows batch backfill without blocking writes
- FK constraint can be added in a separate migration after verification

### 7.4 What We Explicitly Do NOT Migrate (in Sprint 1A/1B)

| Entity | Migrate? | Reason |
|---|---|---|
| `Organization.platformOrganizationId` | YES (optional) | Core bridge |
| `AuditOrganization.platformOrganizationId` | YES (optional) | Core bridge |
| `User` → `PlatformUser` | NO | Sprint 3 (deferred) |
| `AuditUser` → `PlatformUser` | NO | Sprint 3 (deferred) |
| `AuditEvent` → `PlatformAuditLog` | NO | Sprint 3 (deferred) |
| `AuditLog` → `PlatformAuditLog` | NO | Sprint 3 (deferred) |
| `AuditEngagement.projectId` | NO | Sprint 2 (deferred) |
| `ClientWorkspace` | NO | Sprint 2 (deferred) |
| `Project` model | NO | Sprint 2 (deferred) |
| `PlatformRole` | NO | Sprint 3 (deferred) |
| Route migration (`[orgSlug]`) | NO | Sprint 9 (deferred) |

**Sprint 1 scope is strictly: `PlatformOrganization` + optional FK columns on legacy orgs + backfill.**

---

## 8. Migration Plan

### 8.1 Phase 1A: Schema Addition (Zero Downtime)

**Duration:** 1 deployment

1. **Prisma migration:** Add `PlatformOrganization` model + `platformOrganizationId` columns
   - `npx prisma migrate dev --name add_platform_organization`
2. **Prisma generate:** Regenerate Prisma client
   - `npx prisma generate`
3. **Verify:** New model exists; existing models have nullable FK columns
4. **Deploy:** Migration runs; existing data unaffected

**Validation:**
- All existing tests pass
- All existing queries continue to work
- New `PlatformOrganization` table exists (empty)
- Old models have `platformOrganizationId` column (all NULL)

### 8.2 Phase 1B: Backfill with Matching Orgs

**Duration:** 1 script execution

**Create a backfill script (NOT a migration — a script to run in a maintenance window or while live):**

```
scripts/backfill-platform-orgs.ts

Logic:
1. Fetch all Organization records (DecisionOS)
2. For each:
   a. Try to find AuditOrganization with same name (case-insensitive)
   b. Create PlatformOrganization if not exists (use Organization.name as slug, sanitized)
   c. Set Organization.platformOrganizationId = PlatformOrganization.id
3. Fetch all AuditOrganization records without a match:
   a. Try to find Organization with same name
   b. Create PlatformOrganization if not exists (use AuditOrganization.slug)
   c. Set AuditOrganization.platformOrganizationId = PlatformOrganization.id
4. For remaining unmatched AuditOrganizations:
   a. Create new PlatformOrganization from AuditOrganization data
   b. Set AuditOrganization.platformOrganizationId = new ID
5. Report any orgs where name matching failed
```

**Slug generation for Organizations without slug:**
- Use `Organization.name` → lowercase, replace spaces/special chars with `-`
- Handle conflicts by appending `-1`, `-2`, etc.
- Record generated slugs for review

**Dry run first:**
- Script outputs planned changes without executing
- Manual review of matches before proceeding

### 8.3 Phase 1C: Enable FK Constraints

**Duration:** 1 deployment (after backfill is verified)

1. Verify NO NULL values remain in `Organization.platformOrganizationId` and `AuditOrganization.platformOrganizationId`
2. Create migration to add FK constraints
3. Deploy

### 8.4 Rollout Strategy

| Phase | Action | Risk | Rollback |
|---|---|---|---|
| 1A | Schema addition | Minimal | Revert migration, drop new column |
| 1B | Backfill script | Medium | Run reverse script to NULLify platformOrganizationId |
| 1C | FK constraints | Medium | Drop FK constraints (non-destructive) |
| 1D | New signups create PlatformOrganization | Low | Fall back to existing org creation |
| 1E | Extend auth session with platformOrganizationId | Medium | Remove field from JWT callback |

### 8.5 When to Add `platformOrganizationId` to Auth Session

**Do NOT add in Sprint 1A/1B/1C.** Wait until:
- All existing orgs have been backfilled (no NULL `platformOrganizationId`)
- FK constraints are active
- New signups are creating PlatformOrganization automatically
- Verification shows no orphan records

Then:
1. Add `platformOrganizationId` to the JWT callback in `auth-config.ts`
2. Add `platformOrganizationId` to the `CurrentUser` type
3. Add `platformOrganizationId` to the session object
4. All existing code still reads `organizationId` — new code can read `platformOrganizationId`

---

## 9. Rollback Plan

### 9.1 Schema Rollback (Phase 1A)

**If migration causes issues before backfill:**

```bash
npx prisma migrate down  # Revert last migration
# OR manually:
ALTER TABLE "Organization" DROP COLUMN "platformOrganizationId";
ALTER TABLE "AuditOrganization" DROP COLUMN "platformOrganizationId";
DROP TABLE "PlatformOrganization";
```

**Impact:** Zero data loss. Only dropped columns never had data.

### 9.2 Backfill Rollback (Phase 1B)

**If backfill produces incorrect matches:**

```sql
-- Clear all backfilled FKs
UPDATE "Organization" SET "platformOrganizationId" = NULL;
UPDATE "AuditOrganization" SET "platformOrganizationId" = NULL;

-- Do NOT delete PlatformOrganization rows — verify then clean up
-- Once verified correct, remove orphaned PlatformOrganizations:
DELETE FROM "PlatformOrganization" po
WHERE NOT EXISTS (SELECT 1 FROM "Organization" o WHERE o."platformOrganizationId" = po.id)
AND NOT EXISTS (SELECT 1 FROM "AuditOrganization" ao WHERE ao."platformOrganizationId" = po.id);
```

**Impact:** FK links lost. PlatformOrganization rows may need cleanup.

### 9.3 Full Rollback (All Phases)

```sql
-- Drop FK constraints
ALTER TABLE "Organization" DROP CONSTRAINT IF EXISTS "Organization_platformOrganizationId_fkey";
ALTER TABLE "AuditOrganization" DROP CONSTRAINT IF EXISTS "AuditOrganization_platformOrganizationId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "Organization_platformOrganizationId_idx";
DROP INDEX IF EXISTS "AuditOrganization_platformOrganizationId_idx";

-- Drop FK columns
ALTER TABLE "Organization" DROP COLUMN "platformOrganizationId";
ALTER TABLE "AuditOrganization" DROP COLUMN "platformOrganizationId";

-- Drop PlatformOrganization table
DROP TABLE "PlatformOrganization";

-- Regenerate Prisma client
npx prisma generate
```

**Impact:** Zero data loss. Only additive columns removed.

### 9.4 Rollback Success Criteria

- All existing tests pass
- All server actions work
- Auth session works
- AuditOS workspace accessible
- DecisionOS workspace accessible
- No errors in application logs related to `platformOrganizationId`

---

## 10. Test Plan

### 10.1 Pre-Implementation Tests (Run Now)

These tests establish the baseline. Run before any schema changes:

| Test | File/Area | Covers |
|---|---|---|
| T1 | `npx tsc --noEmit` | Type safety of entire codebase |
| T2 | `npm run lint` | Code quality |
| T3 | `npm test` | All existing unit tests |
| T4 | AuditOS engagement CRUD | Services, actions, guards work |
| T5 | DecisionOS decision CRUD | Services, actions, guards work |
| T6 | Auth login + session | JWT contains correct orgId |
| T7 | Actor resolution | `getAuditActor()` returns correct AuditUser |
| T8 | Tenant guard assertions | `assertEngagementAccess()` allows/denies correctly |
| T9 | Cross-org isolation | Org A user cannot access Org B engagement |

### 10.2 Post-Migration Tests (Phase 1A)

Run after schema change, before backfill:

| Test | Covers |
|---|---|
| M1 | `npx prisma migrate status` | Migration applied |
| M2 | `npx prisma db validate` | Schema valid |
| M3 | `npx tsc --noEmit` | Type safety with new model |
| M4 | `npm run lint` | No lint errors from new code |
| M5 | All pre-implementation tests still pass | No regression |
| M6 | Create `PlatformOrganization` via Prisma | New model works |
| M7 | Read existing `Organization` without `platformOrganizationId` | Legacy query unchanged |
| M8 | Read existing `AuditOrganization` without `platformOrganizationId` | Legacy query unchanged |
| M9 | AuditOS engagement CRUD still works | No regression |
| M10 | DecisionOS decision CRUD still works | No regression |

### 10.3 Post-Backfill Tests (Phase 1B)

| Test | Covers |
|---|---|
| B1 | No NULL `platformOrganizationId` remains in Organization | Full coverage |
| B2 | No NULL `platformOrganizationId` remains in AuditOrganization | Full coverage |
| B3 | Every `PlatformOrganization.id` is referenced by at least one legacy org | No orphan bridge |
| B4 | `Organization.platformOrganizationId` resolves to valid `PlatformOrganization` | FK integrity |
| B5 | `AuditOrganization.platformOrganizationId` resolves to valid `PlatformOrganization` | FK integrity |
| B6 | Slug uniqueness across all PlatformOrganizations | Unique constraint intact |
| B7 | All pre-implementation tests still pass | No regression |
| B8 | New signup creates PlatformOrganization + Organization + AuditOrganization links | New flow works |

### 10.4 Edge Cases to Test

| Edge Case | Test |
|---|---|
| Org with no matching AuditOrganization | Creates standalone PlatformOrganization from Organization alone |
| AuditOrganization with no matching Organization | Creates standalone PlatformOrganization from AuditOrganization alone |
| Two Organizations with same name | Slug deduplication (org-name, org-name-1) |
| Org with special characters in name | Slug sanitization |
| Very long org name (>100 chars) | Slug truncation |
| Backfill script interrupted mid-execution | Idempotency — re-running should not create duplicates |
| Race condition: two users create orgs simultaneously | Slug uniqueness constraint prevents duplicates |

### 10.5 Testing Tools

- **Migration tests:** `prisma migrate status`, `prisma db validate`, custom SQL queries
- **Integration tests:** Jest + Supertest against test database
- **Manual smoke tests:** UI-based CRUD for AuditOS and DecisionOS
- **Data integrity checks:** Custom SQL scripts to verify FK relationships

---

## 11. Implementation Sequence

### 11.1 Sprint 1A: Schema Addition (Estimated: 1-2 days)

**Goal:** Create `PlatformOrganization` model and add nullable FK columns. Zero behavior changes.

**Steps:**
1. [ ] Add `PlatformOrganization` model to `prisma/schema.prisma`
2. [ ] Add `platformOrganizationId String?` to `Organization`
3. [ ] Add `platformOrganizationId String?` to `AuditOrganization`
4. [ ] Add `@@index([platformOrganizationId])` to both
5. [ ] Add relation fields to both (but NO FK constraint initially)
6. [ ] Run `npx prisma migrate dev --name add_platform_organization`
7. [ ] Run `npx prisma generate`
8. [ ] Run existing tests (T1-T9)
9. [ ] Run post-migration tests (M1-M10)
10. [ ] Deploy

**Verification:** All existing functionality unchanged. New table exists, empty.

**Rollback:** Migration revert (Section 9.1).

### 11.2 Sprint 1B: Backfill Script + Verification (Estimated: 2-3 days)

**Goal:** Create backfill script, run dry-run, review, run live, verify.

**Steps:**
1. [ ] Create `scripts/backfill-platform-orgs.ts`
2. [ ] Implement org name matching logic with fuzzy fallback
3. [ ] Implement slug generation from Organization.name
4. [ ] Implement slug deduplication
5. [ ] Run dry mode — output planned matches
6. [ ] Manual review of matching accuracy
7. [ ] Run live backfill in staging
8. [ ] Run verification queries (B1-B8)
9. [ ] Run all pre-implementation tests
10. [ ] Fix any mismatches manually
11. [ ] Run live backfill in production (maintenance window recommended)

**Verification:** All legacy orgs have `platformOrganizationId`. All links correct.

**Rollback:** Script rollback (Section 9.2).

### 11.3 Sprint 1C: FK Constraints + Auth Session Extension (Estimated: 1-2 days)

**Goal:** Add FK constraints, extend auth session with `platformOrganizationId`.

**Steps:**
1. [ ] Verify no NULL `platformOrganizationId` exists
2. [ ] Create migration to add FK constraints
3. [ ] Deploy FK constraint migration
4. [ ] Add `platformOrganizationId` to JWT callback in `auth-config.ts`
5. [ ] Add `platformOrganizationId` to `CurrentUser` type
6. [ ] Run all tests
7. [ ] Monitor for errors in production

**Verification:** FK constraints active. Auth session carries `platformOrganizationId`.

**Rollback:** Drop FK constraints (Section 9.3). Remove `platformOrganizationId` from JWT callback.

### 11.4 Sprint 1D: New Signup Flow (Estimated: 1-2 days)

**Goal:** New organization signups create `PlatformOrganization` + link to legacy orgs.

**Steps:**
1. [ ] Add `createPlatformOrganization()` service
2. [ ] Update signup flow to create `PlatformOrganization` first
3. [ ] Create `Organization` and `AuditOrganization` linked to new `PlatformOrganization`
4. [ ] Update `ensureAuditUserProvisioned()` to check `platformOrganizationId`
5. [ ] Run all tests
6. [ ] Deploy

**Verification:** New signups create all three org records with correct links.

**Rollback:** Revert signup flow to create legacy orgs only.

### 11.5 Dependencies and Sequence Diagram

```
Sprint 1A: Schema Addition
  │
  ├──→ Sprint 1B: Backfill Script + Verification
  │       │
  │       └──→ Sprint 1C: FK Constraints + Auth Session
  │               │
  │               └──→ Sprint 1D: New Signup Flow
  │
  └──→ (Sprint 2: Workspace/Project models — deferred)
      (Sprint 3: PlatformUser + unified audit — deferred)
```

**No changes to routes, middleware, server actions, or services until Sprint 1D is complete.**

### 11.6 Files to Create/Modify (Sprint 1A-1D)

| File | Action | Phase |
|---|---|---|
| `prisma/schema.prisma` | Add PlatformOrganization model; add FK to Org + AuditOrg | 1A |
| `prisma/migrations/xxx_add_platform_organization/` | Generated migration | 1A |
| `scripts/backfill-platform-orgs.ts` | NEW — backfill script | 1B |
| `src/lib/auth-config.ts` | Add `platformOrganizationId` to JWT callback | 1C |
| `src/types/current-user.d.ts` (or similar) | Add `platformOrganizationId` to type | 1C |
| `src/lib/platform/create-platform-org.ts` (new) | Service for new signups | 1D |
| Signup route/page | Update to create PlatformOrganization | 1D |

---

## 12. No-Go Conditions

The following conditions would **halt or revert** the Platform Foundation migration:

### 12.1 Hard No-Go (Stop Immediately)

| Condition | Action |
|---|---|
| Any existing Prisma test fails after schema change | Revert migration, investigate |
| `npx tsc --noEmit` reports errors in existing files (not related to new model) | Revert changes affecting those files |
| AuditOS server action returns tenant access error for existing engagements | Revert, investigate tenant guard interaction |
| Auth login fails for any existing user | Revert JWT changes |
| Data loss detected in any existing record | Revert migration, restore from backup |
| Backfill script produces incorrect org matches for production data | Revert backfill, fix matching logic |

### 12.2 Soft No-Go (Pause and Assess)

| Condition | Action |
|---|---|
| Migration takes longer than 5 minutes on production database | Pause, optimize, run in maintenance window |
| Backfill script takes longer than 30 minutes | Pause, optimize with batch processing |
| More than 5% of orgs require manual matching intervention | Pause, improve matching heuristics |
| Performance regression of >10% on any critical query | Investigate index usage, optimize |
| Memory usage of backfill script exceeds production container limits | Implement batch processing with cursors |

### 12.3 Pre-Existing Issues That Must Be Addressed Before Migration

These are pre-existing issues found during the safety review that should be fixed before or alongside the Platform Foundation migration:

| Issue | Priority | Suggested Fix |
|---|---|---|
| No `src/middleware.ts` — routes have no auth guard | **HIGH** | Create middleware that checks auth for `/audit/*`, `/decisions/*`, `/sales/*` |
| Demo fallback in `actor-context.ts` active in `test` environment | **HIGH** | Gate demo fallback to `development` only (not `test`) |
| `AuditEngagement.organizationId` stored without FK constraint | **MEDIUM** | Add FK relation to `AuditOrganization.id` |
| Security headers middleware not wired | **MEDIUM** | Wire `middleware-security.ts` into middleware chain |
| `ProductionBlocker` audit events log empty `engagementId` | **LOW** | Fix to pass correct engagement ID |

**Recommendation:** Fix the first two items (middleware auth guard and demo fallback gating) before Sprint 1A is deployed to production.

---

## Appendix A: File Impact Assessment

### Files That Reference `Organization` Model

| File | Pattern | Impact |
|---|---|---|
| `prisma/schema.prisma` | `model Organization {` | Add FK column + relation |
| `src/lib/auth-config.ts` | `prisma.user.findUnique({... organization ...})` | Unchanged — reads `User.organizationId` |
| `src/lib/auth.ts` | `requireOrgAccess()` | Unchanged — compares `session.organizationId` |
| `src/lib/audit/actor-context.ts` | `session.user.organizationId` | **CRITICAL** — currently assumes this IS AuditOrganization.id. Must remain unchanged until Phase 1C. |
| `src/lib/audit/tenant-guard.ts` | `assertEngagementAccess()` | Unchanged — reads `engagement.organizationId` directly |
| `src/lib/audit/services.ts` | Queries filtered by `organizationId` | Unchanged |
| `src/actions/audit-actions.ts` | `getAuditActor()` → `actor.organizationId` | Unchanged |
| `src/actions/audit-read-actions.ts` | `getAuditActor()` → `actor.organizationId` | Unchanged |

**Key constraint:** `actor-context.ts` lines that resolve `AuditUser` using `session.user.organizationId` must remain UNCHANGED until we verify that `Organization.id` can be mapped to `AuditOrganization.id` for all existing orgs.

### Files That Reference `AuditOrganization` Model

| File | Pattern | Impact |
|---|---|---|
| `prisma/schema.prisma` | `model AuditOrganization {` | Add FK column + relation |
| `src/lib/audit/actor-context.ts` | `prisma.auditUser.findUnique({ organizationId: ... })` | **CRITICAL** — must remain unchanged |
| `src/lib/audit/tenant-guard.ts` | Direct `engagement.organizationId` comparison | Unchanged |
| `src/lib/audit/services.ts` | Engagement queries | Unchanged |

### Files That Should Be New or Modified (Sprint 1A-1C)

| File | Type | Change |
|---|---|---|
| `prisma/schema.prisma` | Modified | Add PlatformOrganization model + FK fields |
| `src/lib/auth-config.ts` | Modified | Add `platformOrganizationId` to JWT callback (Phase 1C) |
| `scripts/backfill-platform-orgs.ts` | **New** | Backfill script |
| `src/types/platform-organization.ts` (proposed) | **New** | PlatformOrganization type definitions |

---

## Appendix B: Detailed Actor Resolution Flow

```
1. User makes request to /audit/* endpoint
2. NextAuth middleware? → NO (no middleware exists)
3. Page/Component renders → calls server action
4. Server action calls getAuditActor()
   │
   ├── 4a. Get NextAuth session
   │     └── session.user = { id, email, name, role, organizationId, organization }
   │                          ↑ This is Organization.id (DecisionOS)
   │
   ├── 4b. Look up AuditUser by (organizationId, email)
   │     └── prisma.auditUser.findUnique({ where: { organizationId_email: { 
   │              organizationId: session.user.organizationId,   ← DecisionOS Organization.id
   │              email: session.user.email                      ← from session
   │   }}})
   │
   ├── 4c. If found → return AuditUser with AuditOrganization.organizationId
   │
   └── 4d. If NOT found → fall back to demo actor (non-production)
                                   OR throw error (production)

5. Server action calls requireRole(roles) → checks actor.role
6. Server action calls assertEngagementAccess(engagementId, actor)
   │
   ├── Fetch engagement from DB
   ├── Compare engagement.organizationId === actor.organizationId
   │   ↑ BOTH come from the SAME source (session.user.organizationId → AuditOrganization.id)
   │
   └── If mismatch → throw TenantAccessError

7. Server action proceeds with business logic
```

**The implicit assumption:** `session.user.organizationId` (which is `Organization.id` from DecisionOS) happens to equal `AuditOrganization.id` for the same real-world organization. This is NOT enforced by the database schema. It works by naming convention (`org-aqliya`).

**Risk to PlatformOrganization migration:** If we add `PlatformOrganization` with a new ID scheme, we MUST NOT change what `session.user.organizationId` contains until we verify that ALL existing Actor Resolution flows still work. The safest path is to add `platformOrganizationId` as a NEW session field and leave `organizationId` untouched.
