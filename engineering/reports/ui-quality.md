# UX Quality Report

**Agent:** ui-quality  
**Generated:** 2026-07-11T02:08:05.728Z  
**Score:** 97/100  
**Findings:** 161 (critical 0, high 0, medium 0, low 66, info 95)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 0 |
| medium | 0 |
| low | 66 |
| info | 95 |

## Scope

- TSX/CSS files: 1157
- Missing alt (sampled findings capped): 0
- Icon a11y suspects: 6
- Inline-style heavy files: 9
- Dark mode variant hits: 178
- English-only marketing suspects: 0
- RTL signals present: yes

## Boundary

This agent reviews consistency and accessibility signals. It does **not** redesign products or visual identity.

## LOW Findings

### F-0518 — Heavy inline style usage

- **Category:** design-system
- **Files:** `src/components/visuals/audit-trace-visual.tsx`
- **Evidence:** ≥5 style={{...}} occurrences
- **Suggestion:** Prefer Tailwind tokens / shared UI primitives (shadcn).

### F-0520 — Heavy inline style usage

- **Category:** design-system
- **Files:** `src/components/visuals/custom-workflow-builder-visual.tsx`
- **Evidence:** ≥5 style={{...}} occurrences
- **Suggestion:** Prefer Tailwind tokens / shared UI primitives (shadcn).

### F-0522 — Heavy inline style usage

- **Category:** design-system
- **Files:** `src/components/visuals/decision-matrix-visual.tsx`
- **Evidence:** ≥5 style={{...}} occurrences
- **Suggestion:** Prefer Tailwind tokens / shared UI primitives (shadcn).

### F-0524 — Heavy inline style usage

- **Category:** design-system
- **Files:** `src/components/visuals/local-content-map-visual.tsx`
- **Evidence:** ≥5 style={{...}} occurrences
- **Suggestion:** Prefer Tailwind tokens / shared UI primitives (shadcn).

### F-0526 — Heavy inline style usage

- **Category:** design-system
- **Files:** `src/components/visuals/operating-system-map-visual.tsx`
- **Evidence:** ≥5 style={{...}} occurrences
- **Suggestion:** Prefer Tailwind tokens / shared UI primitives (shadcn).

### F-0528 — Heavy inline style usage

- **Category:** design-system
- **Files:** `src/components/visuals/proof-chain-visual.tsx`
- **Evidence:** ≥5 style={{...}} occurrences
- **Suggestion:** Prefer Tailwind tokens / shared UI primitives (shadcn).

### F-0529 — Heavy inline style usage

- **Category:** design-system
- **Files:** `src/components/visuals/sales-pipeline-visual.tsx`
- **Evidence:** ≥5 style={{...}} occurrences
- **Suggestion:** Prefer Tailwind tokens / shared UI primitives (shadcn).

### F-0548 — Possible icon-only control without accessible name

- **Category:** accessibility
- **Files:** `src/components/local-content/local-content-delete-button.tsx`
- **Evidence:** button/icon pattern without aria-label/sr-only in file

### F-0573 — Possible icon-only control without accessible name

- **Category:** accessibility
- **Files:** `src/components/audit/ai/ai-suggestion-panel.tsx`
- **Evidence:** button/icon pattern without aria-label/sr-only in file

### F-0576 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/workflowos/templates/new/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0577 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/workflowos/records/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0578 — Possible icon-only control without accessible name

- **Category:** accessibility
- **Files:** `src/app/workflowos/records/[id]/page.tsx`
- **Evidence:** button/icon pattern without aria-label/sr-only in file

### F-0579 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/signup/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0581 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/settings/organization/advanced/events/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0582 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/settings/models/model-governance-client.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0583 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/settings/audit-bridge/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0584 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/settings/audit-bridge/logs/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0585 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/sales/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0586 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/sales/signals/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0587 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/sales/deals/[id]/pilot/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0589 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/sales/activities/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0590 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/risk/[id]/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0591 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/risk/assessments/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0592 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/published/recommendation/[decisionId]/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0593 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/office-ai/advanced/role-config/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0595 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/login/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0597 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/local-content/workbook/[workbookId]/ai-insights-panel.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0598 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/local-content/workbook/[workbookId]/tb-import-dialog.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0600 — Possible icon-only control without accessible name

- **Category:** accessibility
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** button/icon pattern without aria-label/sr-only in file

### F-0602 — Heavy inline style usage

- **Category:** design-system
- **Files:** `src/app/local-content/quality-dashboard/quality-dashboard-client.tsx`
- **Evidence:** ≥5 style={{...}} occurrences
- **Suggestion:** Prefer Tailwind tokens / shared UI primitives (shadcn).

### F-0604 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/local-content/projects/[projectId]/suppliers/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0605 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/local-content/projects/[projectId]/spend/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0608 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/local-content/projects/[projectId]/findings/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0610 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/local-content/projects/[projectId]/evidence/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0613 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/local-content/projects/[projectId]/audit-trail/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0614 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/invite/[token]/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0615 — Heavy inline style usage

