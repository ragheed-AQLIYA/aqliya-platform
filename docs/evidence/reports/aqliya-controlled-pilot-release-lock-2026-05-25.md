# AQLIYA Controlled Pilot Release Lock

**Date:** 2026-05-25  
**Status:** Level 6 — Evidence only  
**Tag:** `controlled-pilot-lock-2026-05-25`  
**Verdict:** CONTROLLED PILOT READY — NOT FULL PRODUCTION SAAS

---

## 1. Executive Verdict

AQLIYA is now **controlled-pilot ready**, not full production SaaS.

This release lock certifies that Phases 0–5 have been completed, verified, and documented. The platform is safe to demonstrate to controlled pilot customers with honest commercial framing. It is not ready for unrestricted external production deployment, autonomous decision-making claims, or enterprise-grade operational guarantees.

---

## 2. Product Status

| Product | Status | Notes |
|---------|--------|-------|
| **AuditOS** | **L5 Pilot-ready** | Archive action/UI, `financial_statements.generated` audit event, export tab with protected download. Primary proof product. |
| **LocalContentOS** | **L5 Pilot-ready with conditions** | Real PDF/XLSX binary exports using pdfkit + xlsx. Workspace resilience files added. Export unit tests pass. Arabic PDF fonts P2 gap. |
| **DecisionOS** | **L4 Usable v0.1** | Stabilized with loading/error/not-found resilience files. No business logic or auth changes. |
| **Office AI Assistant** | **L4 Usable v0.1** | Shared governed application, not standalone product. Unchanged. |
| **Sunbul** | **L4 Usable v0.1** | Custom/internal workspace. Unchanged. |
| **SalesOS** | **L3 Prototype** | Frozen. Mock-only, no Prisma, no persistence. |
| **SimulationOS** | **L1 Marketing** | Frozen. Marketing-only capability label. |
| **LocalContactOS** | **L0 Concept** | Future. Not active. |
| **RiskOS / ComplianceOS / LegalOS / GovOS** | **L0 Concept** | Future. Not active. |
| **AQLIYA Studio** | **L0 Concept** | Strategic future layer. Not active. |

---

## 3. Completed Phase Summary

| Phase | Scope | Status | Date |
|-------|-------|--------|------|
| **0** | Documentation truth alignment — workflowos classification fixed, orphaned code removed | ✅ Done | 2026-05-24 |
| **1** | Security/Core guards — API route guard review, DecisionOS tenant access gap fix (`updateDecisionIntake` → `requireDecisionAccess`) | ✅ Done | 2026-05-24 |
| **2** | AuditOS v1.0 lifecycle — Archive action + button + UI, `financial_statements.generated` audit event, Export tab + protected API | ✅ Done | 2026-05-24 |
| **3** | LocalContentOS v1.0 — Real PDF (pdfkit) + XLSX (xlsx) binary exports, loading/error/not-found resilience files | ✅ Done | 2026-05-25 |
| **4** | DecisionOS stabilization — loading/error/not-found for `/decisions/[id]/` | ✅ Done | 2026-05-25 |
| **5** | Cleanup & hardening — dead `exportLocalContentReportFileAction` removed, export unit tests (3/3 pass), AuditOS smoke check passed, Product Status Matrix synced | ✅ Done | 2026-05-25 |

---

## 4. Validation Evidence

| Check | Result | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | ✅ Pass | Only pre-existing `.next/dev/types/` generated file errors (Next.js route type generation, unrelated to app code). |
| `npx jest src/__tests__/unit/localcontent-export-generators.test.ts` | ✅ 3/3 pass | PDF starts `%PDF-`, XLSX spend starts `PK`, XLSX evidence starts `PK`. Correct mimeTypes and extensions. |
| AuditOS focused smoke check | ✅ Pass | 5 paths verified: archive button → action with full guards + audit event; `financial_statements.generated` after mapping; export tab route exists; export download via protected API. |
| API route guard review (Phase 1) | ✅ Pass | All 7 download/export API routes confirmed with auth + tenant guards. |
| `npx tsc --noEmit` across all phases | ✅ Pass | No TypeScript errors introduced by any phase change. |

---

## 5. Remaining Non-Blocking Gaps

These gaps are known and documented. None block controlled pilot demonstrations, but each should be addressed before public production.

| Gap | Priority | Notes |
|-----|----------|-------|
| Arabic PDF font rendering | P2 | Helvetica doesn't render Arabic glyphs. PDF is real binary but Arabic disclaimer text won't display correctly. |
| XLSX cell styling | P3 | No bold headers or formatting. Data-only output. |
| LocalContentOS mutation tests | P2 | Only export tests exist. No action/mutation unit tests. |
| Broader browser smoke | P2 | No Playwright/e2e tests for AuditOS or LocalContentOS. |
| Staging deploy verification | P1 | No staging environment tested. |
| Backup/restore verification | P1 | No backup/restore process verified. |
| External pilot tenant setup | P2 | First controlled pilot tenant not yet configured. |
| `exportLocalContentReportFileAction` docs reference | P3 | One docs report (`localcontentos-v0.1-l5-pilot-readiness-report.md`) mentions the now-removed action. Minor stale reference. |

---

## 6. Commercial Claim Boundary

### Allowed Claims

AQLIYA may truthfully claim:

- **Controlled pilot-ready** governed institutional intelligence platform
- **Governed workspace** with RBAC, tenant isolation, and audit trail
- **Human-in-the-loop** decision workflow with review and approval gates
- **Evidence-based** workflow with file upload, linking, and verification
- **Real PDF and XLSX exports** for LocalContentOS (binary formats verified)
- **AuditOS** as primary proof product for financial/audit intelligence
- **Bilingual Arabic-first** RTL user experience
- **AI-assisted** (not autonomous) — AI suggests, humans decide
- **Private deployment design direction** (not implemented)

### Forbidden Claims

AQLIYA must NOT claim:

- **Full production SaaS** — not verified for unrestricted external production
- **Fully automated audit** — human review and approval are required
- **Replaces auditors** — AQLIYA assists, does not replace
- **Enterprise-grade deployment proven** — not verified at scale
- **Multi-tenant external production proven** — not verified
- **AI makes final decisions** — AI never approves final outputs autonomously
- **On-Prem or Air-Gapped deployment** — not implemented
- **Local AI runtime** — not implemented
- **SIEM integration** — not implemented
- **SSO/LDAP/Active Directory** — not implemented

---

## 7. Recommended Next Work

Strict order — do not skip ahead:

1. **Browser smoke for AuditOS + LocalContentOS** — Manual or Playwright walkthrough of key workflows (engagement creation → mapping → review → export; project setup → supplier → classification → report).
2. **Staging deploy verification** — Deploy to a staging environment, verify build, auth, seed data, and core flows.
3. **LocalContentOS mutation tests** — Add unit/integration tests for server actions (create supplier, create finding, etc.).
4. **Arabic PDF font support** — Embed an Arabic-capable font (e.g., Noto Naskh Arabic) for proper PDF rendering of Arabic labels and disclaimer.
5. **First controlled pilot tenant setup** — Configure a real pilot organization, user accounts, and seed data.
6. **Only after pilot feedback: SalesOS or new product expansion** — Do not start new product work until the first pilot cycle provides feedback.

---

## 8. Suggested Git Tag

```
controlled-pilot-lock-2026-05-25
```
