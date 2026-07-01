---
title: Access Governance Doctrine
document_id: 08.08
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 04.01, 05.01, 08.01, 08.06, 08.09, 08.11, 12.06, 15.06
---

# Access Governance Doctrine

## 1. Purpose

This document defines how access should be governed across data, evidence, workflows, and decision objects in AQLIYA.

## 2. Thesis

**Access in AQLIYA must be governed at the level of evidence sensitivity, decision authority, and tenant boundary, not just coarse application roles.**

## 3. Problem

Traditional enterprise products often stop at role-based visibility. That is insufficient in environments where access to a single evidence file, finding, or financial object can create confidentiality, independence, or liability issues.

## 4. Why Existing Systems Fail

- coarse roles expose too much by default
- document permissions are disconnected from workflow authority
- data access is not aligned with evidence sensitivity
- cross-tenant mistakes are treated as operational bugs rather than trust failures

## 5. AQLIYA Philosophy

Access governance is substantive governance. Because evidence is the unit of trust, who can see, change, approve, or export evidence is central to enterprise defensibility. Access must align with workflow responsibility and tenant isolation. This is especially critical in AuditOS and Financial Intelligence where sensitive client information is foundational.

## 6. Core Principles

1. Least privilege is necessary but not sufficient.
2. Access should be object-sensitive, not only role-sensitive.
3. Visibility, edit rights, approval rights, and export rights are separate concerns.
4. Tenant boundary integrity is absolute.
5. Access grants and changes must be auditable.
6. Emergency access requires explicit governance and review.

## 7. Key Concepts

- **Access Scope:** The exact tenant, object class, and action set a user may perform.
- **Sensitive Evidence Class:** Evidence requiring additional restrictions due to confidentiality or regulation.
- **Contextual Access:** Access determined by workflow assignment, role, and object state.
- **Break-Glass Access:** Emergency access with elevated controls and retrospective review.

## 8. Operational Implications

1. Customer implementations must map real authority and confidentiality rules.
2. Access reviews should occur as part of workflow governance, not IT hygiene only.
3. Offboarding and reassignment must preserve decision history while closing live access.
4. Exception access should be tightly logged and reviewed.

## 9. Product Implications

The product should expose access context clearly: why a user can or cannot view an object, which privileges apply, and what approvals are required for elevated actions such as export, override, or cross-team review.

## 10. Architecture Implications

1. Fine-grained authorization at tenant, object, and action level.
2. Separation of read, write, approve, and administer permissions.
3. Secure handling of evidence-derived previews and AI context windows.
4. Durable audit records for permission changes and high-risk access events.

## 11. Governance Implications

Governance should define access policies by sensitivity, role, workflow state, and jurisdiction. It should also require review of stale permissions, dormant privileged accounts, and break-glass events.

## 12. AI / Intelligence Implications

AI features must respect the same access boundaries as human users. Model prompts, retrieval scopes, and explanation surfaces may not cross access or tenant boundaries, even indirectly through generated summaries.

## 13. UX Implications

The UX should avoid vague denial states. Users should understand whether access is blocked because of role, tenant, workflow status, evidence sensitivity, or governance approval requirements.

## 14. Commercial Implications

Strong access governance helps win enterprise trust, especially where self-hosting, sovereign deployment, and regulated client segregation are mandatory. It reinforces that AQLIYA is infrastructure for serious governed work, not a generic SaaS tool.

## 15. Anti-Patterns

1. **Role Explosion.** Creating many broad roles instead of principled object-level governance.
2. **View Equals Authority.** Assuming visibility implies right to decide or approve.
3. **Prompt Leakage.** Letting AI retrieval bypass access controls.
4. **Admin Omniscience By Default.** Treating administrators as universally entitled to sensitive client evidence.
5. **Tenant Boundary Softness.** Relying on convention instead of hard isolation.

## 16. Examples

**Example 1:** A reviewer may read a finding but cannot view the underlying sensitive client document without an additional evidence-access grant.

**Example 2:** A quality partner can inspect approval history across an engagement but cannot export raw evidence without explicit authorization.

**Example 3:** A model-generated summary is restricted because the underlying evidence set is not accessible to the requesting user.

## 17. Enterprise Impact

1. Reduced confidentiality risk.
2. Stronger regulator and client trust.
3. Clearer separation of duties.
4. Safer AI-assisted review workflows.

## 18. Long-Term Strategic Importance

Access governance protects the enterprise trust posture that AQLIYA depends on as it expands into more sensitive financial and governance domains. Weak access control would erode the entire evidence-centric doctrine.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 04.01 | Financial Intelligence Thesis | Sensitive financial data access context |
| 05.01 | AuditOS Thesis | Engagement and reviewer access patterns |
| 08.01 | Governance and Trust Thesis | Parent doctrine |
| 08.06 | Accountability Doctrine | Access tied to authority |
| 08.09 | Evidence Governance Doctrine | Evidence sensitivity and handling |
| 08.11 | Tenant Isolation Trust Model | Hard tenant boundary model |
| 12.06 | Sovereign Enterprise Intelligence Theory | Sovereignty implications |
| 15.06 | Sensitive Financial Data Doctrine | Responsible handling boundaries |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed for doctrinal consistency and promoted to Reviewed |
