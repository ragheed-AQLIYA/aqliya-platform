# DOCUMENTATION GOVERNANCE V2 — AQLIYA Recovery & Scale

**Date:** 2026-06-17  
**Supersedes:** Ad-hoc doc practices identified in KNOWLEDGE_GOVERNANCE_REPORT  
**Preserves:** `docs/DOCUMENTATION_AUTHORITY.md` hierarchy — this document operationalizes it

---

## Single Source of Truth Model

### Tier 0 — Conflict Resolution (unchanged)

| Document | Role | Updates when |
|----------|------|--------------|
| `docs/DOCUMENTATION_AUTHORITY.md` | Hierarchy rules | Governance model changes |

### Tier 1 — Executive Truth (sync weekly during recovery)

| Document | Owns | Must never claim |
|----------|------|------------------|
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | Identity, doctrine, product taxonomy framework | Build pass without evidence |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | **Implementation status per product** | L6 production-certified |
| `docs/source-of-truth/ROUTE_REGISTRY.md` | Route map | Routes not in `src/app/` |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | Route policy | — |
| `docs/source-of-truth/READINESS_GATES.md` | Release gates | — |

**Rule:** On status conflict, **code + `docs/reports/` evidence wins** over master ref (DOCUMENTATION_AUTHORITY §5.2).

### Tier 2 — Architecture Truth

| Document | Owns |
|----------|------|
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | System diagram, boundaries |
| `docs/architecture/ADR-*.md` | Decision records (AI runtime, etc.) |

**Rule:** ADRs are authoritative for **decisions**; matrix is authoritative for **status**.

### Tier 3 — Evidence (CREATE — currently missing)

| Path | Owns |
|------|------|
| **`docs/reports/`** | Validation outputs only — tsc, build, test, smoke |

**Mandatory files after each validation run:**

```
docs/reports/
├── YYYY-MM-DD-tsc.txt
├── YYYY-MM-DD-build.txt
├── YYYY-MM-DD-test.txt
├── YYYY-MM-DD-smoke-local.txt
└── README.md  (index + how to regenerate)
```

**Rule:** PRODUCT_STATUS_MATRIX Phase rows must **link** to report file or say NOT RUN.

### Tier 4 — Operations

