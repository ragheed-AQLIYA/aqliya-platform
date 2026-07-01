# LC-SPEC-01d: UX Specification — Project Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** UX Specification — retroactive alignment documenting the page structure, navigation, layout, loading/error states, and RTL bilingual user experience for LocalContentOS Project Management.
> **Parent:** `LC-PRD-01_Project_Management.md` v0.1 (Draft)
> **Depends On:** `LC-SPEC-01a_Domain_Specification.md` v0.1
> **Template:** Adapted from `SPEC-01d_UX_Specification.md` (IES-001 Reference)
> **Note:** All UX documented here reflects the existing implementation in `src/app/local-content/`. No new design.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-01a (Domain), LC-SPEC-01b (API), LC-SPEC-01c (Workflow) |
| **Blocks** | LC-SPEC-01e (Test Specification) |
| **Consumer** | Frontend Engineering, UX Design, QA Teams |
| **Evidence Classification** | Executable Evidence — all pages trace to existing routes |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Route structure | `src/app/local-content/` | 15+ page files |
| Route Handler contracts | LC-SPEC-01b | §1.3 (Route Handler Map) |
| Layout | `layout.tsx` | RTL, auth guard, PlatformSidebar + PlatformHeader |
| UI Components | `src/components/local-content/` | Shell components, forms, views |
| Loading/Error boundaries | `loading.tsx`, `error.tsx` files | 5 loading files, 3 error files |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| Page Map | All 15+ page routes with purpose | UX, QA |
| Navigation Structure | Sidebar + dashboard nav + detail nav | UX, Frontend |
| State Handling | Loading, error, empty state patterns | QA, Frontend |
| RTL/Bilingual Contract | Arabic-first layout with Arabic labels | UX, Localization |

---

## Dependencies

| Dependency | Type | Impact if Missing |
|---|---|---|
| `PlatformSidebar` | Layout component | No workspace navigation |
| `PlatformHeader` | Layout component | No user/session UI |
| `DashboardLayout` | Shell component | No consistent page structure |
| `getCurrentUser()` | Auth | Cannot protect workspace |

---

# 1. Page Map

## 1.1 Route Index

| # | Route | Page Purpose | Server Actions Consumed |
|---|---|---|---|
| 1 | `/local-content` | Dashboard — project summary + Content Studio summary | `listLocalContentProjectsAction`, `getContentStudioSummaryAction` |
| 2 | `/local-content/projects` | Project list — create + browse all projects | `listLocalContentProjectsAction` |
| 3 | `/local-content/projects/[projectId]` | Project detail — metrics + sub-page navigation | `getLocalContentProjectAction`, `getLocalContentScoreAction` |
| 4 | `/local-content/projects/[projectId]/suppliers` | Supplier CRUD | `listLocalContentSuppliersAction` |
| 5 | `/local-content/projects/[projectId]/spend` | Spend records management + CSV import | `listLocalContentSpendRecordsAction` |
| 6 | `/local-content/projects/[projectId]/evidence` | Evidence management + file upload | `listLocalContentEvidenceAction` |
| 7 | `/local-content/projects/[projectId]/classification` | Spend classification view | `listLocalContentSpendRecordsAction` |
| 8 | `/local-content/projects/[projectId]/findings` | Findings management | `listLocalContentFindingsAction` |
| 9 | `/local-content/projects/[projectId]/review` | Review workflow — submit reviews, view routing state | `listLocalContentReviewsAction`, `getLocalContentApprovalRoutingAction` |
| 10 | `/local-content/projects/[projectId]/approval` | Approval workflow — approve/reject with routing | `listLocalContentApprovalsAction`, `getLocalContentApprovalRoutingAction` |
| 11 | `/local-content/projects/[projectId]/reports` | Report generation + download | `listLocalContentReportsAction` |
| 12 | `/local-content/projects/[projectId]/audit-trail` | Audit event log | `listLocalContentAuditEventsAction` |
| 13 | `/local-content/projects/[projectId]/tender-match` | Tender match against AuditOS signals | `getLocalContentTenderMatchAction` |
| 14 | `/local-content/projects/[projectId]/verification` | Verification checklist | `getLocalContentVerificationChecklistAction` |
| 15 | `/local-content/projects/[projectId]/workbook/[workbookId]` | Workbook detail with AI advisor | Server actions from `localcontent-actions.ts` |

## 1.2 Content Studio Routes (Related but separate sub-system)

