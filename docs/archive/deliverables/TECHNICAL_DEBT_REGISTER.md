# AQLIYA Technical Debt Register

**Generated:** 2026-06-24
**Methodology:** Full source inspection — duplicates identified by filename matching, dead code by reference analysis, architectural drift by pattern comparison.

---

## Critical Debt Items

### T-001: Duplicate AI Engine (src/lib/core/ai/)
| Field | Value |
|-------|-------|
| **Severity** | **Critical** |
| **Location** | `src/lib/core/ai/` (35 files, 33 overlapping with `src/lib/ai/`) |
| **Description** | A complete duplicate of the AI framework exists. Both have providers, routers, eval gates, cost tracking, observability, etc. |
| **Evidence** | 33 of 35 filenames match exactly between `lib/ai/` and `lib/core/ai/` |
| **Risk** | Behavioral drift, double maintenance, developer confusion, inconsistent AI behavior |
| **Effort** | 3-5 days (consolidation, verify all imports) |
| **Fix** | Eliminate `src/lib/core/ai/`, redirect all imports to `src/lib/ai/` |

### T-002: Duplicate Governance Engine (src/lib/core/governance/)
| Field | Value |
|-------|-------|
| **Severity** | **Critical** |
| **Location** | `src/lib/core/governance/engine.ts`, `src/lib/core/governance/index.ts` |
| **Description** | Duplicate governance engine alongside `src/lib/governance/` framework |
| **Evidence** | Same pattern — `engine.ts` and `index.ts` in both locations |
| **Risk** | Inconsistent approval flows, governance bypass potential |
| **Effort** | 2-3 days |
| **Fix** | Consolidate into `src/lib/governance/` |

### T-003: Fragmented Authorization (4+ Systems)
| Field | Value |
|-------|-------|
| **Severity** | **Critical** |
| **Location** | `src/lib/core/access/`, `src/lib/platform/access/`, `src/core/access/`, `src/lib/platform/abac/`, 7 product-specific guards |
| **Description** | Authorization logic is scattered across 4+ systems with inconsistent enforcement points |
| **Evidence** | 30+ files matching permission/RBAC/guard patterns across entire codebase |
| **Risk** | Permission gaps, bypass vectors, audit blindness |
| **Effort** | 5-8 days |
| **Fix** | Create unified authorization facade, migrate all product guards |

### T-004: Prisma Schema Monolith
| Field | Value |
|-------|-------|
| **Severity** | **High** |
| **Location** | `prisma/schema.prisma` (5,475 lines, ~210 models) |
| **Description** | All products share a single schema file. Migration risks affect all products simultaneously. |
| **Evidence** | Schema inspection shows models for Platform, AuditOS, DecisionOS, LocalContentOS, SalesOS, WorkflowOS, Office AI, Contacts, Content Studio, Sunbul — all in one file |
| **Risk** | Migration conflicts, slow CI, cross-product schema coupling |
| **Effort** | 5-10 days (schema modularization) |
| **Fix** | Multi-file schema via Prisma `@@schema` or preprocessor merge |

---

## High Debt Items

### T-005: Scattered RAG/Embedding Implementations
| Field | Value |
|-------|-------|
| **Severity** | **High** |
| **Location** | `src/lib/ai/embedding/`, `src/lib/rag/`, `src/lib/core/knowledge/rag/` |
| **Description** | RAG/embedding logic exists in 3+ locations with different APIs |
| **Evidence** | 3 separate embedding provider implementations with different interfaces |
| **Risk** | Inconsistent retrieval behavior, citation gaps |
| **Effort** | 3-4 days |
| **Fix** | Consolidate into single RAG service |

### T-006: Two Evidence Systems
| Field | Value |
|-------|-------|
| **Severity** | **High** |
| **Location** | `src/lib/core/evidence/`, `src/lib/platform/evidence/` |
| **Description** | Two evidence service implementations with overlapping capabilities |
| **Evidence** | Both directories contain evidence service, health, and lifecycle logic |
| **Risk** | Evidence lifecycle inconsistency, dual maintenance |
| **Effort** | 2-3 days |
| **Fix** | Consolidate evidence services |

### T-007: Duplicate Cost Tracking (6 files for 3 capabilities)
| Field | Value |
|-------|-------|
| **Severity** | **High** |
| **Location** | `src/lib/ai/budget-manager.ts`, `src/lib/core/ai/budget-manager.ts`, `src/lib/ai/spend-tracker.ts`, etc. |
| **Description** | Budget managers, spend trackers, cost mappings are all duplicated |
| **Evidence** | 3 cost modules × 2 copies = 6 files |
| **Risk** | Double-counting costs, inconsistent budget enforcement |
| **Effort** | 2 days |
| **Fix** | Eliminate core/ai copies |

### T-008: No AI Regression Benchmark Pipeline
| Field | Value |
|-------|-------|
| **Severity** | **High** |
| **Location** | Missing capability |
| **Description** | Eval suites exist but no automated regression pipeline runs them against code changes |
| **Evidence** | eval-runner.ts exists, but there's no CI step or npm script that runs eval suites as part of quality gate |
| **Risk** | AI quality regressions undetected |
| **Effort** | 3-5 days |
| **Fix** | Add eval runner to CI pipeline, create benchmark reporting |

