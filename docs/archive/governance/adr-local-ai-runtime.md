# ADR-002: Local AI Runtime — Runtime Pattern Definition

> **Status:** ✅ **Approved — Ready for Implementation**  
> **D-06 Added:** Runtime is an Entity Classification, not a Knowledge Model Extension  
> **Date:** 2026-06-29  
> **Type:** Architecture Decision Record  
> **Prerequisite:** M2 Baseline v1.2 Freeze (in effect)  
> **Exception Type:** First ADR under the frozen M2 model

---

## 1. Problem

Local AI Runtime (PROD-LOCAL-AI) is the only product in the Canonical Product Registry without:
- A Knowledge Area (KA) assignment
- An Authority (AUTH) assignment
- A defined entity type within the M2 model (currently marked as "Runtime")

It is currently **Unassigned, Pending ADR**.

## 2. Decisions Required

| Decision | Question |
|----------|----------|
| D-01 | Should a new KA-25 (AI Runtime) be created, or should KA-08 (Deployment) be reused? |
| D-02 | Should a new AUTH-LOCAL-AI be created? |
| D-03 | Does Runtime require a different maturity rubric than Product/Engine? |
| D-04 | How does Runtime relate to Intelligence Core, Provider Router, and Knowledge Foundation? |
| D-05 | Does this require an M2 model change (entity, relationship, cardinality)? |

## 3. Proposed Resolution

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| D-01 | **New KA-25: AI Runtime** | KA-08 (Deployment) covers infrastructure, not runtime. AI Runtime is a distinct operational concern. |
| D-02 | **New AUTH-LOCAL-AI** | No existing AUTH covers local AI runtime operations. |
| D-03 | **Yes** — Runtime maturity rubric is different from Product DoD (AGENTS.md §21). Focus on: deployment stability, provider integration, latency, memory, model loading. |
| D-04 | **Consumer** — Runtime consumes Intelligence Core (Provider Router, Governance Engine) but is NOT a Product or Engine itself. |
| D-05 | **No** — All relationships can be expressed within existing C01–C21 cardinalities. No M2 changes needed. |
| D-06 | **Runtime is an Entity Classification, not a Model Extension** — Runtime is a classification within the Product Registry's Entity Type field. It does not add a new M2 entity, extend the Knowledge Graph, or change the Claim Model. This prevents any future attempt to justify M2 changes based on Runtime classification. |

## 4. Impact on M2 Baseline

| Check | Result |
|-------|--------|
| New entity needed? | ❌ No (Product, Engine, Runtime all covered) |
| New relationship needed? | ❌ No (C01–C21 sufficient) |
| New cardinality needed? | ❌ No |
| New ID pattern needed? | ❌ No |
| New governance rule needed? | ❌ No (GR-001 to GR-013 cover Runtime) |
| **M2 Change Required?** | **NO ✅** |

## 5. Next Steps

1. ✅ D-01 through D-06 approved
2. Create KA-25 in Authority Matrix
3. Create AUTH-LOCAL-AI
2. Create KA-25 in Authority Matrix
3. Create AUTH-LOCAL-AI
4. Populate Local AI Runtime Claims using standard P1–P3 process
5. Validate against 8 existing patterns
6. Declare Runtime as 9th validated pattern