| Route | Purpose |
|---|---|
| `/local-content/campaigns` | Content campaign management |
| `/local-content/campaigns/[id]` | Campaign detail |
| `/local-content/review` | Review center (AI outputs queue) |
| `/local-content/review-center` | Consolidated review UI |
| `/local-content/outputs` | Output packages |

## 1.3 Settings & Admin Routes

| Route | Purpose |
|---|---|
| `/local-content/settings/integrations` | ERP integration settings |
| `/local-content/classification-rules` | Classification rule management |
| `/local-content/analytics` | Analytics dashboard |
| `/local-content/ai-advisor` | Cross-product AI advisor workspace |
| `/local-content/quality-dashboard` | AI quality metrics |
| `/local-content/pilot-readiness` | Pilot readiness checklist |

---

# 2. Navigation Structure

## 2.1 Layout Components

```
┌──────────────────────────────────────────────┐
│ PlatformSidebar │ PlatformHeader              │
│ (persistent     │ (user/session controls)     │
│  navigation)    │                              │
│                 ├──────────────────────────────┤
│                 │ Page Content                  │
│                 │ (children slot)               │
│                 │                               │
│                 │                               │
│                 │                               │
└─────────────────┴──────────────────────────────┘
```

**Layout:** `layout.tsx` — RTL (`dir="rtl"`), requires authentication, provides shell

## 2.2 Dashboard Content Structure

```
Dashboard (/)                     Content Studio Section
  ├─ PageHeader "LocalContentOS"    ├─ Campaigns count → link
  ├─ DevPhaseBadge                  ├─ Review queue count → link
  ├─ ContentStudioNav               ├─ Sources count → link
  ├─ Compliance Metrics Cards       └─ Outputs ready count → link
  │   ├─ Project count
  │   ├─ InReview count             Compliance Projects Section
  │   ├─ Approved count              ├─ Project count cards
  │   └─ Draft count                 ├─ Project list (if any)
  └─ Compliance Path Note            └─ EmptyState (if none)
```

## 2.3 Project Detail Navigation

