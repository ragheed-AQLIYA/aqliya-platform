# AuditOS Runtime Governance Map

## Pipeline Overview

```
TB Upload → Mapping → Reclassification → Financial Statements
                                              │
                    ┌─────────────────────────┤
                    ▼                         ▼
                 Notes   ←──────────────  Lead Schedules
                    │                         │
                    └─────────┬───────────────┘
                              ▼
                         Evidence ←── Procedures
                              │
                              ▼
                         Findings
                              │
                              ▼
                    Reviewer (Quality)
                              │
                              ▼
                         Approval → Commercial Outputs
```

---

## Stage 1: TB Upload

### Runtime Governance Points
- **Ingress Gate:** File hash validation, format check, metadata completeness — all must pass before TB enters pipeline.
- **Duplicate Guard:** System checks hash + engagement key against prior uploads. Duplicate → rejection with reason.
- **Staging Isolation:** Uploaded TB held in staging area; not visible to downstream stages until accepted.
- **Provenance Record:** Immutable record created: who uploaded, when, from which source system, file attributes.

### Human Reviewer Roles
- **Uploader:** Initiates upload; confirms engagement context; responds to validation flags.
- **Engagement Lead:** Resolves metadata conflicts; authorizes uploads that fail auto-validation.

### Evidence Requirements
- Raw TB file stored immutably with versioning.
- Upload event logged in audit trail.
- Checksum recorded for cross-reference verification.

### Draft Generation Controls
- No downstream draft (mapping, statements) can reference unaccepted TB.
- Draft mapping runs permitted on staging TB for preparer review before acceptance.

### Approval Boundaries
- Auto-approval for clean uploads (hash valid, metadata consistent, format allowed).
- Human approval required for flagged uploads.
- Hard boundary: TB not accepted → entire pipeline blocked.

### Escalation Points
- Hash collision → Engagement Lead.
- Infrastructure failure → System Admin.
- PII detected → Data Governance.

---

## Stage 2: Mapping

### Runtime Governance Points
- **Coverage Gate:** Mapping coverage percentage computed; < 95% coverage blocks downstream stages.
- **Confidence Gate:** Low-confidence mappings flagged; must be resolved or deferred with reason.
- **Conflict Detection:** Same source account mapped differently across periods → flagged for review.
- **Version Pinning:** CoA version locked at mapping start; version change requires remapping sign-off.

### Human Reviewer Roles
- **Preparer:** Performs initial mapping (rule-based auto-populated, then manual review of low-confidence items).
- **Reviewer (Mapping):** Independently verifies all low-confidence mappings; spot-checks high-confidence mappings.
- **Engagement Lead:** Resolves mapping conflicts; approves CoA version changes.

### Evidence Requirements
- Mapping decision log: source → target, confidence score, method (auto/manual).
- Coverage report: percentage mapped, unmapped account list with reasons.
- Low-confidence flag list with preparer notes.

### Draft Generation Controls
- Draft financial statements may reference draft mappings for preparer preview.
- No final statements until mappings are reviewed and accepted.
- Draft notes may pre-populate from draft mappings for preparer efficiency.

### Approval Boundaries
- High-confidence rule-based mappings: auto-approved (subject to reviewer spot-check).
- Low-confidence mappings: human review mandatory.
- Material accounts: human review mandatory regardless of confidence.
- Hard boundary: mapping coverage < 95% → no financial statements or notes generation.

### Escalation Points
- Unmapped accounts > 5% → Engagement Lead.
- Mapping conflict across periods → Methodology.
- Engine inconsistency on rerun → Technical Lead.

---

## Stage 3: Reclassification

### Runtime Governance Points
- **Balance Gate:** All reclassification entries must net to zero before batch is accepted.
- **Taxonomy Gate:** Reason codes must be selected from governed taxonomy — no free-text.
- **Traceability Gate:** Each reclassification must reference originating source (mapping, adjustment, journal).
- **Batch Atomicity:** Entire reclassification batch accepted or rejected as a unit.

