# Phase 7 — UI Integration Plan

## Goal

Safely integrate lightweight governance UI indicators into AuditOS without modifying core business logic.

## Component Architecture

```
src/components/audit/governance/
├── DraftOnlyBanner.tsx           ← Shows draft boundary
├── ReviewRequiredNotice.tsx       ← Shows reviewer obligation
├── EvidenceStatusBadge.tsx        ← Shows evidence completeness
├── EscalationBadge.tsx            ← Shows escalation level
├── ProvenanceSummary.tsx          ← Shows provenance metadata
├── GovernanceContextPanel.tsx     ← Shows governance context
├── GovernanceTooltip.tsx          ← Tooltip wrapper
├── index.ts                      ← Barrel exports
├── types.ts                      ← Shared display types
└── examples/
    └── GovernanceDemo.tsx        ← Demo showcase
```

## UI Helpers

```
src/lib/governance/ui/
├── governance-display.ts         ← Labels, colors, formatters
├── escalation-display.ts         ← Escalation descriptions
└── provenance-display.ts         ← Provenance formatters
```

## Integration Points

### Safe (Read-Only Display)

| Page | Component | Integration Method |
|---|---|---|
| Statement preview | DraftOnlyBanner, ProvenanceSummary, EscalationBadge | Import component, pass props |
| Evidence review | EvidenceStatusBadge, ReviewRequiredNotice | Import component, pass status |
| Findings preview | DraftOnlyBanner, GovernanceContextPanel | Import component, pass context |
| Mapping results | EscalationBadge, EvidenceStatusBadge | Import component, pass level |

### Integration Pattern

```tsx
// Example: Adding governance indicators to a statement preview page
import { DraftOnlyBanner, EvidenceStatusBadge, EscalationBadge } from '@/components/audit/governance';

export function StatementPreview({ evidenceStatus, escalationLevel, ...props }) {
  return (
    <div>
      <DraftOnlyBanner taskType="statement_drafting" />
      <div className="flex gap-2 my-2">
        <EvidenceStatusBadge status={evidenceStatus} />
        <EscalationBadge level={escalationLevel} />
      </div>
      {/* existing statement preview content */}
    </div>
  );
}
```

## Not Integrated (By Design)

- Save/approve buttons — components are read-only
- Database persistence — no Prisma changes
- Server actions — no service changes
- Route guards — no routing changes
- Workflow enforcement — advisory only

## Principles Applied

- Components are `"use client"` for shadcn compatibility
- Props are optional where sensible — components show sensible defaults
- No external data fetching — data is passed via props
- No side effects — components are pure display
- Tailwind classes follow existing AuditOS patterns
- shadcn/ui Badge, Card, Tooltip used consistently

## Deployment

Components are import-ready. No build configuration changes needed. Simply import from `@/components/audit/governance` and pass the relevant governance data.
