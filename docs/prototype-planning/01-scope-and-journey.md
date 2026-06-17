# AuditOS Prototype — Scope & User Journey

**Document ID:** PLAN.001
**Status:** Draft
**Owner:** Founding Team
**Version:** 0.1
**Last Updated:** 2026-05-08
**Example Engagement:** Gulf Trading Co. FY2025

---

## 1. Prototype Scope Summary

### 1.1 What Is Included

The prototype implements the complete end-to-end workflow across all 14 modules, from engagement setup through audit trail viewing, for a single pre-configured demo engagement.

| # | Module | Description | PRD Reference |
|---|--------|-------------|---------------|
| 1 | **Dashboard** | Engagement overview with workflow phase indicator, pending task count, and quick-action entry points for Managers and Partners | §6, UX7 |
| 2 | **Engagement Workspace** | Engagement detail view showing team, governance config, workflow state machine progress (Initialized → DataIntake → EvidenceCollection → Review → FindingsDrafting → Approval → Publication → Completed) | §6.2, §9 |
| 3 | **Trial Balance** | CSV/XLSX upload and parsing; account extraction (code, name, debit/credit balances); structural validation (required columns, balance equality); trust assessment (trusted / conditionally trusted / blocked) | §6.3, §10 |
| 4 | **Account Mapping** | AI-suggested mappings from client COA to canonical financial model; operator accept/correct/manual mapping; completeness enforcement (all accounts must map before progression) | §6.4, §12 |
| 5 | **Validation** | Structural validation (A = L + E), period-over-period change detection, ratio analysis, anomaly flag generation with operator disposition (accepted / investigated / dismissed) | §6.5, §13 |
| 6 | **Financial Statements (Draft)** | Draft Statement of Financial Position and Statement of Profit or Loss auto-generated from mapped accounts; clearly marked "DRAFT — NOT FINAL — Requires Professional Review" | §15 |
| 7 | **Notes (Draft Checklist)** | Auto-generated disclosure requirements checklist based on account types and material balances; flags items requiring management-provided supporting schedules | §15 |
| 8 | **Evidence** | File upload (PDF, XLSX, image) with SHA-256 hashing; provenance capture (filename, uploader, timestamp, file type); typed linking to accounts (supports / contradicts / context) | §6.6 |
| 9 | **Evidence Review** | Evidence queue sorted by materiality; inline document viewing; reviewer verdict (verified / insufficient / rejected) with attributable rationale; state transitions Candidate → Verified → Insufficient → Rejected | §6.7, §9.2 |
| 10 | **Findings** | AI-generated signals (anomaly, evidence gap, classification mismatch); signal-to-finding conversion; finding lifecycle (Draft → ReviewReady → InReview → Approved → Withdrawn); evidence reference enforcement | §6.8, §6.9, §14 |
| 11 | **Recommendations** | AI-assisted recommendation drafting with evidence trace; reviewer editing; lifecycle (Draft → PendingApproval → Approved → Rejected); AI contribution metadata (ai_contributed flag, model version, confidence) | §6.10, §15 |
| 12 | **Review & Approval** | Prioritized review queue (risk × materiality × deadline); inline evidence and finding context; Accept / Modify / Reject with mandatory rationale; role-gated approval authority | §6.11, §16 |
| 13 | **Publication** | Immutable published recommendation with full evidence trace; client-facing view with access control; client response mechanism | §6.12 |
| 14 | **Audit Trail** | Append-only event log with every state transition; bidirectional traceability (source data → evidence → finding → recommendation → approval → publication); event filtering by actor, action type, date range, object type | §6.13 |

### 1.2 What Is Explicitly Excluded

