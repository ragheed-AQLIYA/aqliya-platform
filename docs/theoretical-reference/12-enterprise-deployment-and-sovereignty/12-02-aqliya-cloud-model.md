---
title: AQLIYA Cloud Model
document_id: 12.02
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 5 - Narrative
related_documents:
  - 12.01
  - 12.03
  - 12.09
---

# AQLIYA Cloud Model

## 1. Purpose

This document specifies how AQLIYA operates in its managed cloud deployment — the topology where AQLIYA hosts and operates the platform on infrastructure it controls. The AQLIYA Cloud Model establishes the baseline for all other deployment topologies: any capability available in AQLIYA Cloud must be structurally available in every other topology, even if the operational mechanics differ.

## 2. Thesis

AQLIYA Cloud is the reference deployment topology. It provides the fastest path to value for enterprises that do not require sovereign or air-gapped infrastructure, while establishing the functional baseline that all other topologies must match. The cloud model is not the privileged deployment — it is the most operationally convenient one. Intelligence, governance, and evidence integrity are identical across all topologies.

## 3. Problem

Enterprises that can use managed cloud services face a different problem than those that cannot: vendor trust. Cloud decision tools require enterprises to trust the vendor with their decision data, their governance logic, and their evidence chains. Existing cloud platforms exploit this trust asymmetry by gating features, holding data hostage, and creating migration friction. Enterprises need a cloud deployment model where the vendor earns trust through structural guarantees, not contractual fine print.

## 4. Why Existing Systems Fail

| System Type | Failure Mode |
|---|---|
| SaaS audit platforms | Data resides in vendor clouds with no residency guarantees; evidence chains are vendor-owned, not customer-owned |
| Cloud BI tools | Intelligence is limited to visualization; no decision governance capability |
| Cloud workflow automation | Decisions are procedural scripts, not governed intelligence; no evidence model |
| Multi-tenant SaaS | Tenant isolation is contractual, not cryptographic; governance seam lines at tenant boundaries |
| Vendor-managed compliance tools | Compliance evidence is vendor's output, not customer's evidence — creates dependency rather than sovereignty |

## 5. AQLIYA Philosophy

In AQLIYA Cloud, the cloud is infrastructure, not an advantage. The value of AQLIYA is in the decision intelligence engine, the Financial Intelligence moat, and the governance structure — none of which require cloud hosting to function. AQLIYA Cloud exists because managed infrastructure is operationally simpler for many enterprises. It does not exist because cloud hosting enables capabilities that other topologies lack.

Evidence is the unit of trust. In the cloud model, this means enterprises own their evidence chains cryptographically — not through terms of service. AQLIYA cannot modify, redact, or withhold a customer's decision evidence.

## 6. Core Principles

1. **Functional Parity Baseline**: Every feature available in AQLIYA Cloud must be structurally reproducible in every other deployment topology.
2. **Customer Evidence Ownership**: Decision evidence chains are cryptographically signed by the customer's keys. AQLIYA cannot forge, alter, or suppress evidence.
3. **Zero-Knowledge Architecture**: AQLIYA Cloud operates the platform without requiring access to customer decision content. Encryption at rest uses customer-managed keys.
4. **Egress-First Residency**: Data stays within the customer's designated residency zone. No data moves between zones without explicit, governable customer instruction.
5. **Migration Without Penalty**: Moving from AQLIYA Cloud to any other topology is a supported operation with full evidence chain portability.

## 7. Key Concepts

- **Tenant Evidence Vault**: Each customer operates a cryptographically isolated evidence store. Evidence is signed with customer-held keys, not AQLIYA keys.
- **Residency Zone**: A geographically bounded infrastructure region where a customer's data and intelligence operate. AQLIYA Cloud supports multiple residency zones; customers select at deployment time.
- **Managed Intelligence Runtime**: AQLIYA operates the AI inference engine within the residency zone. Model weights are AQLIYA-managed; inference context (decision data, enterprise context) is customer-owned.
- **Governance Control Plane**: The policy engine that enforces governance rules. Operates within the residency zone. AQLIYA manages the runtime; customers own the policies.
- **Evidence Export Protocol**: The mechanism by which customers extract their complete evidence chain for migration to another topology or for external audit. This is a fundamental right, not a premium feature.

## 8. Operational Implications

- AQLIYA manages patching, scaling, and infrastructure resilience within the cloud deployment.
- Customers manage governance policies, evidence retention, and decision rules. AQLIYA has no authority to override customer governance.
- Uptime SLAs apply to infrastructure availability, not to governance decisions. AQLIYA Cloud cannot make governance decisions on behalf of the customer.
- Incident response for infrastructure is AQLIYA's responsibility. Incident response for governance violations is the customer's responsibility, facilitated by AQLIYA's evidence model.
- Monitoring covers system health and evidence chain integrity. AQLIYA does not monitor decision content.

## 9. Product Implications

- Onboarding is fastest in AQLIYA Cloud because infrastructure is pre-provisioned.
- The product must clearly communicate that cloud is one topology, not the only topology. No "cloud premium" feature marking.
- Customer self-service includes full evidence export, policy management, and topology migration initiation.
- The admin interface must separate infrastructure concerns (AQLIYA-managed) from governance concerns (customer-managed).
- License management operates per-decision-volume, not per-infrastructure-consumption.

## 10. Architecture Implications

