# AuditOS Pilot Demo Flow v1

## Overview

The Pilot Demo Flow v1 is an interactive walkthrough component that guides users through the complete AuditOS workflow step by step. It is designed for the AuditOS pilot phase to demonstrate the product's end-to-end audit capabilities with live data, progress tracking, and embedded trust checkpoints.

## Core Principles

1. **Guided workflow**: 9 sequential steps covering the full audit lifecycle.
2. **Live status tracking**: Each step shows real-time completion status from the database.
3. **Trust checkpoints**: Every step includes an explicit trust reminder reinforcing human oversight.
4. **Progress visibility**: Overall progress bar and step-level status badges.
5. **Human-in-command**: AI assists. Humans decide. Evidence governs.

## Architecture

```
src/components/audit/pilot/
├── pilot-demo-flow.tsx      # Main demo flow component with 9 steps
└── pilot-page.tsx           # Page wrapper with demo flow + existing content
```

## Workflow Steps

| Step | Label | Route | Status Logic |
|------|-------|-------|--------------|
| 1 | Engagement | `/` | Engagement exists → complete |
| 2 | Trial Balance | `/trial-balance` | TB variance = 0 → complete; exists → partial |
| 3 | Mapping | `/mapping` | All confirmed → complete; some → partial |
| 4 | Financial Statements | `/statements` | Statements exist → complete |
| 5 | Disclosure Notes | `/notes` | 14 notes + reviewed → partial; 14 notes → complete |
| 6 | Evidence | `/evidence` | No missing + exists → complete; exists → partial |
| 7 | Findings | `/findings` | Findings exist → complete |
| 8 | Review | `/review` | No blocking issues → complete; has blockers → partial |
| 9 | Approval | `/approval` | Status = ready → complete; otherwise → partial |

## How It Works

### Status Fetching

The component uses `Promise.allSettled` to fetch status for all 8 data sources independently:
- `getEngagementAction`
- `getTrialBalanceAction`
- `getMappingsAction`
- `getFinancialStatementsAction`
- `getDisclosureNotesAction`
- `getEvidenceAction`
- `getFindingsAction`
- `getApprovalStatusAction`

This ensures that a failure in one data source doesn't block the others.

### Status Mapping

Each step maps to one or more data sources and evaluates:
- **complete**: All criteria met
- **partial**: Some criteria met, work in progress
- **pending**: No data or criteria not met

### UI Components

1. **Header card**: Shows title, description, and overall progress bar.
2. **Core principle banner**: Persistent reminder of the core principle.
3. **Step cards**: Expandable cards with:
   - Step number and status icon (checkmark, partial circle, or empty circle)
   - Step label, icon, and description
   - Status badge (Complete / In Progress / Pending)
   - "Open" button to navigate to the live page
   - Expanded view with trust checkpoint and human review warning
4. **Footer reminder**: Final disclaimer about human approval requirement.

## Trust Checkpoints

Each step includes a specific trust checkpoint message:

| Step | Trust Checkpoint |
|------|------------------|
| Engagement | Engagement scope and team assignment confirmed. |
| Trial Balance | TB variance = SAR 0. Data integrity confirmed. |
| Mapping | All accounts mapped and confirmed by human reviewer. |
| Financial Statements | Statements auto-generated from confirmed mappings. |
| Disclosure Notes | Notes are draft — human review and evidence linkage required. |
| Evidence | Evidence governs — no note approved without supporting evidence. |
| Findings | All findings require human assessment and resolution. |
| Review | AI assists. Humans decide. Every review action is human-triggered. |
| Approval | No AI auto-approval. Final sign-off is human-only. |

## Integration Points

### Pilot Page
```typescript
// src/components/audit/pilot/pilot-page.tsx
import PilotDemoFlow from './pilot-demo-flow'

export default function PilotPage() {
  return (
    <>
      <PilotDemoFlow />
      <PilotPageContent />
    </>
  )
}
```

### Route
```
src/app/audit/engagements/[engagementId]/pilot/page.tsx
```

### Navigation
- Sidebar navigation (`audit-sidebar.tsx`) currently contains no pilot links.
- Pilot is accessible only via direct route or from engagement overview.

## Limitations (v1)

1. **Static step order**: Steps are hardcoded; no reordering or skipping.
2. **No step dependencies**: All steps shown regardless of previous completion.
3. **No save state**: Expanded/collapsed state not persisted across navigation.
4. **No real-time updates**: Status fetched on mount only; no polling or WebSocket.
5. **Sidebar isolation**: Pilot not linked from main sidebar navigation.

## Future Enhancements (v2+)

- Step dependency enforcement (block step N until N-1 complete)
- Real-time status updates via polling or WebSocket
- Persistent expansion state in URL or localStorage
- Sidebar navigation link for pilot route
- Exportable demo report (PDF) for stakeholder presentations
- Customizable step order per engagement type
- Video walkthrough overlays for self-guided demos

## Validation

Run these commands to verify the demo flow:

```bash
npx prisma generate
npm run seed:audit
npx tsc --noEmit
npm run build -- --webpack
```

## Files Modified

- `src/components/audit/pilot/pilot-demo-flow.tsx` (new)
- `src/components/audit/pilot/pilot-page.tsx` (updated to include demo flow)
- `docs/product/auditos-pilot-demo-flow-v1.md` (this file)
