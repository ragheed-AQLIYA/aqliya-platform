---
title: Private Cloud Model
document_id: 12.03
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Low
depth_level: Level 5 - Narrative
related_documents:
  - 12.01
  - 12.02
  - 12.04
  - 12.08
---

# Private Cloud Model

## 1. Purpose

This document defines how AQLIYA operates when deployed on infrastructure that the customer controls — typically a private Kubernetes cluster, a dedicated cloud tenancy, or a customer-managed virtualization environment. The Private Cloud Model addresses enterprises that require operational control over infrastructure while retaining the full decision intelligence capability of AQLIYA.

## 2. Thesis

Private cloud deployment is AQLIYA's operational model for enterprises that can manage infrastructure but must maintain direct custody of data and intelligence execution. It is not a diminished product — it delivers functional parity with AQLIYA Cloud. The customer gains operational sovereignty while AQLIYA delivers the intelligence engine as a deployable artifact.

## 3. Problem

Enterprises in regulated industries, government-adjacent sectors, and sensitive commercial domains cannot accept shared infrastructure for decision intelligence workloads. Data residency, sovereignty, and operational control requirements mandate that these enterprises keep data within their own infrastructure perimeter. Existing vendors offer private deployment as a stripped-down afterthought — fewer features, delayed updates, manual patching, and second-class support. These enterprises need decision intelligence that is architecturally designed for private operation, not retrofitted.

## 4. Why Existing Systems Fail

| System Type | Failure Mode |
|---|---|
| Enterprise SaaS private instances | Require VPN tunnels to vendor cloud; data still egresses for intelligence features |
| On-premise enterprise software | Require dedicated operations teams; intelligence features lag cloud versions by quarters |
| Managed private cloud offerings | Vendor retains admin access; data sovereignty is contractual, not structural |
| Containerized SaaS | Run in customer infrastructure but still phone-home for core functions |
| Custom-built compliance tools | No shared intelligence engine; each enterprise reinvents decision governance from scratch |

## 5. AQLIYA Philosophy

AQLIYA's private cloud model applies the same principle as every other topology: intelligence capability is independent of deployment location. The customer owns the infrastructure, the data, and the evidence. AQLIYA provides the intelligence engine as a self-contained, verifiable artifact. The customer's operations team runs it on their infrastructure with their governance policies.

Evidence is the unit of trust. In private cloud, every evidence chain is locally generated, locally signed, and locally verifiable. AQLIYA has no access to customer evidence. The customer's sovereignty is structural, not contractual.

## 6. Core Principles

1. **Artifact Delivery Model**: AQLIYA delivers verified, signed artifacts (containers, configurations, model weights) to the customer's infrastructure. The customer runs them.
2. **Full Capability Parity**: Every feature available in AQLIYA Cloud is available in private cloud. No feature flags, no delayed releases, no capability gaps.
3. **Customer-Operated Infrastructure**: The customer manages compute, storage, and networking. AQLIYA provides operational runbooks, not managed operations.
4. **Evidence Locality**: All evidence generation, signing, and verification occurs within the customer's infrastructure perimeter. No evidence egresses to AQLIYA.
5. **Air-Ready Architecture**: Private cloud deployments must be upgradeable to self-hosted and air-gapped configurations without architectural changes.

## 7. Key Concepts

- **Deployable Artifact**: A versioned, signed, and verified package containing the AQLIYA intelligence engine, rule engine, and schema. Artifacts are pull-based — the customer fetches them on their schedule.
- **Customer Infrastructure Boundary**: The logical perimeter beyond which no AQLIYA component communicates. All intelligence operations, evidence generation, and governance enforcement occur within this boundary.
- **Operational Runbook**: AQLIYA-provided documentation for deployment, scaling, monitoring, and incident response. The customer executes these on their own infrastructure.
- **Evidence Vault (Private)**: The customer's local evidence store, cryptographically signed with customer-held keys. Identical in structure to the cloud evidence vault but never leaves the customer's infrastructure.
- **Update Channel**: The mechanism by which AQLIYA delivers artifacts. Could be a secure registry, a signed tarball, or physical media for air-gapped upgrades.

## 8. Operational Implications

- The customer's operations team is responsible for infrastructure uptime, scaling, and hardware lifecycle.
- AQLIYA provides operational runbooks, health check endpoints, and monitoring integrations. The customer integrates these into their existing observability stack.
- Patching follows the customer's change management process. AQLIYA delivers patches as signed artifacts; the customer applies them on their schedule.
- Incident response for AQLIYA components follows a shared responsibility model: AQLIYA provides diagnostic artifacts; the customer executes them within their security perimeter.
- The customer retains full control over backup, disaster recovery, and business continuity for their AQLIYA instance.

## 9. Product Implications

- The product must ship as a complete, self-contained deployment package — not as a set of microservices that phone home.
- Configuration management must support customer infrastructure patterns (Helm charts, Terraform modules, Ansible playbooks).
- The admin interface must clearly separate AQLIYA-provided intelligence configuration from customer-provided infrastructure configuration.
- Diagnostics and support must operate through evidence-based analysis — customer sends structured diagnostic data, not raw logs or screen shares.
- License validation operates offline or through scoped network calls that never transmit customer data.

## 10. Architecture Implications

