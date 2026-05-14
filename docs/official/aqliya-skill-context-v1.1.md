# AQLIYA Skill Context v1.1

**Purpose:** Defines the coding skills and guardrails every developer (or AI agent) must apply when working on AQLIYA.

**Version:** 1.1
**Status:** Official

---

## Skill 1: Platform Identity Awareness

**Rule:** Never reduce AQLIYA to a single product, a single deployment model, or a single use case.

**Checklist:**
- [ ] Does this change describe AQLIYA as an audit system only? → STOP
- [ ] Does this change describe AQLIYA as SaaS only? → STOP
- [ ] Does this change treat AuditOS as the whole platform? → STOP
- [ ] Does this change assume all AI is cloud-based? → STOP (AQLIYA supports Local AI)

**Correct framing:** AQLIYA is a Private Governed Institutional Intelligence Platform with multiple products (AuditOS, LocalContentOS, DecisionOS, etc.) deployable via Cloud or Private/On-Prem.

---

## Skill 2: Governance-First Development

**Rule:** Every feature must include approval, evidence, audit log, and RBAC considerations.

**Checklist for any new feature:**
- [ ] Is there an approval step? (human-reviewed)
- [ ] Are outputs linked to evidence? (Evidence Graph)
- [ ] Is the action logged? (Audit Trail)
- [ ] Are permissions checked? (RBAC / tenant guard)
- [ ] Are AI outputs validated before use? (AI output validation)

---

## Skill 3: Core Engine Reuse

**Rule:** Build functionality in shared engines (`src/lib/`) before product-specific code.

**Priority:**
1. Use shared governance engine (`src/lib/governance/`)
2. Use shared audit logs (Prisma `AuditEvent`)
3. Use shared workflow patterns
4. Only then add product-specific logic

**Anti-pattern:** Duplicating approval logic in each product.

---

## Skill 4: Route Discipline

**Rule:** Follow the established route model strictly.

| If you need... | Use route... | Type |
|---|---|---|
| Public content | `/(marketing)/` or root | Marketing |
| Authenticated workspace | `/(dashboard)/` or `/audit/` | Workspace |
| Guided demo (public) | `/auditos/` | Demo |
| API endpoint | `/api/` | API |

**Forbidden:**
- Creating workspace routes without authentication
- Creating demo routes that access real data
- Linking marketing CTAs to nonexistent routes

---

## Skill 5: Bilingual & RTL Discipline

**Rule:** AQLIYA is Arabic-first, RTL, with bilingual support.

**Checklist:**
- [ ] All user-facing text supports Arabic
- [ ] Layout uses `dir="rtl"` where appropriate
- [ ] English terms have Arabic equivalents documented
- [ ] Financial data processing handles bilingual input

---

## Skill 6: AI Feature Discipline

**Rule:** Every AI feature must comply with AI governance rules.

**Checklist for AI features:**
- [ ] Human review required before final output
- [ ] AI output linked to source evidence
- [ ] AI action logged (model, prompt version, confidence)
- [ ] Model used is registered (Cloud AI or Local AI)
- [ ] User can see AI confidence/limitations
- [ ] AI does NOT make autonomous decisions

---

## Skill 7: Documentation Discipline

**Rule:** Update documentation when changing architecture, routes, product status, or company identity.

**Files to update based on change type:**

| Change Type | Update This |
|---|---|
| New route | `docs/source-of-truth/ROUTE_STRATEGY.md`, `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` |
| New product/subsystem | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`, `docs/official/aqliya-product-taxonomy-v1.1.md` |
| Architecture change | `docs/official/aqliya-core-architecture-v1.1.md`, `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` |
| Company/brand identity change | `docs/official/aqliya-vision-v1.1.md`, `README.md`, `docs/README.md` |
| Terminology change | `docs/official/aqliya-glossary-v1.1.md`, `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` |

---

## Skill 8: Validation Discipline

**Rule:** After any code change, run the validation pipeline.

```bash
npx tsc --noEmit    # Must pass with 0 errors
npm run lint        # Must pass (pre-existing errors documented)
npm run build       # Must pass
```

**Pre-existing known issues (do not treat as new failures):**
- Pre-existing ESLint warnings/errors in DecisionOS/shared library code (count varies by lint run; documented in `PRODUCT_STATUS_MATRIX.md`)
- Jest integration tests require PostgreSQL Docker setup
