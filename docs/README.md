# AQLIYA Documentation

## Documentation Authority

See `DOCUMENTATION_AUTHORITY.md` for the definitive documentation hierarchy, conflict resolution rules, and folder-level authority assignments.

## Documentation Authority Map

| Folder / File                         | Purpose                                              | Authority Level   | Status              |
| ------------------------------------- | ---------------------------------------------------- | ----------------- | ------------------- |
| `DOCUMENTATION_AUTHORITY.md`          | Conflict-resolution authority                        | Level 0 — Highest | Active              |
| `official/AQLIYA_MASTER_REFERENCE.md` | Current master reference                             | Level 1           | Active              |
| `official/*.md` (doctrine)            | Identity, governance, taxonomy, implementation rules | Level 2           | Active — doctrine   |
| `../README.md`                        | Project entry point                                  | Level 3           | Active — entry      |
| `../AGENTS.md`                        | Agent operating contract                             | Level 3           | Active — entry      |
| `README.md` (this file)               | Documentation index                                  | Level 3           | Active — navigation |
| `source-of-truth/*`                   | Architecture, taxonomy, routes, product status       | Level 4           | Active — supporting |
| `product/*`                           | Product definitions and commercial chain             | Level 5           | Active — supporting |
| `systems/*`                           | System and operator documentation                    | Level 5           | Active — supporting |
| `pilot/*`                             | Pilot execution and readiness                        | Level 5           | Active — supporting |
| `reports/*`                           | Validation reports and implementation evidence       | Level 6           | Evidence only       |
| `reports/project-organization/`       | Documentation governance and repo organization audits  | Level 6           | Evidence only       |
| `releases/*`                          | v0.1 release scope, limitations, release notes       | Level 5           | Active — supporting |
| `deployment/*`                        | Deployment posture and environment inventory         | Level 5           | Active — supporting |
| `clients/*`                           | Client organization profiles (not product docs)       | Level 5           | Active — supporting |
| `execution/*`                         | Engineering prompts and guards                       | Level 5           | **Review before use** — some files stale |
| `archive/notion-export-2026/`         | Notion OS planning annex (archived reference)          | Level 8           | Historical — not product status          |
| `notion/README.md`                    | Redirect stub to archived Notion pack                  | Level 8           | See `archive/notion-export-2026/`        |
| `theoretical-reference/*`             | Intellectual foundation and domain theory            | Level 7           | Background only     |
| `archive/*`                           | Historical and superseded documents                  | Level 8           | Historical only     |

## Official Doctrine (Level 2)

| Document                                       | Description                                            |
| ---------------------------------------------- | ------------------------------------------------------ |
| `official/AQLIYA_MASTER_REFERENCE.md`          | Current master reference for v0.1 operational baseline |
| `official/aqliya-vision-v1.1.md`               | Platform identity — what AQLIYA is and is not          |
| `official/aqliya-implementation-rules-v1.1.md` | Mandatory rules for any code change                    |
| `official/aqliya-product-taxonomy-v1.1.md`     | Product boundaries and taxonomy classification         |
| `official/aqliya-core-architecture-v1.1.md`    | Architecture layers, engine status, current limits     |
| `official/aqliya-skill-context-v1.1.md`        | Development skills and guardrails                      |
| `official/aqliya-glossary-v1.1.md`             | Official terminology reference                         |
| `official/aqliya-roadmap-v1.1.md`              | Execution phases and strategic direction               |
| `official/aqliya-agent-context-v1.1.md`        | Full agent brief for human and AI developers           |

## Supporting References (Level 4)

