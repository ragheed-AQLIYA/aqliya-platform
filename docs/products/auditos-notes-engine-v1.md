# AuditOS Notes Engine v1

## Overview

The Notes Engine v1 is a **rule-based, zero-AI** generator that creates draft financial statement notes from mapped trial balance data and financial statements. It is designed for the AuditOS pilot phase to demonstrate automated note generation while maintaining full auditability and human control.

## Core Principles

1. **Rule-based v1**: No AI API calls, no external dependencies, no fabricated values.
2. **Draft only**: All generated notes are clearly marked as Draft and require human review.
3. **Traceable**: Each note links to source accounts, evidence requirements, and missing information flags.
4. **Evidence-governed**: Notes identify required evidence and flag gaps.
5. **Human-in-command**: AI assists. Humans decide. Evidence governs.

## Architecture

```
src/lib/audit/notes/
├── types.ts                 # Type definitions, note templates, missing info checkers
├── evidence-requirements.ts # Evidence requirements per note type (IFRS for SMEs)
├── notes-engine.ts          # Core rule-based generator
└── index.ts                 # Public exports
```

## How It Works

### Input Context

The engine receives a `NoteGenerationContext` containing:
- `trialBalanceLines`: Mapped TB lines with account types and balances
- `mappings`: Account mappings to canonical accounts
- `financialStatements`: Income statement and balance sheet lines
- `existingNotes`: Already-created notes (to avoid duplicates)
- `evidence`: Uploaded/missing evidence files
- `findings`: Related audit findings

### Note Templates

14 predefined templates cover standard IFRS for SMEs disclosures:

| Note | Title | Type |
|------|-------|------|
| 1 | General Information and Basis of Preparation | accounting_policy |
| 2 | Cash and Cash Equivalents | financial_instruments |
| 3 | Trade Receivables | financial_instruments |
| 4 | Inventories | inventory |
| 5 | Property, Plant and Equipment | fixed_assets |
| 6 | Trade Payables | financial_instruments |
| 7 | Short-term Borrowings | borrowings |
| 8 | Revenue | revenue |
| 9 | Expenses by Nature | expenses |
| 10 | Finance Cost | borrowings |
| 11 | Zakat and Tax | tax |
| 12 | Share Capital | equity |
| 13 | Related Party Transactions | related_party |
| 14 | Commitments and Contingencies | contingencies |

### Generation Logic

1. **Template matching**: Each template is evaluated against the context.
2. **Balance calculation**: Totals are computed from TB lines by account type.
3. **Content population**: Template placeholders (`{{balance}}`, `{{gross}}`, etc.) are replaced.
4. **Missing info detection**: Checkers run to identify required but missing information.
5. **Evidence gap analysis**: Required evidence is compared against uploaded files.
6. **Status assignment**: Notes with missing info get `needs_info`, others get `draft`.
7. **Disclaimer appended**: All notes include a draft disclaimer.

### Output

Each generated note includes:
- `noteNumber`, `title`, `noteType`
- `content`: Populated template with disclaimer
- `linkedStatementLine`: Related statement line(s)
- `missingInformation`: Array of required but missing items
- `requiresEvidence`: Array of required evidence documents
- `evidenceProvided`: Array of evidence already uploaded
- `status`: `draft` or `needs_info`

## Evidence Requirements

Each note type maps to specific evidence documents per IFRS for SMEs:

### Example: Inventory (Note 4)
- Physical inventory count sheet
- Inventory valuation report
- NRV assessment for slow-moving items
- Costing method documentation (FIFO/Weighted Average)

### Example: PPE (Note 5)
- Fixed asset register
- Depreciation schedule by asset class
- Addition invoices
- Disposal documentation
- Impairment assessment (if applicable)

See `evidence-requirements.ts` for the full mapping.

## Integration Points

### Services Layer
```typescript
// src/lib/audit/services.ts
import { generateNotes } from './notes'

export async function generateDraftNotes(engagementId: string) {
  // Fetch TB, mappings, statements, evidence, findings
  // Build context
  // Call generateNotes(context)
  // Create AIAssistanceOutput records for UI display
}
```

### Seed Script
```typescript
// prisma/seed-audit.ts
import { generateNotes } from '../src/lib/audit/notes'

// Build context from seed data
const generatedNotes = generateNotes(context)
// Seed disclosure notes from generated output
```

### Mock Data
```typescript
// src/lib/audit/mock-data.ts
import { generateNotes } from './notes'

const generatedNotes = generateNotes(mockContext)
export const mockDisclosureNotes = generatedNotes.map(...)
```

## Missing Information Flags

The engine flags common gaps:
- **AR aging**: Required for Trade Receivables note
- **Inventory breakdown**: Count sheet, costing method, NRV
- **Fixed asset register**: Depreciation rates, additions/disposals
- **Loan terms**: Maturity date, interest rate, covenants
- **Revenue segments**: By product/customer concentration
- **Related party declarations**: Identity, transactions, balances
- **Legal letter**: For contingencies

## Limitations (v1)

1. **Static templates**: Content is template-based, not adaptive to client specifics.
2. **No prior year comparatives**: Templates don't include PY comparison text.
3. **No complex calculations**: Only simple balance totals; no ratios or percentages.
4. **No judgment-based content**: Cannot generate management judgments or estimates.
5. **Single entity**: No consolidation or group structure support.

## Future Enhancements (v2+)

- AI-assisted content refinement (optional, human-triggered)
- Prior year variance analysis in note content
- Ratio disclosures (current ratio, gross margin, etc.)
- Industry-specific templates
- Multi-entity consolidation notes
- Auto-linking to evidence uploads

## Validation

Run these commands to verify the engine:

```bash
npx prisma generate
npm run seed:audit
npx tsc --noEmit
npm run build -- --webpack
```

## Files Modified

- `src/lib/audit/notes/types.ts` (new)
- `src/lib/audit/notes/evidence-requirements.ts` (new)
- `src/lib/audit/notes/notes-engine.ts` (new)
- `src/lib/audit/notes/index.ts` (new)
- `src/lib/audit/services.ts` (updated `generateDraftNotes`)
- `prisma/seed-audit.ts` (updated to use engine)
- `src/lib/audit/mock-data.ts` (updated to use engine)