- **Category:** design-system
- **Files:** `src/app/institutional-memory/graph/page.tsx`
- **Evidence:** ≥5 style={{...}} occurrences
- **Suggestion:** Prefer Tailwind tokens / shared UI primitives (shadcn).

### F-0616 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/institutional-memory/graph/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0617 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/institutional-memory/events/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0618 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/en/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0629 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/content-studio/workspace-create-dialog.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0630 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/content-studio/[workspaceId]/[contentId]/content-evidence-section.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0631 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/content-studio/[workspaceId]/[contentId]/content-lifecycle-actions.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0632 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/content-studio/[workspaceId]/[contentId]/edit/content-edit-form.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0633 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/content-studio/[workspaceId]/create/content-create-form.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0634 — Possible icon-only control without accessible name

- **Category:** accessibility
- **Files:** `src/app/contacts/[id]/page.tsx`
- **Evidence:** button/icon pattern without aria-label/sr-only in file

### F-0635 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/contacts/[id]/relations/new/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0636 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/contacts/[id]/interactions/new/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0639 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(marketing)/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0651 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/settings/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0652 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/settings/sso/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0653 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/settings/mfa/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0656 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/organizations/create-button.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0658 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/notifications/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0659 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/knowledge-review/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0660 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/knowledge-foundation/history/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0662 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/intelligence/sectors/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0663 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/intelligence/sectors/[id]/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0666 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/decisions/[id]/what-to-do/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0667 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/decisions/[id]/tender/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0668 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/decisions/[id]/signals/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0669 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/decisions/[id]/sector/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0670 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/decisions/[id]/report/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0671 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/decisions/[id]/alerts/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0672 — Large page without responsive breakpoint classes

- **Category:** responsive
- **Files:** `src/app/(dashboard)/decisions/gov/escalation-rules/page.tsx`
- **Evidence:** No sm:/md:/lg: utilities detected

### F-0674 — Possible icon-only control without accessible name

- **Category:** accessibility
- **Files:** `src/app/(dashboard)/assistant/[taskId]/page.tsx`
- **Evidence:** button/icon pattern without aria-label/sr-only in file

## INFO Findings

### F-0515 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/workflowos/workflow-add-document-form.tsx`
- **Evidence:** text-[10px], text-[10px], text-[9px], text-[10px], text-[10px]

### F-0516 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/workflowos/workflow-client-list.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0517 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/workflowos/workflow-membership-manager.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0519 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/visuals/audit-trace-visual.tsx`
- **Evidence:** text-[10px], text-[9px], text-[10px], text-[8px], text-[9px]

### F-0521 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/visuals/custom-workflow-builder-visual.tsx`
- **Evidence:** text-[10px], text-[9px], text-[10px], text-[9px]

### F-0523 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/visuals/decision-matrix-visual.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0525 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/visuals/local-content-map-visual.tsx`
- **Evidence:** text-[10px], text-[9px], text-[10px], text-[10px], text-[10px]

### F-0527 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/visuals/operating-system-map-visual.tsx`
- **Evidence:** text-[10px], text-[10px], text-[9px], text-[10px], text-[10px]

### F-0530 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/visuals/sales-pipeline-visual.tsx`
- **Evidence:** text-[10px], text-[9px], text-[10px]

### F-0531 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/visuals/simulation-scenario-visual.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0532 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/sales/commercial-recommendations-panel.tsx`
- **Evidence:** text-[11px], text-[11px], text-[10px], text-[11px], text-[11px]

### F-0533 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/sales/cross-product-signal-strip.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0534 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/sales/executive-commercial-dashboard.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0535 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/sales/institutional-learning-panel.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0536 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/sales/knowledge-graph-explorer.tsx`
- **Evidence:** text-[10px], text-[11px], text-[10px], text-[11px]

### F-0537 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/sales/market-intelligence-view.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0538 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/sales/proof-asset-file-upload-scaffold.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px]

### F-0539 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/sales/proof-network-panel.tsx`
- **Evidence:** text-[10px], text-[11px], text-[10px], text-[11px]

### F-0540 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/sales/strategic-recommendations-panel.tsx`
- **Evidence:** text-[11px], text-[11px], text-[11px], text-[11px]

### F-0541 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/platform/platform-sidebar.tsx`
- **Evidence:** text-[9px], text-[9px], text-[11px], text-[9px], text-[10px]

### F-0542 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/organization/organization-workspace.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0543 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/office-ai/output-actions.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px]

### F-0544 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/marketing/home-sections.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0545 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/marketing/v2/product-page-template.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0546 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/marketing/v2/start-hub-page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[11px]

### F-0547 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/local-content/evidence-file-upload-form.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0549 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/local-content/verification-checklist-view.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0550 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/layout/site-footer.tsx`
- **Evidence:** text-[9px], text-[10px], text-[10px]