- The AQLIYA engine runs as a set of containerized services on the customer's Kubernetes cluster or equivalent orchestration platform.
- All persistent state resides in the customer's data stores — object storage, relational databases, and evidence vaults are customer-provisioned.
- Inter-service communication uses mTLS with customer-managed certificates. No AQLIYA-operated certificate authority is required.
- The intelligence runtime operates with locally deployed model weights. No inference call terminates outside the customer infrastructure boundary.
- The architecture must support disconnected operation for up to 72 hours without loss of governance capability (extending to indefinite for air-gapped configurations).

## 11. Governance Implications

- Governance policy engine runs locally. Policy enforcement is immediate and does not depend on AQLIYA's cloud.
- Regulatory compliance mappings are delivered as artifacts and applied locally. The customer owns and verifies all compliance configurations.
- Audit evidence is generated, signed, and stored locally. External auditors receive customer-verified evidence exports.
- Separation of duties is enforced by the local governance engine. AQLIYA has no role in the customer's internal authorization structure.
- Change management for governance policies follows the customer's existing change approval workflows.

## 12. AI / Intelligence Implications

- AI inference runs locally within the customer's infrastructure boundary. Model weights are delivered as artifacts.
- The customer controls model configuration and inference parameters. AQLIYA provides recommended configurations but cannot override customer choices.
- Intelligence quality benchmarks are provided as part of the artifact package. The customer can validate model performance locally.
- Fine-tuning with enterprise data occurs within the customer's boundary. No enterprise data leaves for model training — this is structurally enforced.
- AI assistance operates with the same structural constraint as every other topology: AI assists, humans decide.

## 13. UX Implications

- The user experience is identical to AQLIYA Cloud. Deployment topology is invisible to governance and intelligence users.
- Administrative users see additional infrastructure configuration panels (resource allocation, scaling parameters, update scheduling).
- Evidence review, decision approval, and audit workflows are unchanged from other topologies.
- Diagnostics and support interactions use structured evidence exchange rather than real-time remote access.
- Migration to or from other topologies uses the same evidence export protocol available in AQLIYA Cloud.

## 14. Commercial Implications

- Pricing reflects intelligence capability, not infrastructure consumption. Private cloud is not a premium tier.
- Professional services for deployment, configuration, and operational setup are available as separate engagements.
- Ongoing support follows evidence-based remote diagnostics. No on-site support requirement unless the customer requests it.
- Licensing operates per decision volume, identical to the cloud model. Infrastructure costs are the customer's responsibility.
- No data egress fees. The customer's data and evidence stay within their infrastructure by design.

## 15. Anti-Patterns

- **Phone-home architecture**: Designing private cloud deployments that require outbound connectivity to AQLIYA services for core intelligence functions. This defeats the purpose of private deployment.
- **Second-class release cadence**: Delivering private cloud artifacts on a delayed schedule compared to AQLIYA Cloud. This violates functional parity.
- **Vendor admin backdoors**: Retaining any administrative access to the customer's AQLIYA instance. Sovereignty requires zero AQLIYA access to running instances.
- **Stripped feature set**: Offering a reduced capability set for private cloud deployments. This contradicts the deployment flexibility thesis.
- **Proxy governance**: Routing governance enforcement decisions through AQLIYA's cloud. Governance must be local and immediate.
- **Data-dependent support**: Requiring customer data access for troubleshooting. Support must work with structured diagnostics and anonymized evidence metadata.

## 16. Examples

- A regional bank in Germany operates AQLIYA on a private OpenShift cluster within their own data center. BaFin-regulated audit evidence stays within the bank's perimeter. Model updates arrive as signed container images through the bank's change management process.
- A healthcare system in the US runs AQLIYA on a dedicated AWS tenancy with BAA controls. PHI-adjacent decision evidence never leaves the tenancy. Governance policies enforce HIPAA article mappings.
- An insurance group operates AQLIYA across three private data centers for disaster recovery. Evidence chains replicate across sites using customer-managed encryption. The governance engine enforces consistent policies across all three sites.

## 17. Enterprise Impact

Private cloud deployment removes the "cloud acceptability" barrier for enterprises in regulated sectors. These enterprises — financial services, healthcare, government, defense — represent the core AuditOS market. By offering structural sovereignty rather than contractual promises, AQLIYA addresses the primary objection that prevents these enterprises from adopting cloud-native decision intelligence.

For the Financial Intelligence moat, private cloud means the intelligence engine can process financial decisions within the institution's existing security boundary, eliminating the risk assessment overhead of data egress.

## 18. Long-Term Strategic Importance

Private cloud deployment creates a strategic option for enterprises that will never accept multi-tenant cloud but need decision intelligence. This market segment — estimated at 30-40% of regulated enterprises — is structurally excluded by existing SaaS-first vendors.

As AQLIYA's private cloud deployment matures, it becomes the natural entry point for sovereign and air-gapped deployments. The deployment path is: cloud → private cloud → self-hosted → air-gapped, each step increasing customer sovereignty without reducing intelligence capability.

## 19. Related Documents

- 12.01 — Deployment Flexibility Thesis
- 12.02 — AQLIYA Cloud Model
- 12.04 — Self-Hosted Intelligence Model
- 12.06 — Sovereign Enterprise Intelligence Theory
- 12.08 — Data Residency Theory
- 12.09 — Enterprise Deployment Trust Model

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-05-07 | Founding Team | Initial draft — full content across all 20 sections |
| 0.2 | 2026-05-08 | Final Editor | Reviewed v0.2: doctrinal alignment verified |