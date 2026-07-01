# Wave 1 Security Hardening Report

**Date:** 2026-05-31  
**Scope:** Platform access guard wiring, API route auth audit, tenant isolation review  
**Schema changes:** None

## Summary

Wave 1 security closure applied unified CoreAccessControl checks to platform server actions, added organization/settings mutations with audit events, tightened pilot diagnostics API auth, and documented public vs protected routes.

## P1 — Unified Access in Server Actions

Added `src/core/access/server-action-guard.ts` with checkAccess, isAuthorized, requireAccess, requireReadAccess, requireMutationAccess.

Applied to organization-actions, platform-org-actions, settings-actions, studio-actions, download-token-actions, and createDecision in decisions.ts.

Product-specific guards unchanged for AuditOS (getAuditActor), SalesOS (validateWorkspaceAccess), LocalContentOS (assertProjectAccess).

Demo route /auditos untouched per aqliya-demo-safety.

## P2 — Organizations + Settings Mutations

createOrganizationAction / updateOrganizationAction with audit events and UI forms. Prototype badge removed.

## P3 — API Route Audit

Protected: metrics, core health, memory routes, sales knowledge-graph, download routes, pilot/ops (fixed to OPERATOR+).

Public by design: /api/health, /api/auth, /api/custom-product-submit, /api/pilot-review.

## Residual Risks

- User preferences on /settings remain client-only
- Organization member CRUD not implemented
- WorkflowOS / Office AI still use legacy requireUserContext

## Validation

npx tsc --noEmit — pass (2026-05-31)