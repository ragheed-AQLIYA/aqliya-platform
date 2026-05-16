# AQLIYA Documentation Governance

> Establishes the hierarchy and rules for all AQLIYA documentation.

---

## Official Source of Truth (Hierarchy)

| Priority    | Layer                      | Location                                            | Description                                                                        |
| ----------- | -------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1 (highest) | **Official v1.1 Docs**     | `docs/official/`                                    | Platform identity, taxonomy, architecture, glossary, roadmap, implementation rules |
| 2           | **Source of Truth v1.0**   | `docs/source-of-truth/`                             | Architecture routes, system taxonomy, product status matrix (aligned with v1.1)    |
| 3           | **Website Content Source** | `docs/content/website-content-rewrite-v3-hybrid.md` | Current public website messaging source of truth                                   |
| 4           | **Website Implementation** | `src/` (source code)                                | The live website copy following v3 hybrid                                          |
| 5           | **Release Notes**          | `docs/releases/`                                    | Records of completed implementation milestones                                     |
| 6           | **Product / System Docs**  | `docs/systems/`, `docs/product/`                    | Per-product PRDs, operator manuals, definition packs                               |
| 7           | **Commercial Assets**      | `docs/commercial/`, `docs/commercial-pack/`         | Demo scripts, pilot packs, sales materials                                         |
| 8           | **Implementation Reports** | `docs/pilot/`, `docs/runtime-prototypes/`           | Session reports, observations, validation                                          |
| 9           | **Historical / Archive**   | `docs/archive/`, `docs/theoretical-reference/`      | Pre-v1.1 docs, legacy brand, theoretical foundation                                |

---

## Rules

### Authority

1. **Official v1.1 docs override** all older product docs, commercial materials, and archived content.
2. Website copy **must follow** `website-content-rewrite-v3-hybrid.md` until replaced by a newer approved content source.
3. No document outside `docs/official/` may contradict v1.1 product taxonomy.

### Product Status (Immutable)

| Product        | Status                                | Must Not Be Claimed Otherwise        |
| -------------- | ------------------------------------- | ------------------------------------ |
| AuditOS        | First proof product, pilot-ready      | —                                    |
| LocalContentOS | Second strategic product, in planning | Active development, production-ready |
| DecisionOS     | Adjacent active system                | Primary product line                 |
| SalesOS        | Prototype / future                    | Production-ready, backend complete   |
| SimulationOS   | Concept / future                      | Active development                   |
| Custom Systems | Activated per institutional scope     | AQLIYA Studio as available           |

### Deployment Language (Immutable)

| Model             | Status             | Must Not Be Claimed Otherwise |
| ----------------- | ------------------ | ----------------------------- |
| Cloud             | Available now      | —                             |
| Private / On-Prem | Strategic / future | Production-ready package      |
| Air-Gapped        | Strategic / future | Implemented                   |

### Brand Identity (Immutable)

- `Mind The Future` must NOT be reintroduced in any brand-facing or marketing content.
- All `Mind The Future` references in `src/` are removed as of commit `ac19a8d`.
- The official brand subtitle is `منصة ذكاء مؤسسي خاص ومحكوم`.

### Claims Safety

Do NOT claim the following as implemented or available in any public-facing documentation:

- Private / On-Prem production deployment package
- Air-Gapped mode
- Local AI runtime
- AQLIYA Studio
- Institutional Memory engine
- Model Governance registry
- Kubernetes deployment
- Docker-based production deployment
- SSO / LDAP / AD integration
- SIEM integration
- GPU-based local inference
- Unsupported performance metrics (e.g., "70-80% reduction")
- KYC / AML / SAMA / PDPL / SOC 2 compliance
- Real-time continuous audit / deviation detection

### Content Lifecycle

- **Official docs** — never deleted; updated via new versions
- **Website content rewrites** — kept for history; latest version is always the `*v3-hybrid*` file
- **Archive docs** — never deleted; clearly marked as historical
- **Release notes** — appended per milestone; never removed

### Review Required Before

- Changing any product status label
- Adding new deployment capability claims
- Changing the trust principle wording
- Reintroducing removed brand elements
- Contradicting v1.1 taxonomy