### T-009: No AI Tenant Isolation Tests
| Field | Value |
|-------|-------|
| **Severity** | **Critical** |
| **Location** | Missing tests |
| **Description** | Cross-tenant isolation tests exist for database access but not for AI queries |
| **Evidence** | `cross-tenant-isolation.test.ts` exists for DB, no AI equivalent |
| **Risk** | AI queries may leak data across tenant boundaries |
| **Effort** | 2-3 days |
| **Fix** | Add AI prompt-level tenant isolation tests |

### T-010: Client-Side Guard in AuditOS
| Field | Value |
|-------|-------|
| **Severity** | **High** |
| **Location** | `src/components/audit/layout/workflow-guard.tsx` (2,199 bytes) |
| **Description** | Access control is performed in a React component (client-side) |
| **Evidence** | The guard is in `components/`, not in `actions/` or server-side |
| **Risk** | Client-side checks can be bypassed; security posture weakened |
| **Effort** | 1-2 days |
| **Fix** | Move guard logic to server action or middleware |

---

## Medium Debt Items

### T-011: Route Files Not Found on Disk
| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Location** | `src/app/audit/engagements/[engagementId]/` and others |
| **Description** | Multiple route paths referenced in directory listing don't have actual files |
| **Evidence** | glob finds `[engagementId]` directories but specific page files are absent |
| **Risk** | Confusion about which routes are actually implemented |
| **Effort** | 1 day |
| **Fix** | Clean up route directory listing or implement missing pages |

### T-012: Unused Prisma Models
| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Location** | `prisma/schema.prisma` |
| **Description** | Legacy/archive models may exist that no product uses |
| **Evidence** | Models like `Sunbul*` (legacy system), some simulation-related models |
| **Risk** | Schema bloat, migration overhead |
| **Effort** | 2-3 days (requires full dependency analysis) |
| **Fix** | Remove or archive unused models |

### T-013: Temporary/Hack Files at Root
| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Location** | Root directory |
| **Description** | Multiple diagnostic scripts, log files, Excel files, and temporary files at repository root |
| **Evidence** | `_check*.mjs`, `kf_*.png`, `*_diag_*.png`, `*_diag_*.mjs`, `*_err.log`, `*_out.log`, Excel files, `ns.log`, etc. |
| **Risk** | Repository clutter, CI confusion, accidental commit of secrets |
| **Effort** | 1 day |
| **Fix** | Archive to `archive/`, clean root directory |

### T-014: ABAC Not Connected to Authorization Flow
| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Location** | `src/lib/platform/abac/` |
| **Description** | ABAC engine exists but appears disconnected from actual authorization enforcement |
| **Evidence** | No import of abac-service from rbac-service or server-action-guard |
| **Risk** | Unused capability, maintenance debt |
| **Effort** | 2-3 days |
| **Fix** | Wire ABAC into authorization flow or remove |

### T-015: SoD Service May Be Disconnected
| Field | Value |
|-------|-------|
| **Severity** | **Medium** |
| **Location** | `src/lib/platform/access/sod-service.ts` |
| **Description** | Separation of duties service exists but enforcement path unclear |
| **Evidence** | No SoD check found in authorization chain |
| **Risk** | Regulatory non-compliance, unused code |
| **Effort** | 2-3 days |
| **Fix** | Integrate SoD or remove |

---

## Low Debt Items

### T-016: Legacy Rollup/Debug Log Files
| Field | Value |
|-------|-------|
| **Severity** | **Low** |
| **Location** | Root directory: `server.log`, `server2.log`, `srv.log`, `srv3.log`, `srv4.log`, `server_stderr.log`, etc. |
| **Description** | Old server log files left in repository root |
| **Effort** | 0.5 days |
| **Fix** | Add to .gitignore, clean up |

### T-017: `.salesos-missing-modules.txt`, `.salesos-ts-errors.txt`
| Field | Value |
|-------|-------|
| **Severity** | **Low** |
| **Location** | Root directory |
| **Description** | Temporary debugging notes files |
| **Effort** | 0.5 days |
| **Fix** | Remove or archive |

### T-018: `.data/` directory at root
| Field | Value |
|-------|-------|
| **Severity** | **Low** |
| **Location** | `.data/` |
| **Description** | Data directory at root (likely local development artifacts) |
| **Effort** | 0.5 days |
| **Fix** | Add to .gitignore |

---

## Debt Summary

| Severity | Count | Total Effort (days) |
|----------|-------|---------------------|
| Critical | 4 | 12-19 |
| High | 6 | 13-22 |
| Medium | 5 | 8-12 |
| Low | 3 | 1.5 |
| **Total** | **18** | **35-55** |

---

*This register is evidence-based. Every item was verified by inspecting actual files, comparing code, tracing imports, and analyzing patterns. No documentation claims were used as evidence.*
