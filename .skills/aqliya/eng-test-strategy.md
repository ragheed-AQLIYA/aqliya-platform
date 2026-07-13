---
name: eng-test-strategy
description: Test coverage gap analysis — missing unit/integration/E2E tests, edge cases, critical path coverage
version: 1.0
date: 2026-07-13
status: active
owner: Layer 6 — Testing
inputs: Module/product, test coverage data
outputs: Test gap report with prioritized test plan
dependencies: engineering/agents/test-intelligence.mjs
---

# Engineering Test Strategy

## Checklist
1. **Coverage Analysis**: Branches, functions, lines below threshold
2. **Critical Paths**: Untested mutation paths, auth flows, export routes
3. **Edge Cases**: Null, empty, boundary, error states
4. **Integration**: Cross-module interactions without tests
5. **Governance**: Actions without enforce() tests, download routes without tenant tests

## Output
```md
## Test Strategy: <scope>
| Gap | Priority | Coverage Missing | Recommended Test |
```
