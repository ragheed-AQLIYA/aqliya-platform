# Remote Staging Probe — Cycle 6

**Date:** 2026-06-06  
**Target:** `https://staging.aqliya.ai/api/health`

| Check | Result |
| ----- | ------ |
| DNS resolve | **FAIL** — `curl: (6) Could not resolve host: staging.aqliya.ai` |
| HTTP health | **Not reached** |

**Implication:** Cycle 6 **program CLOSED** cannot be claimed from this environment until DNS/host is provisioned or operator runs checklist from a network that resolves staging.

**Local substitute:** `npm run cycle6:full-run` + app smoke `http://localhost:3000` (see `POST_DEPLOY_SMOKE.md` if present).
