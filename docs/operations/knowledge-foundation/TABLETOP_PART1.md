# AQLIYA — Tabletop Part 1 (Preparation Record)

> **Audit type:** Source-verified preparation audit (code + live probes)  
> **Date prepared:** 2026-06-21  
> **Exercise date:** TBD  
> **Status:** IN PROGRESS — human names + scheduling pending

---

## 1. Staging URL

### Canonical (deployment / probe default)

| Source | URL | Lines |
|--------|-----|-------|
| `scripts/platform/staging-probe.mjs` | `https://staging.aqliya.com` | L8–11 (`STAGING_HOST` default `staging.aqliya.com`) |
| `.github/workflows/deploy.yml` | `https://staging.aqliya.com` | L186 (non-`main` branch smoke `BASE_URL`) |
| `.github/workflows/promote.yml` | `https://staging.aqliya.com/api/health` | L28–29 |

**Canonical staging URL (code):** `https://staging.aqliya.com`

### Legacy / conflicting references (do not use without ops confirmation)

| Source | URL | Lines |
|--------|-----|-------|
| `docker-compose.staging.yml` | `https://staging.aqliya.ai` | L15 (`NEXTAUTH_URL`) |
| `runbooks/staging-environment.md` | `https://staging.aqliya.ai` | L137–144, L200, L242 |
| `docs/validation/cycle-6/PENTEST_PREP_PACKET.md` | `https://staging.aqliya.ai` | L7 |

### Local fallback (`.env.example`)

| Source | URL | Lines |
|--------|-----|-------|
| `.env.example` | `http://localhost:3000` | L9 (`NEXTAUTH_URL`), L18 (`NEXT_PUBLIC_APP_URL`) |

### Live probe results (this audit environment)

| Target | Command | Result | Evidence |
|--------|---------|--------|----------|
| Remote staging | `node scripts/platform/staging-probe.mjs` | **DNS FAIL** `staging.aqliya.com` ENOTFOUND | Executed 2026-06-21 |
| Local app | `GET http://localhost:3000/api/health` | **FAIL** — no server listening | Executed 2026-06-21 |
| Local DB | `DATABASE_URL` → `localhost:5432` | **REACHABLE** — users query succeeded | `scripts/platform/tabletop-db-probe.mjs` |

**Selected URL for Tabletop (recommended):** `http://localhost:3000` until `staging.aqliya.com` resolves and deploy is verified.

---

## 2. Participants (TBD — fill before exercise)

| Role | Name | System account | Code role |
|------|------|----------------|-----------|
| **Facilitator** | TBD | — | Observer only |
| **Platform Owner** | TBD | — | Sign-off authority |
| **Governance Lead** | TBD | — | Sign-off authority |
| **Admin participant** | TBD | `admin@aqliya.com` | `ADMIN` (`prisma/schema.prisma` L10–12 enum) |
| **Operator participant** | TBD | `sara@aqliya.com` | `OPERATOR` |
| **Auditor participant** | TBD | `mohammad@aqliya.com` | `VIEWER` (read-only; history requires ADMIN/OPERATOR — `history/page.tsx` L18–19) |
| **Observer(s)** | TBD | — | — |

---

## 3. Test Accounts (source code)

### ADMIN

| Email | Role | Password in source? | Citation |
|-------|------|---------------------|----------|
| `admin@aqliya.com` | `ADMIN` | **Yes** — `admin123` | `prisma/seed.ts` L132–138, L1739 |

Also upserted in `prisma/seed-audit.ts` L71–85 (password `admin123` L68).

### OPERATOR

| Email | Role | Password in source? | Citation |
|-------|------|---------------------|----------|
| `sara@aqliya.com` | `OPERATOR` | **Yes** — `operator123` | `prisma/seed.ts` L142–148, L1740 |

Also upserted in `prisma/seed-audit.ts` L88–102.

### VIEWER

| Email | Role | Password in source? | Citation |
|-------|------|---------------------|----------|
| `mohammad@aqliya.com` | `VIEWER` | **Yes** — `viewer123` | `prisma/seed.ts` L152–158, L1741 |

**Note:** `seed-audit.ts` ensures only `admin@aqliya.com` and `sara@aqliya.com` (L105) — not `mohammad@aqliya.com`.

---

