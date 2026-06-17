# LocalContentOS — Product Doctrine

**Version:** 1.0  
**Status:** Product identity decision document  
**Date:** 2026-06-16  
**Authority:** This document supersedes any conflicting local-content positioning in pre-existing discovery-pack docs. It is subordinate only to `docs/official/` doctrine documents.

---

## 1. Answers to the Five Questions

### 1.1 What is the product category?

> **C. Local Content Intelligence Platform**

**Rationale:** LocalContentOS is neither a certification platform (Option A) nor a verification platform (Option B). It is an **internal governed intelligence system** that helps organizations understand, evidence, and improve their local content position — without pretending to be an LCGPA-certified calculation engine or a licensed audit firm's AUP tool.

**Evidence:**

| Factor | Finding | Source |
|--------|---------|--------|
| Export disclaimers | "هذا ليس تقرير امتثال نظامي معتمد من جهة تنظيمية" — explicitly disclaims regulatory certification | `src/lib/local-content/export.ts` lines 28-33 |
| Scoring engine | Proprietary composite weights (locality 40 + ownership 25 + workforce 20 + declaredContent 15), NOT the official LCGPA 4-component formula | `src/lib/local-content/scoring.ts` lines 15-20 |
| Original product definition | "NOT a regulatory submission system" and "NOT an official local content calculation engine with binding legal formulas" | `docs/products/localcontentos-discovery-pack/product-definition.md` lines 44-49 |
| Product taxonomy | Classified as "Specialized Operating System" — a capability on the AQLIYA platform, not a compliance product | `docs/official/aqliya-product-taxonomy-v1.1.md` line 29 |
| What exists in code | Supplier classification, spend analytics, evidence management, review/approval workflows, readiness checklist — NOT an LCGPA certificate generator | `prisma/schema.prisma` lines 1751-1997, `src/lib/local-content/services.ts` |

**Counterfactual check:** If LocalContentOS were a Certification Platform (Option A), export disclaimers would not exist, the scoring engine would implement the LCGPA formula, and there would be AUP report generation. None of these exist. If it were a Verification Platform (Option B), it would need sampling engines, statistical methodology, and licensed auditor workflows — none of which exist. The current codebase fits Option C precisely.

---

### 1.2 Who is the primary buyer?

> **Internal compliance, procurement, and finance teams** — NOT audit firms, NOT government entities as regulators.

**Buyer hierarchy:**

| Rank | Buyer | Org Role | What They Need | Evidence from Code |
|------|-------|----------|----------------|-------------------|
| 1 | **Local Content Manager** | Internal operational owner | Tools to classify suppliers, attach evidence, run review/approval, generate reports | Full classification + evidence + review/approval workflows |
| 2 | **Procurement Director** | Process owner | Repeatable governed process for supplier local content assessment | Supplier CRUD, spend analytics, classification rules |
| 3 | **CFO / Finance Manager** | Decision-maker | Reliable local content percentage with evidence trail | Scoring engine, spend breakdown, PDF/XLSX exports |
| 4 | **Compliance Officer** | Risk owner | Audit-ready documentation trail | Full audit event model, evidence linking, approval snapshots |
| 5 | **Procurement Analyst** | Daily user | Efficient data entry, classification, and exception tracking | All 12 workspace routes, server actions |
| 6 | **CEO / Executive** | Sponsor | Dashboard view, trend analysis, tender readiness | Project dashboards, analytics, tender matching |

**Who is NOT the buyer:**
- Licensed audit firms — they use their own AUP methodologies, not a software tool
- LCGPA itself — they have their own portal
- Government procurement officers — they receive reports, they don't produce them

**Evidence from discovery pack:**
> ICP segments: Large Saudi private companies, Government suppliers, Semi-government contractors, Procurement-heavy companies, Companies with local content obligations
> Buyers: CFO, Procurement Director, Local Content Manager, Compliance Officer
> Source: `docs/products/localcontentos-discovery-pack/icp-and-use-cases.md`

