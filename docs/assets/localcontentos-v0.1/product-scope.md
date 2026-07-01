# LocalContentOS v0.1 — Product Scope

## Product Definition

LocalContentOS is a **governed local content measurement, evidence, compliance, and reporting workflow** for Saudi-market organizations. It is the second strategic product under AQLIYA, built on AQLIYA Intelligence Core.

**Arabic:** نظام المحتوى المحلي — مسار تشغيلي محكوم لقياس وتوثيق واعتماد المحتوى المحلي للمؤسسات.

### What LocalContentOS IS

- A governed multi-stage workflow for local content assessment
- An evidence-backed supplier/spend classification system
- A compliance management platform for LCGPA and Saudi content requirements
- A human-reviewed, AI-assisted analysis environment
- A bilingual Arabic-first operational workspace

### What LocalContentOS IS NOT

- A static dashboard with placeholder cards
- A generic procurement tracker or CRM
- A spreadsheet automation tool only
- A compliance claim generator or regulator certification system
- An autonomous AI decision engine
- A marketing page

## Included in v0.1

| Capability                        | Description                                                                                | Priority |
| --------------------------------- | ------------------------------------------------------------------------------------------ | -------- |
| Project/assessment setup          | Create local content project, define reporting period, scope                               | P0       |
| Supplier/vendor registry          | Register suppliers with locality, ownership, workforce data                                | P0       |
| Procurement/spend records         | Import or enter spend per supplier per category                                            | P0       |
| Local vs non-local classification | Classify spend items, contracts, and suppliers by local content percentage                 | P0       |
| Local content scoring             | Calculate weighted local content score per project                                         | P0       |
| Evidence upload/linking           | Attach supplier certificates, contracts, attestations to records                           | P0       |
| Gap/risk findings                 | Flag missing evidence, low-content areas, classification ambiguities                       | P0       |
| Review workflow                   | Submit for review, reviewer comments, return/revision cycle                                | P0       |
| Approval workflow                 | Approve/reject local content assessment with governance record                             | P0       |
| Audit trail                       | Every mutation logged to PlatformAuditLog                                                  | P0       |
| Dashboard                         | Real metrics from persisted data                                                           | P0       |
| Report/export                     | Binary PDF/XLSX export (Assessment Summary, registers, evidence index). Text/CSV available | P0       |
| Seed demo dataset                 | Realistic Saudi-market dataset for development                                             | P0       |
| Bilingual Arabic-first UX         | RTL layout, Arabic labels, English supported                                               | P0       |

## Excluded from v0.1

| Capability                         | Reason                         | Target      |
| ---------------------------------- | ------------------------------ | ----------- |
| Cloud AI-assisted classification   | AI orchestration not wired     | v0.2        |
| AI-assisted classification         | AI orchestration not wired     | v0.2        |
| Simulation/what-if modeling        | Requires scenario engine       | v0.2        |
| Multi-year trend analysis          | Requires historical data model | v0.3        |
| LCGPA portal integration           | External API dependency        | v0.3        |
| Supplier self-service portal       | Separate user-facing surface   | Future      |
| Automated certificate verification | External service dependency    | Future      |
| Workforce localization tracking    | Additional data domain         | Future      |
| Custom report builder              | Requires Studio                | Post-Studio |
| Mobile app                         | Separate delivery surface      | Future      |
| On-Prem deployment                 | Requires On-Prem package       | Future      |

## Outputs (v0.1)

1. **Local Content Assessment Summary** — overview dashboard-printable with score, breakdown, status
2. **Supplier Locality Register** — tabular export of all suppliers with classification and evidence status
3. **Spend Classification Report** — spend by supplier, category, local percentage
4. **Gap & Risk Register** — findings, missing evidence, low-content risks
5. **Evidence Index** — all evidence items with status, linked records, review state
6. **Review/Approval Log** — timeline of review actions and approval decisions
7. **Final Export Package** — combined PDF/XLSX export package with disclaimer, governance metadata, and binary content (pdfkit + xlsx)
