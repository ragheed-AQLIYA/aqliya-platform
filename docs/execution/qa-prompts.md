# AuditOS — QA Prompts

Reusable QA validation prompts for AI-assisted quality assurance. Each prompt is self-contained and can be used in OpenCode, Cursor, or similar AI coding assistants.

---

## Mapping Persistence

**Objective:** Verify that account mappings persist correctly across page reloads and session boundaries.

**Checks:**
- [ ] Mapped accounts are stored in `AuditAccountMapping` model
- [ ] Mappings survive page reload without data loss
- [ ] Mappings are scoped to the correct engagement
- [ ] Unmapped accounts remain visible for mapping
- [ ] Re-mapping an account updates the existing record (no duplicates)

**Validation Steps:**
1. Create or open an engagement with trial balance data
2. Map at least 5 accounts to standard categories
3. Reload the page
4. Verify all mappings are still present
5. Re-map one account to a different category
6. Verify the update is reflected

**Files to Check:**
- `src/app/audit/engagements/[engagementId]/mapping/page.tsx`
- `src/lib/audit/services.ts` (mapping functions)

**Pass Criteria:** All mappings persist correctly. No data loss on reload. No duplicate mappings.

---

## Statement Rebuild Correctness

**Objective:** Verify that financial statements rebuild correctly when underlying mappings change.

**Checks:**
- [ ] Statement of Financial Position balances (Assets = Liabilities + Equity)
- [ ] Statement of Profit or Loss calculates correctly (Revenue - Expenses = Net Income)
- [ ] Statement of Cash Flows reflects mapped cash accounts
- [ ] Statement of Changes in Equity ties to net income and equity accounts
- [ ] Statements update when mappings are changed

**Validation Steps:**
1. Open an engagement with mapped accounts
2. View the financial statements
3. Change at least 2 account mappings
4. Rebuild statements
5. Verify all 4 statements reflect the changes
6. Verify balancing equations hold

**Files to Check:**
- `src/app/audit/engagements/[engagementId]/statements/page.tsx`
- `src/lib/audit/services.ts` (statement generation functions)
- `docs/archive/legacy-numbered/04-financial-statements/` (generation rules)

**Pass Criteria:** All statements rebuild correctly. Balancing equations hold. Changes propagate.

---

## Traceability

**Objective:** Verify that every output item can be traced back to its source trial balance accounts.

**Checks:**
- [ ] Each financial statement line item links to source accounts
- [ ] Each note references source accounts
- [ ] Each evidence requirement links to accounts or findings
- [ ] Each finding references source accounts
- [ ] Audit trail records all significant actions

**Validation Steps:**
1. Open an engagement with full workflow data
2. Click through from a statement line item to source accounts
3. Click through from a note to source accounts
4. Click through from evidence to accounts/findings
5. Click through from findings to source accounts
6. Review audit trail for completeness

**Files to Check:**
- All pages under `src/app/audit/engagements/[engagementId]/`
- `src/lib/audit/audit-events.ts`
- `src/lib/audit/services.ts`

**Pass Criteria:** Full traceability from output to source. No orphaned items.

---

## Notes Accuracy

**Objective:** Verify that generated notes are accurate, relevant, and properly linked to financial statement items.

**Checks:**
- [ ] Notes correspond to the correct account categories
- [ ] Notes contain accurate financial figures
- [ ] Notes reference the correct accounting standards
- [ ] Notes are in Draft status by default
- [ ] Notes support bilingual output (Arabic/English)

**Validation Steps:**
1. Open an engagement with generated notes
2. Verify each note matches its account category
3. Verify figures in notes match statement figures
4. Verify standard references are appropriate
5. Verify notes are marked as Draft
6. Check Arabic and English output if applicable

**Files to Check:**
- `src/app/audit/engagements/[engagementId]/notes/page.tsx`
- `src/lib/audit/services.ts` (note generation functions)
- `docs/05-notes-system/` (notes methodology)

  - [ ] Requirements match the rules in `docs/archive/legacy-numbered/06-evidence-and-review/02-evidence-by-account-area.md`

  - `docs/archive/legacy-numbered/06-evidence-and-review/02-evidence-by-account-area.md`

**Pass Criteria:** All account areas have evidence requirements. Status tracking works. Linkage is correct.

---

## Build/Type Validation

**Objective:** Verify that the codebase passes all build and type validation checks.

**Checks:**
- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] `npm run build -- --webpack` succeeds
- [ ] `npm run lint` returns 0 new errors
- [ ] No `any` types in new code
- [ ] All imports resolve correctly
- [ ] No unused imports or variables

**Validation Steps:**
1. Run `npx tsc --noEmit` — verify 0 errors
2. Run `npm run build -- --webpack` — verify success
3. Run `npm run lint` — verify 0 new errors
4. Review any warnings and assess severity

**Files to Check:**
- All modified files in the current change set

**Pass Criteria:** All validation commands pass. No new errors or warnings.

---

## No Client/Server Boundary Violations

**Objective:** Verify that Next.js App Router server/client boundaries are respected.

**Checks:**
- [ ] Server components do not use `"use client"` unnecessarily
- [ ] Client components are marked with `"use client"`
- [ ] Server actions are in server-only files
- [ ] No database queries in client components
- [ ] No `server-only` imports in client components
- [ ] Props passed from server to client are serializable

**Validation Steps:**
1. Review all modified files for `"use client"` directives
2. Verify server components do not have client-only hooks (`useState`, `useEffect`, etc.)
3. Verify client components do not import server-only modules
4. Check that server actions are properly isolated
5. Verify props passed to client components are serializable

**Files to Check:**
- All modified `.tsx` and `.ts` files
- `src/lib/audit/services.ts`
- All server action files

**Pass Criteria:** No boundary violations. Server/client separation is clean.