### Human Reviewer Roles
- **Preparer:** Drafts reclassification entries; selects reason codes; verifies balance.
- **Reviewer:** Confirms each batch; validates reason-code appropriateness; checks net-zero balance.

### Evidence Requirements
- Reclassification journal linked to source references.
- Before/after TB snapshot per batch.
- Reviewer identity and timestamp per confirmed batch.

### Draft Generation Controls
- Draft statements may incorporate draft reclassifications for preparer preview.
- Reclassification batches not confirmed → blocked from final statement generation.
- Notes that reference reclassified amounts must flag if reclassification not yet confirmed.

### Approval Boundaries
- All reclassification batches require human reviewer confirmation — no auto-approval.
- Batch-level sign-off: one confirmation covers entire batch.
- Hard boundary: unconfirmed reclassifications → blocked from final outputs.

### Escalation Points
- Unbalanced batch → Engagement Lead (possible data corruption).
- Excessive reclassification count → Engagement Lead (possible systemic issue).
- Repeated reviewer rejection (>2) → Methodology (possible methodology gap).

---

## Stage 4: Financial Statements

### Runtime Governance Points
- **Structure Gate:** Statement structure must conform to engagement-type template.
- **Traceability Gate:** Each line item must trace to TB or lead-schedule aggregations.
- **Rounding Gate:** Rounding differences must be within tolerance and allocated explicitly.
- **Cross-Reference Gate:** Statement-to-TB reconciliation must pass before reviewer access.

### Human Reviewer Roles
- **Preparer:** Completes self-review checklist; verifies line-item traceability; resolves flagged items.
- **Independent Reviewer:** Verifies statement accuracy; checks cross-references; signs off per component.
- **Engagement Lead:** Resolves preparer-reviewer deadlocks; approves template variances.

### Evidence Requirements
- Statement generation log: template version, aggregation rules, data snapshot timestamp.
- Cross-reference reconciliation report.
- Review comments and sign-off trail (preparer + reviewer, per component).

### Draft Generation Controls
- Draft statements generated on mapping/lead-schedule acceptance for preparer self-review.
- Drafts watermarked "DRAFT — NOT FOR DISTRIBUTION."
- Draft visible only to preparer and assigned reviewer; not visible to client-facing roles.

### Approval Boundaries
- Dual sign-off required per statement component (preparer + independent reviewer).
- Cross-reference reconciliation must pass automated checks before reviewer access.
- Hard boundary: no dual sign-off → commercial outputs blocked.

### Escalation Points
- Cross-reference breakage → Technical Lead.
- Unbalanced statements → Engagement Lead.
- Preparer-reviewer deadlock after 2 cycles → Engagement Lead.

---

## Stage 5: Notes

### Runtime Governance Points
- **Completeness Gate:** Mandatory notes populated or N/A-justified; missing notes flagged.
- **Consistency Gate:** Automated cross-validation: note figures must not contradict statement figures.
- **Reference Gate:** External data sources cited with retrieval date; broken references flagged.
- **Quantitative Extraction:** Automated extraction limited to numeric/structured data from TB and lead schedules.

### Human Reviewer Roles
- **Preparer:** Reviews auto-populated quantitative data; authors qualitative/narrative content; marks N/A with justification.
- **Reviewer:** Confirms auto-populated accuracy; reviews manual entries; confirms N/A exemptions.
- **Engagement Lead:** Resolves note-to-statement contradictions; approves external data source substitutions.

### Evidence Requirements
- Note population log: auto-populated vs. manual, timestamps, preparer identity.
- Missing-data flags with reason and timestamp.
- Reviewer annotations per note line.

### Draft Generation Controls
- Auto-populated sections generated on mapping/statement acceptance.
- Drafts watermarked; visible only to preparer and reviewer.
- Narrative sections locked for manual entry only — no generative AI content.

