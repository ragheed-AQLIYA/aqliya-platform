# Continuous ADR Validation

**Generated:** 2026-07-11T11:27:35.799Z  
**Overall ADR Compliance:** **59%**

## PLATFORM-ENFORCE

**Authorization uses enforce()/authorize()**

```
PLATFORM-ENFORCE
  ↓
Repository check
  ↓
Result: 52%
Remaining violations: 13
```

- `src/actions/contact-export-actions.ts`
- `src/actions/contact-review-actions.ts`
- `src/actions/content-evidence-actions.ts`
- `src/actions/decision-templates.ts`
- `src/actions/ingestion-actions.ts`
- `src/actions/institutional-memory-actions.ts`
- `src/actions/localcontent-audit-admin-actions.ts`
- `src/actions/localcontent-review-actions.ts`
- `src/actions/localcontent-workbook-actions.ts`
- `src/actions/mfa.ts`
- `src/actions/office-ai-actions.ts`
- `src/actions/registration-actions.ts`
- `src/actions/tenant-actions.ts`

## PLATFORM-CLIENT-PRISMA

**Client/server boundary**

```
PLATFORM-CLIENT-PRISMA
  ↓
Repository check
  ↓
Result: 55%
Remaining violations: 3
```

- `src/app/local-content/settings/integrations/page.tsx`
- `src/app/(dashboard)/decisions/[id]/tender/page.tsx`
- `src/app/(dashboard)/decisions/[id]/outcome/page.tsx`

## ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT

**ADR-DEPLOY-001: CloudFront WAF Attachment via `web_acl_id`**

```
ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT
  ↓
Repository check
  ↓
Result: 70%
Remaining violations: 1
```

- `Both web_acl_id and aws_wafv2_web_acl_association present — review`

> Validate ↔ Record: `npm run eng:memory` records; `npm run eng:os -- adr` validates.