- AQLIYA Cloud runs on multi-tenant infrastructure with cryptographically isolated tenant evidence vaults.
- The architecture separates the control plane (AQLIYA-managed) from the evidence plane (customer-owned).
- Customer-managed encryption keys (CMEK) are mandatory for evidence stores. AQLIYA cannot decrypt customer evidence.
- The intelligence runtime retrieves model weights from AQLIYA's model registry and executes inference within the tenant's residency zone. Inference results are customer-owned evidence.
- All inter-tenant boundaries are cryptographic, not just logical. This prevents cross-tenant evidence leakage at the architecture level.

## 11. Governance Implications

- Governance policies are authored and owned by the customer. AQLIYA provides the enforcement engine.
- Regulatory compliance mappings (e.g., DORA article mappings) are templates that customers apply, verify, and own.
- Audit evidence is generated within the customer's evidence vault and signed with customer keys. AQLIYA cannot alter audit evidence.
- In AQLIYA Cloud, the customer's governance scope extends to their evidence vault. AQLIYA's governance scope is limited to platform operations — never to customer decisions.
- Separation of duties within a customer's organization is enforced structurally, not through role-based access that AQLIYA admins can override.

## 12. AI / Intelligence Implications

- AI models in AQLIYA Cloud are managed by AQLIYA: selection, training, and optimization are AQLIYA's responsibility.
- Inference operates within the customer's residency zone. Inference results become customer evidence.
- AQLIYA does not use customer data for model training. Period. This is a structural guarantee, not a policy commitment.
- Customers may select model configurations (conservative, balanced, aggressive) but cannot access model weights directly — this differs from self-hosted deployments.
- AI assistance surfaces decision evidence, risk signals, and alternatives. AI does not make decisions. Humans decide.

## 13. UX Implications

- The AQLIYA Cloud experience must feel like operating your own infrastructure, not like using a vendor's platform.
- Governance controls are prominently available — never buried under infrastructure menus.
- Evidence review and audit workflows are identical across all topologies. A user migrating from cloud to private cloud should notice zero UX change.
- Residency zone and evidence vault configuration are presented as governance decisions (requiring appropriate authority), not as infrastructure settings.
- The UX must make it trivially easy to export all evidence and migrate — this signals trust by design.

## 14. Commercial Implications

- Pricing is per decision volume tier, not per cloud resource consumption.
- AQLIYA Cloud pricing must be competitive with running AQLIYA on a customer's own infrastructure — the convenience premium should reflect operational simplicity, not capability access.
- Evidence export is free and unlimited. Data portability is a right, not a premium feature.
- Professional services for initial configuration and governance setup are available but optional.
- No exit fees. No data hostage clauses. Commercial terms must reinforce the structural guarantee.

## 15. Anti-Patterns

- **Cloud-fortress lock-in**: Designing the cloud model to make migration painful or lossy. This directly contradicts AQLIYA's deployment flexibility thesis.
- **Tenant isolation by policy, not by cryptography**: Relying on access control policies to isolate tenants in shared infrastructure. This creates a single point of governance failure.
- **Vendor evidence ownership**: Retaining any ability to modify, suppress, or withhold customer evidence. Evidence is the customer's property, cryptographically guaranteed.
- **Cloud-only feature flags**: Introducing features that only work in cloud due to architectural shortcuts. This violates functional parity.
- **Data gravity exploitation**: Using cloud data residency to create switching costs. AQLIYA's moat is Financial Intelligence, not data gravity.
- **Admin privilege overreach**: Granting AQLIYA operational staff any access to customer decision content, even for support purposes. Support debugging uses anonymized, structural metadata only.

## 16. Examples

- A mid-market bank in the UK adopts AQLIYA Cloud with the EU-West residency zone. Financial Intelligence processes audit decisions in real-time. The bank's compliance team configures DORA article mappings. After 18 months, the bank's group policy shifts to private cloud — they initiate evidence export and redeploy AQLIYA on their own Kubernetes cluster with zero evidence loss.
- A fintech startup uses AQLIYA Cloud for rapid deployment. Governance policies are configured on day one. Evidence chains are signed with the startup's keys. When the startup is acquired, the acquiring bank inherits the evidence chain — verified independently, not through AQLIYA.

## 17. Enterprise Impact

AQLIYA Cloud reduces time-to-value for enterprises that can use managed infrastructure. It serves as the reference implementation for all deployment topologies, ensuring that system capabilities are proven at cloud scale before being validated for private cloud, self-hosted, and air-gapped deployments.

For AuditOS as the first wedge, AQLIYA Cloud provides the fastest deployment path for regulated financial institutions that are cloud-eligible. These institutions can demonstrate value within days, not months, building the evidence for broader AQLIYA adoption.

## 18. Long-Term Strategic Importance

AQLIYA Cloud serves as the proving ground for every capability. Features ship first in AQLIYA Cloud, then propagate to other topologies as validated artifacts. This creates a natural release cadence where cloud users get new capabilities first but never get capabilities that other topologies cannot match.

The long-term strategic value is in the customer relationship model: AQLIYA earns trust through structural guarantees and evidence ownership, not through lock-in. This creates durable commercial relationships where switching is always possible but rarely desired because the intelligence value compounds over time.

## 19. Related Documents

- 12.01 — Deployment Flexibility Thesis
- 12.03 — Private Cloud Model
- 12.04 — Self-Hosted Intelligence Model
- 12.09 — Enterprise Deployment Trust Model
- 12.10 — Regulated Deployment Readiness

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-05-07 | Founding Team | Initial draft — full content across all 20 sections |
| 0.2 | 2026-05-08 | Final Editor | Reviewed v0.2: doctrinal alignment verified |