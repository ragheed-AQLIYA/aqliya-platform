# LocalContentOS — Risks and Open Decisions

**Status:** Specification only — not implemented
**Version:** 1.0

---

## Risk Register

### R-001: Regulatory Formula Validation

| Field                    | Detail                                                                                                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Risk**                 | Customers expect LocalContentOS to use official regulatory formulas (LCGPA, SASO) that may not be publicly available or may require legal validation.             |
| **Impact**               | Product credibility suffers if formulas are not accepted by customers or regulators. Legal liability if formulas are incorrect.                                   |
| **Recommended Decision** | Keep formulas conceptual and transparent. Add configurability so each customer can define their own classification criteria. Do not claim regulatory endorsement. |
| **Owner**                | Product Lead                                                                                                                                                      |
| **Trigger to Revisit**   | First customer demands regulatory-grade formulas before agreeing to pilot.                                                                                        |

---

### R-002: Product Naming (Arabic/English)

| Field                    | Detail                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Risk**                 | Arabic product name may conflict with existing market terms or create confusion with similar products.                                                  |
| **Impact**               | Brand confusion, difficulty in marketing.                                                                                                               |
| **Recommended Decision** | Current Arabic name (نظام المحتوى المحلي) is descriptive and clear. Validate with target customers. Consider trademark search before production launch. |
| **Owner**                | Founder / Brand Lead                                                                                                                                    |
| **Trigger to Revisit**   | Customer feedback indicates confusion with existing solutions.                                                                                          |

---

### R-003: Route Naming

| Field                    | Detail                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Risk**                 | `/local-content` route name may conflict with existing routes or not fit AQLIYA URL convention.                         |
| **Impact**               | Technical debt from renaming later.                                                                                     |
| **Recommended Decision** | Proposed `/local-content` follows the `/audit`, `/decisions`, `/sales` pattern. Confirm during implementation planning. |
| **Owner**                | Technical Lead                                                                                                          |
| **Trigger to Revisit**   | Routing conflict discovered during Phase 1 implementation.                                                              |

---

### R-004: Data Sensitivity

| Field                    | Detail                                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Risk**                 | Customer procurement data is commercially sensitive. Organizations may hesitate to upload spend amounts and supplier data into a cloud system.     |
| **Impact**               | Low adoption, data quality issues, or reluctance to proceed with software.                                                                         |
| **Recommended Decision** | Offer data sensitivity tiers. Allow anonymization (rounded amounts, aggregated categories). Provide clear data handling and storage documentation. |
| **Owner**                | Product Lead                                                                                                                                       |
| **Trigger to Revisit**   | First customer refuses to upload actual spend data.                                                                                                |

---

### R-005: Customer Data Variability

| Field                    | Detail                                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Risk**                 | Every customer has different data formats, field names, categories, and quality. Import becomes a custom integration per customer.                          |
| **Impact**               | High implementation cost, scalability challenges.                                                                                                           |
| **Recommended Decision** | Define strict required fields in the data model. Provide mapping templates. Accept that some manual data preparation is inevitable for non-standard fields. |
| **Owner**                | Technical Lead                                                                                                                                              |
| **Trigger to Revisit**   | First 3 customers require 3 completely different import configurations.                                                                                     |

---

### R-006: Import Complexity

| Field                    | Detail                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Risk**                 | CSV import logic is deceptively complex — encoding issues, large files, partial failures, duplicate handling, cross-reference validation.           |
| **Impact**               | Buggy imports, data corruption, poor user experience.                                                                                               |
| **Recommended Decision** | Invest in robust import engine during Phase 2. Support async processing for large files. Provide clear error messages. Maintain import audit trail. |
| **Owner**                | Technical Lead                                                                                                                                      |
| **Trigger to Revisit**   | Customer reports data loss or corruption during import.                                                                                             |

---

### R-007: Evidence File Quality

| Field                    | Detail                                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Risk**                 | Evidence files are poor quality (illegible scans, wrong documents, missing pages). Analysts cannot validate classifications.        |
| **Impact**               | Low confidence classifications, manual effort to chase evidence.                                                                    |
| **Recommended Decision** | Accept evidence at any quality level but assign appropriate confidence. Do not block workflow on evidence quality — flag and track. |
| **Owner**                | Product Lead                                                                                                                        |
| **Trigger to Revisit**   | > 50% of evidence files are Low confidence in first pilot.                                                                          |

---

### R-008: Role/Permission Complexity