## 4. Are accounts in staging DB or seed-only?

### Staging database

```text
NOT VERIFIABLE — no staging DATABASE_URL in repo; staging DNS unreachable.
```

No repository evidence proves accounts exist on a remote staging RDS. Probes cannot reach `https://staging.aqliya.com`.

### Local database (`DATABASE_URL` → `localhost:5432`)

**PROVEN PRESENT** (executed probe, not documentation):

```json
{
  "databaseUrlHost": "localhost:5432",
  "users": [
    { "email": "admin@aqliya.com", "role": "ADMIN", "hasPasswordHash": true },
    { "email": "sara@aqliya.com", "role": "OPERATOR", "hasPasswordHash": true },
    { "email": "mohammad@aqliya.com", "role": "VIEWER", "hasPasswordHash": true }
  ]
}
```

**Evidence command:** `node scripts/platform/tabletop-db-probe.mjs` (2026-06-21)

**Conclusion:** Accounts are **seed-defined** and **present in the local dev DB** after seed. Whether they exist on **remote staging** depends entirely on whether ops ran `prisma db seed` against that environment — **unproven here**.

---

## 5. Knowledge Foundation seed state

### Code search: no KF version seed

| Search | Result |
|--------|--------|
| `KnowledgeFoundationVersion` in `prisma/seed*.ts` | **0 matches** |
| `knowledgeFoundationVersion` in seeds | **0 matches** |

KF versions are **not** created by seed scripts.

### Mining candidates seed (not Tabletop-ready as-is)

`prisma/seed-knowledge-mining.ts` creates 5 candidates with statuses `CANDIDATE` or **`APPROVED`** — **not `PROMOTED`** (L29, L49, L59, L67).

KF binding requires **`PROMOTED`**:

```83:85:src/lib/knowledge-foundation/candidate-bridge.ts
    where: {
      status: "PROMOTED",
```

Promotion path: `APPROVED → PROMOTED` via `src/lib/tb-intelligence/knowledge-mining/promotion-service.ts` L184–220.

### Local DB KF schema state (live probe)

```text
kfSchemaPresent: false
KnowledgeFoundationVersion table does not exist on localhost:5432
```

Migrations exist (`prisma/migrations/20270622100000_knowledge_foundation_versioning/`) but **not applied** to current local DB.

### Bootstrap actions required (exact order)

| Step | Action | Why (code) |
|------|--------|------------|
| 1 | `npx prisma migrate deploy` | KF tables missing locally (probe P2021) |
| 2 | `npx prisma db seed` | Users + mining candidates (`prisma/seed.ts` L1734) |
| 3 | Promote ≥2 candidates to `PROMOTED` | `/knowledge-review` or promotion service — seed only has APPROVED |
| 4 | Full lifecycle bootstrap `v1.0.0` → **ACTIVE** | No ACTIVE in seed; Tabletop needs rollback target |
| 5 | Confirm `knowledge/releases/` writable | `release-generator.ts` L16, L44–54 |
| 6 | Run `TABLETOP_SMOKE_VALIDATION.md` | Before scheduling participants |

**Expected post-bootstrap state:**

| Entity | Required for Tabletop |
|--------|----------------------|
| ACTIVE version | Yes — e.g. `v1.0.0` |
| RELEASED version | Optional — rollback target may be RELEASED or ACTIVE |
| APPROVED version | Created during exercise Day 2 |
| DRAFT version | Created during exercise Day 1 |
| PROMOTED unbound candidates | ≥2 |

---

## 6. Tabletop document verification

All required files **exist** under `docs/operations/knowledge-foundation/`:

| Document | Path | Verified |
|----------|------|----------|
| RELEASE_APPROVAL_SOP | `RELEASE_APPROVAL_SOP.md` | ✅ L1 |
| ROLLBACK_SOP | `ROLLBACK_SOP.md` | ✅ L1 |
| EVIDENCE_RETENTION_POLICY | `EVIDENCE_RETENTION_POLICY.md` | ✅ L1 |
| TABLETOP_GOVERNANCE_EXERCISE | `TABLETOP_GOVERNANCE_EXERCISE.md` | ✅ L1 |
| TABLETOP_SMOKE_VALIDATION | `TABLETOP_SMOKE_VALIDATION.md` | ✅ L1 |
| TABLETOP_EXECUTION_RECORD | `TABLETOP_EXECUTION_RECORD.md` | ✅ L1 |

