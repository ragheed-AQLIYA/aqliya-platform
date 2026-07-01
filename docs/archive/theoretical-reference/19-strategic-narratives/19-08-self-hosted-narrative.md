---
title: Self-Hosted Narrative
document_id: 19.08
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Low
depth_level: Level 5 - Narrative
related_documents: 01.01, 12.04, 12.05, 19.01, 19.07, 19.09
---

# Self-Hosted Narrative

## 1. Purpose

This document defines the strategic narrative for AQLIYA's self-hosted deployment capability. It specifies why self-hosting is not merely a deployment option but a strategic commitment that shapes product architecture, trust positioning, and market differentiation. It explains why enterprises that require data sovereignty can adopt AQLIYA without compromising on governance, intelligence, or trust.

## 2. Thesis

**Self-hosted deployment is a trust architecture, not a deployment option.**

For regulated enterprises in audit, finance, and governance, the ability to operate decision intelligence infrastructure within their own boundaries — their infrastructure, their jurisdiction, their control — is not a preference. It is a regulatory requirement, a risk management decision, and a trust prerequisite.

AQLIYA's self-hosted capability is not a degraded version of the cloud product. It is the same product, with the same governance enforcement, evidence traces, intelligence capabilities, and audit trails — operating on the enterprise's own infrastructure. Self-hosting is how AQLIYA makes decision intelligence accessible to enterprises that cannot or will not trust a cloud provider with their most sensitive decision evidence.

## 3. Problem

Enterprises in regulated domains face a deployment dilemma:

**Cloud-only exclusion.** Many regulated enterprises — government agencies, financial institutions, audit firms with cross-border data restrictions, organizations subject to data sovereignty laws — cannot put their decision evidence, financial data, and governance records in a vendor's cloud. Cloud-only decision intelligence platforms exclude these enterprises entirely.

**Feature compromise.** Enterprises that self-host existing solutions often receive degraded capabilities: limited intelligence, delayed updates, reduced governance features, or isolated environments. The message is clear: self-hosted is a second-class deployment.

**Trust gap.** For sovereign enterprises, trust requires control over data, infrastructure, and governance. Cloud-only vendors create a trust gap: the enterprise must trust the vendor's cloud, the vendor's data handling, and the vendor's governance — trust that regulatory requirements and risk management policies prohibit.

**Sovereignty compliance.** Data sovereignty regulations (PDPL in Saudi Arabia, GDPR in Europe, domestic data localization laws in many jurisdictions) require that certain data remain within national borders and under national jurisdiction. Cloud-only deployment cannot satisfy these requirements for all enterprises.

## 4. Why Existing Systems Fail

**Cloud-only SaaS platforms** require enterprises to put their data on the vendor's infrastructure. For regulated enterprises, this is not a deployment preference — it is a regulatory prohibition. These platforms cannot serve sovereign enterprises at all.

**On-premise enterprise software** provides self-hosted deployment but with degraded capabilities: intelligence is limited, updates are delayed, and the product diverges from the cloud version over time. Self-hosted becomes a constraint, not an advantage.

**Hybrid deployment models** attempt to split the workload: sensitive data on-premise, intelligence in the cloud. This creates data movement risks, governance inconsistencies, and operational complexity that defeat the purpose of self-hosting.

**Managed hosting solutions** host the vendor's software in a third-party data center. This provides infrastructure control but does not provide data sovereignty — the enterprise still depends on the vendor's cloud for key capabilities.

The consistent failure: self-hosting is treated as a deployment afterthought rather than an architectural commitment. Vendors design for cloud first and retrofit for self-hosting, resulting in degraded capabilities, complex deployments, and feature divergence.

## 5. AQLIYA Philosophy

Self-hosted deployment in AQLIYA is governed by these principles:

**Functional parity.** Self-hosted AQLIYA has the same governance enforcement, evidence traces, intelligence capabilities, and audit trails as cloud AQLIYA. The enterprise does not sacrifice capability for sovereignty.

**Architecture parity.** Self-hosted and cloud deployments run the same codebase. The same workflow engine, the same evidence model, the same governance engine, the same intelligence layer. Feature divergence between deployment models is architecturally prohibited.

**Sovereignty as trust.** Self-hosted deployment is the ultimate expression of AQLIYA's trust architecture. The enterprise's data, decisions, and evidence never leave the enterprise's infrastructure. Trust does not require surrendering sovereignty.

**Operational simplicity.** Self-hosted deployment must be operationally manageable by enterprise IT teams. It cannot require specialized AQLIYA engineers on-site. The deployment must be automated, monitored, and updatable through standard enterprise operations.

