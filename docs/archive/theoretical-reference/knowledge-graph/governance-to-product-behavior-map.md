# Governance to Product Behavior Map

Maps governance rules to expected product behavior.

| Governance Rule | Doctrine Source | Product Behavior | Enforcement Mechanism |
|---|---|---|---|
| All evidence must be attributable to a known source | Part 08 (Governance & Trust) | Evidence upload requires source metadata and digital signature | Reject uploads missing required provenance fields |
| AI recommendations must be clearly labeled as non-authoritative | Part 08 (Governance & Trust), Part 15 (Responsible Intelligence) | AI recommendation UI displays "AI-generated — requires human review" badge | Audit log flags any recommendation acted upon without reviewer attestation |
| Reviewer must explicitly accept or override each AI recommendation | Part 08 (Governance & Trust), Part 10 (Human + AI) | Reviewer approval requires explicit action per recommendation item | Workflow gate blocks transition unless every AI item has accept/override decision |
| Published outputs must include a traceability manifest | Part 08 (Governance & Trust), Part 09 (Data Trust) | Publication generates a signed manifest of evidence hashes, decisions, and actors | Publication API rejects if manifest generation fails or is incomplete |
| No single actor may create and approve the same decision | Part 08 (Governance & Trust) | Approval UI enforces separation of duties | Workflow engine prevents same user ID from appearing as creator and approver |
| AI boundaries must be configurable per engagement | Part 15 (Responsible Intelligence) | Product settings expose boundary configuration (scope, accounts, thresholds) | Unauthorized boundary changes trigger security alert and require admin re-approval |
| All human decisions must be logged with reason and context | Part 08 (Governance & Trust) | Decision capture form requires rationale text before submission | Form validation blocks empty rationale; audit trail records timestamp and user |
| System must support review and reversal of any automated action | Part 15 (Responsible Intelligence), Part 10 (Human + AI) | Undo/reverse capability on all state-transition actions | Immutable audit log records original action and reversal with actor identity |
