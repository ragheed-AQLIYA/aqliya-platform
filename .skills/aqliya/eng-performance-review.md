---
name: eng-performance-review
description: Performance bottleneck detection — database queries, React rendering, bundle size, caching, memory, CPU
version: 1.0
date: 2026-07-13
status: active
owner: Layer 5 — Performance
inputs: Module/product to profile, performance metrics
outputs: Performance report with bottlenecks and optimization recommendations
dependencies: engineering/agents/performance.mjs
---

# Engineering Performance Review

## Checklist
1. **Database Queries**: N+1 detection, missing indexes, slow queries
2. **React Rendering**: Unnecessary re-renders, large component trees, missing memoization
3. **Bundle Size**: Large dependencies, tree-shaking gaps, dynamic imports
4. **Caching**: Cache hit rate, TTL appropriateness, invalidation patterns
5. **Memory**: Leak patterns, large object retention
6. **API Latency**: Response time bottlenecks, DB round trips

## Output
```md
## Performance Review: <scope>
| Bottleneck | Severity | Impact | Recommendation |
```