**Intelligence at the edge.** AI models and intelligence capabilities must run locally in self-hosted environments. Intelligence is not dependent on cloud connectivity. The enterprise's decision intelligence operates within its boundaries, including the AI.

## 6. Core Principles

1. **Deployment sovereignty is enterprise sovereignty.** The enterprise that controls its infrastructure controls its data, its governance, and its decision intelligence. Self-hosting is not a technical choice; it is a sovereignty choice.

2. **Functional parity is non-negotiable.** Self-hosted AQLIYA must deliver the same capabilities as cloud AQLIYA. Feature divergence between deployment models is a strategic failure.

3. **Intelligence operates at the edge.** AI models, risk signals, evidence analysis, and anomaly detection run within the enterprise's infrastructure. Intelligence does not depend on cloud connectivity.

4. **Updates do not compromise sovereignty.** AQLIYA updates, patches, and model improvements are delivered to the enterprise's infrastructure without requiring data to leave the enterprise's boundaries.

5. **Governance is identical across deployments.** Governance enforcement, audit trails, evidence traces, and approval chains operate identically in self-hosted and cloud deployments. The enterprise's governance is the same regardless of deployment model.

6. **Self-hosting is a commercial differentiator.** Enterprises that cannot adopt cloud-only platforms can adopt AQLIYA. Self-hosting expands AQLIYA's addressable market beyond what cloud-only competitors can reach.

## 7. Key Concepts

- **Self-Hosted Deployment:** AQLIYA deployed on the enterprise's own infrastructure — their servers, their data centers, their jurisdiction — with functional parity to the cloud deployment.

- **Functional Parity:** The same governance enforcement, evidence traces, intelligence capabilities, and audit trails in self-hosted and cloud environments. No capability degradation for sovereignty.

- **Edge Intelligence:** AI models and intelligence capabilities that run locally within the enterprise's infrastructure. Intelligence is not dependent on cloud connectivity or cloud-based processing.

- **Sovereign Data:** Data that remains within the enterprise's infrastructure, jurisdiction, and control at all times. No data movement to cloud environments, no third-party data processing, no cross-border data transfer.

- **Deployment Parity:** Architectural commitment to maintaining a single codebase across deployment models. Self-hosted and cloud deployments run the same software, ensuring feature parity and operational consistency.

- **Air-Gapped Intelligence:** AQLIYA's ability to operate in environments with no external network connectivity. Intelligence models, governance engines, and workflow capabilities run entirely within the enterprise's isolated infrastructure.

## 8. Operational Implications

1. Self-hosted deployment must be supported by enterprise IT teams with standard tools. AQLIYA provides deployment guides, monitoring dashboards, and update mechanisms that integrate with enterprise operations.

2. Enterprise account management must include self-hosted deployment planning: infrastructure sizing, network configuration, security hardening, and operational monitoring.

3. Intelligence model updates are delivered to self-hosted environments through secure, sovereignty-preserving mechanisms. The enterprise's data never leaves its infrastructure to receive model improvements.

4. Support for self-hosted deployments must match cloud support response times. Sovereign enterprises receive the same service quality as cloud enterprises.

5. Training for self-hosted enterprise teams covers not just product usage but also operational monitoring, update management, and infrastructure troubleshooting.

6. Self-hosted deployments must be included in AQLIYA's security testing, penetration testing, and compliance verification processes. Self-hosted is not a security afterthought.

## 9. Product Implications

1. The product must be deployable on standard enterprise infrastructure: Linux servers, container orchestrators, and enterprise databases. No proprietary hardware or specialized infrastructure requirements.

2. Self-hosted deployment uses the same workflow engine, evidence model, governance engine, and intelligence layer as cloud deployment. The product is deployment-agnostic at the capability level.

3. Intelligence models run locally in self-hosted environments. Risk signals, evidence analysis, and anomaly detection operate within the enterprise's infrastructure. No cloud API calls for intelligence.

4. Updates and patches are delivered to self-hosted environments through secure channels. The enterprise's data does not leave its infrastructure to receive updates.

5. Configuration, monitoring, and troubleshooting for self-hosted deployments are accessible through standard enterprise interfaces. AQLIYA provides operational tools, not just product interfaces.

6. Self-hosted and cloud deployments produce identical audit trails, governance logs, and evidence traces. The output is deployment-agnostic, ensuring that regulatory requirements are met regardless of deployment model.

## 10. Architecture Implications

1. Deployment agnosticism is an architectural principle. The workflow engine, evidence model, governance engine, and intelligence layer must operate identically in cloud and self-hosted environments. This requires clean separation of deployment-specific and deployment-agnostic components.

