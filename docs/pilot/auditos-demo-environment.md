# AuditOS v0.1 — Demo / Walkthrough Environment

**Date:** 2026-05-28  
**Baseline tag:** `auditos-v0.1-pilot-baseline-2026-05-28`  
**Purpose:** Clean environment setup for first external operator walkthrough

---

## Environment Modes

| Mode                             | Use case                                              |
| -------------------------------- | ----------------------------------------------------- |
| **Docker Compose** (recommended) | External walkthrough, reproducible reset              |
| **Bare-metal dev**               | Internal facilitator prep only                        |
| **Public `/auditos/*`**          | Marketing demo only — **not** walkthrough environment |

---

## Seeded Users (rehearsal defaults)

**Change all passwords before external pilot.**

| Role     | Email                 | Default password | Audit user ID |
| -------- | --------------------- | ---------------- | ------------- |
| Admin    | `admin@aqliya.com`    | `admin123`       | `usr-admin`   |
| Operator | `sara@aqliya.com`     | `operator123`    | (see seed)    |
| Viewer   | `mohammad@aqliya.com` | `viewer123`      | (see seed)    |

**Walkthrough role:** Use **admin** or **operator** with audit permissions.

Login URL: `http://<host>:3000/login`

---

## Seeded Engagement

| Field         | Value                              |
| ------------- | ---------------------------------- |
| Engagement ID | `eng-gulf-2025`                    |
| Client        | Gulf Trading Co.                   |
| Fiscal period | FY2025                             |
| Direct URL    | `/audit/engagements/eng-gulf-2025` |

After login, navigate directly or via `/audit` dashboard.

---

## Docker Startup Sequence

```bash
# 1. From repo root at tag auditos-v0.1-pilot-baseline-2026-05-28
git checkout auditos-v0.1-pilot-baseline-2026-05-28

# 2. Verify secrets in docker-compose.yml (not placeholders)

# 3. Start database
docker compose up -d db

# 4. Seed via compose network (critical — not host localhost:5432)
docker run --rm --network aqliya_default \
  -v "$(pwd):/app" -w /app \
  -e DATABASE_URL=postgresql://postgres:postgres@db:5432/aqliya \
  node:20-alpine sh -c "npm ci --ignore-scripts && npx prisma db push && npx prisma generate && npx tsx prisma/seed.ts && npx tsx prisma/seed-audit.ts"

# 5. Build and start app
docker compose up -d --build app

# 6. Health check
curl -s http://127.0.0.1:3000/api/health
```

Expected: `"status":"ok"`, database connected, storage writable.

Optional: `npm run audit:health` from host with correct `DATABASE_URL`.

---

## Reset Process

### Soft reset (same DB, restart app)

```bash
docker compose restart app
# Operators: hard refresh all browser tabs
```

### Full walkthrough reset (clean seed)

```bash
docker compose down
docker volume rm aqliya_pgdata aqliya_uploads 2>/dev/null || true
# Re-run startup sequence steps 3–6
```

**Warning:** Destroys local DB and uploads. Use only in rehearsal/pilot sandbox.

### Re-seed without volume wipe

```bash
docker run --rm --network aqliya_default \
  -v "$(pwd):/app" -w /app \
  -e DATABASE_URL=postgresql://postgres:postgres@db:5432/aqliya \
  node:20-alpine sh -c "npx tsx prisma/seed.ts && npx tsx prisma/seed-audit.ts"
```

---

## Hard-Refresh Note

After **any** app image rebuild or redeploy:

| Platform        | Action             |
| --------------- | ------------------ |
| Windows / Linux | `Ctrl + Shift + R` |
| macOS           | `Cmd + Shift + R`  |

**Symptoms if skipped:** Infinite spinner, `Failed to find Server Action` in console, login redirect hang.

Login page includes operator reminder text. Facilitator should announce before walkthrough starts.

---

## Browser Recommendation

| Browser                  | Recommendation                     |
| ------------------------ | ---------------------------------- |
| Chrome / Edge (Chromium) | ✅ Preferred                       |
| Firefox                  | ✅ Acceptable                      |
| Safari                   | ⚠️ Test RTL layout first           |
| Mobile                   | ❌ Not recommended for walkthrough |

Use one browser profile; avoid stale tabs from previous deploy.

---

## Pre-Walkthrough Rehearsal Checklist

### Infrastructure (T-60 min)

- [ ] Checked out baseline tag `auditos-v0.1-pilot-baseline-2026-05-28`
- [ ] Docker stack up (`db` + `app`)
- [ ] `/api/health` → ok
- [ ] Seed data present (`eng-gulf-2025` loads)
- [ ] Uploads volume writable
- [ ] Credentials rotated if external org

### Browser (T-15 min)

- [ ] Hard refresh performed
- [ ] Login succeeds → redirect to workspace
- [ ] `/audit/engagements/eng-gulf-2025/statements` loads (no error boundary)
- [ ] One test export succeeds with success message

### Facilitator (T-0)

- [ ] Walkthrough script printed or on second screen
- [ ] Friction log template ready
- [ ] FAQ available for objections
- [ ] Observer roles assigned (facilitator vs operator)
- [ ] Agreement: no feature expansion during session

---

## During Walkthrough

- Monitor `/api/health` if session exceeds 90 minutes
- Log P2 friction without stopping unless P0/P1 blocker
- Do not redeploy mid-session

---

## Post-Walkthrough

- [ ] Capture friction log
- [ ] Confirm health still ok
- [ ] Archive operator feedback
- [ ] File issues for P1 only; defer P2 to post-pilot week

---

## References

- Deployment guide: `docs/deployment/auditos-v0.1-deployment-guide.md`
- Internal rehearsal: `docs/deployment/auditos-v0.1-internal-rehearsal.md`
- Walkthrough flow: `docs/pilot/auditos-first-operator-walkthrough.md`
- Live script: `docs/pilot/auditos-live-walkthrough-script.md`