| Feature | Reason |
|---------|--------|
| ERP / accounting system integration | AQLIYA is decision infrastructure, not transaction processing |
| Full audit methodology encoding (ISA/GAAS) | Only core workflow structure; methodology templates are post-MVP |
| External confirmations (bank, AR, legal) | Requires third-party integration and confirmation management workflow |
| Statistical sampling engine | Requires sample size calculation, selection, and evaluation — post-MVP |
| Autonomous audit opinion generation | Doctrine prohibits AI from issuing audit conclusions |
| Full statutory financial statement generator | Requires management information and supporting schedules beyond trial balance |
| Tax filing or compliance filing | Different domain; not part of AuditOS wedge |
| Self-hosted / air-gapped deployment | Post-MVP deployment flexibility |
| Cross-engagement learning / pattern detection | Post-MVP organizational memory feature |
| Dashboard-first analytics | Dashboards are secondary views; workflow is primary (UX7) |
| Mobile review surfaces | Reviewer productivity extension — post-MVP |
| Generic chatbot or conversational UI | Structurally incompatible with governed workflows |
| Advanced analytics and BI dashboards | Build after workflow is solid |
| Integration APIs for external system connectivity | Post-MVP |
| Multi-language / localization | English-only for MVP |
| Real-time collaboration / co-authoring | Later iteration |
| Automated evidence acceptance | Evidence always requires human verification |
| Black-box anomaly scoring | All AI must be explainable and evidence-backed |

### 1.3 Why This Scope Is Sufficient for MVP Demo

The selected scope delivers a **complete, coherent story** that demonstrates the core value proposition of AuditOS in a single sitting:

1. **End-to-end traceability** — The demo starts with a raw trial balance and ends with a published, traceable recommendation. Every intermediate step (mapping, validation, evidence, finding, approval) is visible and attributable. This proves the architectural principle that "every output is traceable to source data through evidence."

2. **AI-in-the-loop, not AI-in-charge** — The demo shows AI suggesting mappings, detecting signals, and drafting recommendations. Every AI output is clearly marked, requires human confirmation, and leaves an audit trail. This proves the doctrine principle "AI assists. Humans decide. Evidence governs."

3. **Governance is structural, not procedural** — The demo shows that unmapped accounts block progression, unverified evidence cannot support findings, and approvals require attributable actions. This proves that governance is enforced by the workflow engine, not by policy.

4. **Human decision joints are preserved** — The demo shows operators confirming mappings, reviewers verifying evidence, and managers approving recommendations. No auto-approve, no silent acceptance, no bypass paths. This proves that professional judgment is structurally required.

5. **Immediate tangible output** — The demo produces a published recommendation with full evidence trace and an immutable audit trail. This gives stakeholders something concrete to evaluate.

6. **`docs/products/auditos-mvp-prd.md` §17 defines pilot success metrics** — The prototype directly supports measurement of review time reduction, evidence gap detection, mapping accuracy, finding trace completeness, and governance confidence. Every metric has a corresponding prototype module.

---

## 2. User Journey Map

**Scenario:** First-time demo of AuditOS for Gulf Trading Co. FY2025 year-end audit.
**Actors:** Fatima (Operator/Preparer), Ahmed (Reviewer/Senior Auditor), Layla (Audit Manager), Khalid (Audit Partner), Omar (Client-Side Finance Contact).

---

### Step 1: Login & Dashboard

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/dashboard` — Engagement Dashboard |
| **User action** | Fatima logs in with operator credentials. The system displays the dashboard showing all engagements for her firm. |
| **System response** | Dashboard loads with a single active engagement card: **Gulf Trading Co. FY2025**. Card shows: engagement type (Full Audit), status badge *(DataIntake)*, fiscal period (FY2025 — Jan 1 – Dec 31, 2025), assigned team (4 members), and a prominent **"Continue Engagement"** button. |
| **State change** | Fatima's session is authenticated. No engagement state changes. |
| **Data displayed** | Engagement card: client name "Gulf Trading Co.", period, workflow phase indicator, team avatars with role labels (Fatima — Operator, Ahmed — Reviewer, Layla — Manager, Khalid — Partner), last activity timestamp. Secondary panel shows pending tasks badge: "(1) Upload Trial Balance". |

---

### Step 2: Engagement Workspace

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025` — Engagement Workspace |
| **User action** | Fatima clicks "Continue Engagement". The workspace opens with the workflow phase tracker at top. Current phase: **DataIntake** (highlighted). Previous: **Initialized** (green check). Next: **EvidenceCollection** (grayed out). |
| **System response** | Workspace renders with left sidebar (phases), main content area (phase-specific tasks), right panel (engagement metadata). The DataIntake phase shows a checklist: `[ ] Upload Trial Balance`, `[ ] Map Accounts`, `[ ] Validate Data`. |
| **State change** | None. Engagement remains in `DataIntake` state. |
| **Data displayed** | Phase tracker: `Initialized ✅ → DataIntake ◉ → EvidenceCollection ○ → Review ○ → FindingsDrafting ○ → Approval ○ → Publication ○ → Completed ○`. Right panel: engagement details (client, period, type, team roster with contact info, governance rules). |