### Doc ↔ code mismatch (Tabletop impact)

| Issue | Code | Doc impact |
|-------|------|------------|
| OPERATOR cannot open DRAFT detail/list | `kf-service.ts` L216–220, L245–251 | RELEASE_APPROVAL SOP Step B assumes operator on detail page for DRAFT |
| Post-create redirect to DRAFT detail | `new-version-form.tsx` L97 | OPERATOR may error after create |

**Tabletop workaround:** Day 1 bind on `/knowledge-foundation/new`; ADMIN performs DRAFT review OR wait until APPROVED for operator detail access.

---

## 7. Environment verification (executed)

| Check | Command | Result |
|-------|---------|--------|
| Unit tests | `npm test -- knowledge-foundation phase-28-final-hotfix` | **PASS** 87/87 (16 suites) |
| TypeScript | `npx tsc --noEmit` | **PASS** (exit 0) |
| Production build | `npm run build` | **PASS** (exit 0, ~136s) |
| Staging probe | `node scripts/platform/staging-probe.mjs` | **FAIL** DNS ENOTFOUND |
| Local health | `http://localhost:3000/api/health` | **FAIL** app not running |
| Docker | `docker ps` | **FAIL** daemon not running |
| Local DB users | `node scripts/platform/tabletop-db-probe.mjs` | **PASS** 3 accounts found |

---

## 8. Known blockers

| ID | Blocker | Severity | Evidence |
|----|---------|----------|----------|
| B1 | Remote staging DNS dead | P1 | `staging-probe.mjs` ENOTFOUND |
| B2 | Local KF migrations not applied | P1 | DB probe — table missing |
| B3 | No PROMOTED candidates after seed alone | P1 | `seed-knowledge-mining.ts` L49, L59 vs `candidate-bridge.ts` L84 |
| B4 | No ACTIVE baseline in seed | P1 | No KF seed in repo |
| B5 | OPERATOR DRAFT page access denied | P1 | `kf-service.ts` L216–220 |
| B6 | App not running locally | P2 | health probe failed |
| B7 | Staging account presence unproven | P1 | No staging DB access |

---

## 9. Go / No-Go recommendation

### Tabletop scheduling

```text
GO (conditional) — use LOCAL stack
```

**Conditions before calendar invite:**

1. Start Postgres + apply migrations (`migrate deploy`)
2. Run seed + promote candidates + bootstrap ACTIVE `v1.0.0`
3. Start app (`npm run build && npm run start`)
4. Complete `TABLETOP_SMOKE_VALIDATION.md` with all paths PASS
5. Fill participant names in this document
6. Assign separate ADMIN and OPERATOR sessions (not one user for both)

### Remote staging Tabletop

```text
NO-GO — until staging.aqliya.com resolves and ops confirms migrate + seed + bootstrap
```

### Pilot go-live

```text
NO-GO — Tabletop not yet executed; Operational Readiness not verified
```

---

## 10. Readiness checklist status (Part 1)

| Gate | Status |
|------|--------|
| Documentation package | ✅ Complete in repo |
| Staging URL identified | ✅ Canonical: `https://staging.aqliya.com` (unreachable) |
| Test accounts defined in code | ✅ |
| Accounts in **local** DB | ✅ Proven |
| Accounts in **staging** DB | ❌ Not proven |
| KF bootstrap complete | ❌ Required |
| Smoke validation | ❌ Not run |
| Participant names | ❌ TBD |
| Exercise date | ❌ TBD |

---

## 11. Sign-off (pending)

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Platform Owner | TBD | | |
| Governance Lead | TBD | | |
| Facilitator | TBD | | |

---

## 12. Evidence artifacts

| Artifact | Location |
|----------|----------|
| DB probe script | `scripts/platform/tabletop-db-probe.mjs` |
| Staging probe | `scripts/platform/staging-probe.mjs` |
| Exit gate guide | `docs/deliverables/PHASE_29_TABLETOP_EXIT_GATE.md` |
| This record | `docs/operations/knowledge-foundation/TABLETOP_PART1.md` |

**Next step:** Execute bootstrap §5 → smoke → fill Part 1 names → schedule Tabletop.