> "LocalContentOS is an internal governance system that helps you prepare evidence-backed reports. Direct regulatory integration is a future possibility, not a current feature."
> Source: `docs/products/localcontentos-discovery-pack/commercial-positioning.md` line 104

---

### 1.3 What is the moat?

> **Governed Local Content Intelligence** — the combination of (a) supplier classification with evidence linking, (b) governed review/approval workflow with audit trail, (c) period-over-period spend intelligence, (d) readiness assessment against audit criteria, and (e) bilingual Arabic-first UX — all on a single platform that connects classification decisions to evidence to reports to audit logs.

**Specific defensible advantages:**

| Moat Component | What It Means | Competitors Don't Have |
|----------------|---------------|------------------------|
| **Evidence-linked classification** | Every local/non-local decision is tied to source files (CR, invoice, certificate) | Spreadsheets and ERPs don't link evidence to classification decisions |
| **Governed workflow** | Draft → Evidence → Review → Approval → Locked → Export with full audit trail | ERPs have approval but no local-content-specific workflow with evidence gating |
| **Period-over-period intelligence** | Track LC% changes across reporting periods with trend analytics | Manual tools have no historical continuity |
| **Readiness assessment** | 36-item LCGPA-aligned audit matrix as a self-assessment tool | No other tool maps LC data to audit readiness |
| **Bilingual Arabic-first** | All labels, reports, and exports in Arabic with RTL support | Most tools are English-first or poorly localized |
| **Tender preparation** | Match supplier/classification data to tender requirements | ERPs don't do tender-specific LC reporting |
| **AQLIYA platform inheritance** | RBAC, audit logs, tenant isolation, evidence graph — shared with AuditOS, DecisionOS | Standalone tools have no cross-product governance inheritance |

**What the moat is NOT:**
- NOT the scoring formula — the proprietary composite weights are not defensible as a "better LC formula" and should be replaced with transparent configurable policy rules
- NOT LCGPA certification — that belongs to licensed auditors
- NOT AI-powered classification — the system is deterministic; AI is not the differentiator
- NOT the data itself — organizations own their data

**True moat = governed evidence workflow applied to local content.** The defensible value is in the governance, not the calculation.

---

### 1.4 If LocalContentOS disappeared tomorrow, what unique capability would customers lose?

> **The ability to run a governed, evidence-based, audit-trailed local content assessment process that connects supplier classification → evidence → review → approval → export in one system — without spreadsheets.**

Specifically, customers would lose:

1. **Single unified workspace** — 12 integrated routes with classification, evidence, findings, review, approval, and export in one place. Scattered data in Excel and ERP exports would return.

2. **Evidence-linked classification history** — Every local/non-local supplier decision tied to supporting documents. Today: one click to see what evidence supports a classification. Gone: back to folder structures and email chains.

3. **Governed workflow** — Structured draft → evidence → review → approval flow with role-based gates. Gone: back to email approvals and undocumented decisions.

4. **Audit trail** — Immutable log of every classification change, review action, approval decision. Gone: back to "who changed this number last?"

5. **Readiness self-assessment** — 36-item LCGPA-aligned verification matrix showing audit readiness by section (workforce, supply chain, capex, closeout). Gone: back to manual checklists.

6. **Bilingual Arabic-first reporting** — PDF and XLSX exports with full Arabic text, RTL layout, and formatted numbers. Gone: back to English-only or poorly formatted Arabic reports.

7. **Integration-ready connectors** — SAP, Oracle, and CSV import pipelines with field mapping. Gone: back to manual data preparation.

**Summary:** Customers would lose an *organizational capability* — the ability to run a governed, repeatable, evidence-backed local content assessment process. They would not lose a calculation engine (they have Excel) or a certification path (they have auditors). They would lose the governance layer that makes LC numbers defensible.

---

### 1.5 Compare current architecture vs required architecture for the chosen doctrine

#### Current Architecture (as-built)

