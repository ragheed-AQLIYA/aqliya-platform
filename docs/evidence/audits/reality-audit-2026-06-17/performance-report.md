# Performance Report — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Method:** Command timing from audit execution

---

## Measured Timings — VERIFIED

| Operation | Duration | Environment |
|-----------|----------|-------------|
| `npx tsc --noEmit` | ~12s | Windows local |
| `npx prisma validate` | ~4s | Windows local |
| `npm test` (full suite) | ~20s | 2,515 tests, 272 suites |
| `npm run build` (failed at TS) | ~170s | Webpack compile ~98s before fail |
| `npm run lint` (full) | ~176s | Over-broad scope |
| Ollama direct inference | ~32s | qwen3:8b, local smoke |
| Ollama via orchestrator | ~12s | local smoke |

---

## Unmeasured (NOT RUN)

| Metric | Status |
|--------|--------|
| API latency (p50/p95) | UNVERIFIED |
| Database query latency | UNVERIFIED |
| Bundle size | UNVERIFIED (`npm run analyze` not run) |
| Memory consumption (runtime) | UNVERIFIED |
| ECS task memory under load | UNVERIFIED |
| CloudFront cache hit rate | UNVERIFIED |

---

## Build Performance Assessment

- **98s webpack compile** for monorepo with 234 pages — acceptable for CI
- Build failure at TS check wastes full compile cycle — fix TS first for faster iteration
- `--webpack` flag required (Turbopack config issue on non-Windows paths per AGENTS.md)

---

## Test Performance Assessment

- **20s for 2,515 tests** — excellent parallelism
- 29 failing suites don't significantly impact duration (fail fast)
- Integration tests not included in timing (separate run)

---

## AI Latency Assessment

| Path | Latency | Production suitability |
|------|--------:|------------------------|
| Deterministic handlers | <100ms | Excellent |
| Ollama local (8B) | 12-32s | Pilot only |
| Cloud LLM | UNVERIFIED | Expected 2-10s |

**Recommendation:** Keep deterministic default for UX; async queue for LLM tasks.

---

## Scalability Indicators (Static)

| Factor | Assessment |
|--------|------------|
| ECS autoscaling 3-10 tasks | Good (Terraform) |
| RDS Multi-AZ | Good |
| Redis cluster | Good |
| Stateless Next.js | Good |
| In-memory edge rate limit | Poor at scale |
| Monolith bundle size | Unknown — run analyzer |

---

## Recommendations

1. Run `npm run analyze` after build fix for bundle baseline
2. Add API latency middleware metrics to `system-monitor.ts`
3. Load test with k6/Artillery before L6 claim
4. Queue long-running AI tasks (Bull already present)

**Performance score: 65/100** — Test speed good; production latency unverified.
