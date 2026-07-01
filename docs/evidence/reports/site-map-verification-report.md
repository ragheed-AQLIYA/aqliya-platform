# Site Map Verification Report

**Date:** 2026-05-23
**Type:** Route & site-map verification
**Product/System affected:** AQLIYA Platform — all routes

---

## Summary

- Verified 109 page routes + 10 API routes against source-of-truth documentation.
- No dead routes found. No missing documented routes. All navigation links point to existing routes.
- Found one source-of-truth conflict: `AQLIYA_ARCHITECTURE.md` describes LocalContentOS as "not yet implemented" while code reality shows a real L5 workspace with 12 routes.
- Found one marketing undersell: `/products/local-content` describes LocalContentOS as "in planning stage" while the workspace is implemented.
- Found one navigation gap: LocalContentOS has no entry in the platform sidebar and its layout renders without sidebar/header chrome.
- Public product pages (SimulationOS, SalesOS) correctly label themselves as planned/under development — no overclaiming.

## Files Inspected

| File | Purpose |
|------|---------|
| `src/app/` directory tree | Route inventory (all subdirectories) |
| `src/app/layout.tsx` | Root layout |
| `src/app/(marketing)/layout.tsx` | Marketing layout (SiteHeader + SiteFooter) |
| `src/app/(marketing)/page.tsx` | Homepage |
| `src/app/(marketing)/products/simulation/page.tsx` | SimulationOS marketing — verify no overclaim |
| `src/app/(marketing)/products/sales/page.tsx` | SalesOS marketing — verify no overclaim |
| `src/app/(marketing)/products/local-content/page.tsx` | LocalContentOS marketing — verify accuracy |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout (PlatformSidebar + PlatformHeader) |
| `src/app/audit/layout.tsx` | AuditOS layout |
| `src/app/local-content/layout.tsx` | LocalContentOS layout |
| `src/app/published/recommendation/[decisionId]/page.tsx` | Published recommendation route |
| `src/components/layout/site-header.tsx` | Marketing navigation links |
| `src/components/layout/site-footer.tsx` | Marketing footer links |
| `src/components/layout/sidebar.tsx` | Legacy sidebar |
| `src/components/platform/platform-sidebar.tsx` | Platform sidebar (dashboard navigation) |
| `src/components/platform/platform-header.tsx` | Platform header |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | Route strategy reference |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Product status reference |
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | Architecture reference |
| `README.md` | Project entry point |

## Files Changed

None — verification-only pass; no code modifications permitted.

## Commands Run

| Command | Classification | Result |
|---------|---------------|--------|
| `Get-ChildItem -Recurse -Depth 4` (per directory) | Light — targeted file listing | Route inventory complete |
| Targeted file reads (22 files) | Light — no build/run | Content verified |

## Heavy Commands Used

**No.**

## RAM Risk

**None.** File reads and directory listings only.

---

## Actual Route Inventory

### Public Marketing Routes (34 pages)

| Route | Exists? | Notes |
|-------|---------|-------|
| `/` | ✅ | Marketing homepage |
| `/about` | ✅ | |
| `/buyers/audit-partner` | ✅ | |
| `/buyers/cfo` | ✅ | |
| `/buyers/cio` | ✅ | |
| `/buyers/government` | ✅ | |
| `/buyers/procurement` | ✅ | |
| `/case-studies` | ✅ | |
| `/contact` | ✅ | |
| `/custom-product` | ✅ | |
| `/demo` | ✅ | |
| `/deployment` | ✅ | |
| `/engagement-models` | ✅ | |
| `/executive-brief` | ✅ | |
| `/executive-briefing` | ✅ | |
| `/governance` | ✅ | |
| `/how-we-work` | ✅ | |
| `/insights` | ✅ | |
| `/insights/ai-institutional-failures` | ✅ | |
| `/insights/assistant-vs-governed-intelligence` | ✅ | |
| `/insights/governance-over-intelligence` | ✅ | |
| `/pilot-proof` | ✅ | |
| `/platform` | ✅ | |
| `/privacy` | ✅ | |
| `/products` | ✅ | Product catalog |
| `/products/audit` | ✅ | |
| `/products/decision` | ✅ | |
| `/products/local-content` | ✅ | ❗ Undersells — says "planning" but workspace exists |
| `/products/sales` | ✅ | Correctly labeled "under development" |
| `/products/simulation` | ✅ | Correctly labeled "under planning" |
| `/proof-library` | ✅ | |
| `/security` | ✅ | |
| `/terms` | ✅ | |
| `/use-cases` | ✅ | |