```
User (Procurement, LC Manager, Compliance)
  │
  ├── 12 Workspace Routes (/local-content/*)
  │   ├── Dashboard
  │   ├── Projects → Suppliers → Spend → Classification
  │   ├── Evidence → Findings → Review → Approval → Reports
  │   └── Audit Trail
  │
  ├── Scoring Engine (proprietary composite)
  │   ├── Locality (40) + Ownership (25) + Workforce (20) + DeclaredContent (15)
  │   └── Output: SupplierScore, SpendBreakdown, localContentPercentage
  │
  ├── Evidence Engine
  │   ├── File upload with type/status tracking
  │   ├── Evidence → Supplier / Spend / Finding linking
  │   └── Manual review workflow
  │
  ├── Verification Checklist (36-item matrix)
  │   ├── Loaded from knowledge JSON
  │   └── Manual status tracking
  │
  ├── Export Engine (PDF + XLSX)
  │   ├── Assessment summary, Spend classification, Evidence index
  │   └── DISCLAIMER: not regulatory compliance
  │
  └── ERP Connectors (SAP, Oracle, CSV)
      └── Field mapping, review pipeline
```

#### Required Architecture (for "Local Content Intelligence Platform")

```
User (Procurement, LC Manager, Compliance, CFO)
  │
  ├── Same 12 Workspace Routes (preserve)
  │   └── No structural changes needed
  │
  ├── Scoring Engine (REFACTOR: replace proprietary with configurable policy engine)
  │   ├── Current: hardcoded weights (40/25/20/15)
  │   ├── Required: user-configurable policy templates
  │   │   ├── "Standard" — current weights (backward compatible)
  │   │   ├── "LCGPA Readiness" — 4-component awareness (not calculation)
  │   │   └── "Custom" — user-defined weights per org policy
  │   └── Metric naming: `internalLocalContentPercentage` vs `localContentPercentage`
  │       to avoid implying regulatory endorsement
  │
  ├── Evidence Engine (STRENGTHEN — reinforce existing)
  │   ├── Current: functional but manual
  │   ├── Required: bulk upload, expiry tracking, automated reminders
  │   └── Required: evidence coverage scoring (exists already, good)
  │
  ├── Verification Checklist (KEEP — document its role)
  │   ├── Current: 36-item LCGPA-aligned audit matrix
  │   ├── Required: Label as "Readiness Self-Assessment" not "Audit"
  │   └── Required: Generate readiness report separately from assessment report
  │
  ├── Export Engine (IMPROVE — clarify positioning)
  │   ├── Current: disclaimers are good
  │   ├── Required: Add explicit "Internal Management Report" label to PDF cover
  │   └── Required: Separate readiness assessment PDF from internal assessment PDF
  │
  ├── Tender Matching (KEEP — aligns with intelligence positioning)
  │   └── Document as "tender preparation aid" not "compliance checker"
  │
  ├── ERP Connectors (KEEP)
  │   └── Intelligence input, not compliance output
  │
  └── NEW: Benchmarking Module (intelligence, not compliance)
      ├── Aggregate anonymized metrics across projects
      ├── Period-over-period trend engine
      └── Industry sector comparison (opt-in, anonymized)
```

#### Gap Analysis between Current and Required

| Area | Current | Required | Gap Severity | Action |
|------|---------|----------|--------------|--------|
| Scoring engine | Proprietary hardcoded weights | Configurable policy engine | Medium | Refactor — replace hardcoded weights with configurable policy templates |
| Metric naming | `localContentPercentage` implies regulatory metric | `internalLocalContentPercentage` | Low | Rename or alias |
| Evidence expiry tracking | None | Track certificate/CR expiry dates | Low | Add expiry date field + alert |
| Bulk evidence upload | None | Multiple file upload | Low | UX improvement |
| Verification checklist | Unlabeled — ambiguous role | Labeled as "Readiness Self-Assessment" | Low | Documentation + UI label change |
| Report differentiation | Single report type | Three distinct report types: Internal Assessment, Readiness Assessment, Tender Brief | Medium | Split export engine |
| Benchmarking | None | Cross-project, cross-period, cross-sector | Medium | New module (intelligence value) |
| Policy UI | Classification rules in metadata | Configurable scoring policy UI | Low | Admin UI for policy templates |
| API access for consumers | None | Read API for downstream consumers (e.g., tender teams) | Low | REST read endpoints |
| Audit firm handoff | None | Export working-paper-ready data package for auditors | Low | Data extract in standard format |
| LCGPA formula | Absent by design | Should remain absent — not part of this doctrine | N/A | Explicit non-goal |
| Certification workflow | Absent by design | Should remain absent — not part of this doctrine | N/A | Explicit non-goal |

