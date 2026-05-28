# AuditOS v0.1 — First External Operator Walkthrough

**Date:** 2026-05-28  
**Baseline tag:** `auditos-v0.1-pilot-baseline-2026-05-28`  
**Classification:** Ready for Controlled External Walkthrough  
**Trust principle:** AI assists. Humans decide. Evidence governs.

---

## 1. Walkthrough Objective

Demonstrate a **governed financial audit workspace** — not a product demo with hype — showing how an operator moves from trial balance through mapping, statements, evidence, review, human approval, export, and audit trail.

**Success for this session:**

- External operator understands workflow order and governance gates.
- No false claims about certification, autonomy, or enterprise scale.
- Friction is logged; blockers stop the session.

**Not the objective:**

- Closing a sale on the spot.
- Proving AI replaces auditors.
- Showing unfinished products (DecisionOS, LocalContentOS, `/auditos/*` public demo as real workspace).

---

## 2. Operator Persona

| Attribute       | Profile                                                     |
| --------------- | ----------------------------------------------------------- |
| Role            | Audit manager, senior accountant, or institutional operator |
| Language        | Arabic-first preferred; English financial terms acceptable  |
| Technical level | Comfortable with web apps; not required to know Docker      |
| Authority       | Can review outputs; may or may not be final approver        |
| Expectation     | Wants traceability, human control, and evidence linkage     |

**Facilitator role:** AQLIYA pilot lead observes, explains governance, and captures friction — does not override operator decisions.

---

## 3. Environment Assumptions

| Item        | Assumption                                                                       |
| ----------- | -------------------------------------------------------------------------------- |
| Deployment  | Docker Compose or controlled single-instance (see `auditos-demo-environment.md`) |
| Health      | `GET /api/health` → `status: "ok"` before start                                  |
| Data        | Seeded engagement `eng-gulf-2025` (Gulf Trading Co., FY2025)                     |
| Credentials | Rotated from seed defaults if external org present                               |
| Browser     | Chromium-based; hard refresh after any redeploy                                  |
| Duration    | 60–90 minutes                                                                    |
| Observer    | At least one AQLIYA facilitator + one external operator                          |

---

## 4. Exact Walkthrough Flow

| Step | Tab / path                         | Purpose                                              |
| ---- | ---------------------------------- | ---------------------------------------------------- |
| 0    | `/login`                           | Authenticate; confirm governed workspace             |
| 1    | `/audit/engagements/eng-gulf-2025` | Overview — next-action card, workflow progress       |
| 2    | `…/trial-balance`                  | Source data integrity                                |
| 3    | `…/mapping`                        | Classification to canonical accounts                 |
| 4    | `…/statements`                     | Financial statements + traceability                  |
| 5    | `…/notes`                          | Disclosure notes                                     |
| 6    | `…/evidence`                       | Evidence vault upload/link                           |
| 7    | `…/findings`                       | Findings linked to evidence                          |
| 8    | `…/review`                         | Human review comments                                |
| 9    | `…/approval`                       | Human approval gates (may remain blocked — expected) |
| 10   | `…/exports`                        | Draft PDF/XLSX export                                |
| 11   | `…/audit-trail`                    | Mutation log verification                            |

Direct URL after login: `/audit/engagements/eng-gulf-2025`

---

## 5. What to Click / Show

### Overview

- **Next-action card** — explains blocked step in Arabic.
- **Workflow progress** — locked/unlocked tabs match readiness.
- **Platform context note** (blue info) — seed engagement may show unlinked project; explain this is acceptable in pilot seed.

### Trial balance → mapping → statements

- Show SAR formatting and Arabic tab labels.
- Open **traceability** on a statement line (source back to TB).
- On statements, show **draft banner** and export menu; trigger export and confirm **success message**.

### Evidence → findings

- Upload or show existing evidence; note storage badge (local provider).
- Create or review a finding with evidence reference.

### Review → approval

- Show review comments; emphasize no auto-approval.
- On approval page: read **human-decision banner** and prerequisite card if blocked.
- **Do not force approval** if gates block — explain prerequisites instead.

### Export → audit trail

- Download draft PDF/XLSX; explain draft status.
- Audit trail: point to upload, review, export events with actor and timestamp.

---

## 6. What NOT to Claim