---

### Step 3: Trial Balance Upload

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/data-intake/trial-balance` — Trial Balance Upload |
| **User action** | Fatima clicks "Upload Trial Balance" in the DataIntake task list. She drags a CSV file named `Gulf_Trading_COA_FY2025.csv` onto the upload zone. |
| **System response** | The system parses the file, extracts 47 accounts with codes (1000–5999), names, and balances (total debits: $12,450,000; total credits: $12,450,000). A parsing summary appears in a green success banner: *"47 accounts parsed. Trial balance is balanced (debits = credits). Trust state: Trusted."* A preview table shows all accounts with columns: Code, Name, Debit, Credit, Type (auto-detected), Status. |
| **State change** | Trial balance record created. Trust state = `trusted`. File hash (SHA-256) recorded. |
| **Data displayed** | Summary card: Filename, import timestamp, file hash (`e3b0c44...`), trust badge (green "Trusted"), row count (47). Expandable table with accounts sorted by code. Scrollable with sticky header. Each row shows Code, Name, Debit Balance, Credit Balance, Auto-detected Type (Asset/Liability/Equity/Revenue/Expense). Sidebar shows file source metadata: uploader (Fatima), timestamp, file size (24 KB). |

---

### Step 4: Account Mapping

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/data-intake/account-mapping` — Account Mapping |
| **User action** | Fatima clicks "Map Accounts" from the DataIntake task list. The mapping interface loads with 47 accounts. The first account is `1100-Cash on Hand` ($450,000 debit). |
| **System response** | The system displays AI-suggested mappings for each unmapped account. For `1100-Cash on Hand`, the AI suggests **Canonical: Cash & Cash Equivalents** with 94% confidence. Three alternative suggestions listed below. Fatima accepts the top suggestion with one click. She continues through the list: `1200-AR` → Trade Receivables (accepted), `1300-Inventory-Raw` → Inventories (accepted), `2100-AP` → Trade Payables (accepted). For `2500-Software Dev Cost` the AI suggests Intangible Assets (72%) or Property, Plant & Equipment (28%). Fatima selects Intangible Assets manually. A progress bar shows "47/47 mapped". |
| **State change** | All 47 accounts gain `account_mapping` records. Mapping completeness = 100%. The engagement can now advance past the DataIntake gating condition. AI suggestions recorded with model version and confidence. |
| **Data displayed** | Two-column layout: left = client account list (Code, Name, Balance, Status badge), right = AI suggestions panel. Each row in the left column shows a colored status indicator: gray (unmapped), green (mapped, AI accepted), blue (mapped, manually set), yellow (ambiguous — needs review). Clicking a row populates the right panel with the AI suggestion card: suggested canonical account name, confidence bar, alternative suggestions, and Accept / Manual Override / Skip buttons. The header shows a live progress indicator: "42/47 mapped" → "47/47 mapped ✅". |

---