**Key insight:** The current architecture is **80% aligned** with the chosen doctrine. The gaps are in labeling, configurability, and intelligence expansion — NOT in fundamental architecture. This is a much better fit than the gap analysis suggested under the (incorrect) assumption that LocalContentOS should be an LCGPA certification platform.

---

## 2. Product Definition

### 2.1 One-Liner

**English:** A governed local content intelligence platform that helps organizations classify supplier spend, link evidence, run review/approval workflows, assess audit readiness, and generate intelligence reports — on the AQLIYA platform.

**Arabic:** منصة ذكاء محتوى محلي محكوم تساعد الجهات على تصنيف إنفاق الموردين، وربط الأدلة، وتشغيل مهام المراجعة والاعتماد، وتقييم جاهزية التدقيق، وإعداد تقارير ذكية — على منصة عقلية.

### 2.2 What It Is

- A governed workspace for supplier local content assessment
- An evidence-linked classification engine (local vs non-local vs mixed vs unclassified)
- A review/approval workflow with full audit trail
- A readiness self-assessment tool aligned to regulatory frameworks
- A tender preparation aid for government contract bidding
- A bilingual Arabic-first reporting platform
- An intelligence layer that provides period-over-period trend analysis

### 2.3 What It Is NOT

| Not This | Because |
|----------|---------|
| NOT an LCGPA certification platform | Certification requires licensed AUP audits and LCGPA portal submission — that is the domain of audit firms, not this product |
| NOT a regulatory compliance engine | The export disclaimer explicitly states: "هذا ليس تقرير امتثال نظامي معتمد من جهة تنظيمية" |
| NOT a replacement for licensed auditors | AUP engagements under ISRS 4400 require licensed audit firms with professional judgment |
| NOT an official LC% calculator per LCGPA methodology | The scoring engine uses proprietary/organizational policy weights, not the official 4-component LCGPA formula |
| NOT an ERP or procurement system | It consumes ERP data; it doesn't replace procurement transactions |
| NOT a generic AI tool | All classifications are deterministic, evidence-based, and human-approved |
| NOT a data room or document management system | Evidence is linked to classifications, not stored as a general document repository |

### 2.4 Core Value Proposition

> **Make your local content numbers defensible.**

Most organizations track local content in spreadsheets. The numbers exist, but when asked "can you prove this?" — the trail goes cold.

LocalContentOS ensures every classification decision is linked to evidence, reviewed by a human, approved by an authorized person, and recorded in an immutable audit trail. The result is a local content position that can withstand internal audit, external review, and tender scrutiny.

---

## 3. Buyer Definition

### 3.1 Primary Buyer Persona

| Attribute | Detail |
|-----------|--------|
| **Title** | Local Content Manager / Local Content Officer |
| **Department** | Local Content / Compliance / Supply Chain |
| **Organization** | Large Saudi company, government supplier, or semi-government contractor |
| **Pain** | No governed system to track, evidence, and report local content. Manual Excel. Scattered evidence. No audit trail for classification decisions. |
| **Need** | A repeatable, governed process that produces defensible numbers |
| **Buying authority** | Recommender — decision requires Director/CFO approval |
| **Technical comfort** | Moderate — comfortable with web applications but not a developer |
| **Language** | Arabic primary, English secondary |
| **Trigger event** | Annual LC reporting cycle, government tender requiring LC declaration, internal compliance mandate |

### 3.2 Secondary Buyers

