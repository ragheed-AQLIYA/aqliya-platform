# EngineeringOS

**Role:** Engineering Operating System for AQLIYA quality lifecycle  
**Rule:** Findings → Waves → OpenCode implements → Engineering verifies → Close  

```
OpenCode (Implementation)
        │
        ▼
Engineering Intelligence
        │
        ▼
   EngineeringOS
   Quality · Knowledge · Governance · Execution Board
```

## Modules

| # | Module | Artifact |
| - | ------ | -------- |
| 1 | Repository Knowledge Graph | `KNOWLEDGE_GRAPH.md` |
| 2 | Change Impact Analysis | `IMPACT_REPORT.md` |
| 3 | Architectural Compliance | `COMPLIANCE.md` |
| 4 | Product Lifecycle Monitor | `PRODUCT_LIFECYCLE.md` |
| 5 | Release Readiness | `RELEASE_READINESS.md` |
| 6 | Engineering KPIs | `KPI.md` |
| 7 | Continuous ADR Validation | `ADR_VALIDATION.md` |
| 8 | Executive Portal | `EXECUTIVE_PORTAL.md` |
| ★ | Finding Lifecycle Board | `FINDING_LIFECYCLE.md` |

## Commands

```bash
npm run eng:os
npm run eng:impact -- enforce
npm run eng:os -- --impact src/lib/authorization
npm run eng:os -- --adr
npm run eng:os -- --lifecycle sync
npm run eng:os -- --lifecycle assign --fp <fingerprint> --wave Wave-8
npm run eng:os -- --lifecycle implemented --fp <fingerprint>
npm run eng:os -- --lifecycle verified --fp <fingerprint>
npm run eng:os -- --lifecycle closed --fp <fingerprint>
```

## Anti–Report-Factory Rule

Every high-priority finding must have a path to closure:

```
Finding → Priority → Assigned Wave → Implemented → Verified → Closed → Archived
```

OpenCode implements. EngineeringOS verifies. Nothing important stays as a forever-open report.
