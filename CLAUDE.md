# CLAUDE.md

Operational context for Claude Cowork / Claude Code sessions in the AQLIYA repository.

## Primary Role

- OpenCode is the primary implementation environment for this repository.
- Claude is a secondary reviewer, analyst, and assistant unless the user explicitly instructs Claude to implement changes directly.
- Do not assume Claude should take over product ownership, architecture ownership, or broad refactors by default.

## Read Before Acting

Read these files in this order before analysis, editing, or review:

1. `docs/DOCUMENTATION_AUTHORITY.md`
2. `docs/official/AQLIYA_MASTER_REFERENCE.md`
3. `AGENTS.md`
4. `README.md`
5. `docs/official/aqliya-vision-v1.1.md`
6. `docs/official/aqliya-product-taxonomy-v1.1.md`
7. `docs/official/aqliya-implementation-rules-v1.1.md`
8. `docs/official/aqliya-agent-context-v1.1.md`
9. `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
10. `docs/source-of-truth/ROUTE_STRATEGY.md`
11. `docs/source-of-truth/READINESS_GATES.md`

If documentation conflicts:

- Use `docs/official/*` for identity, governance, trust principles, and strategic positioning.
- Use code reality, `AQLIYA_MASTER_REFERENCE.md`, `PRODUCT_STATUS_MATRIX.md`, and `ROUTE_STRATEGY.md` for implementation status and route reality.
- Do not silently invent a third interpretation.

## AQLIYA Identity

- AQLIYA is a **Private Governed Institutional Intelligence Platform**.
- Trust principle: **AI assists. Humans decide. Evidence governs.**
- AQLIYA is not AuditOS only, not SaaS only, not a generic chatbot, not a CRM, and not a collection of disconnected demos.
- Cloud deployment is real. Private / On-Prem and Air-Gapped are strategic directions, not implemented production packages.

## Product Taxonomy And Current Status

| Area                    | Classification          | Current Status                 | Boundary                                                      |
| ----------------------- | ----------------------- | ------------------------------ | ------------------------------------------------------------- |
| **AQLIYA**              | Platform/company        | Active platform                | Parent platform, not a single product                         |
| **AuditOS**             | Product                 | L5 pilot-ready                 | Governed audit workspace at `/audit/*`                        |
| **auditos demo**        | Demo                    | L1 public demo                 | Sanitized guided demo at `/auditos/*`                         |
| **DecisionOS**          | Adjacent product/system | L4 usable v0.1                 | Governed workspace at `/decisions/*`                          |
| **LocalContentOS**      | Product                 | L5 pilot-ready with conditions | Governed workspace at `/local-content/*`                      |
| **Office AI Assistant** | Shared application      | L4 usable v0.1                 | Shared governed app at `/assistant/*`, not standalone product |
| **WorkflowOS**          | Custom/client workspace | L4 usable v0.1                 | Governed workspace at `/workflowos/*`                         |
| **Sunbul**              | Legacy alias            | Redirect only                  | Redirect alias to WorkflowOS, not a separate product          |
| **SalesOS**             | Product concept in repo | L3 prototype                   | `/sales` is prototype only, not a real backend product        |
| **SimulationOS**        | Marketing label         | L1 marketing only              | `/products/simulation` only, not a standalone system          |
| **LocalContactOS**      | Future product          | L0 not implemented             | No live workspace                                             |
| **AQLIYA Studio**       | Strategic layer         | L0 future                      | Do not claim implemented                                      |

Keep these distinctions explicit. Do not collapse AQLIYA into AuditOS. Do not present SalesOS, SimulationOS, or AQLIYA Studio as implemented products.

## Route Boundaries

- `/audit/*` = protected, governed, database-backed AuditOS workspace.
- `/auditos/*` = public, sanitized, mock-backed, read-only guided demo.
- `/decisions/*` = protected DecisionOS workspace.
- `/local-content/*` = protected LocalContentOS workspace.
- `/assistant/*` = protected Office AI Assistant workspace.
- `/workflowos/*` = protected WorkflowOS governed workspace.
- `/sunbul/*` = redirect alias to `/workflowos/*`.
- `/sales` = protected prototype surface only.
- `/products/*` = public marketing pages.
- Sensitive `/api/*` routes must remain permissioned.

If route scope changes, update `docs/source-of-truth/ROUTE_STRATEGY.md` and preserve truthful status labels.

## Demo Vs Workspace Rules

- `/auditos/*` is the only intentionally public AuditOS route family.
- `/auditos/*` must stay sanitized, mock-only, read-only, and clearly labeled as a demo unless explicitly reclassified later.
- Do not use real customer data, uploads, mutations, exports, tenant state, or operational audit workflows on `/auditos/*`.
- Governed workspaces must be authenticated, permissioned, auditable, and scoped to the correct tenant or organization.
- Marketing pages must not imply that demos, prototypes, or future systems are live operational products.

## Mandatory Development Rules

- Prefer the smallest correct change.
- Do not change application code, schema, routes, or infrastructure unless the task explicitly requires it.
- Do not change the Prisma schema unless an active concrete feature requires it and the user has asked for that scope.
- Do not refactor unrelated systems.
- Preserve tenant isolation, RBAC, audit trails, evidence linkage, and human review requirements.
- AI features must remain assistive only. No autonomous final decisions.
- Preserve Arabic-first, RTL-aware product behavior where relevant.
- Before changing Next.js code, check the relevant docs in `node_modules/next/dist/docs/` and verify server/client boundaries.
- Do not claim unimplemented capabilities as live.

## Low-Load Execution Protocol

Start with light context gathering only:

- `git status --short`
- `git log --oneline -10`
- `git diff --stat`
- targeted file reads and searches

Allowed light validation when relevant:

- `npx tsc --noEmit`
- targeted grep/read checks

Do not run heavy commands unless the user explicitly asks or clearly approves:

- `npm run build`
- `npm run lint`
- `npm test`
- `npm install <package>`
- `npx prisma generate`
- `npx prisma migrate dev`

Never inspect or print secrets. Never use destructive git commands.

## Validation Policy

- For docs-only tasks, verify scope with file diff and status. Heavy validation is not required by default.
- For code tasks, run the minimum relevant validation and report exactly what was and was not run.
- Never say validation passed unless the command actually ran.
- Never claim readiness levels above what the repo proves.

## Forbidden Behaviors

- Describing AQLIYA as AuditOS only, SaaS only, or a generic chatbot.
- Claiming SalesOS, SimulationOS, LocalContactOS, or AQLIYA Studio are implemented when they are not.
- Treating `/auditos/*` as a real workspace.
- Introducing real customer data or mutations into `/auditos/*` without explicit reclassification.
- Bypassing auth, RBAC, tenant isolation, audit logging, or review gates.
- Claiming On-Prem, Air-Gapped, Local AI runtime, SSO/LDAP/AD, SIEM, or Kubernetes are implemented without code proof.
- Making autonomous AI decisions or evidence-free final outputs.
- Refactoring unrelated code, changing schema speculatively, or hiding known limitations.

## Required Response Format After Any Task

Use this structure after analysis, review, or implementation:

```md
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT

Summary

- ...

Files Changed

- `path` — what changed

Commands Run

- `command`

Code Changed

- Yes/No

Schema Changed

- Yes/No

Validation

- `command` — Pass/Fail/Not run

Risks / Limitations

- ...
```

When relevant, also state whether the work affected route status, product status, governance, or docs authority.
