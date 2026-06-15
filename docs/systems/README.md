> **Language note (2026-06-09):** AQLIYA is now positioned as a **platform** first. Each system in this map is a **Specialized Operating System** within the platform. See `docs/official/AQLIYA_MASTER_REFERENCE.md` §5b.

# AQLIYA Systems Documentation

## Systems Maturity Map

| System / Layer   | Official Status                                 | Documentation Maturity           | Read First                                         | Notes                                                                                                             |
| ---------------- | ----------------------------------------------- | -------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| AuditOS          | First proof product — pilot-ready               | Active / operator docs available | `AUDITOS_OPERATOR_MANUAL.md` + `auditos/README.md` | Operator manual currently at `docs/systems/` root; future normalization may move it under `docs/systems/auditos/` |
| DecisionOS       | Adjacent active system                          | Strong / 15 files                | `decisionos/README.md`                             | Keep as system docs, not primary product line                                                                     |
| LocalContentOS   | Strategic second product — in planning          | Minimal — intentional            | `local-content-os/README.md`                       | Do not add production claims                                                                                      |
| SalesOS          | Prototype / future                              | Minimal — intentional            | `salesos/README.md`                                | No backend-complete claims                                                                                        |
| SimulationOS     | Concept / future                                | Minimal — intentional            | `simulationos/README.md`                           | No active-development claims                                                                                      |
| Governance Layer | Shared governance layer, not standalone product | Official/core architecture docs  | `../official/aqliya-core-architecture-v1.1.md`     | Do not create `governanceos/` unless taxonomy changes                                                             |

## Rules

- Do not treat GovernanceOS as standalone product in systems docs.
- Do not create production docs for planning/prototype/concept systems.
- Keep LocalContentOS, SalesOS, and SimulationOS minimal unless official status changes.
- DecisionOS depth is acceptable because it is an adjacent active system.
- AuditOS operator docs should remain discoverable until future folder normalization.

## Future Normalization Notes

- Future task may move AuditOS operator manual into `docs/systems/auditos/`.
- Future task may add minimal planning/prototype/concept docs only after approval.
- Future task may create `docs/systems/governance-layer/`, not `governanceos/`, if governance-layer docs are needed.

## GovernanceOS Terminology Note

The systems audit found aspirational "real-time" language in a GovernanceOS product definition pack. This should be handled in a separate terminology cleanup pass, not in this README update.