### Step 5: Validation

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/data-intake/validation` — Data Validation |
| **User action** | Fatima clicks "Run Validation" after all accounts are mapped. The system executes validation checks and returns results. |
| **System response** | Validation dashboard shows 8 checks: 6 pass (green), 2 flags (yellow). **Checks passed:** Balance equality ✅, Structural completeness ✅, Classification reasonableness ✅, Period consistency ✅, A = L + E relationship ✅, Duplicate detection ✅. **Anomaly flags:** (1) *"Revenue/Expense ratio — Revenue $8.2M vs Industry avg $5.1M. Potential cut-off or recognition issue."* (2) *"Inventory $2.1M is 23% of total assets — above the 15% benchmark for this industry."* Fatima clicks each flag, reads the system explanation (with evidence trace showing the account balances and calculation), marks the revenue flag as "Investigate" and the inventory flag as "Note for review". |
| **State change** | Validation results stored with anomaly flags. Flags disposition recorded: one "investigate", one "dismissed with note". DataIntake phase marked complete. Engagement advances to `EvidenceCollection`. |
| **Data displayed** | Validation results grouped by severity. Green section: passing checks with checkmark icons. Yellow section: anomaly flags with warning icons. Each flag expands to show: flagged account(s), current value, expected/benchmark, calculation, AI-generated explanation paragraph. Each flag has three disposition buttons: "Accept — No Issue" (with rationale textarea), "Investigate — Flagged for Review" (adds to findings queue), "Dismiss — With Note" (requires mandatory rationale). A banner at top: *"All critical checks passed. Data Intake phase complete."* Phase tracker updates: DataIntake now has green check. |

---

### Step 6: Draft Financial Statements

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/financial-statements` — Draft Financial Statements |
| **User action** | Fatima navigates to the Financial Statements section (available after mapping completes). She clicks "Generate Draft Statements". |
| **System response** | The system generates a **Draft Statement of Financial Position** and **Draft Statement of Profit or Loss** from the mapped canonical accounts. Each statement is clearly headed **"DRAFT — NOT FINAL — Requires Professional Review"** in a red banner. The Statement of Financial Position shows: Total Assets $9.1M (Current $4.8M, Non-Current $4.3M), Total Liabilities $5.2M (Current $3.1M, Non-Current $2.1M), Equity $3.9M. The Statement of Profit or Loss shows: Revenue $8.2M, Cost of Sales $4.1M, Gross Profit $4.1M, Operating Expenses $2.8M, Net Profit $1.3M. Each line item is clickable, showing the underlying mapped accounts and their balances. |
| **State change** | Draft statements generated. No workflow state change — these are informational drafts, not governed objects. |
| **Data displayed** | Two tabs: **Statement of Financial Position** and **Statement of Profit or Loss**. Each tab shows the statement in standard financial format with indented hierarchy. Every line item is hyperlinked; clicking opens a side panel showing the mapped accounts (code, name, balance, mapping type) that compose that line. A third tab, **Account-to-Statement Mapping**, shows the full audit trail from each mapped account to its statement line. Red draft watermark overlaid diagonally. Export button (disabled for prototype). |

---

### Step 7: Notes Checklist

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/financial-statements/notes-checklist` — Notes / Disclosure Checklist |
| **User action** | Fatima clicks the "Notes Checklist" tab beside the financial statements. |
| **System response** | The system generates a disclosure requirements checklist based on account balances and types present in the mapped trial balance. For Gulf Trading Co., the checklist flags 14 required disclosures, including: Revenue recognition policy (material revenue $8.2M), Inventory valuation method (inventory $2.1M), Property, plant & equipment (net $2.8M), Trade receivables and credit risk ($1.7M), Related party transactions (flag based on account name pattern), Subsequent events, Income taxes, Earnings per share. Each item shows: disclosure requirement, applicable standard (IFRS/IAS reference), status *(Can be drafted from TB)* or *(Requires supporting schedule)*, and the accounts that trigger the requirement. |
| **State change** | No workflow state change. Checklist is a reference view. |
| **Data displayed** | Table with columns: Disclosure Area, Standard Reference, Triggering Account(s), TB-Sufficient?, Status. Items with "Requires supporting schedule" are marked with an orange badge. Items that can be drafted from TB data have a green badge. Items with no applicable disclosure are marked "N/A" in gray. A summary bar at top: *"7 of 14 disclosures can be drafted from trial balance data. 7 require management-provided supporting schedules."* |

---

### Step 8: Evidence Upload

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/evidence/upload` — Evidence Upload |
| **User action** | Fatima navigates to the EvidenceCollection phase. She clicks "Upload Evidence". She selects a file: `Gulf_Trading_Bank_Confirmations_Dec2025.pdf` and tags it to account `1100-Cash on Hand`. |
| **System response** | The system uploads the file, computes the SHA-256 hash, records provenance (Fatima, timestamp, file type PDF, filename), and creates an evidence record in **Candidate** state. The evidence appears in the evidence list with a gray "Candidate" badge. Fatima repeats for: `Inventory_Count_Summary_Dec2025.xlsx` linked to `1300-Inventory-Raw`, `Revenue_Contracts_FY2025.pdf` linked to `4000-Sales Revenue`, and `PPE_Schedule_2025.xlsx` linked to all PPE accounts. |
| **State change** | 4 evidence records created in `candidate` state. Evidence links created between each file and its tagged account(s). |
| **Data displayed** | Evidence list view. Each row shows: filename (clickable to preview), file type badge (PDF, XLSX), file size, uploader, upload timestamp, linked accounts (tag chips), state badge (gray = Candidate). Color coding by state: gray (Candidate), green (Verified), orange (Insufficient), red (Rejected). A preview panel opens on click showing: file icon, full provenance metadata (filename, hash, uploader, timestamp, file type, size), linked accounts with hyperlinks, and a link to view finding if referenced. |

