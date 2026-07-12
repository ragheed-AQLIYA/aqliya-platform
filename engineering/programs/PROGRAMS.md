# AQLIYA Execution Programs

**Status:** Active — supersedes open-ended Wave numbering as the primary planning unit  
**Authority:** Program Governance (vision · ADR · roadmap)  
**Implementation:** OpenCode  
**Quality / Verification:** EngineeringOS  

```
                    AQLIYA
          ┌──────────────────────┐
          │ Program Governance   │
          │ Vision · ADR · Roadmap
          └──────────┬───────────┘
     ┌───────────────┼────────────────┐
     ▼               ▼                ▼
 OpenCode      EngineeringOS    Architecture
 Implementation  Quality+Verify   Governance (D)
     └───────────────┬────────────────┘
                     ▼
             Verified Platform
```

---

## The Five Programs

| ID | Program | Owner lens | Primary outputs |
| -- | ------- | ---------- | --------------- |
| **A** | Platform Completion | Shared core | AuthZ, flags, orgs, audit trail, jobs, AI gateway, observability |
| **B** | Product Completion | Per-product backlog | DecisionOS, WorkflowOS, SalesOS, AuditOS, LocalContentOS, … |
| **C** | Engineering Excellence | EngineeringOS only | KPIs, compliance, findings, verification, release readiness |
| **D** | Architecture Governance | ADR + standards | ADRs, domain boundaries, context maps, reviews, reference architecture |
| **E** | Delivery Governance | Execution flow | Backlog → Selected → Assigned → In Progress → Verification → Accepted → Released → Measured |

Waves (Wave-9, Wave-10, …) are **delivery packets inside Program E**, not the strategy itself. They are composed by the Delivery Planner from Programs A/B priorities.

---

## Program A — Platform Completion

**Goal:** Finish shared platform capabilities once, reuse everywhere.

Scope (examples — track in `programs/a-platform.md`):

- Authorization (`enforce` / adoption)
- Feature flags
- Platform settings
- Organizations / tenancy surfaces
- Audit trail completeness
- Notification infrastructure
- Background jobs / outbox
- Download center
- AI Gateway
- Observability (metrics, logs, traces)

**EngineeringOS role:** Compliance + ADR validation + impact analysis on platform symbols.  
**OpenCode role:** Implement platform backlog items.  
**Not:** Product feature work.

---

## Program B — Product Completion

**Goal:** Each product is its own project with its own backlog and % complete bar.

Track in `programs/b-products.md` and `data/programs/product-backlogs.json`.

Example posture (updated by Product Completion signals + scorecards):

| Product | Focus |
| ------- | ----- |
| DecisionOS | Close remaining governance/export gaps |
| WorkflowOS | Harden SLA/export edge cases |
| SalesOS | Raise completion toward pilot truth |
| AuditOS | Protect L6; only targeted gaps |
| LocalContentOS | Raise completion toward pilot truth |

**Rule:** No “miscellaneous Wave” that mixes three products without a Program B ticket.

---

## Program C — Engineering Excellence

**Goal:** EngineeringOS stays frozen as the quality operating system.

Responsible for:

- KPIs
- Compliance
- Findings + lifecycle board
- Verification after OpenCode
- Release readiness

**Does not:** Redesign products, own feature scope, or invent architecture.

**Agent freeze:** After Delivery Planner + ROI Optimizer + Enterprise Readiness, **no new Engineering agents** unless Program Governance explicitly opens an exception ADR.

See `programs/AGENT_FREEZE.md`.

---

## Program D — Architecture Governance

**Goal:** Governance by decisions, not by report volume.

Owns:

- ADRs (record + validate)
- Domain boundaries / context maps
- Architecture reviews
- Technical standards
- Reference architecture
- Design decision log (`eng:memory`)

Artifacts: `docs/adr/`, `engineering/intelligence/architecture-memory/`, `engineering/os/ADR_VALIDATION.md`.

---

## Program E — Delivery Governance

**Goal:** Replace `Prompt → Done` with a measurable delivery pipeline.

```
Backlog → Selected → Assigned → In Progress
    → Verification → Accepted → Released → Measured
```

Board: `engineering/programs/DELIVERY_BOARD.md`  
State store: `engineering/data/programs/delivery.json`

Waves are planned by **Delivery Planner** and scored by **ROI Optimizer**, then executed by OpenCode and verified by EngineeringOS.

---

## How the three new agents fit

| Agent | Program | Question it answers |
| ----- | ------- | ------------------- |
| Delivery Planner | E (+ A/B) | What goes into the next Wave, and why? |
| ROI Optimizer | E / C | If we fix Top N, how much does Platform Health move? |
| Enterprise Readiness | C + Governance | Is AQLIYA ready as a company/platform to operate? |

---

## Strategic freeze

After this program layer lands:

1. **Do not add more Engineering agents** by default.
2. Invest in **Program B product completion** (especially SalesOS, LocalContentOS, AuditOS hardening).
3. Move toward **pilot customers** — real usage beats static code analysis.

Status: `programs/AGENT_FREEZE.md`
