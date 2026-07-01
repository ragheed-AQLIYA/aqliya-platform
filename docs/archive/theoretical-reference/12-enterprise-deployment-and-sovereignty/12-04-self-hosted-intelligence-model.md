---
title: Self-Hosted Intelligence Model
document_id: 12.04
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 5 - Narrative
related_documents:
  - 12.01
  - 12.03
  - 12.05
  - 12.07
---

# Self-Hosted Intelligence Model

## 1. Purpose

This document specifies AQLIYA's deployment model for enterprises that require complete control over all infrastructure, data, and intelligence execution. Self-Hosted Intelligence is the deployment topology where AQLIYA operates entirely within the customer's infrastructure perimeter, with no network dependency on AQLIYA's services for any core function.

## 2. Thesis

Self-hosted deployment is AQLIYA's most sovereign commercial topology. The enterprise operates the full decision intelligence stack on hardware and infrastructure it controls, with zero runtime dependency on AQLIYA's external services. Self-hosting is not a degraded alternative — it delivers the same governance, evidence, and AI assistance capabilities as every other topology, running entirely within the enterprise's security boundary.

## 3. Problem

Certain enterprises — defense contractors, intelligence agencies, critical infrastructure operators, and organizations under sovereign data mandates — cannot accept any external service dependency. Not cloud, not private cloud with vendor access, not managed services. They need decision intelligence that runs on their hardware, in their facilities, under their complete operational control, with no phone-home capability and no external service calls. Existing offerings force these organizations into a binary choice: accept vendor dependencies or build internally. Neither option delivers enterprise-grade decision intelligence with structural governance guarantees.

## 4. Why Existing Systems Fail

| System Type | Failure Mode |
|---|---|
| On-premise enterprise software | Requires vendor support access and license server connectivity for core functions |
| "Offline" SaaS tools | Degrade without connectivity; synchronization assumes eventual cloud reconnection |
| Open-source decision tools | Lack enterprise governance, evidence integrity, and AI assistance; require extensive custom development |
| Custom-built internal tools | Cannot achieve decision intelligence parity with commercial offerings; maintenance burden grows exponentially |
| Managed hosting with "air-gapped mode" | Still requires periodic vendor access for updates, diagnostics, or license validation |

## 5. AQLIYA Philosophy

Self-hosted intelligence applies AQLIYA's core doctrine at its most rigorous: if evidence is the unit of trust, then the enterprise must be able to generate, verify, and retain evidence without any external dependency. If governance is structural, then the governance engine must operate autonomously on the enterprise's infrastructure. If AI assists and humans decide, then AI inference must run locally on hardware the enterprise controls.

Self-hosting is the topology where AuditOS, the Financial Intelligence moat, and the governance structure are most fully under the enterprise's sovereignty. AQLIYA provides the engine; the enterprise owns everything it produces.

## 6. Core Principles

1. **Zero External Dependency**: No AQLIYA service call is required for any core function — governance enforcement, evidence generation, AI inference, or audit verification.
2. **Complete Artifact Delivery**: AQLIYA delivers the entire intelligence stack as verified, signed artifacts. The enterprise deploys and operates them independently.
3. **Local Evidence Sovereignty**: All evidence chains are generated, signed, stored, and verified within the enterprise's security boundary. No evidence validation requires external service calls.
4. **Autonomous Governance**: The governance engine operates from locally delivered and verified policy artifacts. No policy enforcement depends on external rule resolution.
5. **Customer-Operated Lifecycle**: The enterprise manages the full operational lifecycle — deployment, scaling, patching, backup, and recovery. AQLIYA provides runbooks, not runtime access.

## 7. Key Concepts

- **Self-Contained Intelligence Stack**: The complete set of containerized services, model weights, governance rule packages, and schemas required to operate AQLIYA without any external service dependency.
- **Offline License Validation**: License enforcement that operates locally using cryptographic validation of signed entitlement tokens. No license server connectivity required.
- **Artifact Integrity Verification**: Every AQLIYA artifact (container image, model weight, rule package) is delivered with a cryptographic signature that the local deployment verifies before execution.
- **Air-Ready Configuration**: A self-hosted deployment that is pre-configured for upgrade to full air-gapped operation, requiring only network isolation and physical delivery of updates.
- **Local Model Registry**: The enterprise's internal repository for AQLIYA model artifacts and updates, synchronized through physical media or controlled file transfer rather than network registries.

## 8. Operational Implications

- The enterprise's operations team is fully responsible for infrastructure provisioning, monitoring, and incident response. AQLIYA provides documentation and structured diagnostic procedures.
- Updates are delivered as signed artifact bundles. The enterprise applies them through their change management process on their schedule.
- Monitoring and alerting integrate with the enterprise's existing observability stack through standard protocols (Prometheus, OpenTelemetry, syslog).
- Capacity planning and scaling are the enterprise's responsibility. AQLIYA provides resource requirement guidelines and scaling recommendations.
- Disaster recovery uses the enterprise's existing backup and replication infrastructure. AQLIYA provides data schema documentation and recovery runbooks.

## 9. Product Implications

- The product must ship as a complete, self-contained deployment package with zero external runtime dependencies.
- Installation must be fully automatable through standard infrastructure-as-code tools (Helm, Terraform, Ansible).
- The admin interface must work entirely within the enterprise's network. No external CSS, fonts, or analytics scripts.
- Diagnostics produce structured output that the enterprise can review, sanitize, and transmit to AQLIYA support at their discretion.
- The product must include a local model management interface for selecting, configuring, and validating AI models without external connectivity.

## 10. Architecture Implications