---

### Step 9: Evidence Review

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/evidence/review` — Evidence Review |
| **User action** | Ahmed (Reviewer) logs in. His dashboard shows a review queue with 4 pending evidence items. He opens the first item: `Gulf_Trading_Bank_Confirmations_Dec2025.pdf`. |
| **System response** | The system displays the document inline (PDF viewer for documents, table preview for XLSX). The evidence detail panel shows: account context (`1100-Cash on Hand`, balance $450K, mapping: Cash & Cash Equivalents), provenance metadata, and verdict buttons. Ahmed reviews the bank confirmation letter, confirms it matches the $450K cash balance, and clicks **Verify** with rationale: *"Bank confirmations match stated cash balance. Signature and date verified."* System transitions evidence to **Verified** state. He continues: the inventory count summary is verified (with note about minor discrepancy documented), revenue contracts are verified, PPE schedule is marked **Insufficient** (missing depreciation method disclosure), with rationale: *"Schedule shows gross PPE but does not disclose depreciation method or useful lives. Request updated schedule from client."* |
| **State change** | 3 evidence items → `verified`. 1 evidence item → `insufficient`. Evidence review records created with Ahmed's identity, verdicts, and rationales. |
| **Data displayed** | Split view: left 60% = document viewer (PDF with page controls, XLSX with sheet tabs), right 40% = review panel. Right panel shows: evidence metadata card, linked account card (name, code, balance, mapping), reviewer verdict buttons: **Verify** (green, opens rationale textarea), **Mark Insufficient** (orange, opens rationale + required additional info textarea), **Reject** (red, opens mandatory rationale). After each verdict, the item moves from the queue and a success animation plays. A queue counter at top: "3 of 4 remaining". |

---

### Step 10: Findings (Signals & Creation)

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/findings` — Findings Workspace |
| **User action** | Ahmed navigates to the Review phase. The system has already run AI analysis (triggered when evidence collection was in progress). Ahmed sees 3 AI-generated signals in his queue panel on the left. |
| **System response** | **Signal 1 — Revenue Recognition:** *"Revenue $8.2M is 61% above industry average ($5.1M). Accounts 4000-Sales Revenue. Evidence: Revenue_Contracts_FY2025.pdf (Verified). Confidence: 76%."* **Signal 2 — Inventory Valuation:** *"Inventory $2.1M is 23% of total assets (benchmark 15%). Account 1300-Inventory-Raw. Evidence: Inventory_Count_Summary_Dec2025.xlsx (Verified). Confidence: 68%."* **Signal 3 — Depreciation Method Not Disclosed:** *"PPE schedule does not disclose depreciation method. Accounts 1700-1800. Evidence: PPE_Schedule_2025.xlsx (Insufficient). Confidence: 92%."* Ahmed clicks Signal 1 and selects **"Create Finding"**. The system pre-fills a finding draft with signal context, evidence references, and account links. Ahmed edits the description: *"Revenue for FY2025 is $8.2M, representing a 61% premium over the industry benchmark of $5.1M. While revenue contracts have been provided and verified, the magnitude of variance warrants additional substantive testing to rule out cut-off errors or premature recognition."* He sets type: `material_misstatement`, risk: `medium`, materiality: `material`. Finding state → `review_ready`. |
| **State change** | Signal 1 → status `converted`. Finding created in `review_ready` state with 1 verified evidence reference. |
| **Data displayed** | Three-panel layout: left = signal queue (signal cards with type icon, confidence bar, account reference, status badge), center = signal detail / finding editor, right = evidence trace panel. Signal cards sorted by confidence (highest first). Each signal card shows: signal type icon, short description, account code, confidence bar (colored green/yellow/red by threshold), evidence count badge, status (open/triaged/converted/ignored). Center panel when creating finding: pre-filled description textarea, evidence references as removable chips, account reference, finding type dropdown, risk dropdown, materiality dropdown, save buttons (Save as Draft / Submit for Review). Right panel shows the evidence trace: document name, excerpt/citation, link type (supports). |

