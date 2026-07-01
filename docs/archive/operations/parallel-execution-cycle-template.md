# Parallel Execution Cycle — Template

**Program:** AQLIYA Parallel Execution Director  
**Cycle ID:** `YYYY-MM-DD-cycle-N`  
**Branch:** `main` (Director mode)  
**Director:** (agent / human)  
**Date:**

Copy this file or fill sections in the Director final report.

---

## Pre-flight

| Check | Result |
| ----- | ------ |
| `git status --short` | |
| `git log --oneline -5` | |
| Authority docs read (PRODUCT_STATUS_MATRIX → …) | |
| Backlog tasks selected | |

---

## Agent Assignments

### Agent-IC (Intelligence Core)

- **Task ID(s):**
- **Description:**
- **Files (planned):**
- **Files (actual):**
- **Status:** pending | in_progress | done | blocked

### Agent-Platform

- **Task ID(s):**
- **Description:**
- **Files (planned):**
- **Files (actual):**
- **Status:**

### Agent-AuditOS

- **Task ID(s):**
- **Description:**
- **Files (planned):**
- **Files (actual):**
- **Status:**

### Agent-QA

- **Task ID(s):**
- **Description:**
- **Files (planned):**
- **Files (actual):**
- **Status:**

---

## Dependency Check

| Gate | Required for | Status |
| ---- | ------------ | ------ |
| G0 | L0-07, foundation work | passed / blocked |
| G1 | IC-02, IC-09, IC-01 | passed / blocked |
| (other) | | |

**Overall:** passed | blocked

**Blockers:**

---

## Merge Sequence (main)

| Step | Agent | Commit | `npx tsc --noEmit` |
| ---- | ----- | ------ | ------------------ |
| 1 | Agent-IC | | |
| 2 | Agent-Platform | | |
| 3 | Agent-AuditOS | | |
| 4 | Agent-QA | | |

---

## Files Modified

```
(list every path touched this cycle)
```

---

## Risks

| Risk | Severity | Mitigation |
| ---- | -------- | ---------- |
| | | |

---

## Validation Status

| Command | Result | Notes |
| ------- | ------ | ----- |
| `npx tsc --noEmit` | Pass / Fail / Not run | |
| `npm run lint -- --quiet` | Pass / Fail / Not run | |
| `npm test` | Pass / Fail / Not run | |
| `npm run build` | Pass / Fail / Not run | |
| `npm run ai:eval:ci` | Pass / Fail / Not run | |

**Commit hash (if committed):**

---

## Cycle Status

**DONE** | **DONE_WITH_CONCERNS** | **BLOCKED** | **NEEDS_CONTEXT**

**Concerns / next cycle:**
