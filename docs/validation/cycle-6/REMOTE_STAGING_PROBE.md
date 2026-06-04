# Remote Staging Probe — Cycle 6

**Date:** 2026-06-07 (re-probe)  
**Target:** `https://staging.aqliya.ai/api/health`  
**Baseline:** `e791cc1`

| Check | Result |
| ----- | ------ |
| DNS resolve | **FAIL** — `curl: (6) Could not resolve host: staging.aqliya.ai` |
| HTTP health | **Not reached** |
| Prior probe | 2026-06-06 — same result |

**Implication:** Cycle 6 **program CLOSED** cannot be claimed from this environment until DNS/host is provisioned or operator runs `cycle-6-remote-operator-packet.md` from a network that resolves staging.

**Local substitute:** `npm run cycle6:full-run` @ `3aba98a`+ (see `LIVE_SMOKE_REPORT.md`, `POST_DEPLOY_SMOKE.md`).
