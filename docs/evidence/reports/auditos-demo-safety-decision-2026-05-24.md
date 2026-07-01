# auditos Demo Safety Decision — 2026-05-24

## Decision

Keep `/auditos/*` public.

This decision is valid because the route family is currently a guided demo surface, not a governed workspace, and the code now makes that distinction explicit in the UI.

## Authority Applied

1. `docs/DOCUMENTATION_AUTHORITY.md`
2. `docs/official/AQLIYA_MASTER_REFERENCE.md`
3. `docs/source-of-truth/ROUTE_STRATEGY.md`
4. Implementation reality in `src/app/auditos/**` and `src/lib/audit/demo-data.ts`

Route doctrine already states:

- `/audit/*` = protected governed workspace
- `/auditos/*` = public guided demo, mock-backed, read-only, always labeled `Demo`

## Implementation Reality Reviewed

Evidence inspected in code:

- `src/app/auditos/**` renders static demo pages only.
- `src/lib/audit/demo-data.ts` is explicitly read-only and imports mock data only.
- No `use server`, no form submission, no file inputs, no mutation handlers, no DB access, and no API calls were found in `src/app/auditos/**`.
- `src/proxy.ts` currently leaves `/auditos/*` public, consistent with route doctrine.

## Risks Found Before Decision

The route was technically safe to keep public, but not framed safely enough:

1. The demo disclaimer was not pinned across all pages.
2. Visible labels included client-like names, person names, and demo file names.
3. Some copy could be read as if a real upload or production workspace action had happened.

These were presentation risks, not data-access risks.

## Changes Applied

Files updated:

- `src/app/auditos/layout.tsx`
  Added a top-of-page disclaimer stating that the route is a public demo with fixed data, no client data, no uploads, no saved changes, and no production workspace behavior.

- `src/app/auditos/demo-sidebar.tsx`
  Strengthened demo-only framing in the persistent navigation.

- `src/app/auditos/page.tsx`
  Replaced client-like visible labels with generic demo labels and sanitized recent activity display.

- `src/app/auditos/trial-balance/page.tsx`
  Removed wording that implied a real visitor upload.

- `src/app/auditos/evidence/page.tsx`
  Replaced visible file names and uploader names with generic demo-safe labels and sanitized narrative text.

- `src/app/auditos/traceability/page.tsx`
  Replaced visible actor names and raw event descriptions with demo-safe labels.

- `src/app/auditos/demo-safety.ts`
  Centralized demo-safe presentation helpers.

## Post-Change Safety Check

Checklist for keeping `/auditos/*` public:

- Clearly labeled as demo: PASS
- No real upload from visitor: PASS
- No visible client-specific data in the route UI: PASS
- Does not present as production workspace: PASS
- Disclaimer at top of page: PASS

## Why Gating Was Not Chosen

Gating would add friction without reducing a real data exposure path, because the reviewed route family is already mock-only and read-only.

The correct threshold for gating is if `/auditos/*` later gains any of the following:

- real customer data
- authenticated workspace behavior
- uploads or saved mutations
- protected exports/downloads
- tenant-scoped state
- customer-specific sales/demo content

If any of that happens, `/auditos/*` should move behind auth in `src/proxy.ts` or be replaced by a protected demo workspace.

## Final Decision Statement

`/auditos/*` remains public as a guided demo surface.

It should not be used as a serious client workspace. For serious customer walkthroughs with real or customer-specific data, use the protected `/audit/*` workspace or explicitly gate a dedicated protected demo surface.