---

### Step 11: Recommendations

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/recommendations` — Recommendation Drafting |
| **User action** | From the finding detail view, Ahmed clicks "Draft Recommendation". The system activates AI suggestion for the revenue recognition finding. |
| **System response** | The AI generates a recommendation draft in the editor: **Description:** *"Revenue Recognition — Additional Substantive Testing Required"*. **Recommended Action:** *"Perform detailed substantive testing on revenue transactions for Q4 2025, focusing on cut-off procedures, contract review for milestone-based recognition, and comparison of recognized revenue to supporting delivery documentation."* **Impact Assessment:** *"If revenue recognition issues are identified, adjustments may reduce reported revenue by an estimated $0.3M–$0.8M, impacting net profit and retained earnings."* **Deadline:** *"March 15, 2026"* (estimated). **Responsible Party:** *"Audit Team — Revenue Lead"*. AI metadata displayed: model version `gpt-4-turbo-2025-04`, confidence `0.74`, methodology *"Based on finding type (material misstatement), account context (revenue), and industry benchmark variance."* Ahmed edits the description to add specificity about Gulf Trading's contract types, keeps the AI-suggested action, adjusts impact to $0.5M–$1.0M, and clicks **"Submit for Approval"**. Recommendation state → `pending_approval`. |
| **State change** | Recommendation created in `pending_approval` state. AI contribution recorded (model version, confidence, input hash, human_edited=true). Evidence trace preserved. |
| **Data displayed** | Recommendation editor with AI-suggestion pre-fill. A highlighted banner at top: *"AI-Drafted Suggestion — Review and Edit Before Submitting"* with AI metadata expandable. Editor sections: Description (rich text), Recommended Action (rich text), Impact Assessment (rich text), Deadline (date picker), Responsible Party (text). Evidence trace sidepanel shows the chain: Finding → Signal → Evidence → Account. Bottom action bar: **Save as Draft**, **Submit for Approval**, **Discard**. After submission, a confirmation banner appears: *"Recommendation submitted for approval. Notified: Layla (Manager)."* |

---

### Step 12: Review & Approval

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/approval` — Approval Queue |
| **User action** | Layla (Manager) logs in. Her dashboard shows a review queue sorted by risk/materiality. The top item is the Revenue Recognition recommendation from Ahmed (risk: medium, materiality: material). She opens it. |
| **System response** | The approval detail view shows: recommendation text, full evidence trace (finding → signal → 3 verified evidence documents), AI contribution metadata clearly flagged, and three action buttons: **Accept**, **Modify & Approve**, **Reject**. Layla reads the recommendation and evidence. She agrees with the substance but wants to add specific procedures. She clicks **Modify & Approve**, adds: *"Also include substantive analytical procedures on gross margin trends by month."* to the recommended action, writes approval rationale: *"Sound finding. Added specific Q4 cut-off testing. Approved with modification."* System records approval with Layla's identity, action (modified), rationale, timestamp. Recommendation state → `approved`. |
| **State change** | Recommendation transitions from `pending_approval` → `approved`. Approval record created. |
| **Data displayed** | Approval detail view: top section = recommendation summary card (title, status, author, submitted date), middle section = recommendation full text with any AI-drafted sections highlighted in distinct background color, bottom section = evidence trace chain displayed as interactive breadcrumbs (Recommendation ← Finding ← Signal ← Evidence ← Account — each clickable to view source). Right panel = approval action panel with three equally sized buttons: **Accept** (opens rationale textarea — optional), **Modify & Approve** (opens inline editor for recommendation text + mandatory rationale), **Reject** (opens mandatory rationale textarea). No button is visually primary — equal prominence per UX9. Approval history panel below showing all actions on this recommendation. If Layla were unavailable, the item would remain in queue until Khalid (Partner, higher authority) acts — no auto-escalation. |

