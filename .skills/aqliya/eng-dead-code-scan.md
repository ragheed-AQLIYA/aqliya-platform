---
name: eng-dead-code-scan
description: Dead code detection — unused exports, unreachable paths, orphaned files, stale feature flags
version: 1.0
date: 2026-07-13
status: active
owner: Layer 3 — Quality
inputs: Module or full repository
outputs: Dead code report with removal recommendations
dependencies: eng-code-review
---

# Engineering Dead Code Scan

## Scan Targets
1. **Unused Exports**: Exported functions/types never imported elsewhere
2. **Unreachable Code**: Code after return/throw, impossible conditionals
3. **Orphaned Files**: Files in src/ not imported by any route or action
4. **Stale Feature Flags**: Flags always true/false, removed features
5. **Legacy Directories**: v02/, vnext/, deprecated modules

## Output
```md
## Dead Code Scan: <scope>
| File/Symbol | Type | Last Used | Recommendation |
```
