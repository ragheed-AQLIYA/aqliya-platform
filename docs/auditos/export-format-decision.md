# Export Format Decision

## Current Export Format

- **JSON only** (implemented in Phase 9)
- Export types: Financial Statements, Audit File, Bilingual
- Draft/final labels included via `ExportPackage.labels`
- Approved exports include approval metadata

## Decision

**PATH B — JSON-only for pilot/current release**
Keep JSON as the sole export format for the controlled pilot phase.

## Rationale

| Factor | Assessment |
|--------|------------|
| Existing dependencies | No PDF/DOCX libraries currently installed |
| PDF library options | `@react-pdf/renderer`, `pdfkit`, `jspdf` — all require significant integration effort |
| DOCX library options | `docx` npm package — requires template design |
| Pilot requirement | JSON is sufficient for technical validation |
| Client expectation | Must be disclosed as a known limitation |
| Production requirement | PDF/DOCX should be decided before external production |

## When PDF/DOCX Will Be Added

- Target phase: Post-pilot, before external production
- Format recommendation: PDF (more universal for financial statements)
- Implementation approach: Server-side generation, downloadable from Publication page
- Each export must preserve draft/final status labels

## Current Labeling

- Draft exports: `labels.isDraft: true`, `labels.draftWarning: "DRAFT — Not final until approved..."`
- Approved exports: `labels.isApproved: true`, `labels.approvalInfo: "Approved by {name} at {timestamp}"`

These labels exist in JSON output and will carry over to PDF/DOCX when implemented.

## Production Blocker

See `PDF/DOCX export decision` in the Production Blockers tracker.

Status: **open** — Awaiting business decision on timeline and priority.

## Export Action Links

- `exportFinancialStatementsAction` — JSON download
- `exportAuditFileAction` — JSON download
- `exportBilingualAction` — JSON download with Arabic/English labels
