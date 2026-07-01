---
title: Domain Boundary Principles
document_id: 16.03
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 01.01, 02.01, 05.01, 16.01, 16.02, 16.04, 16.06
---

# Domain Boundary Principles

## 1. Purpose

This document defines how AQLIYA identifies, delineates, and enforces domain boundaries within the platform. It establishes the principles that determine where one domain ends and another begins, and how domains interact without coupling.

## Doctrine Modernization Note

This document remains valid as architecture doctrine. Its older Enterprise Decision Intelligence language should be read as one strategic doctrine within AQLIYA's broader platform architecture.

## 2. Thesis

**Domain boundaries must be drawn around decision authority, evidence ownership, and governance scope, not around technical layers, organizational teams, or feature categories. Boundaries that do not reflect domain semantics will erode under operational pressure.**

## 3. Problem

Most enterprise systems draw boundaries around technical concerns such as frontend, backend, database, and integration. Others draw boundaries around organizational teams. These boundaries do not align with how regulated decisions propagate through an organization. When domain boundaries are misaligned, responsibilities blur, evidence chains break, and governance becomes unenforceable.

## 4. Why Existing Systems Fail

- systems organized by technical layer produce cross-cutting domain logic that is duplicated, inconsistent, or hidden in shared libraries
- systems organized by team produce boundaries that shift when teams reorganize, invalidating data ownership assumptions
- systems that lack explicit boundaries accumulate hidden dependencies that make changes unpredictable and regression testing impossible
- systems with too many fine-grained boundaries create integration complexity that negates the benefits of separation

The common failure is drawing boundaries around convenience rather than domain semantics.

## 5. AQLIYA Philosophy

AQLIYA builds AI operating systems with governed decision workflows as one core doctrine. Domain boundaries must align with decision authority because governed decisions remain a primary product concern. Boundaries must also align with evidence ownership because evidence is the unit of trust. And boundaries must align with governance scope because governance is structural, not procedural. AuditOS defines the current primary commercial domain focus. Financial intelligence remains the first moat. Each domain owns its decisions, its evidence lifecycle, and its governance rules.

## 6. Core Principles

1. Domain boundaries are drawn around stable domain concepts, not around volatile technical or organizational structures.
2. Each domain owns its data model and its governance rules. Other domains access data and logic only through declared interfaces.
3. A domain boundary encloses a complete decision lifecycle: evidence capture, analysis, recommendation, review, and approval.
4. Cross-domain interactions are events and queries, not shared state mutations.
5. Domain boundaries are tested through dependency analysis. If removing a domain requires changes to another domain's internals, the boundary is wrong.
6. New domains are added by defining their boundary and interface, not by modifying existing domains.

## 7. Key Concepts

- **Domain:** A bounded area of business concern that owns a specific set of decisions, evidence types, and governance rules. Audit is a domain. Financial control is a domain.
- **Boundary:** The explicit line that separates one domain's owned concepts from another's. Boundaries define what a domain is responsible for and what it depends on.
- **Interface Contract:** The set of operations, events, and queries a domain exposes to other domains. Interface contracts are stable, versioned, and documented.
- **Evidence Ownership:** The principle that each domain owns the lifecycle of evidence types within its boundary. Other domains reference evidence through the owning domain's interface.
- **Decision Authority Scope:** The set of decisions a domain is responsible for making within its governance rules. Cross-domain decisions require cross-domain coordination through interface contracts.

## 8. Operational Implications

1. Incident response identifies the owning domain first and traces cross-domain effects through interface contracts.
2. Data ownership questions are resolved by domain boundary, not by team assignment.
3. Performance issues within a domain are diagnosed and resolved within that domain's internals.
4. Cross-domain performance issues require interface contract review, not direct access to another domain's data.

## 9. Product Implications

1. Product features are assigned to domains by decision authority, not by UI location or user role.
2. Cross-domain features require interface design before implementation begins.
3. Feature requests that would erode domain boundaries are redesigned to preserve boundary integrity.

## 10. Architecture Implications

1. Each domain maps to a module in the modular monolith architecture defined in 16.02.
2. Domain interface contracts are expressed as code-level abstractions, not as documentation agreements.
3. Database schemas are partitioned by domain. Cross-domain queries use the owning domain's read models, not direct table joins.
4. Events flowing between domains carry sufficient context for the receiving domain to act without querying the sending domain's internals.

