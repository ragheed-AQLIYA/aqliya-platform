# Doctrine to Workflows Map

Maps theoretical doctrine parts to operational workflows.

| Doctrine Part | Key Principle | Workflow Stage | Implementation Guidance |
|---|---|---|---|
| Part 07 (Workflow) | Workflow defines sequential, gated stages with clear handoffs | Trial Balance Intake | Enforce ingestion schema validation before proceeding to mapping |
| Part 07 (Workflow) | Workflow defines sequential, gated stages with clear handoffs | Account Mapping | Require mapping approval gate before evidence collection begins |
| Part 07 (Workflow) | Workflow defines sequential, gated stages with clear handoffs | Evidence Review | Prevent simultaneous review and approval by same actor |
| Part 07 (Workflow) | Workflow defines sequential, gated stages with clear handoffs | Findings Lifecycle | Findings must pass through draft → review → final states |
| Part 07 (Workflow) | Workflow defines sequential, gated stages with clear handoffs | Approval | Require minimum approval threshold (e.g., two-person rule) |
| Part 07 (Workflow) | Workflow defines sequential, gated stages with clear handoffs | Publication | Publication is terminal; no edits after publish, only retraction |
| Part 05 (Audit) | Audit follows a structured methodology from planning to reporting | Trial Balance Intake | Automate TB ingestion but flag anomalies for human review |
| Part 05 (Audit) | Audit follows a structured methodology from planning to reporting | Account Mapping | Map accounts using AI suggestions; require human confirmation |
| Part 05 (Audit) | Audit follows a structured methodology from planning to reporting | Evidence Review | AI surfaces relevant evidence; human determines sufficiency |
| Part 05 (Audit) | Audit follows a structured methodology from planning to reporting | Findings Lifecycle | Link each finding to specific audit objective and evidence set |
| Part 05 (Audit) | Audit follows a structured methodology from planning to reporting | Approval | Approval confirms methodology was followed and evidence supports conclusion |
| Part 05 (Audit) | Audit follows a structured methodology from planning to reporting | Publication | Published report references audit program and evidence trail |
| Part 09 (Data Trust) | Data must be cryptographically signed and immutable | Evidence Review | Accept only signed evidence bundles; reject unsigned or tampered bundles |
| Part 09 (Data Trust) | Data must be cryptographically signed and immutable | Findings Lifecycle | Immutable linkage between evidence and finding; no retroactive changes |
| Part 09 (Data Trust) | Data must be cryptographically signed and immutable | Publication | Published findings reference cryptographic hashes of underlying evidence |
| Part 13 (Product Philosophy) | Products are instruments of professional practice, not replacements | All stages | Every AI output must be reviewable and reversible by a human |
| Part 13 (Product Philosophy) | Products are instruments of professional practice, not replacements | Approval | Approval affirms human ownership; AI cannot approve its own output |