| Title | Role in Decision | What They Care About |
|-------|-----------------|---------------------|
| Procurement Director | Recommender/influencer | Process efficiency, procurement governance |
| CFO | Approver | Defensible LC numbers, audit readiness, cost |
| Compliance Officer | Recommender/influencer | Audit trail, regulatory alignment |
| CEO | Decision-maker (for pilot) | Strategic positioning, Vision 2030 alignment |

### 3.3 Who Is NOT a Buyer

| Persona | Why Not |
|---------|---------|
| Licensed audit firms | They perform AUP engagements under ISRS 4400 — they need audit methodology software, not LC intelligence |
| LCGPA | They operate the national portal, the mandatory list, and the certification process |
| Government procurement officers | They receive LC data, they don't produce it |
| ERP vendors | They sell transaction systems, not governance layers |

---

## 4. Moat Definition

### 4.1 The Moat

> **Governed Local Content Intelligence** — the only system that connects supplier classification → evidence linking → review/approval workflow → audit readiness assessment → bilingual reporting in one governed platform.

### 4.2 What Makes It Hard to Replicate

1. **Evidence-workflow binding** — Every classification is linked to source files AND must pass through review/approval gates. An ERP cannot do this without heavy customization. A spreadsheet cannot do it at all.

2. **Process governance** — The state machine (Draft → DataCollection → Classification → EvidenceReview → Findings → Review → Approval → ReportReady → Exported) is purpose-built for local content. Generic workflow tools lack local-content-specific states, evidence gating, and classification logic.

3. **Audit trail completeness** — Every mutation across 10 models (Project, Supplier, SpendRecord, Classification, Evidence, Finding, Review, Approval, Report, AuditEvent) is logged. This data model is specific to local content governance.

4. **Readiness assessment** — The 36-item verification matrix maps internal data to regulatory audit criteria. This is a domain-specific knowledge asset that cannot be replicated without LCGPA methodology expertise.

5. **Bilingual domain terminology** — "local content," "locality classification," "Saudization," "mandatory list," "price preference" — these terms have specific Arabic translations and regulatory meanings embedded in the data model.

6. **Platform inheritance** — Built on AQLIYA Core which provides RBAC, tenant isolation, audit logs, and evidence graph — shared with AuditOS and DecisionOS. A standalone tool would need to build all of this from scratch.

### 4.3 What the Moat Is NOT

- Not the scoring formula (configurable by design)
- Not the data (customer-owned)
- Not AI (deterministic by design)
- Not regulatory certification (not the goal)
- Not ERP integration (connectors exist but are not unique)

### 4.4 Competitive Positioning

| Competitor Type | What They Do | LocalContentOS Advantage |
|----------------|--------------|--------------------------|
| **Excel** | Manual tracking, no governance | Governed workflow, evidence linking, audit trail, version control |
| **ERP (SAP, Oracle)** | Transaction processing, limited classification | Evidence management, review/approval, audit trail, readiness assessment |
| **Generic workflow tools** | General-purpose process automation | Purpose-built local content domain model, 36-item audit matrix, LC-specific terminology |
| **LCGPA portal** | Certification submission, certificate issuance | Internal governance BEFORE submission — prep platform not a submission portal |
| **Consulting firms** | Manual assessments, Excel-based | Repeatable process, institutional memory, period-over-period continuity |
| **Custom-built solutions** | Bespoke for single company | Multi-tenant platform, shared intelligence, benchmarking, continuous improvement |

---

## 5. Non-Goals

These are explicitly OUT of scope for LocalContentOS:

### 5.1 Permanently Out of Scope

