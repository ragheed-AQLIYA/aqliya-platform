# Governance Checkpoint System — AuditOS Workflow Stages

## 1. TB Upload

### Governance Check
- Origin integrity: TB file hash must match source-system provenance record.
- Client/year/language metadata must be present and non-null.
- Uploading entity must hold `uploader` or `admin` role scoped to the engagement.
- Duplicate-detection: hash + engagement key must be unique across all prior uploads.

### Evidence Check
- Raw TB file preserved immutably in object store with versioning.
- Upload event logged: timestamp, user identity, client ID, file hash, file size.
- Checksum recorded in audit log for downstream cross-referencing.

### Approval Check
- Auto-accepted if hash and metadata pass validation.
- Manual approval required if: (a) hash collides with prior upload, (b) metadata mismatch between filename and declared engagement, (c) file size exceeds threshold, (d) file format not in allowlist.

### Escalation Check
- Escalate to Engagement Lead if upload fails auto-validation on hash/metadata.
- Escalate to System Admin if object-store write fails (infrastructure alert).
- Escalate to Data Governance if PII detected in raw TB (secondary scan).

### Prohibited Automation Boundaries
- No automated transformation of raw TB before human acceptance.
- No automated deletion of prior TB uploads for the same engagement.
- No automated engagement-scope reassignment without human confirmation.

---

## 2. Mapping

### Governance Check
- Every imported account must have a mapping assignment (mapped or explicitly deferred).
- Mapping coverage percentage calculated and logged.
- Chart-of-accounts version used for mapping recorded and version-pinned.

### Evidence Check
- Mapping decisions (source account → target code, rule-based vs. manual) logged per line.
- Confidence scores recorded for each mapping decision.
- Low-confidence mappings (< threshold) must be flagged with reason.

### Approval Check
- Auto-approval for high-confidence rule-based mappings above confidence threshold.
- Manual review required for: (a) low-confidence mappings, (b) accounts exceeding materiality threshold, (c) mappings flagged by anomaly detection, (d) first-use mappings for a given CoA code.

### Escalation Check
- Escalate unmapped accounts > 5% of total to Engagement Lead.
- Escalate to Methodology if mapping conflict detected (same source account mapped differently across periods).
- Escalate to Technical Lead if mapping engine produces inconsistent outputs on rerun.

### Prohibited Automation Boundaries
- No automated resolution of low-confidence mappings without human review.
- No automated changes to mapping rules in production without governance board approval.
- No automated override of materiality-flagged mapping decisions.

---

## 3. Reclassification

### Governance Check
- All reclassification entries must reference a source journal entry and a target account.
- Reclassification reason code must be selected from governed taxonomy (not free-text).
- Net effect of all reclassifications must be zero (balanced) at entry level.

### Evidence Check
- Reclassification journal linked to originating mapping or adjustment source.
- Reviewer identity recorded for each confirmed reclassification batch.
- Before/after trial balance snapshot preserved for each reclassification pass.

### Approval Check
- Reviewer confirmation required for every reclassification batch before downstream consumption.
- Auto-approval prohibited — all reclassifications require human sign-off.
- Batch-level sign-off: reviewer confirms entire batch, not individual entries.

### Escalation Check
- Escalate unbalanced reclassification batches to Engagement Lead (possible data corruption).
- Escalate if reclassification count exceeds expected threshold (possible mass misclassification).
- Escalate if reviewer rejects same batch > 2 times (possible methodology gap).

### Prohibited Automation Boundaries
- No automated reclassification without human reviewer confirmation.
- No automated selection of reason codes — must be human-chosen from taxonomy.
- No automated propagation of reclassification to downstream stages before sign-off.

---

## 4. Financial Statements

### Governance Check
- Statement structure must match engagement-type template (IFRS, GAAP, etc.).
- All statement line items must trace to trial balance or lead-schedule aggregations.
- Rounding differences must be within defined tolerance and allocated to a designated line.

### Evidence Check
- Statement generation log: template version, aggregation rules applied, data snapshot timestamp.
- Cross-reference map: each statement line ↔ source TB line(s) or lead-schedule node.
- Review comments and corrections preserved with user identity and timestamp.

### Approval Check
- Preparer review (self-review checklist) required before submission to reviewer.
- Independent reviewer sign-off required for each financial statement component.
- Cross-reference reconciliation must pass automated checks before reviewer sees statements.

### Escalation Check
- Escalate cross-reference breakage to Technical Lead (possible mapping or aggregation defect).
- Escalate unbalanced statements to Engagement Lead (possible data integrity issue).
- Escalate if preparer and reviewer disagree after 2 review cycles (deadlock).

### Prohibited Automation Boundaries
- No automated release of financial statements without dual sign-off (preparer + reviewer).
- No automated suppression of rounding differences — must be visible and allocated.
- No automated template substitution without engagement-lead approval.

