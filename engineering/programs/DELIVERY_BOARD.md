# Program E — Delivery Governance Board

**Updated:** 2026-07-11T11:36:48.404Z

```
Backlog → Selected → Assigned → In Progress
    → Verification → Accepted → Released → Measured
```

> Not `Prompt → Done`. Every packet must be measured after release.

| State | Count |
| ----- | ----: |
| backlog | 0 |
| selected | 24 |
| assigned | 0 |
| in_progress | 0 |
| verification | 0 |
| accepted | 0 |
| released | 0 |
| measured | 0 |

## Waves

### Wave-11

- Product/Focus: **WorkflowOS**
- ROI: 2.4 · Risk: Medium · Effort: 10 days
- Items: 8
- Rationale: Focus WorkflowOS (completion gap 44%). Pack score prioritizes ROI × need / effort. Program B.

### Wave-10

- Product/Focus: **SalesOS**
- ROI: 2.2 · Risk: Medium · Effort: 10 days
- Items: 8
- Rationale: Focus SalesOS (completion gap 46%). Pack score prioritizes ROI × need / effort. Program B.

### Wave-9

- Product/Focus: **LocalContentOS**
- ROI: 2.2 · Risk: Medium · Effort: 10 days
- Items: 8
- Rationale: Focus LocalContentOS (completion gap 48%). Pack score prioritizes ROI × need / effort. Program B.



## selected

- `1f9d967e11e8` **[high]** Possible secret material (generic-secret) · _Wave-9_ · Program B
- `9ee3952e3faf` **[high]** Client module references server-only concerns · _Wave-9_ · Program B
- `6cd50722bfc6` **[high]** Large module / God Object signal: localcontent-actions.ts · _Wave-9_ · Program B
- `2c4f7402de67` **[high]** Large module / God Object signal: page.tsx · _Wave-9_ · Program B
- `6b43acafccab` **[high]** Large module / God Object signal: ai-advisor.ts · _Wave-9_ · Program B
- `4fc44e3901db` **[high]** Long function WorkbookDetailClient (708 lines) · _Wave-9_ · Program B
- `095ed5a39ce6` **[high]** Long function ReviewCenter (561 lines) · _Wave-9_ · Program B
- `e390e9d05c78` **[high]** Long function QualityDashboardClient (519 lines) · _Wave-9_ · Program B
- `da1ed81c9c3b` **[high]** Possible secret material (generic-secret) · _Wave-10_ · Program B
- `e21451a4a460` **[high]** Client module references server-only concerns · _Wave-10_ · Program B
- `9273676d5f88` **[high]** Client module references server-only concerns · _Wave-10_ · Program B
- `7a825d4f1596` **[high]** Large module / God Object signal: seed-data.ts · _Wave-10_ · Program B
- `15c5a1ab4466` **[high]** Large module / God Object signal: store.ts · _Wave-10_ · Program B
- `3018c98f24b8` **[high]** Large module / God Object signal: page.tsx · _Wave-10_ · Program B
- `fa47676674ee` **[high]** Long function buildSalesSeedData (1651 lines) · _Wave-10_ · Program B
- `83b46b41e82e` **[high]** Long function buildKnowledgeGraphFromSnapshot (430 lines) · _Wave-10_ · Program B
- `4d9ae7e6467f` **[high]** API route may lack auth check · _Wave-11_ · Program B
- `e9840101eae7` **[high]** API route may lack auth check · _Wave-11_ · Program B
- `852f7f174ea2` **[high]** Long function WorkflowAdminDashboard (293 lines) · _Wave-11_ · Program B
- `8dbed2bf3a18` **[high]** Elevated complexity in workflowos-actions.ts · _Wave-11_ · Program B
- `da2a0e0a12a7` **[high]** Low maintainability index (0) · _Wave-11_ · Program B
- `a8c27b594725` **[high]** Download/export route may lack tenant scope · _Wave-11_ · Program B
- `cec164a407be` **[high]** Download/export route may lack tenant scope · _Wave-11_ · Program B
- `dfaeac6f1a57` **[high]** Debt hotspot (priority 106): workflowos-actions.ts · _Wave-11_ · Program B

## Commands

```bash
npm run eng:programs
npm run eng:programs -- --delivery assign --id <fp> --wave Wave-9
npm run eng:programs -- --delivery in_progress --id <fp>
npm run eng:programs -- --delivery verification --id <fp>
npm run eng:programs -- --delivery accepted --id <fp>
npm run eng:programs -- --delivery released --id <fp>
npm run eng:programs -- --delivery measured --id <fp>
```
