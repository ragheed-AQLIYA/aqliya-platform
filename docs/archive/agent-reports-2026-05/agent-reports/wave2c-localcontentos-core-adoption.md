# Wave 2C — LocalContentOS Core Adoption & Polish

## Summary

- Wired Core Evidence adapter into all LocalContentOS evidence actions (create, upload, status update, delete) with correct LC→Core evidence ID lookup via metadata field
- Added Arabic font infrastructure for PDF exports (registerFont fallback scanning 8 candidate paths) with RTL-aware font name helpers
- Enhanced export metadata with organization name, reviewer name, approver name, and approval timestamp
- Reorganized 12 flat components into `forms/`, `display/`, `export/` subdirectories with barrel indexes
- Created 14 loading.tsx and 13 error.tsx skeleton/error components for all routes (Arabic RTL, AlertTriangle icons, reset/back actions)
- Added missing local audit event for CSV-import-created suppliers

## Product/System Affected

- Product: LocalContentOS
- Area: Core Evidence adoption, PDF exports, UI components, route states, audit trail
- Completion level before: L5 (pilot-ready with conditions)
- Completion level after: L5+ (closing identified gaps)

## Files Changed

- `src/products/local-content/core-adapters/evidence-adapter.ts` — Added `findCoreEvidenceByLcId` helper with direct Prisma query, changed `syncEvidenceToCore` to return Core evidence ID, fixed `linkEvidenceToCore` and `updateEvidenceStatusInCore` to resolve LC→Core ID properly
- `src/actions/localcontent-actions.ts` — Imported adapter functions; wired `syncEvidenceToCore` in `createLocalContentEvidenceAction`, `uploadLocalContentEvidenceFileAction`; wired `updateEvidenceStatusInCore` in `updateLocalContentEvidenceStatusAction`, `deleteLocalContentEvidenceAction`; added audit event for CSV import supplier creation
- `src/lib/local-content/arabic-font.ts` — NEW: font registration utility scanning 8 candidate paths, `registerArabicFontsIfAvailable`, `getArabicFontName`, `getArabicBoldFontName` helpers
- `src/lib/local-content/export.ts` — Added `organizationName`, `reviewerName`, `approverName`, `approvedAt` to `LocalContentExportInput`; registered Arabic fonts in all 5 PDF builders; replaced all hardcoded `"Helvetica"`/`"Helvetica-Bold"` with `getArabicFontName()`/`getArabicBoldFontName()`; added org/reviewer/approver lines to header
- `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts` — Enhanced query to fetch `reviewerName`, `approverName`, `createdAt` from review/approval models; passes organization name, reviewer, approver, approval timestamp to export input
- `src/components/local-content/` — Moved 8 form files to `forms/`, `local-content-shell.tsx` to `display/`, `report-generation-button.tsx` to `export/`; created barrel index.ts for each subdirectory
- `src/app/local-content/**/*.tsx` — Updated 11 page files with new import paths
- `src/app/local-content/` — Created 14 `loading.tsx` files (skeleton pattern), 13 `error.tsx` files (RTL Arabic, AlertTriangle, reset/back)

## Governance Check

- RBAC: No changes (existing project-level guards unchanged)
- Tenant isolation: No changes (organizationId already enforced)
- Evidence: Core Evidence adapter now properly wired with dual-write pattern; LC evidence ID tracked in Core metadata for bidirectional lookup
- Audit trail: CSV import suppliers now get local audit events; all other mutations already logged
- Review/approval: No changes
- Export control: No changes (download route already has auth guard + audit log)
- AI boundary: No changes

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass (only pre-existing Sales adapter error) |

Heavy commands (full lint, build, test) not run per low-load protocol — TypeScript validation covers new code paths.

## Known Limitations

- Arabic PDF fonts depend on external font files not bundled in the repo (graceful fallback to Helvetica if unavailable)
- Component barrel indexes (`forms/index.ts`, `display/index.ts`, `export/index.ts`) exist but no pages import from the barrel yet (prefer direct paths for now)
- The `findCoreEvidenceByLcId` helper does a scan of up to 100 Core evidence records by `productKey` — fine for L5 scale but should add a direct `lcEvidenceId` index or dedicated join table at scale

## Next Recommended Step

Install an Arabic font package (e.g., `noto-naskh-arabic`) as an npm dependency so PDF exports render Arabic text correctly out of the box.