| Non-Goal | Rationale |
|----------|-----------|
| LCGPA certification | Certification is the domain of LCGPA and licensed audit firms. Building a certification engine would require regulatory accreditation the platform cannot obtain. |
| AUP report generation | Agreed Upon Procedures reports under ISRS 4400 require licensed auditor judgment. A software tool cannot produce a valid AUP report. |
| Official LC% calculation per LCGPA formula | The official 4-component formula (Workforce 100/37, G&S, Asset Depreciation 100/20, Capacity Building 100) is used by LCGPA for certification. LocalContentOS provides internal policy-based scoring. |
| Regulatory submission | Direct submission to LCGPA, ZATCA, GOSI, or other government portals is outside scope. The system prepares data; organizations submit via official channels. |
| GOSI/ZATCA API integration | Integration with government databases for automated verification is a future compliance feature, not an intelligence feature. It would also introduce data privacy and security concerns beyond the current threat model. |
| Mandatory list compliance checking | The mandatory list changes frequently and is managed by LCGPA. Real-time compliance checking would require direct LCGPA API access, which does not exist. |

### 5.2 Deferred (Not for v0.1/v0.2)

| Deferred Feature | Why Deferred |
|-----------------|--------------|
| Workforce/asset/capacity building data models | These are required for LCGPA formula alignment, which is a non-goal. If customers need to track these for their own policy, they can be added later via configuration, not schema. |
| Statistical sampling engine | Required for AUP audit, which is a non-goal. |
| Automated evidence matching | Would require AI/ML pipeline, which adds complexity without core intelligence value. |
| Direct ERP write-back | Writing classification results back to ERP is a complex integration that serves procurement process automation, not LC intelligence. |
| Public API for third-party consumers | Possible future capability but not required for current positioning. |

---

## 6. Required Capabilities

### 6.1 Currently Implemented (Preserve)

| Capability | Status | Notes |
|-----------|--------|-------|
| Project management with lifecycle states | ✅ Implemented | 12 states from Draft to Archived |
| Supplier CRUD with locality classification | ✅ Implemented | 4 locality types (local, non_local, mixed, unclassified) |
| Spend record management with categorization | ✅ Implemented | 6 categories (goods, services, construction, technology, logistics, other) |
| Classification engine with review workflow | ✅ Implemented | 4 classification bases, 4 confidence levels, 4 review statuses |
| Evidence upload, linking, and review | ✅ Implemented | 6 evidence types, 6 statuses |
| Finding/gap identification | ✅ Implemented | 5 finding types with severity |
| Review workflow (submit/return/comment) | ✅ Implemented | Reviewer assignment, status tracking |
| Approval workflow with snapshot | ✅ Implemented | Approve/reject with full scoring snapshot |
| Report generation (PDF + XLSX) | ✅ Implemented | 3 report types with Arabic support |
| Audit trail for all mutations | ✅ Implemented | 8 entity types tracked |
| Tender matching engine | ✅ Implemented | Based on project classification data |
| Readiness self-assessment (36-item matrix) | ✅ Implemented | LCGPA-aligned, human-tracked |
| ERP connectors (SAP, Oracle, CSV) | ✅ Implemented | Field mapping, review pipeline |
| Arabic-first bilingual UI | ✅ Implemented | All labels, exports, and reports |
| RBAC with tenant isolation | ✅ Implemented | Shared AQLIYA Core capability |

### 6.2 Short-Term Improvements (v0.1.x)

| Capability | Effort | Priority | Rationale |
|-----------|--------|----------|-----------|
| Configurable scoring policy engine | Medium | High | Replace hardcoded 40/25/20/15 weights with user-configurable policy templates (backward-compatible default) |
| Evidence expiry tracking | Low | Medium | Track certificate/CR expiry dates with alerting |
| Bulk evidence upload | Low | Medium | Improve UX for multiple file upload |
| Readiness report (separate from assessment) | Low | Medium | Generate distinct "Readiness Self-Assessment" PDF |
| Metric labeling clarity | Low | High | Rename `localContentPercentage` context to clarify it's an internal metric, not regulatory |
| Classification rules admin UI | Low | Medium | Make the existing classification-rules engine configurable via UI |

### 6.3 Medium-Term Capabilities (v0.2)

| Capability | Effort | Rationale |
|-----------|--------|-----------|
| Benchmarking module (cross-project/period) | Medium | Core intelligence value — what differentiates LocalContentOS from a simple tracker |
| Period-over-period trend analytics | Low | Already partially exists in analytics routes |
| Data extract for auditor handoff | Low | Export working-paper-ready data package in standard format |
| Scoring policy import/export | Low | Allow organizations to share/baseline scoring policies |
| User-defined classification criteria | Medium | Allow orgs to define their own locality rules beyond the 4 built-in types |