## 11. Governance Implications

Governance rules are owned by domains. The platform provides governance primitives, but each domain decides how those primitives apply to its decision lifecycle. Cross-domain governance requires coordination through interface contracts, not through shared governance middleware that couples domains.

## 12. AI / Intelligence Implications

AI services operate within the governance and data boundaries of the calling domain. A domain may invoke intelligence services through the platform's declared interface, but the intelligence module does not own domain data or make domain decisions. Intelligence outputs remain subject to the calling domain's governance rules and review requirements.

## 13. UX Implications

The user interface reflects domain boundaries through workspace organization. Users navigate between domains through explicit transitions that make domain ownership visible. This prevents users from inadvertently exercising decision authority in a domain where they lack governance standing.

## 14. Commercial Implications

Domain boundaries enable AQLIYA to license domain modules independently. An organization that needs audit decision intelligence but not financial control decision intelligence adopts the audit domain module. The architecture supports this without requiring a different product build.

## 15. Anti-Patterns

1. **Shared Domain Model.** Creating a single domain model that multiple domains modify, which couples domain evolution and makes governance boundaries unenforceable.
2. **Feature-Cutting Domains.** Drawing domain boundaries around feature categories such as reporting or dashboards, which do not align with decision authority and create cross-cutting dependencies.
3. **Anemic Boundaries.** Declaring domain boundaries but allowing other domains to bypass them through direct database access, shared libraries, or undocumented APIs.
4. **Merge-Hungry Domains.** Drawing boundaries so fine that every meaningful operation crosses multiple domains, producing integration overhead that negates the value of separation.
5. **Governance Middleware Overreach.** Centralizing all governance logic in a shared layer that couples domains through governance rules that should be domain-specific.
6. **Team-Aligned Boundaries.** Drawing domain boundaries to match current team structure, which produces boundaries that shift with every reorganization.

## 16. Examples

**Example 1:** The audit domain owns finding lifecycle, severity classification, and review governance. The financial control domain owns variance analysis, threshold monitoring, and escalation governance. When a financial control variance triggers an audit finding, the financial control domain emits an event. The audit domain receives it through its interface and creates a finding according to its own governance rules.

**Example 2:** A user wants to view evidence linked to a finding. The finding exists in the audit domain. The evidence reference points to an evidence object owned by the evidence domain. The audit domain retrieves the evidence through the evidence domain's interface, not by querying the evidence domain's database directly.

**Example 3:** A new regulatory compliance domain is added to the platform. It defines its own decision lifecycle, evidence types, and governance rules. It references organization data through the organization domain's interface and creates findings through the audit domain's interface. No existing domain requires modification.

## 17. Enterprise Impact

1. Clear domain boundaries give regulated enterprises confidence that their governance rules are enforced within the correct scope.
2. Domain-aligned architecture reduces the risk of unauthorized cross-domain decision authority.
3. Enterprise buyers can adopt specific domain modules without committing to the full platform, reducing procurement friction.
4. Domain boundaries support tenant isolation by providing clear separation of concerns for multi-tenant data partitioning.

## 18. Long-Term Strategic Importance

Domain boundaries determine how AQLIYA scales across decision domains. Well-drawn boundaries allow new domains to be added without modifying existing ones, supporting expansion into financial intelligence, compliance, and operational risk. Poorly drawn boundaries create coupling that makes each new domain more expensive than the last, eventually requiring a complete architectural rewrite.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 01.01 | AQLIYA Foundational Thesis | Root doctrine that domain boundaries must serve decision integrity |
| 02.01 | Enterprise Decision Intelligence Theory | Decision authority as the basis for boundary design |
| 05.01 | AuditOS Thesis | First domain boundary definition |
| 16.01 | Platform Design Principles | Platform-level context for domain boundaries |
| 16.02 | Modular Monolith Principles | Architectural implementation of domain boundaries |
| 16.04 | Workflow Design Principles | How workflows respect domain boundaries |
| 16.06 | Governance Design Principles | Governance scope alignment with domain boundaries |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Final Editor | Reviewed v0.2: doctrinal alignment verified |
