# Manifest Index

> **Created:** 2026-06-29 (Sprint v2 — P5: Manifest Generation)

---

## Wave 1 Manifests

| PROD-ID | Product | Manifest | Hash | Claims | EV | Generated |
|---------|---------|----------|------|--------|----|-----------|
| PROD-AUDITOS | AuditOS | MANIFEST-AuditOS.md | See Phase B | 4 | 15 | 2026-06-29 |
| PROD-DECISIONOS | DecisionOS | MANIFEST-DecisionOS.md | 4a8e2f1c | 5 | 11 | 2026-06-29 |
| PROD-LOCALCONTENT | LocalContentOS | MANIFEST-LocalContentOS.md | 7b9f3a2e | 5 | 13 | 2026-06-29 |

**Total: 3 Manifests | 14 Claims | 39 EV references (37 unique)**

---

## Generation Log

| Run | Date | Generator | Claims Input | EV Input | Result |
|-----|------|-----------|-------------|----------|--------|
| 1 | 2026-06-29 | Manual (template-based) | CLAIM_REGISTRY.md §Sea | evidence-coverage-matrix.md | ✅ Generated |

---

## Manifest Dependency Chain

```
CLAIM_REGISTRY.md
        ↓
evidence-coverage-matrix.md
        ↓
MANIFEST-*.md  (derived)
        ↓
DOSSIER-*.md   (derived after P6)
```
