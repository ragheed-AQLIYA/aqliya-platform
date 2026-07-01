# Permission helper

﻿# SalesOS v0.3 - PR-7C RBAC UI

**Status:** light validated (unit test for getSalesPermissionsForRole added; full suite not run per low-load protocol)
**Scope:** Sales pages/components only - server passes canCreate / canUpdate from getSalesPermissionsForRole(user.role); VIEWER sees read-only UI.

## Permission helper

- src/lib/sales/permissions.ts - SalesRolePermissions, getSalesPermissionsForRole(role)

## Components

- deal-create-form, account-create-form (canCreate)
- deal-stage-form, deal-status-form, account-edit-form, deal-next-action-form, deal-evidence-panel (canUpdate)
- deal-interaction-panel (canCreate, canUpdate)
- sales-shell: SalesNavLinks canCreate, SalesViewerReadOnlyNotice

## Server pages

- deals/page, deals/new, deals/[id], accounts/page, accounts/new, accounts/[id]

## Excluded

- interactions.ts encoding, pipeline page, migration SQL

## Arabic one-liner

واجهة SalesOS تخفي أزرار الإنشاء والتعديل عن دور VIEWER مع بقاء القراءة والسيرفر يمنع التغيير.
