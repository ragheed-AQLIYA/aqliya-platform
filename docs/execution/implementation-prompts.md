# AuditOS — Implementation Prompts

Reusable AI prompts for feature implementation. Each prompt is self-contained and can be used in OpenCode, Cursor, or similar AI coding assistants.

---

## Notes Engine v1

**Objective:** Implement the Notes Engine v1 that generates disclosure notes from trial balance data and account mappings.

**Scope:**
- Read mapped accounts and generate corresponding disclosure notes
- Support Arabic and English note output
- Link notes to financial statement line items
- Display notes in `/audit/engagements/[engagementId]/notes`

**Inputs:**
- Mapped account data from `AuditAccountMapping`
- Accounting policies from `docs/05-notes-system/02-accounting-policies-library.md`
- Note-to-FS mapping rules from `docs/05-notes-system/03-note-to-fs-mapping.md`

**Outputs:**
- Generated notes stored in `AuditNote` Prisma model
- Notes displayed on the notes page with FS linkage
- Draft status by default (requires human review)

**Constraints:**
- Do not alter Prisma schema
- Do not alter existing server actions
- Notes must be marked as Draft until reviewed
- All generated notes must include source account references
- Bilingual support required

**Files:**
- `src/app/audit/engagements/[engagementId]/notes/page.tsx`
- `src/lib/audit/services.ts`
- `src/components/audit/` (notes-related components)

**Validation:**
- `npx tsc --noEmit` passes
- `npm run build -- --webpack` passes
- Notes page renders with generated notes
- Each note links back to source accounts

**Non-goals:**
- AI-generated notes are not final — they are drafts
- No automatic publication of notes
- No note editing by AI after human review

---

## Evidence Requirements Engine v1

**Objective:** Implement the Evidence Requirements Engine that generates evidence requirement lists based on account mappings and findings.

**Scope:**
- Analyze mapped accounts and identify required evidence
- Generate evidence requirements by account area
- Display evidence requirements in `/audit/engagements/[engagementId]/evidence`
- Support evidence status tracking (Pending, Provided, Reviewed)

**Inputs:**
- Mapped account data
- Evidence rules from `docs/archive/legacy-numbered/06-evidence-and-review/02-evidence-by-account-area.md`

  - Reviewer approval rules from `docs/03-audit-methodology/06-reviewer-approval-model.md`

- Approval checklist from `docs/archive/legacy-numbered/06-evidence-and-review/05-approval-checklist.md`

**Outputs:**
- Approval records stored in `AuditApprovalRecord` Prisma model
- Visual status indicators on all relevant pages
- Approval audit trail

**Constraints:**
- Do not alter Prisma schema
- Only authenticated reviewers can approve
- Approval is irreversible in v1 (no un-approve)
- All approvals must be timestamped and attributed

**Files:**
- `src/app/audit/engagements/[engagementId]/approval/page.tsx`
- `src/app/audit/engagements/[engagementId]/review/page.tsx`
- `src/lib/audit/services.ts`
- `src/components/audit/` (approval-related components)

**Validation:**
- `npx tsc --noEmit` passes
- `npm run build -- --webpack` passes
- Approval workflow functions end-to-end
- Status indicators update correctly
- Audit trail records all approval events

**Non-goals:**
- No multi-level approval hierarchy in v1
- No approval delegation
- No automated approval based on rules

---

## Trial Balance Import QA

**Objective:** Harden the trial balance import process with comprehensive QA checks and error reporting.

**Scope:**
- Validate uploaded trial balance file format (CSV/XLSX)
- Check for required columns (Account Code, Account Name, Debit, Credit)
- Detect and report duplicate account codes
- Validate debit/credit balance (total debits must equal total credits)
- Provide clear error messages for all validation failures

**Inputs:**
- Uploaded trial balance file (CSV or XLSX)
- Column mapping configuration
- Validation rules from `docs/02-accounting-methodology/01-trial-balance-requirements.md`

**Outputs:**
- Validation report with pass/fail status
- Error list with line numbers and descriptions
- Clean import on validation success
- `AuditTrialBalance` records created on success

**Constraints:**
- Do not alter Prisma schema
- Do not alter existing server actions — add validation layer
- Support both Arabic and English account names
- Preserve original file data for audit trail

**Files:**
- `src/app/audit/engagements/[engagementId]/trial-balance/page.tsx`
- `src/lib/audit/services.ts` (import-related functions)
- `src/components/audit/` (trial balance import components)

**Validation:**
- `npx tsc --noEmit` passes
- `npm run build -- --webpack` passes
- Invalid files are rejected with clear errors
- Valid files import successfully
- Balance check (debits = credits) is enforced

**Non-goals:**
- No automatic account mapping during import
- No AI-assisted column detection
- No file format conversion

---

## Demo Dataset Builder

**Objective:** Build a comprehensive demo dataset that showcases the full AuditOS workflow for pilot demonstrations.

**Scope:**
- Create a realistic trial balance for a sample company
- Pre-populate account mappings
- Generate sample financial statements
- Generate sample notes
- Generate sample evidence requirements
- Generate sample findings
- Set up demo engagement with all workflow stages visible

**Inputs:**
- Demo company profile (Gulf Trading Co. FY2025 or similar)
- Existing mock data in `src/lib/audit/mock-data.ts`
- Accounting methodology docs in `docs/02-accounting-methodology/`

**Outputs:**
- Seed script or demo data loader
- Fully populated demo engagement accessible via `/audit`
- All workflow stages visible (TB → Mapping → Statements → Notes → Evidence → Review → Approval)

**Constraints:**
- Do not alter Prisma schema
- Demo data must be clearly marked as demo
- Demo data must not interfere with real engagements
- Preserve existing mock data structure

**Files:**
- `src/lib/audit/mock-data.ts`
- `prisma/seed-audit.ts` (or new seed script)
- `scripts/` (demo data builder script)

**Validation:**
- `npx tsc --noEmit` passes
- `npm run build -- --webpack` passes
- Demo engagement loads with all data
- All workflow pages render correctly
- Demo data is isolated from production data

**Non-goals:**
- No real customer data in demo
- No production-like sensitive information
- No automated demo reset functionality