| Field                    | Detail                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Risk**                 | 7 roles with granular permissions create administrative overhead. Small organizations may not have distinct people for each role. |
| **Impact**               | Role configuration becomes a barrier to adoption.                                                                                 |
| **Recommended Decision** | Offer simplified role sets for smaller organizations (Admin, Analyst, Viewer). Full RBAC for enterprise deployments.              |
| **Owner**                | Product Lead                                                                                                                      |
| **Trigger to Revisit**   | Customer spends > 1 week configuring roles.                                                                                       |

---

### R-009: Build Before First Paid Pilot

| Field                    | Detail                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Risk**                 | Building the software MVP before validating demand through paid analyst-led pilots.                                               |
| **Impact**               | Wasted development, building the wrong thing, no market fit.                                                                      |
| **Recommended Decision** | **Do NOT build before first paid pilot conversion.** Continue with analyst-led model until a customer commits budget to software. |
| **Owner**                | Founder                                                                                                                           |
| **Trigger to Revisit**   | Customer with committed budget requests software delivery schedule.                                                               |

---

### R-010: Keep Analyst-Led Model Longer

| Field                    | Detail                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Risk**                 | Continuing analyst-led model too long may miss market timing or allow competitors to enter.                                                      |
| **Impact**               | Lost market opportunity, competitor advantage.                                                                                                   |
| **Recommended Decision** | Transition to software when (a) analyst-led pilots consistently score ≥ 2.5, (b) customers request software, (c) competitive pressure increases. |
| **Owner**                | Founder                                                                                                                                          |
| **Trigger to Revisit**   | Customer chooses competitor because analyst-led model is "not scalable."                                                                         |

---

## Open Decisions

### D-001: When to Start Building

| Field              | Detail                                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Question**       | Should we build LocalContentOS MVP before or after the first paid analyst-led pilot conversion?                                                                                             |
| **Options**        | (A) Build after first paid pilot conversion — validates demand first. (B) Build in parallel — have product ready when customer asks. (C) Build only after AuditOS production stabilization. |
| **Recommendation** | **(C) Build only after AuditOS production stabilization AND after first paid pilot conversion.** This minimizes risk to both products.                                                      |
| **Decision Owner** | Founder                                                                                                                                                                                     |

### D-002: MVP vs. Full Product

| Field              | Detail                                                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Question**       | Should the first software release be a limited MVP or a fuller product?                                                                                                                        |
| **Options**        | (A) Narrow MVP (Phase 1–3 only: workspace, imports, classification). (B) Full MVP (Phase 1–5: including findings, review, reporting). (C) Start narrow, add phases based on customer feedback. |
| **Recommendation** | **(C) Start with Phase 1–2 (workspace + imports), then add phases based on first software customer's needs.**                                                                                  |
| **Decision Owner** | Product Lead + Founder                                                                                                                                                                         |

### D-003: AI Integration Timing

| Field              | Detail                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Question**       | When should AI-assisted classification be added?                                                                                                             |
| **Options**        | (A) From MVP launch — competitive differentiator. (B) After MVP validation — reduce complexity. (C) Only after AQLIYA Core AI Abstraction phase is complete. |
| **Recommendation** | **(C) Only after AQLIYA Core AI Abstraction phase is complete.** Do not build AI before the Core supports it properly.                                       |
| **Decision Owner** | Technical Lead                                                                                                                                               |

### D-004: Pricing Model for Software

| Field              | Detail                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Question**       | What pricing model should LocalContentOS software use?                                                                                            |
| **Options**        | (A) Monthly SaaS subscription. (B) Per-engagement fee. (C) Annual license with implementation project. (D) Hybrid — paid pilot → subscription.    |
| **Recommendation** | **(D) Hybrid — start with paid pilot (analyst-led or software-based), then convert to subscription.** Follow the AuditOS pricing model precedent. |
| **Decision Owner** | Founder                                                                                                                                           |

### D-005: First Customer Criteria

| Field              | Detail                                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Question**       | What criteria should the first software customer meet?                                                                                                                        |
| **Options**        | (A) Any paying customer. (B) Customer with analyst-led pilot experience. (C) Strategic customer with government/semi-government contracts. (D) Customer willing to co-design. |
| **Recommendation** | **(C + D) Strategic customer with government contracts who is willing to co-design the product.** This ensures both revenue and product-market fit.                           |
| **Decision Owner** | Founder                                                                                                                                                                       |