2. Edge intelligence models must be optimized for enterprise server hardware. Model size, inference latency, and resource requirements must be scoped for enterprise infrastructure, not cloud data centers.

3. Data residency is architecturally guaranteed. In self-hosted deployments, data never leaves the enterprise's infrastructure. The architecture must be verifiable in this regard: no hidden cloud calls, no telemetry data movement, no third-party processing.

4. Tenant isolation is architecturally identical in cloud and self-hosted deployments. The same isolation guarantees that apply in multi-tenant cloud also apply in single-tenant self-hosted.

5. Update mechanisms must deliver code and model updates without requiring data movement. The enterprise's data stays on its infrastructure; only software and model artifacts are transferred.

6. Observability and monitoring for self-hosted deployments must be available without external cloud dependencies. The enterprise can monitor its own AQLIYA instance with its own monitoring tools.

## 11. Governance Implications

1. Self-hosting is a governance decision. The enterprise that self-hosts keeps its governance data, evidence, decisions, and audit trails within its own infrastructure. Governance enforcement operates identically, but governance data stays sovereign.

2. Regulatory compliance is easier to demonstrate in self-hosted deployments because the enterprise controls its data residency, its data processing, and its data handling. No third-party data processor involvement.

3. Self-hosted deployment satisfies data sovereignty regulations (PDPL, GDPR, domestic data localization) by design. Data does not leave the enterprise's jurisdiction.

4. Governance configuration is identical across deployment models. The same approval chains, evidence requirements, and role-based permissions apply in self-hosted and cloud deployments.

5. Audit trail production and accessibility are identical in self-hosted and cloud deployments. Regulatory bodies can audit AQLIYA's governance enforcement regardless of where the system runs.

## 12. AI / Intelligence Implications

1. AI models run locally in self-hosted environments. Intelligence signals, risk detection, evidence analysis, and anomaly detection are generated within the enterprise's infrastructure.

2. Model updates are delivered as artifacts to the enterprise's infrastructure. The enterprise's data does not leave its boundaries to benefit from model improvements.

3. Edge intelligence models are optimized for local deployment: smaller models, efficient inference, and conservative resource requirements that match enterprise server capabilities.

4. Intelligence quality in self-hosted environments is comparable to cloud environments. The enterprise does not accept intelligence degradation in exchange for sovereignty.

5. Cross-tenant intelligence sharing is architecturally prohibited in all deployment models, including self-hosted. The enterprise's intelligence is its own.

6. Air-gapped deployment (no external network connectivity) is supported. All intelligence capabilities operate without external network access.

## 13. UX Implications

1. Self-hosted and cloud users experience identical product capabilities. The interface, the workflow, the governance, the evidence traces, and the intelligence signals are the same regardless of deployment.

2. Self-hosted operational interfaces are available for enterprise IT teams: deployment status, update management, health monitoring, and log access. These are standard enterprise operational interfaces, not specialized AQLIYA tools.

3. Configuration and customization options are identical across deployment models. Self-hosted enterprises have the same governance configuration, workflow design, and evidence standard capabilities as cloud enterprises.

4. No cloud-dependent UI elements. The product experience is fully functional without cloud connectivity. No features require cloud API calls to render or function.

## 14. Commercial Implications

1. Self-hosted deployment is a premium offering that commands higher pricing because it solves sovereignty and trust problems that cloud-only competitors cannot address.

2. The addressable market expands significantly. Enterprises that cannot adopt cloud-only platforms — government agencies, financial institutions, military organizations, enterprises subject to data localization laws — become AQLIYA customers.

3. Trust-based selling is amplified. Self-hosted deployment is the ultimate demonstration of trust architecture: the enterprise controls its infrastructure, its data, and its governance. AQLIYA proves its trust by not requiring control.

4. Self-hosted customers have higher switching costs because their decision infrastructure, evidence chains, and governance rules are embedded in their own environment. The commercial relationship deepens over time.

5. The commercial narrative must emphasize: "Same decision intelligence. Your infrastructure. Your data. Your governance." Self-hosting is presented as sovereignty, not as a constraint.

6. Self-hosted expansion follows the same wedge model as cloud: audit first, then financial intelligence, then governance operations. The expansion path is identical; the deployment model is different.

## 15. Anti-Patterns

1. **Degraded self-hosted capabilities.** Offering self-hosted deployment with reduced intelligence, limited governance, or fewer features than cloud. This tells sovereign enterprises they are second-class customers.

2. **Cloud-dependent intelligence.** Requiring cloud API calls for AI capabilities in self-hosted environments. This defeats the purpose of self-hosting and creates data sovereignty violations.

