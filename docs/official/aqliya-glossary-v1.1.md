# AQLIYA Glossary v1.1

**Version:** 1.1
**Status:** Official terminology reference

---

## Company Identity Terms

| Term | Definition |
|---|---|
| **AQLIYA** | Private Governed Institutional Intelligence Platform. The parent company and platform brand. |
| **AQLIYA Intelligence Core** | The shared platform layer containing AI, governance, workflow, evidence, memory, RBAC, audit logs, model governance, document intelligence, reporting, and deployment engines. |
| **AQLIYA Cloud** | Managed SaaS deployment of AQLIYA, suitable for SMEs, pilots, and mid-market. |
| **AQLIYA Private / On-Prem** | Strategic deployment model: runs inside the customer's infrastructure with local database, local file storage, local AI, and no data leaving the organization. Not yet implemented as a production package. |
| **AQLIYA Studio** | The custom systems builder layer that enables building institutional systems on top of the Core without starting from scratch. |

---

## Product Terms

| Term | Definition |
|---|---|
| **AuditOS** | Governed financial and audit intelligence system. The first proof product under AQLIYA. Handles trial balance, mapping, statements, notes, evidence, findings, review, approval, and export. |
| **LocalContentOS** | Local content measurement and governance system. The second strategic product, strong for the Saudi market. |
| **DecisionOS** | Executive decision governance system. Handles decision requests, context collection, options analysis, risk review, committee workflow, voting, and audit trail. |
| **SalesOS** | Governed revenue intelligence system. Not a traditional CRM — an institutional sales memory and governance system. |
| **LocalContactOS** | Institutional relationship intelligence system. Manages sensitive organizational relationships that live in employees' minds. |
| **RiskOS** | Internal risk intelligence system. Risk register, scoring, control mapping, incident tracking. |
| **ComplianceOS** | Regulated compliance management system. Framework library, control checklist, gap analysis, regulatory reporting. |
| **LegalOS** | Legal intelligence assistant. Not a lawyer replacement. Contract repository, clause extraction, obligation tracking. |
| **GovOS** | Government institutional intelligence system. Committee management, official correspondence, policy workflow. |
| **SimulationOS** | Scenario simulation and decision comparison system. Currently marketing-only. |

---

## Governance Terms

| Term | Definition |
|---|---|
| **Evidence Graph** | The system that links every output (number, finding, decision) to its source evidence, file, user, timestamp, review, and approval. |
| **Governance Engine** | The shared engine managing approvals, review stages, policies, risk levels, evidence requirements, access rules, escalations, and locks. |
| **Workflow Engine** | The shared state machine (Draft → Prepared → Reviewed → Returned → Approved → Locked → Exported → Archived) used by all products. |
| **Institutional Memory** | The system that preserves decisions, notes, files, risk patterns, approval patterns, suppliers, clients, relationships, and policies. |
| **RBAC** | Role-Based Access Control operating at Organization, Workspace, Product, Module, Workflow, Document, AI action, Export, Approval, and Admin levels. |
| **Audit Logs** | Immutable logs answering: Who did what, when, what changed, why, what source, what result, was it approved, was it exported. |
| **Model Governance** | Registry and governance of every AI model: name, version, license, use case, approval status, limitations, owner, deployment date, allowed/blocked modules. |

---

## AI Terms

| Term | Definition |
|---|---|
| **AI Orchestration Engine** | The engine managing Cloud AI, Local AI, Hybrid AI, model routing, prompt registry, AI action logs, and AI output validation. |
| **Cloud AI Provider** | External AI model provider (OpenAI, Claude, Gemini, managed models). |
| **Local AI Provider** | Internal/local AI models (Qwen, Llama, Mistral via Ollama or vLLM). |
| **Prompt Registry** | Version-controlled registry of all AI prompts used across products. |
| **AI Action Logs** | Logs of every AI action: prompt version, input references, output, confidence, reviewer decision, human approval. |
| **Hybrid AI** | Routing between Cloud and Local AI based on sensitivity, cost, and capability. |

---

## Deployment Terms

| Term | Definition |
|---|---|
| **Cloud Pilot** | Cheapest, fastest AQLIYA tier for trials and pilots. |
| **Cloud Enterprise** | Managed cloud with tenant isolation and advanced governance. |
| **Private Cloud** | Strategic: dedicated infrastructure with Saudi hosting and higher control. Not yet implemented. |
| **On-Prem** | Strategic: inside customer servers — local storage, local database, local AI. Not yet implemented as a production package. |
| **Air-Gapped** | Strategic: no internet, no external APIs, no outbound traffic, local OCR, local vector search, local LLM. Not yet implemented; requires On-Prem foundation first. |

---

## Commercial Terms

| Term | Definition |
|---|---|
| **Cloud Subscription** | Monthly per-user, per-workspace, per-product pricing with usage-based AI. |
| **Private License** | Setup fee + annual license + support contract + professional services. |
| **Custom Systems** | Platform license + implementation project + governance design + AI configuration + annual maintenance. |
