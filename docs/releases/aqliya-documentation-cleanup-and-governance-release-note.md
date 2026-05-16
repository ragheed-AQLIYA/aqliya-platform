# AQLIYA Documentation Cleanup & Governance — Release Note

## 1. Release Status

**Status:** Complete

This release establishes the current documentation governance baseline and project cleanup state.

## 2. Scope

- Documentation inventory and governance baseline
- Documentation conflict report
- Active pilot docs brand cleanup
- Root cleanup safe move pass
- Documentation navigation indexes
- AuditOS commercial master index
- Systems maturity map
- DecisionOS documentation index
- Governance terminology cleanup
- AuditOS operator manual discoverability improvement

## 3. Commits Included

| Commit    | Area                   | Purpose                                                                   | Source Code Changed |
| --------- | ---------------------- | ------------------------------------------------------------------------- | :-----------------: |
| `01bc712` | Docs governance        | Inventory, governance, conflict report, README updates                    |         No          |
| `ac00dde` | Brand cleanup          | Removed legacy `Mind The Future` from active pilot docs                   |         No          |
| `06c2281` | Root cleanup           | Moved root docs/data, removed artifact, updated `.gitignore`              |         No          |
| `5398ab2` | Docs indexes           | Added navigation indexes for product, commercial, systems, pilot, reports |         No          |
| `83114d3` | AuditOS commercial     | Added AuditOS commercial master index                                     |         No          |
| `5bf7dce` | Systems docs           | Added systems maturity map and DecisionOS index                           |         No          |
| `dd594b9` | Governance terminology | Clarified GovernanceOS real-time language as future concept               |         No          |
| `7bcc8ac` | AuditOS systems docs   | Linked AuditOS operator manual from AuditOS systems README                |         No          |

## 4. Final Documentation State

- `docs/official/` remains the highest authority.
- `docs/content/website-content-rewrite-v3-hybrid.md` remains the current public website messaging source.
- `docs/DOCUMENTATION_GOVERNANCE.md` defines source hierarchy and immutable rules.
- `docs/DOCUMENTATION_INVENTORY.md` classifies documentation areas.
- `docs/DOCUMENTATION_CONFLICT_REPORT.md` tracks known conflicts.
- Active docs no longer contain `Mind The Future`.
- `Mind The Future` remains only in historical archive docs if present.
- `docs/product/auditos-commercial-master-index.md` is the AuditOS commercial navigation entrypoint.
- `docs/systems/decisionos/README.md` indexes DecisionOS system docs.
- `docs/systems/auditos/README.md` links to the AuditOS operator manual.
- GovernanceOS is treated as governance-layer concept/future direction, not current standalone production product.

## 5. Project Root Cleanup State

- `demo-storyline-auditos.md` → moved to `docs/commercial/demo-storyline-auditos.md`
- `pilot-dataset-gtc-fy2025.md` → moved to `docs/pilot/datasets/pilot-dataset-gtc-fy2025.md`
- `pilot-dataset-gtc-fy2025.csv` → moved to `docs/pilot/datasets/pilot-dataset-gtc-fy2025.csv`
- root artifact `h` removed
- `.gitignore` updated for:
  - `.opencode/`
  - `/lighthouse-reports/`
  - `/cypress/videos/`
  - `/cypress/screenshots/`

## 6. Claims / Positioning Safety

- No source code changed in this documentation cleanup release.
- No product status changes were made.
- No website copy changes were made.
- No official v1.1 docs were rewritten.
- No unsupported On-Prem / Air-Gapped / Local AI / Studio / compliance claims were introduced.
- GovernanceOS wording was clarified as future/conceptual.

## 7. Remaining Known Items

Future optional work:

- Commercial archive pass for duplicate docs:
  - `docs/commercial/pilot-pack/`
  - `docs/commercial/demo-storyline-auditos.md`
  - older pilot success criteria variants
- AuditOS operator manual future move plan, only after link validation
- Product folder normalization later if needed
- Governance-layer docs only if approved, using `governance-layer`, not `governanceos`, unless taxonomy changes

## 8. Release Decision

The AQLIYA documentation system is now governed, indexed, and safe for continued project work.

## 9. Next Recommended Step

Recommendations for what to do next:

1. **Commercial archive pass** — archive duplicate pilot pack and superseded demo storyline
2. **AuditOS operator manual move plan** — move manual into `docs/systems/auditos/`
3. **Roadmap execution review** — assess current execution against v1.1 roadmap
4. **Product gap planning** — minimal planning docs for LocalContentOS / SalesOS / SimulationOS
