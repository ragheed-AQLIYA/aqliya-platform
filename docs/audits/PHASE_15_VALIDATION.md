# Phase 15 Validation — Presentation Policy Administration (CRUD)

**Date:** 2026-06-14  
**Scope:** Governance/configuration — no accounting engine changes  
**Prior:** [`PHASE_14_VALIDATION.md`](./PHASE_14_VALIDATION.md)

---

## Objective

Move from **system-seeded policies only** to **org-managed presentation policies**:

- List system + org policies
- Clone custom policy from template
- Edit key policy fields (org-owned)
- Assign policy to engagement with FS rebuild

---

## Implementation Summary

| Task | Deliverable | Status |
|------|-------------|--------|
| Policy service | `presentation-policy-service.ts` | ✅ |
| List (system + org) | `listPresentationPoliciesForOrganization` | ✅ |
| Clone from template | `createOrgPresentationPolicyFromTemplate` | ✅ |
| Update org policy | `updateOrgPresentationPolicy` (non-system only) | ✅ |
| Assign to engagement | `assignPresentationPolicyToEngagement` | ✅ |
| Server actions | `audit-presentation-policy-actions.ts` | ✅ |
| Admin UI | `PresentationPolicySettings` on engagement page | ✅ |
| FS rebuild on assign | Reuses Phase 13.1.1 orchestrator | ✅ |
| Audit event | `engagement.presentation_policy_assigned` | ✅ |
| System policy protection | `isSystem: true` → read-only | ✅ |

---

## Admin UX (Engagement Page — admin only)

1. **Policy dropdown** — system policies + org custom policies  
2. **تعيين السياسة وإعادة البناء** — assigns `presentationPolicyId` + auto rebuild  
3. **Clone** — duplicate current/template policy as org-owned custom  
4. **Edit** (custom only) — GL exclusions, CoR prefixes, other income target, finance offset  
5. **Viewer** — read-only summary card (unchanged)

Profile settings (Phase 13.1) remain separate; explicit policy assignment overrides profile default until profile is changed again.

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass |
| `npm test -- presentation-policy-service.test.ts presentation-policy.test.ts` | Pass |

---

## Files Changed

- `src/lib/audit/presentation/presentation-policy-service.ts`
- `src/actions/audit-presentation-policy-actions.ts`
- `src/components/audit/engagement/presentation-policy-settings.tsx`
- `src/app/audit/engagements/[engagementId]/page.tsx`
- `src/lib/audit/presentation/__tests__/presentation-policy-service.test.ts`

---

## Known Limitations

- No org-wide policy list page (engagement-scoped admin only).
- Full JSON policy editor not exposed — key fields only.
- Clone requires page refresh to refresh dropdown (uses `router.refresh()`).
- DB migration `20260614130000_presentation_policy_engine` must be deployed before CRUD works in staging.

**Verdict:** Phase 15 **complete** for pilot policy administration MVP.

---

## Next Steps

| Priority | Item |
|----------|------|
| 1 | **Shalfa pilot rollout** — engagement + TB upload + assign `shalfa-pilot-audited-v1` |
| 2 | CoR fine-tune (−0.31%) if sub-0.1% required |
| 3 | Org policy list page + delete/archive |
| 4 | Western COA GL inference |