---

### Step 13: Publication

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/publication` — Publication |
| **User action** | Layla navigates to the Publication phase after all recommendations are approved. She clicks "Publish Recommendations" for the approved Revenue Recognition recommendation. |
| **System response** | The system generates a **Published Recommendation** record. It materializes the full evidence trace as an immutable snapshot: recommendation text (Layla's modified version), finding (Ahmed's description), signal (AI-generated with model metadata), evidence references (3 documents with hashes and provenance), account references (4000-Sales Revenue), approval record (Layla, modified, timestamp). A client-facing view is generated at a unique URL. The system generates an access link and displays it: `https://auditos.app/client/gulf-trading-2025/rec-001`. State → `published`. The client view becomes accessible to Omar (Client Contact). |
| **State change** | Published recommendation created (immutable). Recommendation state → `published`. Audit events recorded for every action leading to publication. Omar can now see the published recommendation via his limited VIEWER account. |
| **Data displayed** | Pre-publication view: summary card listing all approved recommendations ready for publication (1 item). Each card shows: recommendation title, finding type, materiality, evidence count, approval timestamp, approver name. A **"Publish to Client"** button at bottom. Post-publication view: green success banner *"Recommendation published successfully."* Published recommendation summary with: publication timestamp, publisher, access URL (copyable), status badge (Published), and a **"View Client Page"** button that opens a new tab showing the client-facing view. The client-facing view shows: professional layout with firm logo, recommendation title, finding context, recommended action, impact assessment, and a "supporting evidence" expandable section. All AI contributions are noted with an *"AI-assisted analysis" footnote. |

---