### Auth Routes (2 pages)

| Route | Exists? | Notes |
|-------|---------|-------|
| `/login` | ✅ | |
| `/access-denied` | ✅ | |

### Protected Workspace Routes (73 pages)

| Route Group | Pages | Protected by | Notes |
|-------------|-------|-------------|-------|
| `/audit` + 15 sub-routes | 16 | Proxy + route auth | Pilot-ready (L5) |
| `/auditos` + 5 sub-routes | 6 | Public (demo) | Public guided demo |
| `/decisions` + 18 sub-routes | 19 | Proxy + dashboard layout | Active adjacent (L4) |
| `/local-content` + 11 sub-routes | 12 | Own layout (auth only) | L5 with conditions. No sidebar. |
| `/assistant` + `[taskId]` | 2 | Proxy + dashboard layout | Shared application (L4) |
| `/intelligence/sectors` + `[id]` | 2 | Proxy + dashboard layout | |
| `/sales` | 1 + layout | Proxy + own layout | Prototype (L3) |
| `/sunbul` + `/admin` + record detail | 3 + layout | Proxy + own layout | Custom workspace (L4) |
| `/workflowos` + `/admin` + record detail | 3 + layout | Proxy + own layout | Route alias over Sunbul |
| `/organizations` + `[id]` | 2 | Proxy + dashboard layout | Prototype (L3) |
| `/organizations/sunbul` | 1 | Separate page | Links to Sunbul |
| `/settings` + 3 sub-routes | 4 | Proxy + dashboard layout | Mix of shell (L2) and active (L4) |
| `/monitoring` | 1 | Proxy + dashboard layout | Active (L4) |
| `/published/recommendation/[decisionId]` | 1 | Proxy + route-level action | Legacy |

### API Routes (10 routes)

| Route | Protection | Notes |
|-------|-----------|-------|
| `/api/auth/[...nextauth]` | Public | NextAuth v5 |
| `/api/health` | Public | |
| `/api/custom-product-submit` | Public | Marketing form |
| `/api/metrics` | Admin only | |
| `/api/audit/evidence/[evidenceId]/download` | Protected + tenant | |
| `/api/audit/engagements/[engagementId]/exports/[format]` | Protected + tenant | |
| `/api/office-ai/download` | Protected + platform org | |
| `/api/local-content/projects/[projectId]/reports/[reportId]/download` | Protected + project | |
| `/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf` | Protected + client | |
| `/api/sunbul/documents/[documentId]/download` | Protected + client | |

---

## Navigation Link Verification

### Site Header (Marketing)
All 6 primary nav links → existing routes ✅
- `/platform`, `/products`, `/governance`, `/case-studies`, `/about`, `/contact`
- Demo CTA → `/demo` ✅
- Executive CTA → `/contact` ✅

### Site Footer
All 30 footer links verified against actual routes → All exist ✅
- 4 platform/governance links
- 4 active systems links
- 5 buyer persona links
- 6 evidence/collaboration links
- 6 company/knowledge links
- 5 legal links

### Platform Sidebar (Authenticated)
**Module switcher:** AuditOS, DecisionOS, SalesOS, Sunbul — all routes exist ✅

**Missing from module switcher:** LocalContentOS ❌

**platformNav (active for DecisionOS module):**
- `/decisions` ✅
- `/organizations` ✅
- `/organizations/sunbul` ✅
- `/intelligence/sectors` ✅
- `/settings` ✅
- `/settings/platform-organization` ✅
- `/settings/workspaces` ✅
- `/settings/audit-logs` ✅
- `/assistant` ✅

**auditNav, salesNav, sunbulNav** — all links verified ✅

---

## Product Route Matrix

