# SalesOS Freeze Policy

**Status:** FROZEN  
**Effective:** 2026-08-17  
**Authority:** AQLIYA Operating Contract §4, §28  
**Owner:** Platform Governance  
**Review cycle:** None — unfreeze requires explicit new decision.

---

## 1. Scope

This freeze applies to **all SalesOS development, architecture, and design work** across the entire repository.

SalesOS includes:
- `src/app/sales/` — all routes and pages
- `src/components/salesos/` — all UI components
- `src/actions/sales/` or any sales-prefixed server actions
- SalesOS Prisma models (`Sunbul*`, any future `Sales*` models)
- SalesOS domain logic, services, repositories
- SalesOS seed data, migrations, fixtures
- SalesOS documentation claiming capability
- SalesOS AI features, scoring, pipeline logic

---

## 2. Prohibited Activities

The following are **explicitly prohibited** while SalesOS is frozen:

| Category | Prohibited |
|----------|-----------|
| **Features** | Any new SalesOS feature development |
| **Redesign** | Any UI/UX redesign of SalesOS surfaces |
| **Refactoring** | Any code restructuring within SalesOS scope |
| **Migrations** | Any Prisma migration touching SalesOS models |
| **Schema changes** | Any modification to SalesOS Prisma models |
| **Domain consolidation** | Any merging or restructuring of SalesOS domain models |
| **Cleanup** | Any code cleanup, dead code removal, or lint fixes specific to SalesOS |
| **Performance** | Any performance optimization specific to SalesOS |
| **Architecture** | Any architectural changes to SalesOS |
| **Data migration** | Any continuation of the SalesOS data migration |
| **Documentation** | Any documentation expansion claiming new SalesOS capabilities |

---

## 3. Allowed Exceptions

Only the following categories of work are permitted on SalesOS:

### 3.1 P0 Security Vulnerabilities
A vulnerability that allows remote code execution, authentication bypass, or data exfiltration.

### 3.2 Cross-Tenant Isolation Vulnerabilities
A defect that allows one organization's data to be visible to or modifiable by another organization.

### 3.3 Production-Breaking Defects
A defect that causes 500 errors, data corruption, or complete loss of functionality for existing users.

### 3.4 Shared-Platform Regressions
A SalesOS change that breaks shared platform infrastructure (kernel, auth, cache, audit-log, feature-flags).

### 3.5 Legal/Compliance Blockers
A legal or regulatory requirement that mandates a specific change to SalesOS.

---

## 4. Exception Process

When an exception is identified:

1. **Identify** — Document the specific issue with evidence (error, CVE, reproduction steps).
2. **Classify severity** — Confirm it falls under one of the 5 allowed exception categories.
3. **Document evidence** — Create a brief record in `docs/audits/` with:
   - Issue description
   - Severity classification
   - Affected files
   - Evidence (logs, screenshots, reproduction steps)
4. **Implement minimum change** — Make the smallest possible change that resolves the issue.
5. **Add regression test** — Add a test that prevents the specific issue from recurring.
6. **Review** — The change must be reviewed before merge.
7. **Record decision** — Log the exception in this document's changelog below.
8. **Return to frozen state** — Confirm no other SalesOS changes were included.

---

## 5. Relationship to Active Roadmap

SalesOS is **NOT** part of the active Content/AuditOS roadmap.

Active priorities:
1. **Content / Knowledge** (P1)
2. **AuditOS** (P2)
3. **Platform Enablement** required by Content or AuditOS (P3)

No SalesOS work belongs in any active sprint, wave, or execution plan unless it qualifies as an exception under Section 3.

---

## 6. Current SalesOS Status

SalesOS is assessed at **L2-L3** (Shell / Prototype):
- Routes exist under `src/app/sales/`
- Prisma models exist (Sunbul* series)
- Basic CRUD operations implemented
- No complete workflow end-to-end
- No production-grade tenant isolation validated
- No evidence-backed pipeline
- No export/report capability
- Data migration incomplete

**Recommendation:** SalesOS should remain frozen until Content and AuditOS reach L4-L5. At that point, a dedicated SalesOS completion assessment should be performed.

---

## 7. Exception Log

| Date | Issue | Category | Files Changed | Decision |
|------|-------|----------|---------------|----------|
| (none yet) | | | | |

---

## 8. Enforcement

This policy is enforced by:
- Code review — any PR touching SalesOS files must reference an exception category
- CI checks — SalesOS file changes outside exceptions should be flagged
- Architecture review — any SalesOS schema or route change requires explicit approval

---

*This document was created as part of the AQLIYA Content + AuditOS Reality Audit on 2026-08-17.*