### Step 14: View Published Output (Client-Side)

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/client/gulf-trading-2025/rec-001` — Client-Facing Published Recommendation |
| **User action** | Omar (Client-Side Finance Contact) logs in with his VIEWER account. His dashboard shows "1 New Published Recommendation" from the Gulf Trading FY2025 audit. He clicks to open. |
| **System response** | The client view loads a clean, read-only layout with the published recommendation. Omar sees: **Title:** "Revenue Recognition — Additional Substantive Testing Required", **Finding Context:** Ahmed's description of the revenue variance, **Recommended Action:** Layla's modified version including Q4 cut-off testing and gross margin trend analysis, **Impact Assessment:** $0.5M–$1.0M potential adjustment, **Supporting Evidence:** expandable section listing the 3 evidence documents (names only, no download — view-only), **Auditor's Note:** *"This recommendation is based on verified evidence and approved by the engagement manager."* At the bottom, Omar can click **"Add Comment"** to submit a response. He writes: *"We will provide additional revenue cut-off reports by end of week."* This is recorded as engagement correspondence (not evidence, unless later verified). |
| **State change** | Client response recorded as engagement correspondence. No workflow state change. |
| **Data displayed** | Clean, brand-appropriate layout. Header: AuditOS firm logo, engagement name, "Published Recommendation" label with date. Body sections clearly delineated with headings. Evidence section as expandable accordion — each entry shows document name, type, and upload date. Client comment section at bottom with a text area and submit button. A note under the comment form: *"Your response will be recorded as engagement correspondence. To provide additional evidence documents, please contact your audit team."* No edit, delete, share, or download capability — read-only by design. |

---

### Step 15: Audit Trail

| Aspect | Detail |
|--------|--------|
| **Screen/Page** | `/engagements/gulf-trading-2025/audit-trail` — Audit Trail |
| **User action** | Khalid (Partner) logs in to review the complete engagement record before sign-off. He navigates to the Audit Trail tab (available at all phases, visible to Partner/Manager/Reviewer roles). |
| **System response** | The audit trail view displays a reverse-chronological, filterable, paginated list of every state transition that occurred during the Gulf Trading FY2025 engagement. Khalid sees 87 events spanning the full lifecycle. Key events include: *(1) Trial Balance Uploaded* — Fatima, DataIntake, 2026-01-15 09:30:22 UTC, *(2) Account Mapping Completed* — Fatima, 47 accounts mapped, *(3) Validation Passed* — System, 8 checks, 2 flags, *(4) Evidence Uploaded* — Fatima, `Gulf_Trading_Bank_Confirmations_Dec2025.pdf`, Candidate, *(5) Evidence Verified* — Ahmed, Bank Confirmations → Verified, *(6) Evidence Marked Insufficient* — Ahmed, PPE_Schedule → Insufficient, *(7) Signal Generated* — AI (gpt-4-turbo-2025-04), Revenue Recognition, confidence 0.76, *(8) Finding Created* — Ahmed, Revenue Recognition → ReviewReady, *(9) Recommendation Submitted* — Ahmed, Revenue Recognition → PendingApproval, *(10) Recommendation Approved (Modified)* — Layla, PendingApproval → Approved, *(11) Recommendation Published* — Layla, Approved → Published. Khalid filters by actor "Ahmed" to review all actions by the senior reviewer. Each event is expandable to show full metadata: event ID, actor details, previous and new state, evidence references (if any), and a **"View Context"** button that opens the traceability graph for that specific event. |
| **State change** | None — audit trail is a read-only view. |
| **Data displayed** | Filterable event log with search box and filters: Actor (dropdown), Action Type (dropdown: upload, verify, create, approve, reject, publish), Date Range (date picker), Object Type (dropdown: trial_balance, account_mapping, evidence, signal, finding, recommendation, approval, publication). Results displayed as a timeline-style list: each event row shows timestamp (formatted to local time), actor avatar + name, action verb, target object summary, state change arrow (e.g., `Candidate → Verified`). Color-coded by action type: blue = upload/create, green = verify/approve, orange = flag/modify, red = reject. Expandable detail panel shows: event UUID, full actor info (name, email, role), target object ID, previous state, new state, evidence reference UUIDs (clickable), AI model version (if applicable), raw metadata JSON (collapsible). Pagination at bottom with "Showing 1–20 of 87 events". A summary bar at top: *"Total Events: 87 | Unique Actors: 4 | Time Range: Jan 15 – May 8, 2026"* with an **"Export Audit Log"** button (downloads JSON — P2 feature, placeholder in prototype). |

---

## 3. Journey Summary

The 15-step journey demonstrates the complete AuditOS value proposition:

| Principle | Demonstrated In |
|-----------|----------------|
| AI assists. Humans decide. Evidence governs. | Steps 4, 5, 8–12 |
| Every output traceable to source data | Steps 10–15 |
| Governance is structurally enforced | Steps 4 (mapping gate), 8 (evidence gate), 12 (approval gate) |
| No anonymous actions | Step 15 (every event attributable) |
| AI contributions are visibly marked | Steps 4, 10, 11, 12 |
| Override friction equals accept friction | Step 12 (equal button prominence) |
| Workflow-first (not dashboard-first) | Steps 2–15 (workspace-driven, dashboard secondary) |
| Immutable audit trail | Step 15 (append-only event store) |

---

## Appendix A: State Machine Transitions in the Journey

| Step | Entity | From | To | Trigger | Actor |
|------|--------|------|----|---------|-------|
| 3 | TrialBalance | — | Created | Upload | Fatima |
| 3 | TrialBalance | Created | Trusted (state) | Validation | System |
| 4 | Engagement | DataIntake | DataIntake | Mapping complete | Fatima |
| 5 | Engagement | DataIntake | EvidenceCollection | Validation passed | System |
| 8 | Evidence | — | Candidate | Upload | Fatima |
| 9 | Evidence | Candidate | Verified | Verify | Ahmed |
| 9 | Evidence | Candidate | Insufficient | Mark insufficient | Ahmed |
| 10 | Signal | — | Open | AI generation | System |
| 10 | Signal | Open | Converted | Create finding | Ahmed |
| 10 | Finding | — | ReviewReady | Submit | Ahmed |
| 11 | Recommendation | — | PendingApproval | Submit for approval | Ahmed |
| 12 | Recommendation | PendingApproval | Approved | Approve (modified) | Layla |
| 13 | Recommendation | Approved | Published | Publish | Layla |
| 13 | PublishedRecommendation | — | Published | Publish | Layla |
| 15 | AuditEvent | — | Created | Every action | Every actor |
