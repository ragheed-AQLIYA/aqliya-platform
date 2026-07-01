# Decision Intelligence — System Map

Maps Decision Intelligence concepts to the broader AQLIYA architecture using doctrine from Part 01 (Foundations), Part 02 (Architecture), and Part 20 (Decision Intelligence).

## Concept–Doctrine–System–Product Mapping

| Concept | Doctrine Source | System Context | Product Application |
|---|---|---|---|
| Decision as a First-Class Primitive | Part 01 §1.3 — Decisions as Units of Value | Decisions are the atomic unit of the AQLIYA architecture — every system produces or consumes decisions | Decision Log in product UI: every recommendation is a first-class decision record with context, evidence, and outcome |
| Evidence-Backed Decision | Part 01 §1.5 — Evidence Primacy | All decisions must reference verifiable evidence from AuditOS or trusted external sources | Decision cards display evidence citations; clicking reveals full chain-of-custody |
| Decision Registry | Part 20 §20.2 — Decision Registry | A central registry indexes every decision across all systems, linking context, evidence, and outcome | Searchable Decision Registry API; powers audit, reporting, and回溯 analysis |
| Confidence & Uncertainty | Part 20 §20.4 — Confidence Attribution | Every decision carries a confidence score and uncertainty interval derived from evidence quality | UI shows confidence meter; decisions below threshold are flagged for human review |
| Decision Cascade | Part 02 §2.4 — System Interconnect | Decisions flow between systems (e.g., AuditOS alert → Decision Intelligence recommendation → Commercial action) | Cascade visualiser maps upstream and downstream decision dependencies |
| Feedback Loop | Part 20 §20.6 — Outcome Feedback | Decision outcomes feed back into evidence quality scoring and model retraining | Product includes outcome tracking; "Was this helpful?" feeds directly into doctrine-defined feedback loop |
| Human Oversight | Part 01 §1.7 — Human Agency | High-confidence decisions are automated; medium-confidence require human review; low-confidence cannot proceed without human | Configurable confidence thresholds per client; UI enforces review boundaries |
| Decision Audit Trail | Part 02 §2.7 — Auditability | Every decision is immutable, timestamped, and linked to its evidence and human reviewer | Audit exports include full decision graph: evidence → decision → outcome → feedback |
| System-of-Systems | Part 02 §2.1 — Layered Architecture | Decision Intelligence sits between AuditOS (evidence) and Commercial/Pilot systems (action) | Product architecture: AuditOS → Decision Engine → Commercial Workflow |

## Architecture Context

```
┌─────────────────────────────────────────────────────────────┐
│                     Part 01 — Foundations                    │
│  Decisions as units, evidence primacy, human agency          │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     Part 02 — Architecture                   │
│  Layered systems, interconnect, auditability                 │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Part 20 — Decision Intelligence                  │
│  Registry, confidence, cascade, feedback                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  Decision Intelligence Engine (Product)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Registry  │  │ Scorer   │  │ Cascader  │  │ Outcome    │ │
│  │          │  │          │  │          │  │ Tracker   │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Product Impact

| Product Feature | Doctrine Requirement | Implementation |
|---|---|---|
| Decision Log | Part 20 §20.2 — Registry | Immutable log with search, filter, export |
| Confidence Meter | Part 20 §20.4 — Confidence | Visual indicator with threshold colouring |
| Review Queue | Part 01 §1.7 — Human Agency | Queue of decisions requiring human review, sorted by risk |
| Evidence Viewer | Part 01 §1.5 — Evidence Primacy | Side-panel showing evidence chain for each decision |
| Feedback Collector | Part 20 §20.6 — Outcome Feedback | Inline thumbs-up/down + optional comment; feeds into scoring |