### 6.4 Not Required (Will Not Build)

| Capability | Why Not |
|-----------|---------|
| LCGPA formula implementation | Non-goal — the official formula is for certification, not internal intelligence |
| AUP report generation | Non-goal — requires licensed auditor judgment |
| Certificate lifecycle management | Non-goal — belongs to LCGPA portal |
| GOSI/ZATCA API integration | Non-goal — government data integration for certification purposes |
| Statistical sampling engine | Non-goal — required for AUP audit, which is not the product's purpose |
| AI-autonomous classification | Contravenes AQLIYA trust principle ("AI assists. Humans decide.") |

---

## 7. Unnecessary Capabilities

These capabilities exist in the current codebase but are either (a) unnecessary for the chosen doctrine or (b) should be relabeled/repurposed.

### 7.1 Needs Relabeling

| Current Capability | Current Label | Recommended Label | Why |
|-------------------|---------------|-------------------|-----|
| Verification checklist | "التحقق" (Verification) | "تقييم الجاهزية" (Readiness Assessment) | Current label implies audit-level verification. It's a self-assessment tool. |
| Scoring result: `localContentPercentage` | "نسبة المحتوى المحلي" | "نسبة المحتوى المحلي الداخلية" (Internal Local Content Percentage) | Current name implies regulatory LC%. Should clarify it's internal policy-based. |
| Report disclaimer | "هذا ليس تقرير امتثال نظامي" | Keep but add "تقرير إداري داخلي" (Internal Management Report) header | Adding explicit labeling above the existing disclaimer |

### 7.2 Potentially Overbuilt (Monitor)

| Capability | Concern | Action |
|-----------|---------|--------|
| Tender matching engine | May be more sophisticated than buyer need | Keep but monitor usage; simplify if unused |
| 36-item verification matrix | Detailed for a self-assessment | Keep but document as readiness, not audit |
| ERP connectors (SAP/Oracle full impl) | Complex for intelligence use case | Keep — intelligence needs data input; connectors serve that purpose |

### 7.3 Genuinely Unnecessary (Remove If Found)

| Capability | Why Unnecessary |
|-----------|-----------------|
| Any reference to "certification" in UI copy | Contradicts doctrine; would mislead users |
| Any claim of "LCGPA compliance" in code comments | Code comments that say "LCGPA-compliant" about current scoring engine are incorrect |
| Any calculation result exposed as "LCGPA Score" | Misleading; the scoring is proprietary/policy-based |

---

## 8. Recommended Roadmap

Based on this doctrine, the recommended execution sequence is:

### Phase 0 — Doctrine Alignment (Current, ~1 week)
- [ ] Update export disclaimers to add "Internal Management Report" header
- [ ] Relabel verification checklist as "Readiness Self-Assessment" in UI
- [ ] Rename metric display labels to clarify internal nature
- [ ] Remove any "certification" or "LCGPA compliance" claims in code comments
- [ ] Update product taxonomy/status docs to reflect this doctrine

### Phase 1 — Intelligence Strengthening (~2 weeks)
- [ ] Refactor scoring engine: replace hardcoded weights (40/25/20/15) with configurable policy templates
- [ ] Add scoring policy admin UI
- [ ] Build readiness assessment report (separate from assessment summary PDF)
- [ ] Add evidence expiry tracking + alerts

### Phase 2 — Intelligence Expansion (~3-4 weeks)
- [ ] Build benchmarking module (cross-project, cross-period comparison)
- [ ] Add period-over-period trend analytics (strengthen existing)
- [ ] Build data extract for auditor handoff
- [ ] Add scoring policy import/export
- [ ] Add user-defined classification criteria