| Do not say                            | Say instead                                                   |
| ------------------------------------- | ------------------------------------------------------------- |
| "AI approves your audit"              | "AI assists; humans decide"                                   |
| "Certified audit opinion"             | "Draft governed workspace output"                             |
| "Enterprise production ready"         | "Controlled pilot baseline"                                   |
| "SSO / LDAP integrated"               | "Credentials auth in v0.1"                                    |
| "Autonomous audit platform"           | "Governed workflow with human gates"                          |
| "On-prem / air-gapped package"        | "Strategic direction; cloud/single-instance validated"        |
| "`/auditos/*` is your live workspace" | "Public demo is sanitized mock; `/audit/*` is real workspace" |

---

## 7. Governance Explanation Points

1. **Human approval** — Final approval requires a human with recorded identity; system blocks bypass.
2. **Workflow gates** — Tabs lock until prerequisites complete; reasons shown in Arabic.
3. **Audit trail** — Mutations logged with actor and time.
4. **Evidence** — Material outputs should link to evidence; downloads are permissioned.
5. **Draft exports** — Pre-approval exports are labeled draft for internal review only.
6. **Tenant isolation** — Data scoped to organization; no cross-tenant access.
7. **AI boundary** — Suggestions only; no autonomous final decisions.

---

## 8. Export Explanation

- Exports (PDF/XLSX) pull from engagement data server-side via permissioned API.
- **Draft exports** are available before final approval — intentional for internal review.
- Success message confirms download; file is not a certified final deliverable until approval path complete.
- Export events appear in audit trail.

---

## 9. Evidence Explanation

- Evidence files stored in configured local storage (`LOCAL_STORAGE_DIR` / Docker `uploads` volume).
- Upload requires auth; download routes are permissioned.
- Rejecting evidence changes state but may retain file on disk (v0.1 limitation — disclosed).
- Findings should reference evidence for material items.

---

## 10. Approval Explanation

- Approval page shows status badge and blocking issues.
- Prerequisite card links to the next required tab.
- Seeded engagement may **not reach final approval** in one session — this demonstrates governance, not failure.
- Rejection path exists with audit logging.

---

## 11. Expected Questions

| Question                       | Honest answer                                                   |
| ------------------------------ | --------------------------------------------------------------- |
| Is this production-ready?      | Controlled pilot baseline — single instance, not enterprise HA. |
| Who approves?                  | Your designated human reviewer/partner; system enforces gates.  |
| Can we export before sign-off? | Yes — as **draft** for internal review.                         |
| Where is data stored?          | PostgreSQL + local file storage in your deployment.             |
| Does AI sign the report?       | No. AI assists only.                                            |
| Arabic support?                | Arabic-first operator UI; some admin labels may mix English.    |
| What if we redeploy?           | Hard refresh browser; see deployment guide.                     |

---

## 12. Expected Objections

| Objection                              | Response                                                               |
| -------------------------------------- | ---------------------------------------------------------------------- |
| "Approval is blocked — product broken" | Gates are intentional; walk through prerequisite card.                 |
| "Why draft export before approval?"    | Policy for internal review; not a certified final output.              |
| "Too many locked tabs"                 | Sequential governed workflow; next-action card guides order.           |
| "We need SSO"                          | Not in v0.1; roadmap item — credentials only today.                    |
| "Is this Big 4 certified?"             | No — governed institutional workflow tool, not audit opinion software. |
| "Page stuck loading after update"      | Hard refresh (Ctrl+Shift+R); stale cache after deploy.                 |

---

## 13. Success Criteria

**Session succeeds if:**

- [ ] Operator completes steps 0–11 without auth/tenant/governance blockers
- [ ] Operator articulates trust principle in their own words
- [ ] Operator understands draft vs final export
- [ ] Operator understands approval is human and may be gated
- [ ] Friction log captured (P0/P1/P2)
- [ ] No false claims made by facilitator

**Session fails (stop and escalate) if:**

- Auth bypass or tenant data leak
- Silent mutation without audit event
- Export/download without permission check
- Facilitator claims certification or autonomous audit

---

## References

- Live script: `docs/pilot/auditos-live-walkthrough-script.md`
- FAQ: `docs/pilot/auditos-pilot-faq.md`
- Demo environment: `docs/pilot/auditos-demo-environment.md`
- Internal rehearsal: `docs/deployment/auditos-v0.1-internal-rehearsal.md`
- Baseline tag: `auditos-v0.1-pilot-baseline-2026-05-28`
