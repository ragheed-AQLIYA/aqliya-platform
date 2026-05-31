# AQLIYA v0.1 Known Limitations

## 1. Product Limitations

- AuditOS is strong but still has some mixed mock/deterministic internals in service and AI helper paths.
- DecisionOS includes some mixed dashboard filler and is not yet positioned as fully production-hardened.
- Office AI Assistant is deterministic/governed today, not a broad cloud-AI product runtime.
- WorkflowOS is the canonical governed workflow workspace (L4 Usable v0.1), classified as custom/client-specific rather than a general platform product line.
- Sunbul is a legacy redirect alias over WorkflowOS only; `/sunbul/*` routes redirect to `/workflowos/*`. Prisma models retain `Sunbul*` prefixes for schema compatibility.
- LocalContentOS is a real governed workspace (L5 with conditions / usable v0.1), not marketing-only or unimplemented. Binary PDF/XLSX export implemented (2026-05-25, pdfkit + xlsx); not L6 production-hardened. Arabic PDF font rendering is a P2 quality gap. Review/approval/report inline forms may still need a clean manual pass after mutation feedback loop verification.

## 2. AI Limitations

- No live cloud AI provider is wired end-to-end.
- No local AI runtime exists.
- Model Governance registry is not implemented.
- Institutional Memory engine is not implemented.
- Evidence-linked AI behavior is partial outside the strongest AuditOS paths.

## 3. Deployment Limitations

- No production On-Prem package exists.
- No Air-Gapped package exists.
- No production Local AI deployment path exists.
- Private/On-Prem and Air-Gapped remain strategic claims only.

## 4. Test/Build Warnings

- ESLint passes with pre-existing warnings and no errors.
- Build succeeds with existing warnings about workspace-root detection, deprecated `middleware` convention, missing Sentry auth token, and dynamic-server usage logs on `/decisions`.

## 5. Prototype/Internal Surfaces

- `/sales` is prototype only.
- `/organizations` and `/organizations/[id]` are protected mock/internal preview routes.
- Generic `/settings` is local-state-only internal preview.
- `/monitoring` is real internal diagnostics, but broader operator visibility policy may still need follow-up tightening.

## 6. Documentation Limitations

- Official v1.1 docs were aligned in this pass, but future code changes must keep official and source-of-truth documents synchronized.
- Some system-specific docs outside the official/source-of-truth/release set may still contain older framing and should be reviewed when touched.

## 7. Security/Ops Limitations

- Sensitive API endpoints covered by the hardening pass are protected, but platform-wide operator-only visibility policy should continue to be reviewed.
- Build-time Sentry warnings indicate release-token/config gaps, not runtime security failure, but they remain an operational limitation.

## 8. Future Roadmap Limitations

- LocalContentOS L6 production hardening, binary PDF/XLSX library export, and full end-to-end governance mutation browser verification remain open (product is L5 with conditions, not unimplemented).
- SalesOS remains prototype-only.
- LocalContactOS, RiskOS, ComplianceOS, LegalOS, GovOS, Studio, Model Governance, and Institutional Memory remain future work and are not release bugs.
