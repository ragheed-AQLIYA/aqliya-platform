# Architectural Budgets

**Generated:** 2026-07-18T21:44:04.729Z  
**Overall:** **PASS**  
**PASS:** 11 · **WARN:** 0 · **FAIL:** 0 · **SKIP:** 0

> CI Gate mode — FAIL triggers non-zero exit.

| Budget | Policy | Current | Max | Baseline | Status | Reason |
| ------ | ------ | ------: | --: | -------: | ------ | ------ |
| God Objects | no_regression | 6 | 6 | 6 | **PASS** | 6 → 6 (no regression) |
| Long Functions | decrease_only | 41 | 41 | 41 | **PASS** | 41 → 41 (decreased or held) |
| Circular Dependencies | no_regression | 4 | 4 | 4 | **PASS** | 4 → 4 (no regression) |
| SRP Violations | decrease_only | 10 | 10 | 10 | **PASS** | 10 → 10 (decreased or held) |
| Layer Violations | no_regression | 4 | 4 | 4 | **PASS** | 4 → 4 (no regression) |
| Domain Boundary Violations | no_regression | 1 | 5 | 1 | **PASS** | 1 → 1 (no regression) |
| High-Severity Security Findings | no_regression | 2 | 2 | 2 | **PASS** | 2 → 2 (no regression) |
| Critical Security Findings | fixed | 0 | 0 | 0 | **PASS** | At target: 0 = 0 |
| N+1 Query Patterns (High) | no_regression | 8 | 10 | 8 | **PASS** | 8 → 8 (no regression) |
| Unbounded Queries | no_regression | 30 | 30 | 30 | **PASS** | 30 → 30 (no regression) |
| High-Severity Debt Items | decrease_only | 40 | 40 | 40 | **PASS** | 40 → 40 (decreased or held) |

## Policies

| Policy | Behavior |
| ------ | -------- |
| `fixed` | Metric must equal exactly `max` |
| `decrease_only` | Metric must not increase from current value |
| `no_regression` | Metric must not exceed baseline from main branch |

---

_AQLIYA Engineering Excellence · architectural-budgets_
