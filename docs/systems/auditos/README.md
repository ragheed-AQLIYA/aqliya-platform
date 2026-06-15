> **Language note (2026-06-09):** AQLIYA is now positioned as a **platform** first. AuditOS is a **Specialized Operating System** within the platform. See `docs/official/AQLIYA_MASTER_REFERENCE.md` §5b.

# AuditOS

**Status:** Active
**Route:** `/audit` (workspace), `/auditos` (demo)
**Current Maturity:** Stabilized — controlled pilot approved. Real data gate open with constraints.

## What Exists

- Full workspace at `/audit`
- Public demo at `/auditos`
- Pilot Session 5 defined (paused — awaiting customer TB file)
- Controlled pilot approval granted
- Real data ingestion pipeline live with constraint gates

## What Does Not Exist

- Session 5 completion (blocked on customer TB file)
- Commercial readiness approval
- General availability release

## Next Allowed Work

- Unblock Pilot Session 5 once customer TB file is provided
- Continue stabilization and constraint-gate compliance
- Prepare materials for commercial readiness review (do not approve)

## Forbidden Claims

- Do **not** claim commercial readiness or GA status
- Do **not** claim full production release
- Do **not** claim Session 5 is complete

## Operator Manual

The primary AuditOS operator manual currently lives at:

- [`../AUDITOS_OPERATOR_MANUAL.md`](../AUDITOS_OPERATOR_MANUAL.md)

This manual remains at the `docs/systems/` root for now to avoid breaking existing references. A future normalization pass may move it under `docs/systems/auditos/` after link validation.

## AuditOS 2.0 Factory Program Docs

**Program status:** Phases **2–12** on branch — **pilot-ready with conditions** (see [`FACTORY_PROGRAM_CLOSURE.md`](./FACTORY_PROGRAM_CLOSURE.md)). Live factory smoke **12/12 PASS** on `eng-gulf-2025` (2026-06-13).

- [`CURRENT_STATE.md`](./CURRENT_STATE.md) — branch reality matrix
- [`GRAPH_ARCHITECTURE.md`](./GRAPH_ARCHITECTURE.md) — Phase 2 reporting graph
- [`GRAPH_SCHEMA.md`](./GRAPH_SCHEMA.md) — node/edge schema map
- [`LEAD_SCHEDULE_ENGINE.md`](./LEAD_SCHEDULE_ENGINE.md) — Phase 3 lead schedules
- [`RECONCILIATION_ENGINE.md`](./RECONCILIATION_ENGINE.md) — Phase 4 tie-out checks
- [`FS_ENGINE.md`](./FS_ENGINE.md) — Phase 5 FS v2 + cash flow
- [`IFRS_RULES_ENGINE.md`](./IFRS_RULES_ENGINE.md) — Phase 6 IFRS runtime
- [`SOCPA_RULES_ENGINE.md`](./SOCPA_RULES_ENGINE.md) — Phase 7 SOCPA overlay
- [`LOCAL_AI_BRIDGE.md`](./LOCAL_AI_BRIDGE.md) — Phase 1 inference bridge (partial)
- [`FACTORY_READINESS_REVIEW.md`](./FACTORY_READINESS_REVIEW.md) — eight-step readiness gate (2026-06-13)
- [`FACTORY_PILOT_READINESS.md`](./FACTORY_PILOT_READINESS.md) — Phase 12 pilot activation + Go/No-Go
- [`FACTORY_PROGRAM_CLOSURE.md`](./FACTORY_PROGRAM_CLOSURE.md) — program closure summary
- [`AUDIT_INTELLIGENCE.md`](./AUDIT_INTELLIGENCE.md) — Phase 9 governed disclosure enrichment
- [`GOVERNANCE_ENGINE.md`](./GOVERNANCE_ENGINE.md) — Phase 10 factory approval gates
- [`MIND_MAP.md`](./MIND_MAP.md) — Phase 11 factory mind map + GraphSnapshot
