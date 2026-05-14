# Evidence to Decision Traceability Map

Maps the evidence lifecycle to decision outcomes.

| Evidence State | Workflow Stage | Decision Type | Traceability Artifact |
|---|---|---|---|
| Raw (unverified) | Trial Balance Intake | Accept or reject source data | Ingestion log with hash, timestamp, and source identifier |
| Attributed (sourced) | Account Mapping | Assign evidence to account | Mapping record linking evidence hash to account ID |
| Verified (cryptographically signed) | Evidence Review | Confirm authenticity and integrity | Signed attestation record with public key reference |
| Sufficient (adequate in scope) | Evidence Review | Determine sufficiency for audit objective | Sufficiency memo signed by reviewer |
| Linked (bound to finding) | Findings Lifecycle | Associate evidence with specific finding | Finding-evidence link record with directional relationship |
| Reviewed (assessed by human) | Findings Lifecycle | Evaluate evidence against criteria | Review log with finding reference, reviewer ID, and timestamp |
| Approved (confirmed by second actor) | Approval | Conclude evidence supports opinion | Approval certificate with multi-signature |
| Published (immutable record) | Publication | Finalize opinion | Published report with embedded evidence manifest |
| Retired (superseded or deprecated) | Post-Publication | Withdraw or replace evidence | Retirement record referencing superseding evidence hash |
