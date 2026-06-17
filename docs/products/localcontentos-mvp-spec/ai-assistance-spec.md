# LocalContentOS — AI Assistance Spec

**Status:** Specification only — not implemented
**Version:** 1.0
**Note:** AI-assisted capabilities in LocalContentOS are **future/controlled**. They must follow the AQLIYA AI Orchestration architecture and the trust principle: AI assists. Humans decide. Evidence governs.

---

## AI-Assisted Capabilities (Future)

| #   | Capability                     | When Available | Human Review                | Evidence Required              |
| --- | ------------------------------ | -------------- | --------------------------- | ------------------------------ |
| 1   | Suggest vendor classification  | Post-MVP       | Required                    | Must reference source evidence |
| 2   | Summarize spend categories     | Post-MVP       | Optional (review suggested) | Based on imported data         |
| 3   | Identify missing evidence      | Post-MVP       | Required before action      | Pattern-based                  |
| 4   | Draft findings from exceptions | Post-MVP       | Required                    | Linked to evidence             |
| 5   | Draft management summary       | Post-MVP       | Required                    | Based on approved data         |

---

## Capability 1: Suggest Vendor Classification

| Field                          | Detail                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Input**                      | Vendor record fields (name, CR country, certificate status, declaration text)                             |
| **Output**                     | Suggested classification (Local, Non-Local, Mixed, Undetermined) with confidence score and reasoning      |
| **Human Review Requirement**   | Required — analyst must accept, modify, or reject suggestion                                              |
| **Evidence Requirement**       | Suggestion must reference source evidence fields (e.g., "CR country is SA → suggests Local")              |
| **Confidence/Limitation Note** | Show confidence: High (clear evidence), Medium (partial evidence), Low (ambiguous)                        |
| **Audit Logging Requirement**  | `AI_SUGGESTION_MADE` — { record_id, suggested_value, confidence, accepted/rejected }                      |
| **What AI Must NOT Do**        | NOT make final classification. NOT override human decision. NOT classify without referencing source data. |

---

## Capability 2: Summarize Spend Categories

| Field                         | Detail                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Input**                     | ProcurementSpendRecord data grouped by category                                                                    |
| **Output**                    | Natural language summary: "Your top local content category is Industrial Equipment at 68% local spend (12.5M SAR)" |
| **Human Review Requirement**  | Optional — analyst reviews and edits summary before inclusion in report                                            |
| **Evidence Requirement**      | Summary must be data-derived — not hallucinated                                                                    |
| **Audit Logging Requirement** | `AI_SUMMARY_GENERATED` — { category, period }                                                                      |
| **What AI Must NOT Do**       | NOT add insights not present in data. NOT make predictions or recommendations.                                     |

---

## Capability 3: Identify Missing Evidence

| Field                         | Detail                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| **Input**                     | Classification records without linked evidence, or with Low/None confidence                       |
| **Output**                    | List of records needing evidence: "15 vendors classified as Local have no CR attached"            |
| **Human Review Requirement**  | Required before action — analyst reviews list and initiates evidence request                      |
| **Evidence Requirement**      | Based on actual evidence register gaps                                                            |
| **Audit Logging Requirement** | `AI_GAP_IDENTIFIED` — { gap_type, count, total_impact }                                           |
| **What AI Must NOT Do**       | NOT automatically request evidence. NOT reclassify based on missing evidence. NOT delete records. |

---

## Capability 4: Draft Findings from Exceptions

| Field                         | Detail                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Input**                     | Exception records, affected amounts, evidence gaps                                                                   |
| **Output**                    | Draft finding with structured fields: type, severity, description, evidence gap, recommendation                      |
| **Human Review Requirement**  | Required — analyst must review, edit, and approve each finding                                                       |
| **Evidence Requirement**      | Finding must reference specific evidence items or exceptions                                                         |
| **Audit Logging Requirement** | `FINDING_AI_DRAFTED` — { finding_id, accepted_changes }                                                              |
| **What AI Must NOT Do**       | NOT create findings without human review. NOT assign owners or due dates. NOT finalize severity without human input. |

---

## Capability 5: Draft Management Summary

| Field                         | Detail                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Input**                     | Approved report data — metrics, findings, recommendation                                                                            |
| **Output**                    | One-page executive summary in natural language                                                                                      |
| **Human Review Requirement**  | Required — must be reviewed before sharing with management                                                                          |
| **Evidence Requirement**      | Summary must reference approved data only                                                                                           |
| **Audit Logging Requirement** | `AI_MANAGEMENT_SUMMARY_DRAFTED` — { engagement_id, version }                                                                        |
| **What AI Must NOT Do**       | NOT include information not in approved data. NOT make commitments or promises. NOT override the recommendation set by the analyst. |

---

## AI Architecture Integration

LocalContentOS AI capabilities will use the existing AQLIYA AI Orchestration engine:

```txt
AQLIYA AI Orchestration Engine (existing)
├── DeterministicAIProvider (current — all handlers)
│   └── LocalContentOS handlers (future):
│       ├── vendorClassificationSuggestionHandler
│       ├── spendCategorySummaryHandler
│       ├── evidenceGapIdentificationHandler
│       ├── findingDraftFromExceptionHandler
│       └── managementSummaryDraftHandler
├── CloudAIProvider (future — when wired)
├── LocalAIProvider (future — when wired)
```

All handlers must:

1. Register in `register-handlers.ts` pattern (see AuditOS precedent)
2. Include governance context from `retrieval-router.ts`
3. Be permissioned, evidence-aware, human-reviewed, and auditable
4. Follow the existing `services.ts` → `aiOrchestrator.generate()` delegation pattern

---

## AI Governance Rules

| Rule                        | Application                                                              |
| --------------------------- | ------------------------------------------------------------------------ |
| **Output validation**       | Every AI output validated against provider interface before presentation |
| **Human-in-the-loop**       | No AI output is final without human review                               |
| **Evidence linking**        | Every AI suggestion references source data                               |
| **Confidence display**      | Show confidence level for every suggestion                               |
| **Audit trail**             | Every AI action logged with input references, output, reviewer decision  |
| **No autonomous decisions** | AI proposes, humans dispose                                              |

---

## What AI Must Never Do

- Make final classification decisions
- Override a human reviewer's decision
- Export or share data outside the engagement
- Claim regulatory approval or compliance
- Operate without an audit trail
- Make predictions about future local content performance
- Provide legal or compliance interpretations
- Automatically reclassify vendors without human approval
