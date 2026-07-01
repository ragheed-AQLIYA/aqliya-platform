# AQLIYA SOC2 Readiness Roadmap

**Status:** Planning | **Version:** 1.0 | **Date:** 2026-06-30

## Current State

AQLIYA is NOT SOC2 certified. This document outlines the path to certification.

## Already in Place (Gap Analysis)

### Security (90% ready)
- ✅ RBAC with role hierarchy (viewer/operator/manager/admin)
- ✅ MFA enforcement for admin/operator roles
- ✅ Audit trail for all mutations
- ✅ Tenant isolation via organizationId
- ✅ Encryption at rest (AES-256-GCM for secrets)
- ✅ CSP headers configured
- ✅ Rate limiting on API routes

### Availability (60% ready)
- ✅ Docker stack with health checks
- ✅ CI/CD pipeline with automated testing
- ✅ Database backup scheduling
- ❌ No multi-region deployment
- ❌ No formal DR plan tested
- ❌ No SLA monitoring

### Processing Integrity (85% ready)
- ✅ Hash chain verification for audit logs
- ✅ Evidence graph for traceability
- ✅ Workflow engine with state validation
- ✅ Separation of duty rules
- ❌ No formal data retention testing

### Confidentiality (75% ready)
- ✅ File upload scanning (ClamAV)
- ✅ Download permission gates
- ✅ SSO/SAML/SCIM integration
- ❌ No DLP (Data Loss Prevention)
- ❌ No customer-managed encryption keys

### Privacy (70% ready)
- ✅ Data residency controls
- ✅ DPA-ready terms
- ❌ No formal privacy impact assessment
- ❌ No data subject access request workflow

## Timeline

| Phase | Scope | Timeline | Dependencies |
|-------|-------|----------|--------------|
| 1 | Gap assessment + remediation plan | Q3 2026 Week 1-2 | Pen test result |
| 2 | Policy documentation | Q3 2026 Week 3-4 | Legal team |
| 3 | Control implementation | Q3 2026 Week 5-8 | Engineering |
| 4 | Internal audit | Q3 2026 Week 9-10 | Audit team |
| 5 | External auditor engagement | Q4 2026 Week 1-4 | Budget |
| 6 | Certification | Q4 2026 Week 5-6 | All dependencies |

## Cost Estimate
- External auditor: SAR 80,000-120,000
- Internal engineering: ~4 weeks
- Policy/legal: ~2 weeks