The project detail page (route #3) serves as a **hub** with 11 sub-sections:

```
Project Detail
  ├─ Back link to /local-content
  ├─ Project name + StatusBadge
  ├─ Reporting period + scope description
  ├─ Score Summary Cards (4): Total Spend, Local Content %, Suppliers, Evidence Coverage
  └─ Navigation Grid (11 cards):
      ├─ الموردين (Suppliers)
      ├─ الإنفاق (Spend)
      ├─ الأدلة (Evidence)
      ├─ التصنيف (Classification)
      ├─ النتائج (Findings)
      ├─ المراجعة (Review)
      ├─ الاعتماد (Approval)
      ├─ التقارير (Reports)
      ├─ سجل التدقيق (Audit Trail)
      ├─ مطابقة المناقصة (Tender Match)
      └─ قائمة التحقق (Verification)
```

---

# 3. State Handling

## 3.1 Loading States

| Page | Loading File | Visual Pattern |
|---|---|---|
| `/local-content/projects` | `projects/loading.tsx` | 6 skeleton cards (h-40, animate-pulse) |
| `/local-content/projects/[projectId]` | `projects/[projectId]/loading.tsx` | 2-row skeleton grid |
| `/local-content/outputs` | `outputs/loading.tsx` | Skeleton grid |
| `/local-content/campaigns/[id]` | `campaigns/[id]/loading.tsx` | Skeleton layout |
| `/local-content/ai-advisor` | `ai-advisor/loading.tsx` | Skeleton layout |
| `/local-content` (root) | No loading file | Server-rendered, dynamic = force-dynamic |

Loading follows the Next.js App Router pattern: `loading.tsx` at route segment level renders while async pages resolve.

## 3.2 Error States

| Page | Error File | Pattern |
|---|---|---|
| `/local-content` (root) | `error.tsx` | Client error boundary |
| `/local-content/projects/[projectId]` | `projects/[projectId]/error.tsx` | Client error boundary |

Error boundaries catch rendering errors. Server-side errors (from Server Actions) are handled inline:

```typescript
// Pattern: inline error display
{!res.ok ? (
  <InlineNotice variant="error" title="..." description={res.error} />
) : null}
```

## 3.3 Not Found States

| Page | Not Found File | Pattern |
|---|---|---|
| `/local-content/projects/[projectId]` | `not-found.tsx` | Custom 404 for invalid project IDs |

## 3.4 Empty States

Pages with no data show the `EmptyState` component:

| Route | Empty Condition | EmptyState Content |
|---|---|---|
| `/local-content/projects` | No projects exist | "لم يتم إنشاء أي مشروع تقييم محتوى محلي بعد." + CTA |
| `/local-content` (side panel) | Projects length = 0 | "لا توجد مشاريع امتثال" + "إنشاء مشروع امتثال" CTA |

## 3.5 Edge Cases

| Scenario | UX Behavior | Handling |
|---|---|---|
| Server Action fails | `InlineNotice` with error message | `!res.ok` check in component |
| Network delay | Skeleton loading animation | `loading.tsx` files |
| Invalid project ID | Custom `not-found.tsx` | `if (!projectRes.ok) notFound()` |
| Cross-tenant access | Server throws 403 | Guard layer prevents data return |
| Workbook exported | Tabs locked with Arabic messages | Tab gates from `workflow-gating.ts` |
| Incomplete for export | Export tab locked with completion % | Tab gate `completionPct < 100` |

---

# 4. RTL / Bilingual Contract

## 4.1 Arabic-First Design

| Element | Language | Evidence |
|---|---|---|
| Layout direction | RTL (`dir="rtl"`) | `layout.tsx` line 18 |
| Page titles | Arabic with English fallback | "المشاريع / Projects" |
| Dashboard labels | Arabic | "المشاريع", "قيد المراجعة", "معتمد" |
| Navigation cards | Arabic | "الموردين", "الإنفاق", "الأدلة", "التصنيف" |
| Empty states | Arabic | "لا توجد مشاريع امتثال" |
| Error notices | Arabic | "تعذر تحميل ملخص المشاريع" |
| Loading skeletons | N/A | No text content |
| Inline notices | Arabic | All notice descriptions in Arabic |
| Tab gate reasons | Arabic | "تم تصدير الدفتر ولا يمكن تعديل القيم." |
| AI advisor disclaimer | Arabic | "يساعد ولا يعتمد آلياً" |

## 4.2 English Elements (Intentional)

| Element | Language | Rationale |
|---|---|---|
| Product name | English | Brand name — "LocalContentOS" |
| Status values | English | Interoperability — "Draft", "InReview", etc. |
| Page header: subtitle | English | "Compliance + Content Studio" |
| API route paths | English | Standard URL convention |

---

# 5. Component Map

All UI components are in `src/components/local-content/`.

| Component | Used On | Purpose |
|---|---|---|
| `local-content-shell` (shared) | All pages | `DashboardLayout`, `PageHeader`, `ProjectList`, `EmptyState`, `DevPhaseBadge`, `InlineNotice`, `LocalContentStatusBadge` |
| `project-create-form` | Projects list | Form to create new project |
| `tender-match-view` | Tender match page | Tender matching results view |
| `content-studio-nav` | Dashboard | Content Studio navigation tabs |
| Review/Approval UI | Review + Approval pages | Inline review submission + approval form |

---

# Traceability

| SPEC Element | PRD Reference | Code Evidence | Evidence Classification |
|---|---|---|---|
| Page Map (§1) | §2 (File Organization) | `src/app/local-content/` (15+ routes) | Executive |
| Navigation (§2) | §5 (User Journeys) | `layout.tsx`, `page.tsx` (dashboard) | Executive |
| Loading States (§3.1) | §2 (Error/Loading) | 5 `loading.tsx` files | Executive |
| Error States (§3.2) | §2 (Error/Loading) | 2 `error.tsx` + inline `InlineNotice` | Executive |
| Empty States (§3.4) | §2 (Empty) | `EmptyState` component usage | Executive |
| Edge Cases (§3.5) | §8 (Tab Access) | `workflow-gating.ts` tab gates | Executive |
| RTL/Bilingual (§4) | §3 (RTL/Arabic) | `layout.tsx` (dir=rtl), Arabic labels throughout | Executive |
| Constitution Principle: Accessibility | §4 | Loading, error, not-found, empty states all covered | Governance |

---

## Alignment Delta

Because this is a **Brownfield Alignment** (LIA-001) and not a Greenfield or Cross-Product design:

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ 15+ page routes in `src/app/local-content/`, layout with RTL + auth guard, 5 loading files, 2 error boundaries, Arabic-first labels |
| **Documented** | ✅ This specification retroactively describes the existing UX structure |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** UX Specification — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LC-PRD-01_Project_Management.md` v0.1
- **Program:** LIA-001 (LC-EPIC-01)
- **Status:** **Frozen** (LC-EPIC-01 complete)
- **Next:** LC-SPEC-01e (Test Specification) — *already frozen*
