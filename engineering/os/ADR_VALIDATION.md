# Continuous ADR Validation

**Generated:** 2026-07-18T18:34:59.499Z  
**Overall ADR Compliance:** **100%**

## PLATFORM-ENFORCE

**Authorization uses enforce()/authorize()**

```
PLATFORM-ENFORCE
  ↓
Repository check
  ↓
Result: 100%
Remaining violations: 0
```


## PLATFORM-CLIENT-PRISMA

**Client/server boundary**

```
PLATFORM-CLIENT-PRISMA
  ↓
Repository check
  ↓
Result: 100%
Remaining violations: 0
```


## ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT

**ADR-DEPLOY-001: CloudFront WAF Attachment via `web_acl_id`**

```
ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT
  ↓
Repository check
  ↓
Result: 100%
Remaining violations: 0
```


> Validate ↔ Record: `npm run eng:memory` records; `npm run eng:os -- adr` validates.
