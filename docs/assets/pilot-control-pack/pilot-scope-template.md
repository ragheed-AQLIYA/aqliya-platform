# Pilot Scope Template — AQLIYA

## Purpose

Define what is inside and outside the scope of a specific AQLIYA pilot engagement. This document is completed per customer before the pilot begins.

## When to Use

Before signing a pilot agreement. Must be reviewed by product and legal.

---

## Pilot Scope Document

### General Information

| Field            | Value |
| ---------------- | ----- |
| Customer Name    |       |
| Pilot Start Date |       |
| Pilot Duration   |       |
| AQLIYA Lead      |       |
| Customer Lead    |       |

### Products in Scope

- [ ] **AuditOS** — financial/audit intelligence, evidence vault, review/approval, exports
- [ ] **LocalContentOS** — local content measurement, supplier scoring, gap analysis (Pilot-ready بشروط)
- [ ] **DecisionOS** — decision governance, committee workflow, evidence-based recommendations
- [ ] **Office AI Assistant** — governed AI workspace, document-aware assistance

### Products Explicitly OUT of Scope

| Product                         | Reason                                           |
| ------------------------------- | ------------------------------------------------ |
| SalesOS                         | Prototype only — not ready for customer exposure |
| RiskOS                          | Not implemented — concept phase                  |
| ComplianceOS                    | Not implemented — concept phase                  |
| LegalOS                         | Not implemented — concept phase                  |
| AQLIYA Studio                   | Strategic — not built                            |
| On-Prem / Air-Gapped deployment | Architecture direction only — not deployed       |

### Features in Scope per Product

_(Check and add detail per pilot)_

**AuditOS:**

- [ ] Engagement management
- [ ] Trial balance upload and mapping
- [ ] Financial statements generation
- [ ] Notes and evidence vault
- [ ] Findings and review workflow
- [ ] Approval gates
- [ ] AI review assistant (human-supervised)
- [ ] PDF/XLSX exports

**LocalContentOS:**

- [ ] Supplier/vendor registry
- [ ] Spend/procurement records
- [ ] Classification workflow
- [ ] Local content scoring
- [ ] Evidence upload
- [ ] Gap/risk findings
- [ ] Reports and export

### Data Scope

| Data Type                            | Included?  | Notes |
| ------------------------------------ | ---------- | ----- |
| Customer financial data (production) | ☐ Yes ☐ No |       |
| Customer supplier data               | ☐ Yes ☐ No |       |
| Anonymized/demo data only            | ☐ Yes ☐ No |       |
| Historical data migration            | ☐ Yes ☐ No |       |

### Technical Scope

- [ ] Cloud deployment (AQLIYA-hosted)
- [ ] Customer network access / VPN
- [ ] SSO integration (if available)
- [ ] Data export in agreed formats

### Acceptance Criteria

The pilot scope is accepted when:

1. All above sections are completed
2. Both parties have signed
3. Data handling rules are agreed (see customer-data-handling-rules.md)

### Owner

- **Prepared by:** AQLIYA Product Team
- **Approved by:** [AQLIYA Lead] + [Customer Lead]

### Status

- [ ] Draft
- [ ] Customer Review
- [ ] Signed
- [ ] Active
- [ ] Completed
- [ ] Terminated