| Product | Marketing Route | Workspace Route | Docs Status | Actual Status | Match? |
|---------|---------------|----------------|-------------|--------------|--------|
| AuditOS | `/products/audit` | `/audit/*` (16 routes) | L5 Pilot-ready | L5 Pilot-ready | ✅ |
| DecisionOS | `/products/decision` | `/decisions/*` (19 routes) | L4 Active adjacent | L4 Active adjacent | ✅ |
| LocalContentOS | `/products/local-content` | `/local-content/*` (12 routes) | L5 with conditions | L5 with conditions | ⚠️ Architecture doc says "not yet implemented" |
| SalesOS | `/products/sales` | `/sales` | L3 Prototype | L3 Prototype | ✅ |
| SimulationOS | `/products/simulation` | — | L1 Marketing-only | L1 Marketing-only | ✅ |
| Office AI Assistant | — | `/assistant/*` (2 routes) | L4 Shared app | L4 Shared app | ✅ |
| Sunbul | — | `/sunbul/*` (3 routes) | L4 Custom workspace | L4 Custom workspace | ✅ |
| workflowos | — | `/workflowos/*` (3 routes) | L3 Prototype | L3 Prototype | ✅ |

---

## Protected Route Classification

| Route Group | Proxy Protects? | Layout Auth | Correctly Classified? |
|-------------|----------------|------------|----------------------|
| `/audit/*` | ✅ Yes | Own layout | ✅ |
| `/decisions/*` | ✅ Yes | Dashboard layout | ✅ |
| `/local-content/*` | ✅ Yes | Own layout (no sidebar) | ⚠️ Missing sidebar integration |
| `/assistant/*` | ✅ Yes | Dashboard layout | ✅ |
| `/sales` | ✅ Yes | Own layout (no sidebar) | ⚠️ Prototype — correct |
| `/sunbul/*` | ✅ Yes | Own layout | ✅ |
| `/workflowos/*` | ✅ Yes | Own layout | ✅ |
| `/organizations/*` | ✅ Yes | Dashboard layout | ✅ |
| `/intelligence/*` | ✅ Yes | Dashboard layout | ✅ |
| `/settings/*` | ✅ Yes | Dashboard layout | ✅ |
| `/monitoring` | ✅ Yes | Dashboard layout | ✅ |
| `/published/recommendation/*` | ✅ Yes (proxy matcher) | Separate layout | ✅ |

---

## Findings

### Finding 1: Source-of-truth conflict — LocalContentOS status in AQLIYA_ARCHITECTURE.md
- **File:** `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` line 27
- **Says:** "Local Content OS (strategic second product, scope locked for v0.1, **not yet implemented**)"
- **Reality:** Real workspace at `/local-content/*` with 12 routes, server actions, seed data, bilingual UI, evidence upload, review/approval, audit trail — rated L5 pilot-ready with conditions
- **Correct source:** `ROUTE_STRATEGY.md` and `PRODUCT_STATUS_MATRIX.md` accurately reflect L5 status
- **Impact:** Architecture doc is stale and contradicts both route strategy and code reality
- **Fix not applied:** Per instructions, `docs/official/**` cannot be modified. `AQLIYA_ARCHITECTURE.md` is source-of-truth (level 4), which is modifiable, but the task scope limits changes to the report and ROUTE_STRATEGY.md only.

### Finding 2: LocalContentOS marketing page undersells the product
- **File:** `src/app/(marketing)/products/local-content/page.tsx` line 199
- **Says:** "LocalContentOS في مرحلة التخطيط. نبحث عن شركاء تصميم للتحقق من الاحتياج وتحديد نطاق البايلوت" (in planning stage, looking for design partners)
- **Reality:** Fully implemented workspace at `/local-content/*` with 12 routes, L5 pilot-ready with conditions
- **Impact:** Marketing page understates product readiness. Potential customers may not know the product is usable.
- **Fix not applied:** Per instructions, app code modification is forbidden.

### Finding 3: LocalContentOS missing from platform sidebar
- **File:** `src/components/platform/platform-sidebar.tsx` — `modules` array
- **Missing:** No `local-content` entry in the sidebar module switcher
- **Missing:** `getActiveModule()` does not handle `/local-content` path prefix
- **Missing:** No `localContentNav` configuration
- **Impact:** Authenticated users navigating to `/local-content/*` see no sidebar navigation. The layout at `src/app/local-content/layout.tsx` renders bare content without `PlatformSidebar` or `PlatformHeader`.
- **Fix not applied:** Per instructions, component modification is forbidden.

