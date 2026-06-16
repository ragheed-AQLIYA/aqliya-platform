# SOCPA → AuditOS Technical Analysis

**Document ID:** `docs/socpa-auditos-technical-analysis.md`  
**Status:** Technical Specification / Planning Document  
**Product:** AuditOS under AQLIYA Platform  
**Source:** socpa.org.sa (extracted 2026-06-10)  
**Classification:** Internal — Engineering Reference  

---

## Table of Contents

1. [Overview](#1-overview)
2. [Standards Framework](#2-standards-framework)
3. [Quality Review Program](#3-quality-review-program)
4. [Peer Review System](#4-peer-review-system)
5. [Professional Licensing](#5-professional-licensing)
6. [Independence & Ethics Requirements](#6-independence--ethics-requirements)
7. [Audit Report Framework](#7-audit-report-framework)
8. [Professional Inquiries Database](#8-professional-inquiries-database)
9. [Practical Guidance Documents](#9-practical-guidance-documents)
10. [AuditOS Feature Mapping](#10-auditos-feature-mapping)
11. [Data Model Recommendations](#11-data-model-recommendations)
12. [Data Sources & Access Notes](#12-data-sources--access-notes)
13. [Next Steps for AuditOS](#13-next-steps-for-auditos)

---

## 1. Overview

### 1.1 Purpose

This document extracts and structures the SOCPA (الهيئة السعودية للمراجعين والمحاسبين) regulatory framework to directly engineer AuditOS features under the AQLIYA platform. It serves as a technical specification bridging Saudi auditing regulatory requirements with software implementation.

### 1.2 About SOCPA

| Property | Detail |
|----------|--------|
| Full Name | Saudi Organization for Certified Public Accountants (الهيئة السعودية للمراجعين والمحاسبين) |
| Role | Sole auditing and accounting standards body in Saudi Arabia |
| Authority | Regulates all certified public accountants and audit firms in KSA |
| Oversight | All audit firms must be licensed by SOCPA and subject to its quality review program |
| Website | socpa.org.sa |
| Platform | Kentico CMS (Arabic-first, with English content mirror) |
| Content Pattern | Standards documents behind GetFile.aspx links; e-services for restricted content |

### 1.3 Strategic Relevance to AuditOS

AuditOS under AQLIYA must align with the SOCPA regulatory framework to serve Saudi-based audit firms, internal audit departments, and compliance functions. Every SOCPA requirement represents a feature surface for AuditOS:

- **Mandatory compliance** → AuditOS Compliance Engine
- **Quality reviews** → AuditOS Quality Review Module
- **Peer reviews** → AuditOS Peer Review Module
- **Licensing** → AuditOS License Management
- **Professional inquiries** → AuditOS Knowledge Base / AI Training Corpus
- **Standards adoption** → AuditOS Methodology Engine

### 1.4 Document Structure

This document follows the taxonomy established in `docs/DOCUMENTATION_AUTHORITY.md` (Level 5 — Product/System docs). It is a technical specification grounded in actual data extracted from socpa.org.sa. Where data requires deeper access (e-service login, restricted downloads), this is explicitly noted.

## 2. Standards Framework

### 2.1 Adopted Standards Overview

SOCPA has adopted the following international standards, each with an official adoption document (وثيقة اعتماد), approved standards listing (المعايير المعتمدة), updates tracking (التحديثات المعتمدة), and eBook versions.

| Standard | Arabic Name | Type | AuditOS Relevance |
|----------|-------------|------|-------------------|
| IFRS (Full) | المعايير الدولية للتقرير المالي | Financial Reporting | Compliance Matrix, Financial Statement Engine |
| IFRS for SMEs | معيار المنشآت الصغيرة والمتوسطة | Financial Reporting | SME Audit Methodology, Simplified Templates |
| ISA | معايير المراجعة الدولية | Auditing | Assurance Engine, Audit Program Builder |
| ISQM 1 & 2 | معايير إدارة الجودة الدولية | Quality Management | Quality Management System Engine |
| IESBA Code of Ethics | الميثاق الدولي لسلوك وآداب المهنة | Ethics & Independence | Independence Module, Ethics Screener |
| IPSAS | معايير المحاسبة للقطاع العام | Public Sector Accounting | Government Audit Templates, Public Sector Module |

### 2.2 Content Structure Per Standard

Each standard on the SOCPA website follows this structure:

| Component | Description | AuditOS Mapping |
|-----------|-------------|-----------------|
| Adoption Document (وثيقة اعتماد) | Official decree adopting the standard | Standards Registry |
| Approved Standards (المعايير المعتمدة) | The current adopted version | Compliance Matrix Baseline |
| Updates (التحديثات المعتمدة) | Amendments and effective dates | Standards Change Tracker |
| eBook Versions | Downloadable standard text | Reference Library |
| Local Technical Standards (المعايير والآراء الفنية المحلية) | Saudi-specific interpretations | Local Compliance Layer |
| Superseded Standards Archive | Historical versions | Archive Module |

### 2.3 Local Technical Standards & Opinions

SOCPA publishes local technical standards and opinions (المعايير والآراء الفنية المحلية) that modify or interpret international standards for the Saudi context. These are critical for AuditOS because:

- They represent Saudi-specific compliance requirements
- They override or supplement international standards
- They must be tracked as delta from the base international standard
- They form the "Local Compliance Layer" in the AuditOS Standards Engine

### 2.4 Standards Engine Requirements

The AuditOS Standards Engine must:

1. **Ingest** — Import standards adoption documents as structured metadata
2. **Version** — Track standards versions with effective dates
3. **Map** — Map ISA/IFRS requirements to audit program steps
4. **Diff** — Track local modifications vs. international baseline
5. **Notify** — Alert practitioners of standards changes affecting active engagements
6. **Cross-reference** — Link standards to practical guidance documents

## 3. Quality Review Program

### 3.1 Program Overview

SOCPA operates a **Quality Performance Monitoring Program** (برنامج مراقبة جودة الأداء المهني) that assesses audit firms and practitioners against established quality criteria. This is the primary mechanism for enforcing audit quality in Saudi Arabia.

### 3.2 Practitioner Types (4 Tracks)

| Type | Code | Arabic Name | Scope | AuditOS Track ID |
|------|------|-------------|-------|------------------|
| A | CPA | محاسب قانوني | Certified Public Accountant — full audit scope | `PRACTITIONER_A` |
| B | ZATCA | زكاة وضرائب | Zakat and Tax Accounting | `PRACTITIONER_B` |
| C | VAT | ضريبة القيمة المضافة | VAT Accounting | `PRACTITIONER_C` |
| D | ACC-SVC | خدمات محاسبية | Accounting Services (bookkeeping, financial preparation) | `PRACTITIONER_D` |

Each practitioner type has distinct:
- Scope of work limitations
- Continuing Professional Development (CPD) requirements
- Quality review criteria
- License requirements

### 3.3 Quality Ratings (4 Levels)

| Rating | Arabic | Code | Description | AuditOS Score Range |
|--------|--------|------|-------------|---------------------|
| Excellent | ممتاز | `EXCELLENT` | Highest quality rating; no significant deficiencies | 90–100 |
| Good | جيد | `GOOD` | Satisfactory quality; minor improvements needed | 75–89 |
| Acceptable | مقبول | `ACCEPTABLE` | Minimum acceptable quality; corrective action required | 60–74 |
| Poor | ضعيف | `POOR` | Below acceptable quality; mandatory corrective action | 0–59 |

### 3.4 Corrective Action Plan (CAP) Mechanism

The **Corrective Action Plan Follow-up Mechanism** (آلية متابعة الخطة التصحيحية) requires:

1. **Trigger** — Poor or Acceptable rating triggers a CAP
2. **Submission** — Firm submits CAP addressing each deficiency
3. **Timeline** — SOCPA-defined deadline for remediation
4. **Follow-up Review** — SOCPA conducts follow-up inspection
5. **Escalation** — Failure to remediate leads to license suspension/revocation
6. **Closure** — CAP closed upon successful remediation verification

**AuditOS CAP Tracker Requirements:**
- CAP creation workflow tied to quality review finding
- Automated deadline calculation
- Progress tracking with status milestones (Draft → Submitted → In Review → Approved → Implemented → Verified → Closed)
- Evidence attachment for each remediation step
- Escalation triggers for missed deadlines
- Audit trail for all CAP actions

### 3.5 Annual Data Program

SOCPA's **Annual Data Program** (برنامج البيانات السنوية) requires licensed practitioners to submit annual data. This includes:

- Firm profile and structure updates
- Engagement volume and type
- Staffing and CPD compliance
- Revenue and practice metrics
- Quality review history

**AuditOS Mapping:** Annual Compliance Submission workflow with form templates based on practitioner type.

### 3.6 Quality Indicators Guide

SOCPA publishes a **Quality Indicators Guide** (الدليل الإرشادي لمؤشرات جودة المراجعة) defining measurable quality metrics. These indicators form the basis for:

- SOCPA's quality review scoring
- Firm self-assessment
- Benchmarking across firms
- Dashboard KPIs

**AuditOS Mapping:** Quality Indicator dashboard with:
- Pre-defined indicator templates from SOCPA guide
- Configurable weight/scoring
- Trend visualization over review cycles
- Benchmarking (firm vs. peer group)

### 3.7 Field Inspection Findings Reports

SOCPA publishes recurring **Field Inspection Findings Reports** documenting common deficiencies:

| Report Period | File Name/Document | AuditOS Use |
|---------------|-------------------|-------------|
| 2018–2019 | Recurring Field Inspection Findings | Deficiency Taxonomy seed data |
| 2020–2021 | Recurring Field Inspection Findings | Updated deficiency patterns / AI Training |

These reports provide:
- Common deficiency categories (e.g., audit documentation, risk assessment, evidence)
- Frequency analysis (most common findings)
- Severity distribution
- Trend data between periods

**AuditOS Mapping:** Pre-seeded Finding templates with SOCPA deficiency taxonomy, enabling AI-assisted finding identification during quality reviews.

### 3.8 Transparency Report Service

SOCPA offers a **Transparency Report Service** (خدمة تقرير الشفافية) requiring firms to publish transparency reports covering:

- Governance structure
- Quality management system
- Independence practices
- CPD and training
- Client acceptance and retention policies
- Financial information

**AuditOS Mapping:** Transparency Report Generator (P2 feature) with:
- SOCPA-compliant report templates
- Data auto-population from firm profile
- Approval workflow before publication
- PDF/HTML export

## 4. Peer Review System

### 4.1 Service Overview

SOCPA's **Peer Review Service** (فحص القرين) provides an independent assessment of a firm's quality management system by qualified peer reviewers. This is distinct from SOCPA's own quality reviews.

| Property | Detail |
|----------|--------|
| Arabic Name | فحص القرين |
| Purpose | Independent peer assessment of quality management system |
| Assessor | Qualified peer reviewer (not SOCPA inspection staff) |
| Scope | Quality management system, engagement performance, compliance |
| Outcome | Review report with findings and recommendations |

### 4.2 Peer Review Components

| Component | Description | AuditOS Mapping |
|-----------|-------------|-----------------|
| Peer Review Controls (ضوابط خدمة فحص القرين) | Regulatory framework governing peer reviews | Peer Review Engine rules |
| Examiner Registry (سجل الفاحصين) | Database of qualified peer reviewers | Reviewer Directory |
| Application for Registration in Examiner Registry | Registration workflow | Onboarding workflow |
| Qualified Examiner List (قائمة الفاحصين المقيدين) | Published list of approved examiners | Public registry |

### 4.3 Peer Review Module Requirements

The AuditOS Peer Review Module must support:

1. **Peer Review Initiation** — Firm requests peer review; scope definition
2. **Reviewer Selection** — Match qualified reviewer from registry based on firm size, specialization, geography
3. **Review Execution** — Structured review against ISQM 1/2 criteria
4. **Findings Documentation** — Deficiency identification and classification
5. **Report Generation** — Standardized peer review report
6. **CAP Integration** — Corrective Action Plan linked to peer review findings
7. **Registry Management** — Maintain examiner qualifications, accreditation, expiry

## 5. Professional Licensing

### 5.1 License Categories

SOCPA defines **5 license categories** for professional practice:

| # | Category | Arabic Name | Scope | AuditOS License Type |
|---|----------|-------------|-------|---------------------|
| 1 | Audit & Accounting | محاسبة ومراجعة | Full audit and accounting services | `LICENSE_AUDIT` |
| 2 | Zakat and Tax | زكاة وضرائب | Zakat, tax, and related advisory | `LICENSE_ZAKAT_TAX` |
| 3 | VAT | ضريبة القيمة المضافة | VAT compliance and advisory | `LICENSE_VAT` |
| 4 | Accounting Services | خدمات محاسبية | Bookkeeping, financial statement preparation | `LICENSE_ACCOUNTING` |
| 5 | Financial Consulting | استشارات مالية | Financial advisory and consulting | `LICENSE_CONSULTING` |

### 5.2 License Terms

| Term | Duration | Applicability |
|------|----------|---------------|
| Full-time | 5 years | Standard professional practice |
| Part-time | 3 years | Limited scope or adjunct practice |

### 5.3 License Registry

SOCPA publishes a **Registry of Licensed Practitioners** (بيان بالمرخص لهم) containing:
- Practitioner name
- License category and number
- Issue and expiry dates
- License status (active/suspended/revoked)

### 5.4 License Management Module Requirements

The AuditOS License Management Module must support:

1. **License Lifecycle** — Application → Review → Issuance → Renewal → Suspension → Revocation
2. **Category Management** — 5 license types with distinct criteria
3. **Term Management** — 5-year and 3-year terms with automated renewal reminders
4. **Registry Publication** — Public-facing licensed practitioner directory
5. **CPD Tracking** — Continuing Professional Development linked to license renewal
6. **Status Enforcement** — Only active-license practitioners assigned to engagements

## 6. Independence & Ethics Requirements

### 6.1 Regulatory Basis

Based on SOCPA **Professional Inquiry No. 180** (detailed below in §8) and the **IESBA Code of Ethics** (الميثاق الدولي لسلوك وآداب المهنة) as adopted by SOCPA with modifications.

### 6.2 Core Independence Rules

| Rule | Detail | Source |
|------|--------|--------|
| IESBA Adoption | SOCPA adopts IESBA Code of Ethics with Saudi-specific modifications | SOCPA Standards |
| Prohibition on Combined Services | منع الجمع بين تقديم خدمات المراجعة والخدمات الأخرى — prohibition on combining audit and non-audit services | SOCPA Regulation |
| Circular 573 Exception | قائمة الخدمات الأخرى الجائز تقديمها — SOCPA Circular 573 defines permissible non-audit services during audit engagement | SOCPA Circular 573 |
| Sovereign Entities Exception | الجهات السيادية — sovereign entities exempted from certain combined service restrictions | SOCPA Regulation |
| Related Entity Scope | For PIEs, "audit client" includes related entities for independence assessment | IESBA / SOCPA |

### 6.3 Conceptual Framework Approach

SOCPA follows the IESBA conceptual framework:

1. **Identify** — Identify threats to independence
2. **Evaluate** — Evaluate significance of threats
3. **Address** — Apply safeguards to eliminate or reduce to acceptable level

### 6.4 Three Tests

The independence assessment applies three tests:

| Test | Description | Application |
|------|-------------|-------------|
| Professional Skepticism | Would a professional skeptic question the auditor's objectivity? | Self-review test |
| Professional Judgment | Does professional judgment confirm independence is maintained? | Reasonable judgment test |
| Reasonable and Informed Third Party | Would a reasonable and informed third party conclude independence is impaired? | Objective observer test |

### 6.5 Related Entity Considerations

For investment funds and similar structures:
- The audit client includes the fund and its management company
- Related entity considerations apply to portfolio investments
- Independence assessment must consider the entire fund structure

### 6.6 Independence Module Requirements

The AuditOS Independence Module must implement:

1. **Threat Identification** — Pre-defined threat categories (self-interest, self-review, advocacy, familiarity, intimidation)
2. **Safeguard Library** — Catalog of permitted safeguards with applicability rules
3. **Combined Service Checker** — Audit service + proposed non-audit service compatibility (Circular 573 integration)
4. **Related Entity Scanner** — Map engagement to related entities for PIE compliance
5. **Three-Test Engine** — Automated application of professional skepticism, judgment, and third-party tests
6. **Conclusion Workflow** — Independence conclusion with reviewer/approver gates
7. **Cooling-Off Period Tracker** — Rotations and cooling-off periods for key audit partners

## 7. Audit Report Framework

### 7.1 Regulatory Basis

Based on SOCPA **Professional Inquiry No. 174** (detailed below in §8) and ISA standards:

| Standard | Topic | AuditOS Mapping |
|----------|-------|-----------------|
| ISA 450 | Evaluation of Misstatements | Materiality Engine, Misstatement Aggregator |
| ISA 705 | Modifications to the Independent Auditor's Report | Report Generator, Opinion Selector |

### 7.2 Reporting Frameworks

SOCPA distinguishes two financial reporting frameworks:

| Framework | Description | AuditOS Template |
|-----------|-------------|------------------|
| Fair Presentation Framework | إطار العرض العادل — Requires true and fair view presentation | Fair Presentation Opinion Templates |
| Compliance Framework | إطار الامتثال — Requires compliance with specific rules | Compliance Opinion Templates |

### 7.3 Modified Opinion Types

| Opinion Type | Arabic | ISA 705 Reference | When Applicable |
|-------------|--------|-------------------|-----------------|
| Unmodified (Standard) | رأي غير معدل | ISA 700 | Financial statements free from material misstatement |
| Qualified | رأي متحفظ | ISA 705(a) | Material misstatement is not pervasive OR limitation is not pervasive |
| Adverse | رأي معارض | ISA 705(b) | Material misstatement is pervasive |
| Disclaimer | امتناع عن إبداء الرأي | ISA 705(c) | Limitation is pervasive; unable to obtain sufficient appropriate audit evidence |

### 7.4 Emphasis of Matter

SOCPA permits **Emphasis of Matter** (أمور التأكيد) paragraphs for:
- Significant uncertainties
- Going concern issues
- Subsequent events
- Prior period adjustments
- Application of new accounting standards

### 7.5 Public Sector Reporting

SOCPA provides an **Audit Report Template for Transitional Financial Statements** specifically for public sector entities, reflecting IPSAS adoption transitions.

### 7.6 Standard Opinion Wording

SOCPA prescribes standard opinion wording for compliance framework engagements, including specific language addressing:
- Compliance with SOCPA-adopted standards
- Applied regulatory framework
- Practitioner's responsibility statement
- Audit firm and license identification

### 7.7 Report Generator Requirements

The AuditOS Report Generator must implement:

1. **Opinion Selector** — Guided decision tree based on ISA 705 criteria
2. **Template Engine** — SOCPA-compliant report templates for both Fair Presentation and Compliance frameworks
3. **Dynamic Wording** — Auto-population of firm details, engagement reference, date, signatures
4. **Modified Opinion Builder** — Qualified/adverse/disclaimer paragraph generation with audit evidence justification
5. **Emphasis of Matter Inserter** — Contextual emphasis paragraphs
6. **Framework Selector** — Fair Presentation vs. Compliance framework toggle
7. **Draft → Review → Final Workflow** — Report lifecycle with partner review
8. **Export** — SOCPA-compliant PDF with Arabic-first formatting (RTL)

## 8. Professional Inquiries Database

### 8.1 Overview

SOCPA publishes **180+ professional inquiries** (استفسارات مهنية) covering accounting, auditing, ethics, and public sector topics. Each inquiry represents a real practitioner question and the official SOCPA response with standards references.

### 8.2 Inquiry Structure

Each professional inquiry contains:

| Field | Description | Example |
|-------|-------------|---------|
| Inquiry Number | Sequential identifier | 174, 177, 180 |
| Title | Brief subject line | تقييم الأخطاء وتعديل تقرير المراجع |
| Date | Publication date | Various (2018–2025+) |
| Question | Detailed practitioner inquiry | Full Arabic text of the inquiry |
| Response | Official SOCPA response | Full Arabic text with standards references |
| Standards Reference | Applicable standards | ISA 450, ISA 705, IAS 16, etc. |

### 8.3 Identified Inquiries (Partial Inventory)

The following specific inquiries were identified during the extraction:

| # | Inquiry Title | Standards | Category |
|---|--------------|-----------|----------|
| 173 | Revenue Recognition | IFRS 15 | Accounting |
| 174 | Evaluation of Misstatements & Audit Report Modification | ISA 450, ISA 705 | Auditing |
| 175 | IFRS for SMEs Application | IFRS for SMEs | Accounting |
| 176 | Consolidation Requirements | IFRS 10 | Accounting |
| 177 | Lease Accounting | IFRS 16 | Accounting |
| 178 | Accounting Policies, Equity Classification | IAS 8, IAS 32/33, IFRS for SMEs | Accounting |
| 179 | PPE and Leases | IAS 16, IFRS 16 | Accounting |
| 180 | Independence and Combined Services | IESBA Code of Ethics | Ethics |

### 8.4 Category Distribution

Based on available inquiries, the distribution approximates:

| Category | Count (Approx.) | AuditOS Use |
|----------|----------------|-------------|
| Accounting Standards (IFRS/IAS) | Most numerous | AI Training — IFRS interpretation |
| Auditing Standards (ISA) | Moderate | AI Training — Audit methodology |
| Ethics & Independence | Small set | Independence Module rules |
| Non-profit Entity Standards | Small set | Non-profit audit templates |
| Public Sector (IPSAS) | Small set | Government audit templates |
| IFRS for SMEs | Small set | SME methodology |

### 8.5 Knowledge Base Requirements

The AuditOS Knowledge Base must:

1. **Import** — All 180+ inquiries as structured records with full text
2. **Index** — Full-text Arabic search with category/standard filters
3. **Cross-reference** — Link inquiries to standards, guidance, and audit program steps
4. **AI Training Corpus** — Use inquiries as training data for AuditOS AI Assistant
5. **Update Sync** — Track new inquiries published by SOCPA
6. **Citation** — When AI uses an inquiry in a response, cite the inquiry number

## 9. Practical Guidance Documents

### 9.1 Document Inventory

SOCPA publishes practical guidance documents (الأدلة الإرشادية) on the Quality Performance page. The following documents were identified:

| # | Document | Arabic Name | Type | AuditOS Use |
|---|----------|-------------|------|-------------|
| 1 | Audit Evidence Guide | أدلة وقرائن المراجعة الحية | Methodology | Evidence Engine design patterns |
| 2 | SME Audit Guide | دليل مراجعة المنشآت الصغيرة والمتوسطة | Methodology | SME methodology templates |
| 3 | Quality Control Guide for Small & Medium Firms | دليل رقابة الجودة في المكاتب الصغيرة والمتوسطة | Quality | QMS config for small firms |
| 4 | AML/CFT Guide | الدليل الإرشادي لمكافحة غسل الأموال وتمويل الارهاب | Compliance | AML compliance checks |
| 5 | Beneficial Owner Guide | الدليل الإرشادي لمعرفة المستفيد الحقيقي | Compliance | KYC/KYB compliance |
| 6 | Risk Assessment Guide | الدليل الإرشادي لتقييم المخاطر والاستجابات المرتبطة بها | Methodology | Risk assessment module |
| 7 | Management Override Guide | الدليل الإرشادي للتقييم الفعال للمخاطر واختبار تجاوز الإدارة | Methodology | Fraud detection patterns |
| 8 | Quality Management Standards Guides | الأدلة الإرشادية لمعايير إدارة الجودة | Quality | ISQM 1/2 implementation |
| 9 | Financing Spread Classifications | تصنيفات تمويل الانتشار والمؤشرات التحذيرية | Financial | Warning indicators |
| 10 | Targeted Financial Sanctions Guide | — | Compliance | Sanctions screening |
| 11 | New Offices Guide | الدليل الإرشادي للمكاتب الجديدة | Practice | Firm onboarding |
| 12 | Independent Auditor Report Guide | الدليل الاسترشادي لإعداد تقارير المراجع المستقل | Reporting | Report templates |
| 13 | COVID-19 Audit Considerations | — | Methodology | Special circumstances procedures |
| 14 | Practice in KSA Guide | الدليل الاسترشادي لممارسة المراجعة في المملكة | Practice | Regulatory orientation |
| 15 | Quality Indicators Guide | الدليل الإرشادي لمؤشرات جودة المراجعة | Quality | Dashboard KPIs |

### 9.2 Methodology Engine Requirements

The AuditOS Methodology Engine must support:

1. **Guide Library** — Searchable catalog of all guidance documents organized by category
2. **Template Extraction** — Extract procedural templates from guides (checklists, programs, forms)
3. **Workflow Integration** — Link guide steps to workflow stages
4. **Contextual Help** — Display relevant guide excerpts in-context during engagement execution
5. **Version Control** — Track guide updates with practitioner notifications
6. **SME-Specific** — Different methodology templates for SME vs. large firm audits (per SME Audit Guide)

## 10. AuditOS Feature Mapping

### 10.1 SOCPA-to-AuditOS Mapping Table

| SOCPA Component | AuditOS Feature | Priority | Description |
|----------------|----------------|----------|-------------|
| ISQM 1 & 2 | Quality Management System Engine | **P0** | Manage quality objectives, risks, responses; track quality metrics per ISQM framework |
| ISA Standards (200–800 series) | Compliance Matrix / Assurance Engine | **P0** | Map ISA requirements to audit program steps; track compliance; generate compliance reports |
| IESBA Code + Circular 573 | Independence Module | **P0** | Threat identification, safeguard library, combined service checker, three-test evaluation |
| 4 Quality Ratings (Excellent/Good/Acceptable/Poor) | Quality Review Scoring Engine | **P0** | Practitioner-type-aware scoring with configurable rubrics aligned to SOCPA ratings |
| Corrective Action Plans | CAP Tracker | **P0** | Full CAP lifecycle from creation to closure verification with SOCPA compliance |
| Audit Evidence Guide | Evidence Engine | **P0** | Evidence collection, classification, sufficiency evaluation, documentation automation |
| ISA 705 Report Types | Report Generator | **P0** | Opinion selection decision tree, template engine, modified paragraph builder, PDF export |
| Peer Review Service | Peer Review Module | **P1** | Peer review workflow, examiner registry, structured review, report generation |
| 5 License Types (Audit/Tax/VAT/Accounting/Consulting) | License Management | **P1** | License lifecycle, CPD tracking, registry management, expiry alerts |
| 180+ Professional Inquiries | Knowledge Base / AI Training Data | **P1** | Searchable inquiry database, cross-referenced to standards; AI training corpus |
| Quality Indicators Guide | Dashboard KPIs | **P1** | KPI templates with configurable thresholds; trend visualization; benchmarking |
| SME Audit Guide | Methodology Templates | **P1** | Reduced-scope audit programs for small and medium enterprises |
| Field Inspection Findings (2018–2021) | Deficiency Taxonomy / AI Training | **P1** | Pre-seeded finding templates; AI-assisted deficiency identification during review |
| AML/CFT Guides | Compliance Checks | **P1** | AML compliance workflow with customer due diligence, sanctions screening, transaction monitoring |
| Risk Assessment Guidelines | Risk Assessment Module | **P1** | Risk identification, assessment, response planning aligned to SOCPA guidance |
| Beneficial Owner Guide | KYC / Beneficial Owner Module | **P1** | Beneficial owner identification and verification workflow |
| Practice in KSA Guide | Onboarding & Regulatory Reference | **P1** | Regulatory orientation for new firms and practitioners |
| Independent Auditor Report Guide | Report Templates | **P1** | Template library aligned to SOCPA reporting guidance |
| New Offices Guide | Firm Onboarding | **P2** | New firm setup checklist and orientation workflow |
| Transparency Report Service | Transparency Report Module | **P2** | Report generator with SOCPA-compliant transparency sections |
| Financing Spread Classifications | Warning Indicators Dashboard | **P2** | Financial distress warning indicators and monitoring |
| Targeted Financial Sanctions Guide | Sanctions Screening | **P2** | Automated sanctions screening against OFAC/UN/SA lists |
| IPSAS Standards | Public Sector Module | **P2** | Government audit templates and methodology |
| COVID-19 Audit Considerations | Special Circumstances Methodology | **P2** | Remote auditing procedures and special considerations |
| Annual Data Program | Annual Compliance Submission | **P2** | Form-based annual submission workflow with SOCPA data templates |
| Quality Control Guide (Small/Medium Firms) | QMS Configuration | **P1** | Simplified quality management configuration for smaller firms |

### 10.2 Priority Definitions

| Priority | Definition | Implementation Window |
|----------|-----------|----------------------|
| **P0** | Core AuditOS workflow — required for v0.1 minimum viable product | Current development cycle |
| **P1** | Major feature — required for v0.2 pilot expansion | Next development cycle |
| **P2** | Enhancement — valuable but not blocking adoption | Future cycles |

## 11. Data Model Recommendations

### 11.1 Recommended Prisma Models

The following data models are recommended for the AuditOS Prisma schema. Each model includes fields, relations, and governance considerations consistent with AQLIYA's platform architecture as defined in `docs/official/aqliya-core-architecture-v1.1.md`.

---

#### 11.1.1 `QualityReview`

Records a quality review engagement (SOCPA or internal).

```prisma
model QualityReview {
  id                String @id @default(cuid())
  organizationId    String // Tenant isolation
  engagementId      String? // Link to audit engagement
  reviewerId        String // User performing the review
  practitionerType  PractitionerType // A/B/C/D
  practitionerId    String // Practitioner being reviewed
  rating            QualityRating // EXCELLENT/GOOD/ACCEPTABLE/POOR
  score             Int? // Numeric score (0-100)
  reviewDate        DateTime
  reviewType        ReviewType // SOCPA_INSPECTION / INTERNAL / PEER
  scope             String? // Scope description
  status            ReviewStatus // IN_PROGRESS / COMPLETED / APPEALED / CLOSED
  notes             String?
  createdById       String
  createdAt         DateTime
  updatedAt         DateTime

  // Relations
  areas             QualityReviewArea[]
  findings          Finding[]
  auditEvents       AuditEvent[]

  @@index([organizationId, status])
}
```

---

#### 11.1.2 `QualityReviewArea`

Defines review areas within a quality review (e.g., "Risk Assessment," "Documentation").

```prisma
model QualityReviewArea {
  id          String @id @default(cuid())
  reviewId    String
  areaCode    String // e.g., "RA-01", "DOC-02"
  areaNameAr  String
  areaNameEn  String
  maxScore    Int?
  score       Int?
  weight      Float? // Contribution to overall score
  parentId    String? // Hierarchical area structure

  // Relations
  review      QualityReview @relation(fields: [reviewId], references: [id])
  parent      QualityReviewArea? @relation("AreaHierarchy", fields: [parentId], references: [id])
  children    QualityReviewArea[] @relation("AreaHierarchy")
  questions   QualityReviewQuestion[]
}
```

---

#### 11.1.3 `QualityReviewQuestion`

Individual review checklist questions.

```prisma
model QualityReviewQuestion {
  id             String @id @default(cuid())
  areaId         String
  questionTextAr String
  questionTextEn String
  weight         Float? // Question-level weighting
  maxScore       Int
  orderIndex     Int
  category       QuestionCategory? // CRITICAL_KEY / KEY / STANDARD / EXPLORATORY

  // Relations
  area           QualityReviewArea @relation(fields: [areaId], references: [id])
  findings       Finding[]
}
```

---

#### 11.1.4 `Finding`

A deficiency or observation identified during a review.

```prisma
model Finding {
  id              String @id @default(cuid())
  reviewId        String
  questionId      String?
  engagementId    String? // Link to audit engagement if applicable
  findingCode     String? // SOCPA deficiency taxonomy code
  descriptionAr   String
  descriptionEn   String?
  severity        Severity // CRITICAL / MAJOR / MODERATE / MINOR
  recommendation  String?
  rootCause       String?
  status          FindingStatus // OPEN / IN_PROGRESS / RESOLVED / VERIFIED_CLOSED
  createdById     String
  createdAt       DateTime
  updatedAt       DateTime

  // Relations
  review          QualityReview @relation(fields: [reviewId], references: [id])
  question        QualityReviewQuestion? @relation(fields: [questionId], references: [id])
  cap             CorrectiveActionPlan[]
  auditEvents     AuditEvent[]

  @@index([reviewId, severity])
  @@index([status])
}
```

---

#### 11.1.5 `Severity`

Severity classification lookup.

```prisma
model Severity {
  code    String @id // CRITICAL / MAJOR / MODERATE / MINOR
  nameAr  String
  nameEn  String
  color   String? // Display color

  findings Finding[]
}
```

---

#### 11.1.6 `CorrectiveActionPlan`

Remediation plan linked to a finding.

```prisma
model CorrectiveActionPlan {
  id                String @id @default(cuid())
  findingId         String
  actionDescription String
  ownerId           String // User responsible
  deadline          DateTime
  status            CapStatus // DRAFT / SUBMITTED / IN_REVIEW / APPROVED / IN_PROGRESS / IMPLEMENTED / VERIFIED / CLOSED
  approvedById      String?
  approvedAt        DateTime?
  evidenceNotes     String?
  extensionRequested Boolean @default(false)
  extensionReason   String?
  createdById       String
  createdAt         DateTime
  updatedAt         DateTime

  // Relations
  finding           Finding @relation(fields: [findingId], references: [id])
  owner             User @relation("CAPOwner", fields: [ownerId], references: [id])
  approver          User? @relation("CAPApprover", fields: [approvedById], references: [id])
  auditEvents       AuditEvent[]

  @@index([findingId])
  @@index([status, deadline])
}
```

---

#### 11.1.7 `PeerReview`

Peer review engagement record.

```prisma
model PeerReview {
  id              String @id @default(cuid())
  organizationId  String // Tenant
  firmId          String // Reviewed firm
  reviewerId      String // Peer reviewer
  reviewerType    PractitionerType // Must be qualified examiner
  date            DateTime
  scope           String
  scopeAreas      String[] // Areas covered
  rating          QualityRating?
  status          PeerReviewStatus // PLANNED / IN_PROGRESS / DRAFT_REPORT / FINAL_REPORT / CLOSED
  reportContent   String?
  findings        String? // Summary of findings
  recommendations String?
  createdById     String
  createdAt       DateTime
  updatedAt       DateTime

  // Relations
  reviewer        User @relation(fields: [reviewerId], references: [id])
  auditEvents     AuditEvent[]

  @@index([organizationId, status])
}
```

---

#### 11.1.8 `Inspector`

SOCPA-authorized inspector or peer examiner.

```prisma
model Inspector {
  id                String @id @default(cuid())
  userId            String // Link to platform user
  practitionerType  PractitionerType
  specialization    String
  accreditationDate DateTime
  expiryDate        DateTime
  status            InspectorStatus // ACTIVE / EXPIRED / SUSPENDED
  createdById       String
  createdAt         DateTime
  updatedAt         DateTime

  // Relations
  user              User @relation(fields: [userId], references: [id])
  reviews           QualityReview[] // As reviewer

  @@index([status, expiryDate])
}
```

---

#### 11.1.9 `License`

Professional practice license.

```prisma
model License {
  id                String @id @default(cuid())
  organizationId    String
  practitionerId    String // User
  licenseType       LicenseType // AUDIT / ZAKAT_TAX / VAT / ACCOUNTING / CONSULTING
  licenseNumber     String @unique
  issueDate         DateTime
  expiryDate        DateTime
  term              LicenseTerm // FULL_TIME (5yr) / PART_TIME (3yr)
  status            LicenseStatus // ACTIVE / EXPIRED / SUSPENDED / REVOKED
  governingBody     String @default("SOCPA")
  notes             String?
  createdById       String
  createdAt         DateTime
  updatedAt         DateTime

  // Relations
  practitioner      User @relation(fields: [practitionerId], references: [id])
  auditEvents       AuditEvent[]

  @@index([practitionerId, status])
  @@index([organizationId, licenseType])
  @@index([expiryDate])
}
```

---

#### 11.1.10 `ProfessionalInquiry`

SOCPA professional inquiry record.

```prisma
model ProfessionalInquiry {
  id              String @id @default(cuid())
  inquiryNumber   Int @unique
  title           String
  titleAr         String?
  questionText    String // Full Arabic question text
  responseText    String // Full Arabic response text
  standardsRef    String[] // E.g., ["IFRS 16", "IAS 16"]
  category        InquiryCategory // ACCOUNTING / AUDITING / ETHICS / PUBLIC_SECTOR / NON_PROFIT
  datePublished   DateTime?
  sourceUrl       String?
  tags            String[]
  importedAt      DateTime @default(now())
  isActive        Boolean @default(true)

  @@index([inquiryNumber])
  @@index([category])
  @@index([standardsRef])
}
```

---

#### 11.1.11 `IndependenceCheck`

Independence assessment record for an engagement.

```prisma
model IndependenceCheck {
  id              String @id @default(cuid())
  engagementId    String
  checkedById     String
  checkDate       DateTime @default(now())
  threats         String[] // Identified threat categories
  safeguards      String[] // Applied safeguards
  combinedService Boolean? // Is a non-audit service being provided?
  circular573Ref  String? // Reference to Circular 573 if applicable
  conclusion      IndependenceConclusion // INDEPENDENT / NOT_INDEPENDENT / CONDITIONALLY_INDEPENDENT
  conclusionNotes String?
  nextReviewDate  DateTime?
  reviewedById    String?
  reviewedAt      DateTime?
  status          CheckStatus // DRAFT / FINAL / SUPERSEDED
  createdById     String
  createdAt       DateTime
  updatedAt       DateTime

  // Relations
  auditEvents     AuditEvent[]

  @@index([engagementId, status])
  @@index([conclusion])
}
```

---

#### 11.1.12 `AuditReport`

Audit report record with opinion framework.

```prisma
model AuditReport {
  id              String @id @default(cuid())
  engagementId    String
  opinionType     OpinionType // UNMODIFIED / QUALIFIED / ADVERSE / DISCLAIMER
  framework       ReportingFramework // FAIR_PRESENTATION / COMPLIANCE
  draftContent    String?
  finalContent    String?
  addressee       String?
  signingDate     DateTime?
  emphasisOfMatter String? // Emphasis of Matter paragraph
  otherMatters    String? // Other Matter paragraph
  reportVersion   Int @default(1)
  status          ReportStatus // DRAFT / UNDER_REVIEW / FINAL / ISSUED / SUPERSEDED
  preparedById    String
  reviewedById    String?
  approvedById    String?
  approvedAt      DateTime?
  createdById     String
  createdAt       DateTime
  updatedAt       DateTime

  // Relations
  auditEvents     AuditEvent[]

  @@index([engagementId, status])
  @@index([opinionType])
}
```

---

#### 11.1.13 `GuidanceDocument`

SOCPA practical guidance document metadata.

```prisma
model GuidanceDocument {
  id              String @id @default(cuid())
  titleAr         String
  titleEn         String?
  category        GuidanceCategory // METHODOLOGY / QUALITY / COMPLIANCE / REPORTING / PRACTICE
  url             String? // Source URL on socpa.org.sa
  description     String?
  fileType        String? // PDF, HTML, etc.
  fileSize        Int?
  isDownloadable  Boolean @default(true)
  requiresAuth    Boolean @default(false)
  publishedDate   DateTime?
  version         String?
  tags            String[]
  isActive        Boolean @default(true)
  importedAt      DateTime @default(now())

  @@index([category])
}
```

### 11.2 Common Model Fields

All models should include AQLIYA platform-standard governance fields:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | `String @id @default(cuid())` | Primary key |
| `organizationId` | `String` | Tenant isolation (all tenant-scoped models) |
| `createdById` | `String` | Who created the record |
| `updatedById` | `String?` | Who last updated the record |
| `createdAt` | `DateTime @default(now())` | Creation timestamp |
| `updatedAt` | `DateTime @updatedAt` | Last update timestamp |

### 11.3 Enumerations

The following enums should be defined in the Prisma schema:

```prisma
enum PractitionerType {
  CPA       // محاسب قانوني
  ZAKAT_TAX // زكاة وضرائب
  VAT       // ضريبة القيمة المضافة
  ACC_SVC   // خدمات محاسبية
}

enum QualityRating {
  EXCELLENT  // ممتاز
  GOOD       // جيد
  ACCEPTABLE // مقبول
  POOR       // ضعيف
}

enum Severity {
  CRITICAL
  MAJOR
  MODERATE
  MINOR
}

enum LicenseType {
  AUDIT      // محاسبة ومراجعة
  ZAKAT_TAX  // زكاة وضرائب
  VAT        // ضريبة القيمة المضافة
  ACCOUNTING // خدمات محاسبية
  CONSULTING // استشارات مالية
}

enum OpinionType {
  UNMODIFIED
  QUALIFIED
  ADVERSE
  DISCLAIMER
}
```

## 12. Data Sources & Access Notes

### 12.1 Access Levels

Based on extraction from socpa.org.sa, data falls into three access categories:

| Access Level | Description | Example | AuditOS Impact |
|-------------|-------------|---------|----------------|
| **Public** | Accessible without authentication | Professional inquiries, standards lists, guidance document titles | Fully importable; no restrictions |
| **Downloadable** | Requires direct URL access; no login | PDF downloads of practical guides, standards documents | Importable; verify license terms for commercial use |
| **E-Service** | Requires SOCPA e-service login (user registration) | Full inspection checklists, audit programs, detailed review forms | Requires manual extraction or client-provided data |

### 12.2 URL Patterns

SOCPA's Kentico CMS uses specific URL patterns:

| Pattern | Content Type | Example |
|---------|-------------|---------|
| `/ar/...` | Arabic content | `/ar/quality-performance` |
| `/en/...` | English content | `/en/quality-performance` |
| `GetFile.aspx?...` | File downloads | Document PDFs |
| `InquiryDetails.aspx?ID=...` | Professional inquiry | Individual inquiry pages |

### 12.3 Import Recommendations

| Data Type | Import Strategy | Automation Level |
|-----------|----------------|------------------|
| Professional Inquiries | Web scraping → Structured JSON → Prisma seed | High (public pages) |
| Standards Metadata | Manual extraction → YAML config → Prisma seed | Medium (structured but requires validation) |
| Guidance Document Index | Web scraping → Document registry | High (public index) |
| Inspection Checklists | Manual (e-service restricted) | Low (requires client or SOCPA cooperation) |
| Deficiency Taxonomy | From field inspection reports PDF → Structured taxonomy | Medium (PDF parsing required) |
| Quality Indicators | From Quality Indicators Guide PDF → KPI templates | Medium (PDF parsing) |

### 12.4 Digital Library Consideration

SOCPA's digital library (المكتبة الرقمية) requires authentication for some resources. AuditOS should:
1. Track which documents require authentication
2. Allow firms to upload their own copies for internal use
3. Respect access restrictions in the platform

## 13. Next Steps for AuditOS

### 13.1 Prioritized Implementation Roadmap

| # | Task | Dependencies | Effort Estimate | Primary Models |
|---|------|-------------|-----------------|----------------|
| 1 | **Design Prisma schema** for models in §11 | None | Medium (1-2 sprints) | All models in §11 |
| 2 | **Build Quality Review Engine** with 4-track (A/B/C/D), 4-level (Excellent/Poor) classification | Schema complete | Large (2-3 sprints) | QualityReview, QualityReviewArea, QualityReviewQuestion, Finding, Severity |
| 3 | **Implement Independence Module** with IESBA Code integration + Circular 573 | Schema complete | Medium (1-2 sprints) | IndependenceCheck, ProfessionalInquiry |
| 4 | **Build ISA Compliance Matrix** (ISA 200–800 series) | Schema complete | Large (2-3 sprints) | Compliance matrix models (new) |
| 5 | **Design Evidence Engine** per SOCPA Audit Evidence Guide patterns | Schema complete | Medium (1-2 sprints) | Evidence (existing) + Finding |
| 6 | **Build Report Generator** with ISA 705 opinion templates | ISA Matrix complete | Medium (1-2 sprints) | AuditReport |
| 7 | **Import professional inquiries** as seed data for AI Knowledge Base | Schema complete | Small (1 sprint) | ProfessionalInquiry, GuidanceDocument |
| 8 | **Design CAP tracking workflow** per SOCPA corrective action mechanism | Quality Review Engine complete | Medium (1 sprint) | CorrectiveActionPlan |
| 9 | **Build Dashboard** with quality indicators from SOCPA guide | Quality Review Engine complete | Medium (1 sprint) | Aggregation queries on review models |
| 10 | **Create seed data packages** for demo/training scenarios | Models seeded | Small (1 sprint) | All models |

### 13.2 Implementation Sequence (Recommended)

```
Sprint 1-2:  Foundation
  ├── Prisma schema (all models)
  ├── Basic CRUD server actions
  └── Seed data: practitioner types, severity, license types

Sprint 3-4: Quality Review Engine
  ├── Quality review CRUD
  ├── Practitioner type classification
  ├── Scoring with 4-level rating
  └── Review area/question management

Sprint 5: CAP Tracker
  ├── CAP creation from findings
  ├── Workflow (Draft → ... → Closed)
  └── Deadline management and escalation

Sprint 6: Independence Module
  ├── Independence check workflow
  ├── Threat identification library
  └── Circular 573 combined service checker

Sprint 7-8: ISA Compliance + Report Generator
  ├── ISA standards matrix
  ├── Opinion selector
  └── Report template engine

Sprint 9: Knowledge Base + Dashboard
  ├── Professional inquiry import
  ├── Full-text search
  └── Quality indicator dashboard

Sprint 10: Polish + Seed Data
  ├── Complete seed datasets
  ├── Demo/training scenarios
  └── Documentation
```

### 13.3 Key Architecture Decisions

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Practitioner Types | Enum in Prisma, extendable via admin | SOCPA defines fixed types; admin extension for future categories |
| Quality Ratings | Fixed enum with configurable score ranges | SOCPA ratings are fixed; scoring thresholds may vary |
| CAP Status | State machine with guard transitions | Regulatory requirement for controlled workflow |
| Report Templates | Template engine with SOCPA-prescribed wording | Compliance requires standard wording; customization risk |
| Inquiry Storage | Full-text PostgreSQL with Arabic search | Arabic FTS requires careful configuration (pg_trgm + ICU) |
| Tenant Isolation | organizationId on all tenant-scoped models | AQLIYA Core requirement |
| Audit Trail | AuditEvent model (shared AQLIYA Core) | Platform governance requirement |

### 13.4 Open Questions

| Question | Needed From | Impact |
|----------|-------------|--------|
| Does SOCPA provide API access for any of these services? | SOCPA / Client | High — if API available, reduces scraping needs |
| Are full inspection checklists available in structured format (Excel/JSON) or only PDF? | SOCPA E-Service login | High — determines import complexity |
| Can licensed firms grant AuditOS access to their SOCPA e-service account for data sync? | Legal / Client | Medium — enables real-time compliance status |
| What is the license/copyright status of SOCPA content for use in commercial software? | Legal / SOCPA | High — determines if content is importable |
| Does SOCPA require audit software to be certified or approved? | SOCPA | Critical — regulatory requirement |
| Are guidance documents available in editable format (Word/XML) or only PDF? | SOCPA E-Service | Medium — determines template extraction approach |

---

## Appendix A: Terminology Reference

| English Term | Arabic Term | Context |
|-------------|-------------|---------|
| SOCPA | الهيئة السعودية للمراجعين والمحاسبين | Regulator |
| Quality Performance Monitoring Program | برنامج مراقبة جودة الأداء المهني | Quality reviews |
| Corrective Action Plan | الخطة التصحيحية | Remediation |
| Peer Review | فحص القرين | Independent review |
| Professional Inquiry | استفسار مهني | Published Q&A |
| Practitioner | ممارس | Licensed professional |
| Quality Rating | تصنيف الجودة | ممتاز/جيد/مقبول/ضعيف |
| Audit Evidence | أدلة وقرائن المراجعة | Evidence collection |
| Transparency Report | تقرير الشفافية | Public accountability |
| Independence | الاستقلال | Ethics requirement |
| Combined Services | الجمع بين الخدمات | Audit + non-audit |
| Adoption Document | وثيقة اعتماد | Standards adoption |

---

## Appendix B: Document References

| Reference | Source | Accessed |
|-----------|--------|----------|
| SOCPA Quality Performance Page | socpa.org.sa/quality-performance | 2026-06-10 |
| SOCPA Professional Inquiries | socpa.org.sa/inquiries | 2026-06-10 |
| SOCPA Licensing | socpa.org.sa/licensing | 2026-06-10 |
| SOCPA Standards | socpa.org.sa/standards | 2026-06-10 |
| Inquiry No. 174 — ISA 450/705 | socpa.org.sa | 2026-06-10 |
| Inquiry No. 180 — IESBA Code | socpa.org.sa | 2026-06-10 |

---

## Document Metadata

| Property | Value |
|----------|-------|
| **File** | `docs/socpa-auditos-technical-analysis.md` |
| **Product** | AuditOS under AQLIYA |
| **Doc Level** | Level 5 — Product/System (per `docs/DOCUMENTATION_AUTHORITY.md`) |
| **Status** | Technical Specification / Planning Document |
| **Last Updated** | 2026-06-10 |
| **Next Review** | When SOCPA data is updated or AuditOS implementation begins |
