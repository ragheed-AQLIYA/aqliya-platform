---
name: eng-coverage-analysis
description: Test coverage gap identification — branches, functions, lines, statements below threshold per module
version: 1.0
date: 2026-07-13
status: active
owner: Layer 6 — Testing
inputs: Coverage report (jest --coverage)
outputs: Coverage gap report with prioritized files to test
dependencies: eng-test-strategy
---

# Engineering Coverage Analysis

## Analysis
1. **Below Threshold**: Files below branch/function/line/statement thresholds
2. **Zero Coverage**: Files with 0% coverage
3. **Critical Paths**: High-impact files with low coverage
4. **Trend**: Coverage trend over last N cycles
5. **Module Breakdown**: Coverage per product/lib module

## Output
```md
## Coverage Analysis
| Module | Branch% | Func% | Line% | Priority |
## Top 10 Files to Test
```
