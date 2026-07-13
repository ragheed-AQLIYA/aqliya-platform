---
name: eng-code-review
description: Comprehensive code review — complexity, duplication, patterns, testability, readability, SOLID, server/client boundary violations
version: 1.0
date: 2026-07-13
status: active
owner: Layer 3 — Code Quality
inputs: File path(s) to review
outputs: Review report with severity (critical/high/medium/low) findings and actionable recommendations
dependencies: engineering/agents/code-health.mjs, engineering/agents/architecture-drift.mjs
---

# Engineering Code Review

> **Purpose:** Review a file or module for quality, maintainability, and architectural compliance. Not just lint — deep structural review.

---

## Review Checklist

### 1. Server/Client Boundary (Critical)

```
□ Does this file import "server-only" modules? (prisma, fs, auth/session, secrets)
□ Is this file a Client Component ("use client")?
□ If client: does it import server-only code directly? → CRITICAL
□ If server: is it properly behind a Server Action boundary?
```

**Enforce:** `engineering/os/COMPLIANCE.md` → NO_PRISMA_IN_CLIENT

---

### 2. Complexity (High)

```
□ Lines > 300? → Flag as "large module"
□ Lines > 600? → Flag as "God Object signal"
□ Cyclomatic complexity > 10 per function? → Flag
□ Deeply nested conditionals (>3 levels)? → Flag
□ Number of imports > 20? → Check coupling
```

**Reference:** `engineering/agents/code-health.mjs` complexity thresholds

---

### 3. Duplication (High)

```
□ Any repeated logic blocks (>10 lines similar)?
□ Is this logic available in a shared module (src/lib/core/, src/lib/platform/)?
□ Does another product have an identical implementation?
```

**Anti-pattern:** Copy-paste between products without shared Core usage.

---

### 4. SOLID Compliance (Medium)

```
□ Single Responsibility: Does this module do ONE thing?
□ Open/Closed: Can it be extended without modification?
□ Interface Segregation: Are types minimal and focused?
□ Dependency Inversion: Does it depend on abstractions, not concretions?
```

---

### 5. Testability (Medium)

```
□ Can this module be unit tested without a database?
□ Can this module be unit tested without auth mocking?
□ Are edge cases covered? (null, empty, error, boundary)
□ Is there a corresponding test file? (check src/__tests__/)
```

---

### 6. Readability (Low)

```
□ Naming: Are variables/functions named for intent?
□ Comments: Do comments explain WHY, not WHAT?
□ Magic numbers: Are constants extracted and named?
□ Error messages: Are they actionable? (not "Error occurred")
```

---

### 7. Governance Alignment (Critical)

```
□ Does this code belong to the correct product domain?
□ Does it use shared Core engines or duplicate them?
□ Does it call enforce()/authorize() before mutations?
□ Are audit events logged for state changes?
□ Is organizationId/tenant scoping applied?
```

**Enforce:** AGENTS.md §11 (Governance Requirements), §14 (Server/Client Boundary)

---

## Output Format

```md
## Code Review: <file_path>

### Findings
| # | Severity | Category | Finding | Recommendation |
|---|----------|----------|---------|----------------|
| 1 | critical | boundary | Client imports prisma | Move to Server Action |
| 2 | high | complexity | 850 lines — God Object | Split into focused modules |

### Summary
- Critical: N
- High: N
- Medium: N
- Low: N
- Compliance score: X%

### Recommended Next Steps
1. ...
2. ...
```

---

## Integration

This skill should be loaded:
- Before every PR merge
- During architecture reviews (Layer 2 → Layer 3 handoff)
- When `engineering/agents/code-health.mjs` flags a file
- When technical debt is being triaged
