---
name: eng-refactor-plan
description: Refactoring strategy — identify God Objects, duplicate logic, misplaced concerns, propose split plan
version: 1.0
date: 2026-07-13
status: active
owner: Layer 3 — Quality
inputs: File/module with quality issues
outputs: Refactoring plan with split strategy, estimated effort, risk assessment
dependencies: eng-code-review
---

# Engineering Refactoring Plan

## Analysis
1. **God Objects**: Files > 800 lines — split by domain concern
2. **Duplication**: > 10 similar lines across modules — extract to shared
3. **Misplaced Logic**: Server logic in client, product logic in Core
4. **Split Strategy**: Proposed module structure post-refactor
5. **Risk**: What could break, rollback plan

## Output
```md
## Refactoring Plan: <module>
| Issue | Current State | Proposed | Files Affected | Risk |
```