| Directory / File                            | Description                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| `source-of-truth/`                          | Supporting references — architecture, product definition, system taxonomy |
| `source-of-truth/AQLIYA_ARCHITECTURE.md`    | Route model and system hierarchy                                          |
| `source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | System classification and terminology rules                               |
| `source-of-truth/PRODUCT_STATUS_MATRIX.md`  | Current product status across all dimensions                              |
| `source-of-truth/ROUTE_STRATEGY.md`         | Route purpose and workspace/demo separation                               |
| `source-of-truth/READINESS_GATES.md`        | Pilot and commercial readiness criteria                                   |

## Systems Documentation (Level 5)

| Directory                   | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `systems/auditos/`          | AuditOS product documentation, operator manual      |
| `systems/decisionos/`       | DecisionOS architecture, engine, inputs, publishing |
| `systems/local-content-os/` | LocalContentOS documentation                        |
| `systems/salesos/`          | SalesOS documentation                               |
| `systems/simulationos/`     | SimulationOS documentation                          |

## Reports and Evidence (Level 6)

Reports provide evidence of implementation progress and validation results. They do not define doctrine or product taxonomy.

→ `reports/` for validation reports, smoke tests, readiness reviews, and audit evidence.

**Current Release Lock:**

- `reports/aqliya-controlled-pilot-release-lock-2026-05-25.md` — Phases 0–5 completion, product status, validation evidence, commercial claim boundaries, and recommended next work. Tag: `controlled-pilot-lock-2026-05-25`.

## Public Claim Alignment Authority

Current Reference for Public Facing Claims:

- `reports/public-claim-alignment-2026-05-24.md`

Authority & Constraints:

- This report is the current reference for the status of public-facing claims in marketing, product positioning, and customer communications.
- Any future modifications to marketing copy or public product positioning must review this report.
- Claims about production-readiness, security certifications, customer proof, or autonomous capabilities must be supported by explicit, current evidence.

Authority applies to:

- Marketing pages and landing pages
- Product documentation and positioning statements
- Case studies and customer proof claims
- Security and compliance statements
- Demo and trial claim accuracy

## Theoretical Reference (Level 7 — Background Only)

Full 21-part theoretical foundation: foundational doctrine, enterprise decision intelligence, market theory, financial intelligence, audit intelligence, audit firm operating theory, workflow intelligence, governance & trust, data trust, human-AI model, organizational memory, deployment & sovereignty, product philosophy, commercialization, responsible intelligence, system design principles, terminology, anti-patterns, strategic narratives, reference models, and documentation maintenance system.

Theoretical docs provide intellectual foundation but do not govern implementation status, product taxonomy, or route decisions.

→ `theoretical-reference/` for the full index.

## Language Support

AQLIYA is Arabic-first (RTL), bilingual. Supports Arabic and English financial data processing.

## Navigation Indexes

These README files provide navigation and recommended reading order for each documentation area. They do not override official docs or change product statuses.

| Directory          | README                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| `product/`         | `product/README.md` — Product definitions and commercial chain                       |
| `commercial/`      | `commercial/README.md` — Commercial and go-to-market materials (demo storyline)      |
| `releases/`        | Release scope, known limitations, release notes                                      |
| `reports/project-organization/` | Repo documentation governance audits (latest: `PROJECT-ORGANIZATION-AUDIT.md`) |
| `systems/`         | `systems/README.md` — System and operator documentation                              |
| `pilot/`           | `pilot/README.md` — Pilot execution, readiness, operational docs                     |
| `reports/`         | `reports/README.md` — Stabilization, audit, documentation, QA reports                |

## Archive (Level 8 — Historical Only)

| Directory                    | Description                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `archive/`                   | Historical and superseded documents retained for reference                                          |
| `archive/legacy-numbered/`   | Pre-v1.1 numbered documentation (product foundation, financial statements, evidence, AI governance) |
| `archive/content-drafts/`    | Superseded website content drafts (v1, v2 drafts)                                                   |
| `archive/pilot-history/`     | Historical pilot session reports and run records                                                    |
| `archive/commercial-legacy/` | Legacy commercial materials (archived pilot-pack and demo-storyline)                                |

> **Important:** Archived files are **not authoritative**. They are retained for historical reference only. See `DOCUMENTATION_AUTHORITY.md` for the current hierarchy.

## Important Disclaimer

Outputs generated by AQLIYA products are draft preparation materials and require review and approval by qualified professionals before official use. AI assists, humans decide, evidence governs.
