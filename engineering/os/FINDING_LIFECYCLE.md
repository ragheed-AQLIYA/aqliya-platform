# Finding Lifecycle Board

**Updated:** 2026-07-18T18:34:59.508Z

> Every high-priority finding must move: Finding → Priority → Wave → Implemented → Verified → Closed → Archived

## Pipeline

```
Finding → Priority → Assigned Wave → Implemented (OpenCode)
       → Verified (Engineering) → Closed → Archived
```

| State | Count |
| ----- | ----- |
| finding | 196 |
| prioritized | 0 |
| assigned | 0 |
| implemented | 0 |
| verified | 0 |
| closed | 96 |
| archived | 0 |

## finding

- `e21451a4a460` **[high]** Client module references server-only concerns
- `16ccb0427639` **[high]** Client module references server-only concerns
- `009e27e9b8cc` **[high]** Client module references server-only concerns
- `888bc52ca7d5` **[high]** Client module references server-only concerns
- `74779b1746f4` **[high]** Client module references server-only concerns
- `9273676d5f88` **[high]** Client module references server-only concerns
- `9ee3952e3faf` **[high]** Client module references server-only concerns
- `b22035b67a93` **[high]** Client module references server-only concerns
- `5b96ea754f79` **[high]** Client module references server-only concerns
- `d2c5fbdd0a40` **[high]** Large module / God Object signal: services.ts
- `f644111e0277` **[high]** Large module / God Object signal: page.tsx
- `2c4f7402de67` **[high]** Large module / God Object signal: page.tsx
- `93b9c1c5b73f` **[high]** Large module / God Object signal: evidence-page.tsx
- `15c5a1ab4466` **[high]** Large module / God Object signal: store.ts
- `6b43acafccab` **[high]** Large module / God Object signal: ai-advisor.ts
- `e90d1aef424c` **[high]** Large module / God Object signal: findings-page.tsx
- `3018c98f24b8` **[high]** Large module / God Object signal: page.tsx
- `e62d954f4a7d` **[high]** Long function buildStatementLinesFromMappings (718 lines)
- `4fc44e3901db` **[high]** Long function WorkbookDetailClient (708 lines)
- `5f0e21a9731e` **[high]** Long function ClientAcceptanceDashboard (662 lines)
- `736187d83e90` **[high]** Long function PilotPageContent (654 lines)
- `9b52dca9708a` **[high]** Long function ReviewNotesBoard (598 lines)
- `095ed5a39ce6` **[high]** Long function ReviewCenter (561 lines)
- `e390e9d05c78` **[high]** Long function QualityDashboardClient (519 lines)
- `6b5b1e64fba8` **[high]** Long function IndependenceDashboard (491 lines)
- `6198225e52b5` **[high]** Long function MaterialityEnginePage (489 lines)
- `19e8e3e2868f` **[high]** Long function QualityDashboard (459 lines)
- `3e4fb78a4fce` **[high]** Long function TrialBalanceUpload (434 lines)
- `83b46b41e82e` **[high]** Long function buildKnowledgeGraphFromSnapshot (430 lines)
- `0055b2ffc9bf` **[high]** Long function CustomProductForm (419 lines)
- `3b334d0ca858` **[high]** Long function DecisionDashboard (399 lines)
- `183a406b3152` **[high]** Long function ExecutiveCommercialDashboard (380 lines)
- `4eabb0b2f05d` **[high]** Long function AiGovernanceClient (374 lines)
- `9948280a7f71` **[high]** Long function OverviewTab (372 lines)
- `d2eace2defdd` **[high]** Long function AiInsightsPanel (369 lines)
- `a5fee2a88f3d` **[high]** Long function WorkbookAiAdvisorClient (367 lines)
- `5ce967b04336` **[high]** Long function buildKnowledgeGraphFromSnapshot (359 lines)
- `14849b3cd099` **[high]** Long function runLocalContentPipeline (358 lines)
- `69c0f90777d4` **[high]** Long function ModelGovernanceClient (346 lines)
- `34853fb3349e` **[high]** Long function TbImportDialog (341 lines)

## closed

- `da1ed81c9c3b` **[high]** Possible secret material (generic-secret) · _Wave-8_
- `1f9d967e11e8` **[high]** Possible secret material (generic-secret) · _Wave-8_
- `c80eb58f437f` **[high]** Possible secret material (generic-secret) · _Wave-8_
- `4d9ae7e6467f` **[high]** API route may lack auth check · _Wave-8_
- `e9840101eae7` **[high]** API route may lack auth check · _Wave-8_
- `04e6963e9b32` **[high]** API route may lack auth check · _Wave-8_
- `98dce0e7a33c` **[high]** API route may lack auth check · _Wave-8_
- `88307898a617` **[high]** API route may lack auth check · _Wave-8_
- `fc258a1eda54` **[high]** API route may lack auth check · _Wave-8_
- `e2c27d3df5a9` **[high]** API route may lack auth check · _Wave-8_
- `c0bdd5a1f9cc` **[high]** Large module / God Object signal: index.ts
- `3a572419ea29` **[high]** Large module / God Object signal: mock-data.ts
- `5af76bd64ffb` **[high]** Large module / God Object signal: audit-actions.ts
- `bc412283b638` **[high]** Large module / God Object signal: decisions.ts
- `7a825d4f1596` **[high]** Large module / God Object signal: seed-data.ts
- `6cd50722bfc6` **[high]** Large module / God Object signal: localcontent-actions.ts
- `564570cd68d8` **[high]** Large module / God Object signal: demo-data.ts
- `fa47676674ee` **[high]** Long function buildSalesSeedData (1651 lines)
- `d595ec218d75` **[high]** Long function main (645 lines)
- `eb73700fb601` **[high]** Long function runValidation (308 lines)
- `0e8c35a4b5e7` **[high]** Long function getDashboardMetrics (274 lines)
- `f10fa46fe6e8` **[high]** Elevated complexity in index.ts
- `9eb9056d796b` **[high]** Elevated complexity in prisma-client-mock.js
- `eeab839a93e9` **[high]** Elevated complexity in decisions.ts
- `31b1a2b4c511` **[high]** Elevated complexity in skill-registry.integration.test.ts
- `c6baa66b663e` **[high]** Low maintainability index (0)
- `da2e60adc2ea` **[high]** Low maintainability index (0)
- `13354f4e4304` **[high]** Low maintainability index (0)
- `9421be5d61fc` **[high]** Low maintainability index (0)
- `e9f7ad17b64d` **[high]** Low maintainability index (0)
- `4b38f8338d76` **[high]** Low maintainability index (0)
- `c7b9e39b593a` **[high]** Low maintainability index (0)
- `cc1f85747968` **[high]** Low maintainability index (0)
- `f85b85e9b576` **[high]** Low maintainability index (0)
- `4ca08a9a0a38` **[high]** Low maintainability index (3)
- `44e5eda65591` **[high]** Low maintainability index (3)
- `12174b23b545` **[high]** Low maintainability index (4)
- `052a9768eff7` **[high]** Low maintainability index (4)
- `e39b6052aca8` **[high]** Low maintainability index (4)
- `9c4c3bb67b2e` **[high]** Low maintainability index (4)

## Commands

```bash
npm run eng:os -- lifecycle assign --fp <fingerprint> --wave Wave-8
npm run eng:os -- lifecycle implemented --fp <fingerprint>
npm run eng:os -- lifecycle verified --fp <fingerprint>
npm run eng:os -- lifecycle closed --fp <fingerprint>
npm run eng:os -- lifecycle archived --fp <fingerprint>
```
