# Post-Deploy Smoke — Local App (Cycle 6 supplement)

**Date:** 2026-06-06  
**Base URL:** `http://localhost:3000`  
**DATABASE_URL:** `localhost:5435/aqliya_staging`

| Check | Result |
| ----- | ------ |
| `GET /api/health` | **200** — `status: ok` |
| `post-deploy-smoke.mjs` | **PASS** — 6/6 (health, home, login, session, monitoring redirect, notifications 200/404) |

**Command:**

```bash
npm run build && npm run start
node scripts/post-deploy-smoke.mjs --base-url http://localhost:3000
```

**Note:** Authenticated routes skipped (no auth token). Remote staging repeat required when URL resolves.
