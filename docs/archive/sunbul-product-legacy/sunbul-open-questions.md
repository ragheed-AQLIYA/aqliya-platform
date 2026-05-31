# Sunbul Open Questions

**Version:** 0.1
**Status:** These questions MUST be answered before Phase 1 implementation begins

---

## Product & Strategy

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 1 | Is Sunbul a product for external sale (multi-tenant SaaS) or an internal platform (org serves multiple departments)? | External sale / Internal platform / Both | Before Phase 1 |
| 2 | Who is the first target client type? | Professional services firm / Government shared service / BPO provider / Other | Before Phase 1 |
| 3 | Is there a confirmed pilot client? | If yes, which one? Their needs shape MVP priorities | Before Phase 3 |
| 4 | What is the commercial model? | Per-client subscription / Per-record / Platform fee + per-client / Not yet decided | Before Phase 7 |
| 5 | Is Sunbul a white-label product (client brands as their own) or does it carry Sunbul/AQLIYA branding? | White-label / Sunbul branded / AQLIYA branded / Configurable | Before Phase 2 |
| 6 | Should there be a marketing page at `/products/sunbul` alongside existing product pages? | Yes / No — documentation only until MVP | Before Phase 2 |

## Client Workflow Assumptions

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 7 | What is the default record type for MVP? | Generic "Case" / "Request" / Client-specific type / Need example from pilot | Before Phase 3 |
| 8 | What are the minimum required fields for a record? | Title only / Title + type / Title + type + at least one document / Other | Before Phase 3 |
| 9 | Should records support custom fields per client? | Yes — configurable per client / No — fixed schema for MVP / Only in future | Before Phase 3 |
| 10 | How are records numbered/tracked externally? | Auto-increment per client / UUID only / Client-specific prefix + number / Not needed for MVP | Before Phase 3 |
| 11 | What is the expected record volume per client? | <100/month / 100-1000/month / 1000+/month | Before Phase 1 (schema design) |

## Multi-Client Isolation

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 12 | Should client isolation be at the application layer (same DB, `clientId` filter) or database layer (separate schemas/DBs)? | Application layer (MVP) / Schema-per-tenant / DB-per-tenant / Hybrid | Before Phase 1 |
| 13 | Should file storage isolation use the same filesystem with path isolation or separate storage per client? | Path isolation (MVP) / Separate buckets/volumes per client / Encrypted per client | Before Phase 5 |
| 14 | How is backup and restore handled for individual clients? | Full deployment backup only / Per-client backup / Not needed for MVP | Before Phase 8 |
| 15 | Can a user belong to multiple clients with different roles? | Yes — flexible platform / No — one client per user (simpler) / Yes, with restrictions | Before Phase 1 |

## Data Sensitivity

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 16 | What level of data sensitivity is expected for client records? | Low (general business) / Medium (confidential) / High (regulated/PII) | Before Phase 1 (security design) |
| 17 | Is encryption at rest required for MVP? | No (rely on DB encryption) / Yes, field-level / Yes, column-level / Yes, client-level | Before Phase 5 |
| 18 | Are there data retention requirements? | Delete after X years / Archive only / Client-configurable / Not addressed | Before Phase 6 |

## Required Integrations

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 19 | Are there any required integrations for MVP? | None / Email (SMTP) / Document generation / Other | Before Phase 3 |
| 20 | Is email notification required for workflow events? | Yes — critical for review/approval / No — in-app only for MVP / Basic email for MVP | Before Phase 3 |
| 21 | Is SSO/SAML/AD integration required? | Required for pilot / Nice to have / Not needed | Before Phase 8 |

## Deployment Model

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 22 | Is MVP deployed on the existing AQLIYA infrastructure or a separate deployment? | Same deployment / Separate deployment / TBD | Before Phase 1 |
| 23 | Is Private/On-Prem deployment required for any client within 6 months? | Yes / No / Uncertain | Before Phase 1 |
| 24 | What database infrastructure is available? | Shared PostgreSQL / Dedicated PostgreSQL / Managed service / TBD | Before Phase 1 |

## Auth & Identity

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 25 | Should Sunbul reuse the existing AQLIYA auth system or have its own? | Reuse NextAuth v5 / Separate auth / Hybrid (shared auth, separate user model) | Before Phase 1 |
| 26 | Should Platform Admin be an AQLIYA System Admin or a Sunbul-specific role? | AQLIYA System Admin / Sunbul-specific admin / Both | Before Phase 1 |
| 27 | Is self-registration allowed for clients? | No — admin creates all clients / Yes — with approval / Invite-only | Before Phase 1 |

## Pricing / Commercial

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 28 | Is Sunbul a standalone product with its own pricing or bundled with AQLIYA? | Standalone / Bundled / Both options | Before Phase 7 |
| 29 | Is there a free trial or demo mode? | Yes / No / Not yet decided | Before Phase 8 |
| 30 | What defines an "active client" for billing purposes? | Has at least one active user / Has records created in billing period / Monthly active users / Not decided | Before Phase 7 |

## Pilot Scope

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 31 | How many clients in the pilot? | 1 / 2-3 / 5+ | Before Phase 8 |
| 32 | How many users per pilot client? | <5 / 5-20 / 20+ | Before Phase 8 |
| 33 | How long is the pilot? | 1 month / 2 months / 3 months / Flexible | Before Phase 8 |
| 34 | What success metrics will the pilot be measured against? | (To be defined with pilot client) | Before Phase 8 |
| 35 | Is there a production review/signoff process for the pilot? | Follow existing AQLIYA `docs/auditos/` pilot process / Custom Sunbul process / TBD | Before Phase 8 |

## Technical

| # | Question | Options / Notes | Decision Needed By |
|---|---|---|---|
| 36 | Should Sunbul models use a `Sunbul` prefix or no prefix? | `Sunbul` prefix (avoid collision) / No prefix (clash risk) / `Sb` prefix | Before Phase 1 |
| 37 | Should Sunbul routes be at `/sunbul` or under `/(dashboard)/sunbul`? | `/sunbul` top-level (like SalesOS) / `/(dashboard)/sunbul` (like DecisionOS) | Before Phase 2 |
| 38 | Should Sunbul reuse existing AQLIYA components (PlatformSidebar, PlatformHeader, KPICard, etc.)? | Yes — full reuse / Partial reuse / Custom components | Before Phase 2 |
| 39 | Should Sunbul reuse existing AQLIYA governance framework (tenant-guard, RBAC, audit)? | Reuse with Sunbul-specific extensions / Build Sunbul-specific / Mix | Before Phase 1 |
| 40 | What testing strategy for MVP? | Jest unit tests only / + Integration tests / + E2E (Cypress) | Before Phase 1 |