3. **Feature divergence.** Allowing self-hosted and cloud deployments to diverge in capabilities, governance, or intelligence. Feature parity is a strategic commitment, not a best-effort target.

4. **Complex deployment.** Designing self-hosted deployment that requires specialized AQLIYA engineers on-site. Self-hosting must be manageable by enterprise IT teams.

5. **Self-hosting as afterthought.** Designing the cloud product first and retrofitting self-hosting as an afterthought. Self-hosted must be an architectural commitment from day one.

6. **Telemetry data movement.** Sending usage telemetry, analytics data, or performance metrics from self-hosted environments to AQLIYA's cloud without explicit enterprise consent. Data sovereignty means no data movement.

7. **Limited update path.** Providing slower, delayed, or incomplete updates to self-hosted environments. Update parity is required for security and capability parity.

## 16. Examples

**Example 1: Government audit agency.** A government audit agency is required by law to keep all financial data within national borders and on government infrastructure. Cloud-only platforms are not an option. AQLIYA is deployed on the agency's infrastructure. The agency receives the same decision intelligence, governance enforcement, evidence traces, and audit trails as cloud customers — within its own boundaries. The agency's data never leaves its infrastructure.

**Example 2: Financial institution with data sovereignty requirements.** A bank subject to domestic data localization regulations cannot use cloud-based decision intelligence platforms. AQLIYA's self-hosted deployment enables the bank to adopt decision infrastructure — with intelligence, governance, and evidence traces — without moving data outside its jurisdiction. The bank's regulatory compliance team verifies that data residency requirements are met by design.

**Example 3: Air-gapped intelligence deployment.** A defense ministry requires decision intelligence for audit and governance of classified programs. The system must operate in an environment with no external network connectivity. AQLIYA's air-gapped deployment provides full decision intelligence, governance enforcement, and evidence traces without any cloud dependency. Updates are delivered through secure physical media.

## 17. Enterprise Impact

1. **Market expansion.** Self-hosted deployment makes AQLIYA accessible to enterprises that cannot adopt cloud-only platforms — expanding the addressable market by including government, military, financial, and regulated industries.

2. **Sovereignty compliance.** Enterprises subject to data localization and data sovereignty regulations can adopt AQLIYA without regulatory exceptions. Self-hosting satisfies sovereignty requirements by design.

3. **Trust differentiation.** Self-hosted deployment is the ultimate demonstration of AQLIYA's trust architecture: the enterprise controls its infrastructure and data, while receiving full decision intelligence capabilities. This differentiates AQLIYA from every cloud-only competitor.

4. **Competitive moat.** Cloud-only competitors cannot serve sovereign enterprises. Self-hosting capability creates a competitive moat in segments that represent significant market value.

5. **Customer depth.** Self-hosted enterprises have higher switching costs because their decision infrastructure is embedded in their environment. The commercial relationship deepens with each engagement.

## 18. Long-Term Strategic Importance

Self-hosted deployment is not a technical option; it is a strategic commitment that reflects AQLIYA's positioning as decision infrastructure rather than SaaS software.

Infrastructure runs where the enterprise requires it. Data infrastructure runs in data centers and cloud environments. Transaction infrastructure runs in banking systems and stock exchanges. Decision infrastructure must run wherever the enterprise makes decisions — including environments where data sovereignty requires local deployment.

The long-term strategic importance is two-fold:

First, self-hosting is a trust architecture. It communicates that AQLIYA trusts its product enough to run it anywhere, and it enables enterprises to trust AQLIYA because they never surrender control. This trust architecture cannot be replicated by cloud-only competitors.

Second, self-hosting is a market enabler. It opens regulated, sovereign, and security-sensitive enterprise segments that represent some of the highest-value customers for decision intelligence. These segments are structurally inaccessible to cloud-only vendors.

The risk is treating self-hosting as a deployment afterthought. If self-hosting delivers degraded capabilities, delayed updates, or reduced intelligence, it becomes a constraint rather than an enabler. The strategic commitment must be: same product, same capabilities, same intelligence — on the enterprise's infrastructure.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 01.01 | AQLIYA Foundational Thesis | Root thesis; sovereignty and self-hosting commitment |
| 12.04 | Self-Hosted Intelligence Model | Technical model for self-hosted deployment |
| 12.05 | Air-Gapped Intelligence Theory | Theory for intelligence in disconnected environments |
| 19.01 | Enterprise Narrative | Broader enterprise strategy |
| 19.07 | Enterprise Trust Narrative | Trust architecture that self-hosting enables |
| 19.09 | Sovereign Intelligence Narrative | Sovereignty narrative that self-hosting delivers |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed — promoted to v0.2 after doctrinal check |