- AQLIYA's self-hosted architecture is a collection of containerized microservices that communicate exclusively through local network calls within the deployment boundary.
- All persistent state uses the enterprise's data infrastructure (PostgreSQL, S3-compatible object storage). No AQLIYA-managed data services.
- The evidence vault is a self-contained service with local cryptographic operations. No external key management service is required (though HSM integration is supported).
- The governance engine is a self-contained rule execution environment. Policy packages are delivered as artifacts, not fetched at runtime.
- Model inference operates on local compute resources (GPU/CPU). The model registry is a local artifact repository, not a remote endpoint.

## 11. Governance Implications

- Governance enforcement is entirely local. Policy rules are delivered as signed artifacts, verified locally, and executed by the local governance engine.
- Regulatory compliance mapping templates are delivered as artifacts and applied locally. The enterprise owns and verifies all compliance configurations.
- Audit evidence is generated, signed, and stored locally. The enterprise's audit team or external auditors receive evidence through the enterprise's controlled export processes.
- Change management for governance policies integrates with the enterprise's existing approval workflows through API or configuration file interfaces.
- The enterprise has full visibility into governance rule logic. No "black box" enforcement — every policy rule is inspectable and auditable.

## 12. AI / Intelligence Implications

- AI models run entirely within the enterprise's infrastructure. Model weights are delivered as signed artifacts and stored in the local model registry.
- Inference context (decision data, enterprise context) never leaves the deployment boundary. No external API calls for inference.
- Model configuration, parameter tuning, and performance validation are all local operations managed by the enterprise's team.
- Fine-tuning with enterprise data is a local operation. Training data, model weights, and fine-tuned models never leave the enterprise's boundary.
- AI assistance follows the same structural constraint: AI assists, humans decide. The assistance engine operates locally with the same capability as cloud deployments.

## 13. UX Implications

- The user experience is functionally identical to AQLIYA Cloud. Deployment topology is invisible to end users.
- Administrative users have full control over infrastructure configuration, model management, and update scheduling through a local admin interface.
- Evidence review, decision approval, and audit workflows are unchanged from other topologies.
- The admin interface provides local diagnostics, evidence vault health, and governance engine status without any external telemetry.
- Updates are managed through a local artifact management interface, not through cloud-connected update channels.

## 14. Commercial Implications

- Pricing is per decision volume, identical to other topologies. Self-hosting is not a premium.
- Professional services for initial deployment, configuration, and operational knowledge transfer are available as separate engagements.
- Ongoing support operates through structured evidence exchange. The enterprise controls what diagnostic information they share with AQLIYA.
- Licensing uses offline token validation. No license server connectivity required. License renewal is a signed artifact delivered through the enterprise's chosen channel.
- No metering data leaves the enterprise. Usage metrics for license compliance are locally validated, not transmitted.

## 15. Anti-Patterns

- **Phoning home for core functions**: Any requirement for external connectivity to operate governance, inference, or evidence generation. Self-hosted means zero runtime external dependency.
- **License server requirements**: Requiring network connectivity to validate licenses. This is operationally fragile and creates a dependency that contradicts self-hosted sovereignty.
- **Feature pausers**: Features that degrade or pause when external connectivity is unavailable. Core governance and intelligence must work indefinitely in isolation.
- **Black-box governance**: Providing governance enforcement without making rule logic inspectable. Self-hosted enterprises must be able to audit every governance rule their system executes.
- **Vendor support dependency**: Requiring AQLIYA remote access for troubleshooting. Self-hosted support must work through structured diagnostic artifacts that the enterprise shares at their discretion.
- **Partial artifact delivery**: Delivering only part of the intelligence stack as artifacts while requiring cloud access for the remainder. The entire stack must operate locally.

## 16. Examples

- A defense contractor operates AQLIYA on a classified network. All decision evidence for procurement decisions, compliance checks, and audit trails is generated and stored within the classified boundary. Model updates arrive via secure physical media quarterly.
- A central bank in a sovereign jurisdiction runs AQLIYA on nationally controlled infrastructure. Financial Intelligence processes operate on domestic data without any external service calls. Governance policies enforce domestic regulatory frameworks.
- A critical infrastructure operator uses AQLIYA for safety-critical decision governance. The system operates in a network-isolated environment with no external connectivity. All intelligence, governance, and evidence functions run on dedicated hardware within the facility.

## 17. Enterprise Impact

Self-hosted intelligence opens AQLIYA to the most restrictive enterprise environments — those that existing vendors cannot serve at all. These environments have the highest decision governance needs (classified operations, sovereign financial systems, critical infrastructure safety) and the lowest tolerance for vendor dependencies.

For AuditOS, self-hosted intelligence means regulated institutions with strict data sovereignty requirements can adopt financial decision governance without any external dependency. This removes the most common procurement blocker in highly regulated sectors.

## 18. Long-Term Strategic Importance

Self-hosted intelligence positions AQLIYA for markets where cloud-first vendors cannot compete: defense, sovereign finance, critical infrastructure, and classified operations. These are mission-critical environments where decision governance has the highest stakes and the fewest adequate solutions.

The self-hosted model also serves as the foundation for air-gapped deployment. As geopolitical instability increases data sovereignty regulation globally, the ability to offer fully autonomous decision intelligence becomes a decisive competitive advantage and a structural barrier to vendor displacement.

## 19. Related Documents

- 12.01 — Deployment Flexibility Thesis
- 12.03 — Private Cloud Model
- 12.05 — Air-Gapped Intelligence Theory
- 12.07 — Local AI Runtime Theory
- 12.09 — Enterprise Deployment Trust Model

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-05-07 | Founding Team | Initial draft — full content across all 20 sections |
| 0.2 | 2026-05-08 | Final Editor | Reviewed v0.2: self-hosted primacy confirmed; doctrinal alignment verified |