### Approval Boundaries
- Auto-populated quantitative: reviewer confirmation required.
- Manual entries: dual sign-off (preparer + reviewer).
- N/A declarations: reviewer must confirm applicability exemption.
- Hard boundary: mandatory notes incomplete → commercial outputs blocked.

### Escalation Points
- Mandatory notes not populated on time → Engagement Lead.
- Cross-validation contradiction → Technical Lead.
- External data unavailable → Engagement Lead.

---

## Stage 6: Evidence

### Runtime Governance Points
- **Authenticity Gate:** Every evidence item must pass hash verification and chain-of-custody checks.
- **Linkage Gate:** Each evidence item must be traceable to a finding or procedure.
- **Immutability Gate:** Accepted evidence is immutable; modifications require supersession with new evidence ID.
- **Sufficiency Gate:** Evidence coverage assessed per finding; gaps flagged.

### Human Reviewer Roles
- **Preparer:** Collects and submits evidence; links evidence to findings/procedures.
- **Evidence Reviewer:** Verifies authenticity; confirms linkage relevance; accepts or rejects each item.
- **Quality Reviewer:** Required for evidence linked to Critical/High findings.
- **Data Governance:** Oversees chain-of-custody exceptions.

### Evidence Requirements
- Unique evidence ID per item.
- Hash, source metadata, chain-of-custody record.
- Verification status: Verified, Rejected, Pending — with reviewer identity and timestamp.
- Rejected evidence: reason code + replacement evidence reference.

### Draft Generation Controls
- Findings cannot advance beyond "draft" status unless linked evidence is verified.
- Evidence pending verification → finding status locked to "evidence gathering."
- Draft findings visible to preparer with unverified evidence warnings.

### Approval Boundaries
- All evidence requires human verification — no auto-acceptance.
- Individual review required for Critical/High finding evidence (no bulk acceptance).
- Quality Reviewer required for Critical finding evidence.
- Hard boundary: unverified evidence → findings cannot be finalized.

### Escalation Points
- Repeated evidence rejection (>2) → Engagement Lead.
- Chain-of-custody broken → Data Governance.
- Repository integrity failure → System Admin.

---

## Stage 7: Findings

### Runtime Governance Points
- **Severity Gate:** Every finding must be classified (Critical/High/Medium/Low/Observation) by human.
- **Evidence Gate:** Every finding must link to at least one verified evidence item.
- **Deduplication Gate:** Similarity scan before submission; duplicates flagged.
- **Lifecycle Gate:** Finding state machine enforced: Draft → In Review → Approved → Published → Remediated.

### Human Reviewer Roles
- **Preparer:** Drafts findings; classifies severity; links evidence.
- **Reviewer:** Reviews and signs off on findings.
- **Quality Reviewer:** Required for Critical/High findings (dual sign-off with Engagement Lead).
- **Engagement Partner:** Notified of all Critical findings within 24 hours.

### Evidence Requirements
- Evidence links (IDs) recorded per finding.
- Evidence sufficiency confirmed: all linked evidence verified and accessible.
- Finding lifecycle log: state transitions with user identity and timestamp.

### Draft Generation Controls
- Findings in "Draft" status: visible only to preparer.
- Findings advance to "In Review" only when linked evidence is verified.
- Commercial outputs can only reference "Approved" or "Published" findings.

### Approval Boundaries
- Critical/High: Engagement Lead + Quality Reviewer dual sign-off.
- Medium: Single reviewer sign-off.
- Low/Observation: Preparer self-certification with reviewer spot-check.
- Hard boundary: findings not approved → excluded from commercial outputs.

### Escalation Points
- Critical findings → Engagement Partner notification within 24h.
- Duplicate findings → Quality Reviewer.
- Abnormal finding count → Engagement Lead.

---

## Stage 8: Reviewer (Quality)