---

## 5. Notes

### Governance Check
- Every mandatory note (per engagement-type template) must be populated or explicitly marked N/A with reason.
- Note content must not contradict financial statement figures (cross-validation automated).
- External data references in notes must include source and retrieval date.

### Evidence Check
- Note population log: which notes auto-populated from data, which required manual entry.
- Missing-data flags recorded per note with reason and timestamp.
- Reviewer annotations preserved per note line.

### Approval Check
- Auto-populated notes: reviewer confirmation required (verify accuracy of extraction).
- Manually entered notes: preparer + reviewer dual sign-off.
- N/A declarations: reviewer must confirm applicability exemption.

### Escalation Check
- Escalate mandatory notes not populated within engagement timeline to Engagement Lead.
- Escalate contradictory note-to-statement cross-validation failures to Technical Lead.
- Escalate if external data source unavailable at note-generation time (data gap).

### Prohibited Automation Boundaries
- No automated authoring of narrative/qualitative note content — auto-population limited to quantitative extractions.
- No automated suppression of missing-data flags.
- No automated selection of N/A justifications.

---

## 6. Findings

### Governance Check
- Each finding must be classified by severity using governed taxonomy (Critical, High, Medium, Low, Observation).
- Each finding must reference at least one source of evidence (document, transaction, account).
- Findings must not duplicate — similarity detection runs before submission.

### Evidence Check
- Evidence links (document references, transaction IDs, account codes) recorded per finding.
- Evidence sufficiency check: all linked evidence must be accessible and non-tampered.
- Finding lifecycle logged: created, drafted, reviewed, approved, published, remediated.

### Approval Check
- Critical and High findings: Engagement Lead + Quality Reviewer dual sign-off.
- Medium findings: single reviewer sign-off.
- Low and Observation: preparer self-certification with reviewer spot-check.

### Escalation Check
- Escalate Critical findings to Engagement Partner within 24 hours.
- Escalate duplicate/overlapping findings to Quality Reviewer (possible methodology inconsistency).
- Escalate if finding count exceeds statistical norm for engagement type (possible systematic issue).

### Prohibited Automation Boundaries
- No automated severity classification — must be human-assigned from taxonomy.
- No automated linking of evidence without human confirmation of relevance.
- No automated closure or downgrade of findings without reviewer sign-off.

---

## 7. Evidence Review

### Governance Check
- All evidence items must have a unique identifier and be traceable to a finding or procedure.
- Evidence must pass authenticity checks: hash verification, source metadata, chain of custody.
- Evidence repository must be immutable — no modification after acceptance, only supersession.

### Evidence Check
- Verification status recorded per evidence item: Verified, Rejected, Pending.
- Reviewer identity and timestamp recorded for each verification action.
- Rejected evidence must include reason code and linkage to replacement evidence (if any).

### Approval Check
- Evidence acceptance requires independent reviewer verification (not self-reviewed by preparer).
- Bulk acceptance prohibited — each evidence item requires individual review for Critical/High findings.
- Evidence linked to Critical findings requires Quality Reviewer verification.

### Escalation Check
- Escalate if evidence item rejected > 2 times to Engagement Lead (possible evidence gap).
- Escalate if evidence chain-of-custody broken to Data Governance.
- Escalate if evidence repository integrity check fails to System Admin.

### Prohibited Automation Boundaries
- No automated acceptance of evidence — all evidence requires human verification.
- No automated rejection of evidence without human reason-code selection.
- No automated bypass of chain-of-custody validation.

---

## 8. Commercial Outputs

### Governance Check
- All output documents must align with approved doctrine and methodology version.
- Claims in commercial outputs must be traceable to findings and evidence (no overclaiming).
- Output document versioning: draft, review, approved, issued — with sign-off trail.

### Evidence Check
- Doctrine-alignment scan: automated check that output language does not contradict methodology.
- Claim traceability map: each assertion → finding(s) → evidence item(s).
- Output generation log: template version, data snapshot, generator identity.

### Approval Check
- Engagement Lead sign-off required before any commercial output leaves the system.
- Quality Reviewer sign-off for outputs containing Critical or High findings.
- Client-facing outputs require Engagement Partner approval.

### Escalation Check
- Escalate doctrine-alignment failures to Methodology Board.
- Escalate overclaiming detection to Engagement Partner (potential professional standards breach).
- Escalate if output generation fails consistency checks on rerun to Technical Lead.

### Prohibited Automation Boundaries
- No automated issuance of commercial outputs without required sign-offs.
- No automated modification of finding language in output generation — verbatim from findings.
- No automated suppression of methodology-version disclosure.
- No automated bundling of findings that materially alters severity perception.
