# Sunbul Organization Workspace Report

**Date:** 2026-05-19
**Status:** Created — Organization workspace shell for Sunbul client
**Route:** `/organizations/sunbul`

---

## Purpose

Provide a dedicated organization workspace page for the Sunbul client/company within AQLIYA. This page makes the corrected mental model visible:

- Sunbul is a **client organization**, not a product
- WorkflowOS, AuditOS, DecisionOS, SalesOS are **products** that Sunbul uses
- Employees, roles, and product access are presented from an organization perspective

---

## Route

**URL:** `/organizations/sunbul`

**Layout:** Uses the platform sidebar + header (same as `/sunbul` layout pattern)

**Auth:** Requires authentication. Redirects to `/login` if unauthenticated. No ADMIN role restriction — any authenticated user can view the organization workspace.

---

## UI Sections

### 1. Organization Overview Header
- Title: "شركة سنبل"
- Subtitle: "Sunbul — مساحة مؤسسة داخل عقلية تستخدم المنتجات المفعلة لها."

### 2. Organization Stats Cards
- Total users
- Admins (Platform Admin)
- Operators
- Reviewers

All counts are fetched from the `User` model by `role`.

### 3. Enabled Products Section
Four product cards, each showing:
- Product name (Arabic + English)
- Status badge
- Description note with real data counts
- Link to open the product
- Link to admin page (if applicable)
- Route debt warning for WorkflowOS (`/sunbul` → `/workflowos`)

Products displayed:
| Product | Status | Real Data |
|---------|--------|-----------|
| WorkflowOS | Dynamic | Counts clients, records, memberships from DB |
| AuditOS | "متاح" | Static — always available |
| DecisionOS | "متاح" | Static — always available |
| SalesOS | "نموذج أولي" | Static — prototype |

### 4. Employees & Roles Summary
- Platform Admin count
- Operator count
- Reviewer count
- Conditional message showing WorkflowOS memberships if data exists

### 5. Organization Actions
- **إدارة WorkflowOS** → `/sunbul/admin`
- **فتح WorkflowOS** → `/sunbul`
- **إعدادات المؤسسة** → disabled placeholder
- **إدارة الموظفين** → disabled placeholder

---

## Links to Enabled Products

| Product | Link | Admin Link |
|---------|------|------------|
| WorkflowOS | `/sunbul` | `/sunbul/admin` |
| AuditOS | `/audit` | — |
| DecisionOS | `/decisions` | — |
| SalesOS | `/sales` | — |

---

## Transitional Route Debt

The WorkflowOS product currently lives at the legacy route `/sunbul`. The organization workspace correctly links to `/sunbul` for WorkflowOS but displays a warning:

> المسار التقني الحالي مؤقت (/sunbul) وسيتم ترحيله لاحقاً إلى /workflowos

This debt is documented in `docs/architecture/aqliya-client-organization-model.md`.

---

## Sidebar Integration

- **Org context badge** (showing "Sunbul / المؤسسة الحالية") is now clickable → links to `/organizations/sunbul`
- **New nav item**: "شركة سنبل" added to the platform nav under "المنظمات"
- Nav item uses `Building2` icon to distinguish from the WorkflowOS product (`KanbanSquare`)

---

## File Changes

| File | Action |
|------|--------|
| `src/app/organizations/sunbul/page.tsx` | Created — server component with auth + data fetch |
| `src/components/organization/organization-workspace.tsx` | Created — client component with full UI |
| `src/components/platform/platform-sidebar.tsx` | Modified — added Building2 import, "شركة سنبل" nav item, clickable org badge |
| `src/components/platform/platform-header.tsx` | Modified — added sunbul breadcrumb mapping |

---

## Validation Results

See validation run below.
