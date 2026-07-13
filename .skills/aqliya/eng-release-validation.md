---
name: eng-release-validation
description: Pre-release gate — validates build, tests, governance rules, security, documentation before release
version: 1.0
date: 2026-07-13
status: active
owner: Layer 1 — Executive + Layer 9 — DevOps
inputs: Release scope, changed files
outputs: Go/No-Go decision with checklist
dependencies: aqliya-release-checklist, eng-governance-compliance, eng-security-audit
---

# Engineering Release Validation

## Gate Checklist
1. **Build**: `npm run build` passes
2. **TypeScript**: `npx tsc --noEmit` 0 errors
3. **Tests**: Critical path tests pass
4. **Governance**: All BLOCK rules pass (GOV-01 through GOV-12)
5. **Security**: No critical/high vulnerabilities
6. **Docs**: Release notes updated, status matrix synced
7. **Route Check**: New routes have boundaries (error/loading/not-found)

## Output
```md
## Release Validation: <version>
| Gate | Status | Details |
## Decision: GO / NO-GO / CONDITIONAL-GO
```
