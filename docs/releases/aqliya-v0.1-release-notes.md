# AQLIYA v0.1 Release Notes

## 1. Release Summary

AQLIYA v0.1 is the **first scope-locked usable platform release candidate** for the repository as it exists today. It is not a production-hardened enterprise release. It represents the first formally reviewed, validation-backed release scope for the AQLIYA platform and its currently implemented systems.

## 2. Release Verdict

- Final verdict: **GO — v0.1 release candidate approved**
- Release tag allowed: **Yes, if the repository state is clean and safe for tagging**
- Validation status: **passed**
- Remaining limitations: **documented and accepted**

## 3. Included in v0.1

| Area                           | Status                                  | Maturity       | Demo/Use Status               |
| ------------------------------ | --------------------------------------- | -------------- | ----------------------------- |
| AQLIYA Platform                | Included in v0.1                        | L4 Usable v0.1 | Safe to show with explanation |
| AuditOS                        | Included as pilot-ready product         | L5 Pilot-ready | Safe to show                  |
| DecisionOS                     | Included as active adjacent system      | L4 Usable v0.1 | Safe to show with explanation |
| Office AI Assistant            | Included as governed shared application | L4 Usable v0.1 | Safe to show with explanation |
| Sunbul                         | Included as custom/internal workspace   | L4 Usable v0.1 | Safe to show with explanation |
| workflowos                     | Included as custom/internal workspace   | L3 Prototype   | Internal only                 |
| Platform audit logs/governance | Included in v0.1                        | L4 Usable v0.1 | Internal/operator use         |
| Public marketing site          | Included in v0.1                        | L4 Usable v0.1 | Safe to show                  |
| Custom product inquiry         | Included in v0.1                        | L4 Usable v0.1 | Safe to show                  |
| auditos guided demo            | Included as demo only                   | L1 Marketing   | Demo only                     |

## 4. Not Included as Implemented

| Area                    | Current Classification       | Correct Claim                             | Forbidden Claim                           |
| ----------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------------- |
| LocalContentOS          | Strategic / future           | Strategic second product                  | LocalContentOS is implemented             |
| SalesOS                 | Prototype / internal preview | Prototype only                            | SalesOS is implemented                    |
| SimulationOS standalone | Do not claim as live         | DecisionOS includes simulation capability | SimulationOS is a live standalone product |
| LocalContactOS          | Not implemented              | Future product                            | LocalContactOS is implemented             |
| RiskOS                  | Not implemented              | Future product                            | RiskOS is implemented                     |
| ComplianceOS            | Not implemented              | Future product                            | ComplianceOS is implemented               |
| LegalOS                 | Not implemented              | Future product                            | LegalOS is implemented                    |
| GovOS                   | Not implemented              | Future product                            | GovOS is implemented                      |
| AQLIYA Studio           | Strategic / future           | Strategic custom systems layer            | AQLIYA Studio is live                     |
| On-Prem                 | Not implemented              | Strategic deployment direction            | Production On-Prem package exists         |
| Air-Gapped              | Not implemented              | Strategic deployment direction            | Air-Gapped deployment is available        |
| Local AI                | Not implemented              | Strategic runtime direction               | Local AI runtime is live                  |
| Model Governance        | Not implemented              | Strategic future capability               | Model Governance is implemented           |
| Institutional Memory    | Not implemented              | Strategic future capability               | Institutional Memory is implemented       |

## 5. What Changed Before Release

- Repository discovery audit established the real current system inventory.
- Reality hardening pass protected sensitive APIs, labeled prototypes honestly, and repaired the Jest stack.
- API protection was added to audit evidence download, Office AI download, and internal metrics.
- Prototype labeling was added to SalesOS, organizations, and generic settings surfaces.
- Test stack repair converted governance validation files into real Jest tests and replaced the broken Prisma mock.
- Official docs alignment reconciled official v1.1 documents with source-of-truth and hardened repository reality.
- v0.1 scope lock defined what is included, excluded, safe to demo, and forbidden to claim.
- Final go/no-go review approved the release candidate.

## 6. Validation

| Command                   | Result                        |
| ------------------------- | ----------------------------- |
| `npx tsc --noEmit`        | Pass                          |
| `npm run lint`            | Pass with documented warnings |
| `npm run build`           | Pass                          |
| `npm test -- --runInBand` | Pass                          |
| `npm run audit:health`    | Pass                          |
| `npm run backup:verify`   | Pass                          |

## 7. Known Limitations

- AuditOS still contains some mixed mock/deterministic internals in non-blocking helper paths.
- DecisionOS includes some mixed dashboard filler and is not yet production-hardened.
- Office AI Assistant is deterministic/governed today, not a full cloud/local AI platform runtime.
- Sunbul is real but positioned as custom/client-specific rather than a general product line.
- workflowos remains an internal/custom alias over Sunbul implementation.
- Build and lint warnings remain documented and accepted.
- Prototype/internal routes such as `/sales`, `/organizations`, `/settings`, and `/monitoring` remain present and must keep their restricted framing.

## 8. Demo and Commercial Safety

Allowed positioning:

- AuditOS is real and pilot-ready.
- DecisionOS is real and active.
- Office AI Assistant is a governed shared application.
- Sunbul is a real custom/client-specific workspace.
- AQLIYA Cloud is active.

Forbidden positioning:

- SalesOS or LocalContentOS are implemented products.
- workflowos is a separate product from Sunbul.
- On-Prem, Air-Gapped, or Local AI are live.
- AQLIYA Studio, Model Governance, or Institutional Memory are implemented.

## 9. Release Tag

- Proposed tag: `v0.1.0`
- Tag type: annotated git tag
- Tag message: `AQLIYA v0.1.0 — initial usable platform release candidate`

## 10. Next Phase

After release tagging, the next phase should be chosen deliberately:

- final customer demo preparation
- first customer pilot
- LocalContentOS product implementation
- AI abstraction hardening
- deployment/on-prem preparation

This task does not start any of those phases.