### Finding 4: No overclaiming on public product pages
- `/products/simulation` — metadata says "قيد التخطيط، يُعرَض حاليًا كصفحة تعريفية" (under planning, informational page only) ✅
- `/products/sales` — metadata says "قيد التطوير" (under development) ✅
- All public pages accurately reflect their implementation status.

### Finding 5: All navigation links verified — no broken links
- SiteHeader: 6 primary nav links + 2 CTAs → all existing
- SiteFooter: 30 links → all existing
- PlatformSidebar: ~25 links across all nav sets → all existing

---

## Source-of-Truth Conflicts Summary

| Document | Claim | Code Reality | Severity |
|----------|-------|-------------|----------|
| `AQLIYA_ARCHITECTURE.md` | LocalContentOS "not yet implemented" | L5 with conditions, 12 workspace routes | 🔴 Stale — contradicts reality |
| `ROUTE_STRATEGY.md` | LocalContentOS L5 with conditions | Matches code | ✅ Accurate |
| `PRODUCT_STATUS_MATRIX.md` | LocalContentOS L5 with conditions | Matches code | ✅ Accurate |
| `README.md` | LocalContentOS L5 with conditions | Matches code | ✅ Accurate |
| `docs/official/aqliya-core-architecture-v1.1.md` | Not inspected | N/A | ⚪ Not inspected per scope |

---

## Final Status

**PASS with reservations**

### Pass reasons
- All documented routes exist in code. All code routes are documented.
- All navigation links point to existing routes. No broken links.
- Public product pages accurately label unbuilt products (no overclaiming).
- Protected route classification is correct.
- No dead routes found.

### Reservations
1. `AQLIYA_ARCHITECTURE.md` claims LocalContentOS is "not yet implemented" — contradicts reality. Should be updated.
2. `/products/local-content` marketing page describes LocalContentOS as "in planning" — undersells the implemented workspace.
3. LocalContentOS has no sidebar entry in `PlatformSidebar` and its layout renders without navigation chrome.

## Post-Verification Corrections

### Agent 4 — Documentation Reality Alignment

- **Corrected:** `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` — LocalContentOS status changed from "not yet implemented" to "workspace at /local-content/*, L5 pilot-ready with conditions". Added `/local-content` workspace route to the Route Model table. Added LocalContentOS reality alignment note.
- See `docs/reports/documentation-reality-alignment-report.md` for full details.

### Agent 5 — LocalContentOS Navigation & Positioning Fix

**Findings 2 and 3 are now closed.**

- **Marketing page fixed:** `/products/local-content` badge changed from "مرحلة التخطيط" to "مساحة عمل تجريبية متاحة"; subtext and CTA updated to reflect the pilot-ready workspace with a direct link to `/local-content`.
- **Sidebar entry added:** LocalContentOS module added to `PlatformSidebar` with amber-600 accent color, `Globe` icon, and dedicated nav items (Dashboard, Projects, shared platform links).
- **Layout chrome fixed:** `local-content/layout.tsx` now wraps children with `PlatformSidebar` + `PlatformHeader` with RTL layout, matching the AuditOS dashboard pattern.
- **Platform header fixed:** `getWorkspaceInfo` in `platform-header.tsx` now handles `/local-content` prefix and shows "LocalContentOS / نظام المحتوى المحلي".
- **CSS variable added:** `--module-localcontent: #d97706` and its `--color-module-localcontent` mapping for consistent module accent theming.

See `docs/reports/localcontentos-navigation-positioning-fix-report.md` for full details.

## Pilot Recommendation

**Pilot-ready — all reservations closed**

AQLIYA is pilot-ready from a route, site-map, navigation, and product-positioning perspective. All three reservations from the initial verification pass have been resolved:

1. ✅ **Documentation conflict** — corrected by Agent 4 (AQLIYA_ARCHITECTURE.md now reflects L5 reality)
2. ✅ **Marketing page undersell** — corrected by Agent 5 (badge, subtext, CTA now reflect pilot-ready workspace)
3. ✅ **Sidebar/layout gap** — corrected by Agent 5 (LocalContentOS module added to sidebar, layout wrapped with chrome)