### Phase 3 — Intelligence Maturation (Ongoing)
- [ ] Anonymized cross-organization benchmarking (opt-in)
- [ ] Sector-specific scoring policy templates
- [ ] API for downstream consumers (tender teams, procurement systems)
- [ ] Dashboard improvements (executive view, trend visualization)

### Never Build
- LCGPA formula implementation
- AUP report generation
- Certificate lifecycle
- GOSI/ZATCA API integration
- Statistical sampling engine
- AI-autonomous classification

---

## 9. Effect on Previous Gap Analysis

The methodology gap analysis at `docs/review/localcontent/LOCALCONTENT_METHODOLOGY_GAP_ANALYSIS.md` was written under the implicit assumption that LocalContentOS should align with LCGPA certification methodology. Under this Product Doctrine:

### What the Gap Analysis Got Right

| Finding | Still Valid? | Notes |
|---------|-------------|-------|
| 4-component formula is not implemented | ✅ Valid but irrelevant | The doctrine explicitly excludes LCGPA formula; this is not a gap |
| Verification is 100% manual | ✅ Valid but recontextualized | Manual self-assessment is appropriate for a readiness tool |
| No AUP report generation | ✅ Valid but irrelevant | AUP is a non-goal per this doctrine |
| No certificate lifecycle | ✅ Valid but irrelevant | Certificate lifecycle is a non-goal |
| 3 missing data models (Employee, Asset, CapacityBuilding) | ❌ Not a gap | These models are required for LCGPA formula calculation, which is a non-goal |
| Cannot issue Local Content certificate | ✅ Valid but irrelevant | Certificate issuance is a non-goal |

### What Changes

| Gap Analysis Finding | Revised Assessment |
|---------------------|-------------------|
| "Verification is 100% manual" → Critical gap | Manual readiness assessment is appropriate for intelligence platform. Not a gap. |
| "Missing Workforce, Asset, CapacityBuilding data models" → Critical gap | These models are unnecessary for intelligence platform doctrine. Not a gap. |
| "Cannot issue Local Content certificate" → Critical gap | Certificate issuance is not the product's purpose. Not a gap. |
| "Official LCGPA formula not implemented" → Critical gap | LCGPA formula is explicitly excluded. The scoring engine provides configurable policy-based scoring. Not a gap. |
| "Product completion ~30%, Methodology coverage ~25%" | Completion level for this doctrine: ~80% (implemented), ~20% (intelligence improvements needed). |

### Revised Score

| Dimension | Previous Score (Certification Doctrine) | Revised Score (Intelligence Doctrine) |
|-----------|----------------------------------------|---------------------------------------|
| Product completeness | ~30% | ~80% |
| Methodology alignment | ~25% (vs LCGPA cert) | ~95% (vs intelligence doctrine) |
| Certification readiness | ~5% | N/A (non-goal) |
| Buyer readiness | ~40% | ~85% |

---

## 10. Final Product Identity Statement

> **LocalContentOS is a governed local content intelligence platform.**
>
> It does not certify, does not audit, does not submit to regulators.
>
> It helps organizations **understand** their local content position, **evidence** their classifications, **govern** their review/approval process, and **prepare** for external scrutiny — all on the AQLIYA platform.
>
> **Arabic:** نظام ذكاء المحتوى المحلي المحكوم. لا يُصدّق ولا يدقّق ولا يرفع للجهات التنظيمية. يساعد الجهات على فهم موقعها من المحتوى المحلي، وتوثيق تصنيفاتها بالأدلة، وحوكمة اعتماداتها، والاستعداد للتدقيق الخارجي — على منصة عقلية.
>
> **Trust principle:** AI assists. Humans decide. Evidence governs.
>
> **Buyer promise:** Make your local content numbers defensible.
> **Arabic:** اجعل أرقام المحتوى المحلي الخاصة بك قابلة للإثبات.

---

*This doctrine supersedes any conflicting LocalContentOS positioning in the discovery pack. It is subordinate only to `docs/official/` documents (AQLIYA_MASTER_REFERENCE.md, aqliya-product-taxonomy-v1.1.md, aqliya-vision-v1.1.md).*