### F-0551 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/enterprise/aqliya-operating-map.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0552 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/enterprise/brand-architecture-panel.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[9px]

### F-0553 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/enterprise/command-center-panel.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[9px], text-[9px]

### F-0554 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/enterprise/product-proof-card.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0555 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/enterprise/solution-block.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0556 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/decisions/decision-dashboard.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0557 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/validation/validation-page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px]

### F-0558 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/shared/traceability-drawer.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0559 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/review/review-page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0560 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/recommendations/recommendations-page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px]

### F-0561 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/pilot/pilot-demo-flow.tsx`
- **Evidence:** text-[10px], text-[9px], text-[9px], text-[9px], text-[11px]

### F-0562 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/pilot/pilot-page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0563 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/notes/disclosure-auto-panel.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0564 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/notes/notes-page.tsx`
- **Evidence:** text-[11px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0565 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/governance/ProvenanceSummary.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0566 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/findings/findings-page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0567 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/factory-map/factory-mind-map.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px]

### F-0568 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/evidence/evidence-page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0569 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/engagement/platform-context-card.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0570 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/audit-trail/audit-trail-page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0571 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/approval/reviewer-signoff-chain-panel.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0572 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/ai/ai-outputs-panel.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0574 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/ai/ai-suggestion-panel.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0575 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/components/audit/admin/admin-users-page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0580 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/settings/retention/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0588 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/sales/audit-trail/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[9px], text-[10px]

### F-0594 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/login/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0596 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/local-content/workbook/[workbookId]/ai-insights-panel.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0599 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/local-content/workbook/[workbookId]/workbook-detail-client.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0601 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/local-content/settings/integrations/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0603 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/local-content/quality-dashboard/quality-dashboard-client.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[9px]

### F-0606 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/local-content/projects/[projectId]/reports/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0607 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/local-content/projects/[projectId]/findings/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0609 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/local-content/projects/[projectId]/evidence/page.tsx`
- **Evidence:** text-[9px], text-[10px], text-[11px]

### F-0611 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/local-content/projects/[projectId]/classification/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0612 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/local-content/projects/[projectId]/audit-trail/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[9px], text-[10px]

### F-0619 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/proof/page.tsx`
- **Evidence:** text-[10px], text-[11px], text-[10px], text-[10px], text-[10px]

### F-0620 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/products/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0621 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/platform/page.tsx`
- **Evidence:** text-[10px], text-[11px], text-[11px], text-[9px], text-[10px]

### F-0622 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/insights/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[9px]

### F-0623 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/insights/governance-over-intelligence/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0624 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/insights/assistant-vs-governed-intelligence/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0625 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/insights/ai-institutional-failures/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0626 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/industries/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px]

### F-0627 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/governance/page.tsx`
- **Evidence:** text-[10px], text-[11px], text-[11px], text-[10px]

### F-0628 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/en/about/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0637 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/auditos/demo-sidebar.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0638 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/auditos/traceability/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0640 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/use-cases/page.tsx`
- **Evidence:** text-[10px], text-[9px], text-[9px], text-[9px]

### F-0641 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/proof/page.tsx`
- **Evidence:** text-[10px], text-[11px], text-[10px], text-[10px], text-[10px]

### F-0642 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/products/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0643 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/platform/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[11px]

### F-0644 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/insights/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[9px]

### F-0645 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/insights/governance-over-intelligence/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0646 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/insights/assistant-vs-governed-intelligence/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0647 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/insights/ai-institutional-failures/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0648 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/industries/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px]

### F-0649 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/governance/page.tsx`
- **Evidence:** text-[10px], text-[11px], text-[11px], text-[11px], text-[11px]

### F-0650 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(marketing)/about/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px]

### F-0654 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(dashboard)/settings/audit-logs/page.tsx`
- **Evidence:** text-[10px], text-[11px], text-[11px], text-[11px], text-[10px]

### F-0655 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(dashboard)/overview/page.tsx`
- **Evidence:** text-[10px], text-[11px], text-[10px], text-[10px], text-[11px]

### F-0657 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(dashboard)/notifications/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

### F-0661 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(dashboard)/intelligence/page.tsx`
- **Evidence:** text-[10px], text-[11px], text-[10px]

### F-0664 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(dashboard)/governance-hub/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[11px], text-[11px]

### F-0665 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(dashboard)/decisions/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px]

### F-0673 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(dashboard)/assistant/page.tsx`
- **Evidence:** text-[9px], text-[9px], text-[11px], text-[10px], text-[10px]

### F-0675 — Many arbitrary px Tailwind values

- **Category:** spacing-typography
- **Files:** `src/app/(dashboard)/assistant/[taskId]/page.tsx`
- **Evidence:** text-[10px], text-[10px], text-[10px], text-[10px], text-[10px]

---

_AQLIYA Engineering Excellence · ui-quality_
