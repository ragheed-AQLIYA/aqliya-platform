# LocalContentOS v0.1 — AI Boundaries

## Principle

> AI assists. Humans decide. Evidence governs.

LocalContentOS v0.1 uses **deterministic rule-based assistance** (no external AI provider required in v0.1). AI capabilities are limited to governed suggestions that are always draft, always reviewable, and never final.

## Allowed AI Actions

### 1. Classification Suggestion

AI may suggest local content classification based on:

- Supplier registration data (ownership type, workforce %)
- Existing classifications in the same project
- Contract terms and evidence metadata

Output: "Suggested classification: 65% local based on supplier ownership type (Saudi) and workforce data (72% Saudi). Review required before final."

### 2. Spend Pattern Summary

AI may summarize spend patterns:

- "74% of total spend is with 3 suppliers"
- "Supplier X accounts for 42% of procurement"
- "Construction category shows lowest average local content (23%)"

### 3. Missing Evidence Flag

AI may detect and flag:

- Suppliers with classification > 50% but no certificate uploaded
- Spend records without contract references
- Evidence items in 'uploaded' state but not linked to any record

### 4. Draft Gap/Risk Notes

AI may suggest findings:

- "Potential compliance gap: Supplier X has no local content evidence despite 80% classification"
- "Risk: 3 suppliers account for 60% of non-local spend"

### 5. Draft Report Narrative

AI may draft narrative sections for reports:

- Executive summary paragraph
- Key findings summary
- Recommendation text

## Forbidden AI Actions

AI must NOT:

- Finalize classification without human review
- Make final compliance claims (e.g., "compliant with LCGPA")
- Approve assessments
- Export final packages without human approval
- Claim regulator-certified results
- Override reviewer or approver decisions
- Make autonomous decisions about evidence sufficiency
- Claim local/private AI capability unless implemented

## AI Output Requirements

Every AI output must:

1. Be marked as **DRAFT** with a clear label
2. Include **confidence indicator** (high, medium, low, uncertain)
3. Reference **source data** (supplier, spend record, evidence)
4. Link to **governance context** (task type, doctrine references)
5. Include **human review requirement** statement
6. Be logged to **PlatformAuditLog** with AI metadata (provider, model, prompt version)

## AI Governance Integration

AI actions reuse the shared governance framework:

```typescript
// Pattern for AI-assisted classification
const provenance = createDraftProvenance({
  taskType: "local_content_classification",
  doctrineReferences: lcGovernanceContext.doctrineReferences,
  governanceReferences: lcGovernanceContext.governanceReferences,
  evidenceRequirements: lcGovernanceContext.evidenceRequirements,
  reviewRequired: true,
});

// Always log AI action
await writePlatformAuditLog({
  productKey: "localcontent",
  action: "localcontent.ai.classification_suggested",
  aiProvider: "deterministic",
  aiModel: "lc-rules-v0.1",
  aiPromptVersion: "1.0.0",
  aiOutputReviewStatus: "pending_review",
  // ... actor, target, metadata
});
```

## v0.1 vs Future AI

| Capability                | v0.1                | Future              |
| ------------------------- | ------------------- | ------------------- |
| Classification suggestion | Deterministic rules | Cloud AI / Local AI |
| Spend pattern analysis    | Deterministic rules | Cloud AI / Local AI |
| Evidence gap detection    | Deterministic rules | Cloud AI / Local AI |
| Report narrative drafting | Deterministic rules | Cloud AI / Local AI |
| Anomaly detection         | Not included        | Cloud AI / Local AI |
| Predictive scoring        | Not included        | Machine learning    |
| Supplier risk profiling   | Not included        | Machine learning    |
