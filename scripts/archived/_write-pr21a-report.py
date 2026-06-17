"""Write PR-21a report doc."""
from pathlib import Path

TARGET = Path(__file__).resolve().parents[1] / "docs/reports/salesos-v03-pr21a-commercial-claims.md"
TARGET.parent.mkdir(parents=True, exist_ok=True)

TARGET.write_text(
    """# SalesOS v0.3 — PR-21a Commercial claim gate

**Date:** 2026-06-01 | **Validation:** light validated (Jest `sales-commercial-claims.test.ts` only) | **Production:** NO

## Scope

Governed commercial claims on deal/account metadata — deterministic rules, no LLM.

## Implementation

| Area | Path | Notes |
|------|------|-------|
| Core | `src/lib/sales/commercial-claims.ts` | `validateClaimText`, risky phrases, `[[claim]]` / `[COMMERCIAL_CLAIM]` markers |
| Outreach | `src/lib/sales/outreach.ts` | Flags on create; blocks submit until `sales.claim.reviewed` |
| Account brief | `src/lib/sales/agents/account-research.ts`, `account-brief-pack.ts` | Brief gated on ADMIN review + claim review |
| Audit | `sales.claim.flagged`, `sales.claim.reviewed` | `SalesAuditEvent` |
| UI | `src/components/sales/deal-outreach-panel.tsx` | Badge + review claim button |
| Tests | `src/lib/sales/__tests__/sales-commercial-claims.test.ts` | NEW |

## Governance rules

1. Risky phrases (e.g. `production-ready`, `pilot-ready`, `L6`, guaranteed outcomes) require a flagged claim record.
2. Explicit markers `[[claim]]` or `[COMMERCIAL_CLAIM]` require human claim review before outreach submit.
3. Account research brief export/review blocked until commercial claim is reviewed when text triggers rules.

## Honest limits

- Rule-based only — not a substitute for Legal/Product Claims Register.
- No email send path (unchanged).
- Browser smoke not run in this pass.

## Arabic summary

بوابة المطالبات التجارية PR-21a: فحص نصي محكوم، منع إرسال outreach قبل مراجعة المطالبة، وتدقيق `sales.claim.*`.
""",
    encoding="utf-8",
    newline="\n",
)
print(f"wrote {TARGET}")