### Runtime Governance Points
- **Independence Gate:** Reviewer must not be the same individual as preparer for any given work product.
- **Coverage Gate:** All required review points per stage must be completed; checklist enforced.
- **Objectivity Gate:** Review comments must be recorded; resolved/dispositioned before sign-off.
- **Timeliness Gate:** Review SLA tracked; overdue reviews escalated.

### Human Reviewer Roles
- **Independent Reviewer:** Verifies work product accuracy; raises review points; signs off.
- **Quality Reviewer:** Second-level review for high-risk items (Critical findings, complex judgments).
- **Engagement Lead:** Resolves preparer-reviewer disputes; monitors review SLA compliance.
- **Engagement Partner:** Final authority on quality disputes; notified of systemic review failures.

### Evidence Requirements
- Review checklist completion record per stage.
- Review comments log: raised by, timestamp, resolved by, resolution.
- Sign-off trail: reviewer identity, timestamp, scope of review.

### Draft Generation Controls
- Work products advance from "Draft" to "In Review" on preparer submission.
- "In Review" items locked for preparer editing.
- Review comments create "Revision Required" state; preparer revises and resubmits.

### Approval Boundaries
- Independent reviewer sign-off required before any stage output is considered final.
- Quality Reviewer sign-off required for Critical/High findings and related outputs.
- Hard boundary: no reviewer sign-off → downstream stages cannot consume the output.

### Escalation Points
- SLA breach (overdue review) → Engagement Lead.
- Preparer-reviewer deadlock (>2 cycles) → Engagement Lead.
- Systemic review failure pattern → Engagement Partner.

---

## Stage 9: Approval → Commercial Outputs

### Runtime Governance Points
- **Doctrine Gate:** Output language must pass automated doctrine-alignment scan.
- **Claim Gate:** Every assertion must trace to an approved finding with verified evidence.
- **Versioning Gate:** Output documents versioned: Draft → Review → Approved → Issued.
- **Distribution Gate:** Role-based access control on issued outputs; distribution list approved.

### Human Reviewer Roles
- **Engagement Lead:** Signs off on all commercial outputs; verifies doctrine alignment.
- **Quality Reviewer:** Required sign-off for outputs containing Critical/High findings.
- **Engagement Partner:** Final approval for client-facing outputs.
- **Methodology Board:** Reviews doctrine-alignment failures; authorizes exceptions.

### Evidence Requirements
- Output generation log: template version, data snapshot, generator identity.
- Doctrine-alignment scan report.
- Claim traceability map: assertion → finding → evidence.
- Sign-off trail for each output version state.

### Draft Generation Controls
- Outputs generated in "Draft" state; watermarked and restricted visibility.
- "Review" state: visible to Engagement Lead and Quality Reviewer.
- "Approved" state: visible to client-facing roles.
- "Issued": published to client; immutable; superseded only by new version.

### Approval Boundaries
- Engagement Lead sign-off mandatory before output leaves the system.
- Quality Reviewer sign-off for outputs with Critical/High findings.
- Engagement Partner approval for client-facing outputs.
- Hard boundary: missing any required sign-off → output cannot be issued.

### Escalation Points
- Doctrine-alignment failure → Methodology Board.
- Overclaiming detected → Engagement Partner.
- Generation consistency failure on rerun → Technical Lead.
- Unauthorized distribution attempt → System Admin + Engagement Partner.

---

## Cross-Cutting Governance Controls

| Control | Scope | Mechanism |
|---|---|---|
| Segregation of Duties | All stages | Preparer ≠ Reviewer enforced by system |
| Immutable Audit Trail | All stages | Every state transition, sign-off, and action logged |
| Role-Based Access | All stages | Engagement-scoped roles; no cross-engagement visibility |
| Version Pinning | Templates, CoA, Methodology | All references version-locked; upgrades require governance approval |
| SLA Monitoring | Review, Escalation | Time-based triggers for each stage; breach notifications |
| Evidence Immutability | Evidence, Findings | Hash-verified; write-once storage; supersession model |
| Pipeline Gating | Between stages | Downstream blocked until upstream gates satisfied |