| Path | Owns |
|------|------|
| `docs/operations/production-deployment-runbook.md` | Deploy procedure |
| `docs/operations/ha-dr-plan.md` | DR |
| `runbooks/*.md` | **Merge into operations/** or cross-link one canonical backup doc |

### Tier 5 — Product Detail

| Path | Owns |
|------|------|
| `docs/product/*` | Specs, pilot runbooks |
| `docs/pilot/*` | Pilot procedures |

**Rule:** Product docs **must not** override Tier 1 status labels.

---

## Non-Authoritative Documents

**Must carry banner:** *"Background / non-authoritative for implementation status"*

| Corpus | Path | Count | Use |
|--------|------|------:|-----|
| Theoretical reference | `docs/theoretical-reference/` | 352 | Research, domain theory |
| Archive | `docs/archive/` | 227 | History only |
| Knowledge Foundation | `knowledge-foundation/` | ~292 | Institutional IP corpus |
| Audit snapshots | `docs/audits/*/` | dated folders | Point-in-time evidence |
| Review packs | `docs/review/` | evidence | Customer/pilot artifacts |

**Forbidden:** Citing archive or theoretical docs in sales decks, RFPs, or status claims.

---

## Authoritative vs Non-Authoritative Quick Reference

| Question | Authoritative source |
|----------|---------------------|
| Is product X implemented? | PRODUCT_STATUS_MATRIX + code |
| Can we deploy today? | `docs/reports/` latest build |
| What routes exist? | ROUTE_REGISTRY + `src/app/` |
| What is AQLIYA identity? | docs/official/* |
| How does AI runtime work? | ADR-001 + code |
| Domain theory? | theoretical-reference (background) |
| What did audit find on date X? | `docs/audits/forensic-audit-2026-06-17/` |

---

## Archive Process

1. **Trigger:** Doc superseded by newer authority doc or audit  
2. **Action:** Move to `docs/archive/{YYYY-MM}/{original-path}`  
3. **Header:** Add `Status: Archived · Superseded by: {path} · Date: {date}`  
4. **Index:** Entry in `docs/archive/README.md`  
5. **Never delete** doctrine or audit evidence — archive only

**Immediate candidates:**

- Duplicate `RELEASE_DECISION.md` (keep one in `docs/review/`, archive other)
- Master ref §16 validation baseline (annotate superseded by 2026-06-17 reports)

---

## Deprecation Process

For **product features** (not docs):

1. Mark in PRODUCT_STATUS_MATRIX with deprecation date  
2. Add code comment `@deprecated` with removal target  
3. Route_REGISTRY status → ⚠️ deprecated  
4. Remove from customer claims matrix  
5. Delete only after 1 release cycle with redirect

**Current deprecations (code markers — TECH_DEBT_REPORT):**

- TB firm-memory paths — follow existing DEPRECATED markers, do not delete blindly

---

## Ownership Process

Every Tier 1–2 doc gets frontmatter (add on next edit):

```yaml
---
owner: platform-engineering | product-localcontent | product-audit
last-reviewed: YYYY-MM-DD
evidence-ref: docs/reports/YYYY-MM-DD-build.txt
---
```

| Document | Default owner |
|----------|---------------|
| PRODUCT_STATUS_MATRIX | Platform PM + eng lead |
| AQLIYA_MASTER_REFERENCE | CTO / product architect |
| ROUTE_REGISTRY | Platform eng |
| ADRs | Architect who wrote ADR |
| Product runbooks | Product owner |

**No owner = cannot be cited in due diligence.**

---

## Review Process

### Weekly (recovery period)

| Review | Participants | Output |
|--------|--------------|--------|
| Status truth | Eng lead + PM | PRODUCT_STATUS_MATRIX delta |
| Build evidence | QA / eng | New file in `docs/reports/` |
| Claims check | Commercial | Update unsupported claims list |

### Monthly

| Review | Output |
|--------|--------|
| Authority doc freshness | `last-reviewed` dates updated |
| Archive sweep | Superseded docs moved |
| Conflict scan | DOCUMENT_CONFLICT_MATRIX delta |

### Per release

| Gate | Requirement |
|------|-------------|
| Pilot GO | Matrix row + report link + runbook current |
| Deploy | build.txt PASS within 7 days |
| Enterprise meeting | No Tier 5 doc cited as status |

---

## Immediate Remediation (Week 2)

| # | Action | Closes |
|---|--------|--------|
| 1 | Create `docs/reports/` + README | DC-17 |
| 2 | Run validation → commit snapshots | DC-01 |
| 3 | Update master ref §6, §9, §16 | DC-02–DC-05 |
| 4 | Fix README SalesOS line | DC-03 |
| 5 | Fix AQLIYA_ARCHITECTURE LocalContactOS contradiction | DC-11 |
| 6 | Add build status row to matrix Phase table | DC-01 |
| 7 | Banner on theoretical-reference README | DC-18 |

---

## Commercial Claims Register (New — Tier 1 adjunct)

Create `docs/source-of-truth/COMMERCIAL_CLAIMS_REGISTER.md`:

| Claim | Allowed? | Evidence ref |
|-------|----------|--------------|
| AuditOS pilot-ready | Yes, conditional | Matrix L8 |
| LocalContent workbook + ERP | Yes | Matrix L20 |
| Production L6 | **No** | Audit |
| SAML enterprise SSO | **No** until wired | SEC-M03 |
| Air-gapped package | **No** | Matrix L31 |
| Local AI Ollama | Yes, pilot + operator setup | ADR-001, smoke |
| SalesOS production CRM | **No** | Matrix L19 |

**Rule:** Sales/marketing may only use claims marked Yes.

---

## Success Criteria (Day 30)

- [ ] `docs/reports/` exists with ≥1 full validation cycle  
- [ ] Zero open DC-01–DC-07 conflicts  
- [ ] All Tier 1 docs have owner + last-reviewed  
- [ ] Commercial claims register published  
- [ ] theoretical-reference banner live
