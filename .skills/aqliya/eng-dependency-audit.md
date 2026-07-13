---
name: eng-dependency-audit
description: Dependency health audit — CVE scanning, license compliance, version currency, unused dependencies, supply chain
version: 1.0
date: 2026-07-13
status: active
owner: Layer 4 — Security + Layer 9 — DevOps
inputs: package.json, package-lock.json
outputs: Dependency health report with vulnerability and update recommendations
dependencies: engineering/agents/dependency.mjs
---

# Engineering Dependency Audit

## Checklist
1. **CVEs**: npm audit — critical/high vulnerabilities
2. **Licenses**: License compatibility check
3. **Version Currency**: Outdated packages, major version gaps
4. **Unused Dependencies**: depcheck or equivalent
5. **Supply Chain**: Package provenance, maintainer activity
6. **Bundle Impact**: Large dependencies in client bundles

## Output
```md
## Dependency Audit
| Package | Current | Latest | CVE | Action |
```
