# Knowledge Foundation — RELEASED + FAILED Recovery Runbook

> **Version:** 1.0  
> **Date:** 2026-06-21  
> **Status:** Approved (Phase 29 P1)  
> **Closes:** R-06 (RELEASED + `artifactStatus: FAILED`)  
> **Audience:** Platform ops, ADMIN on-call, Governance lead  
> **Related:** [Release Approval SOP](./RELEASE_APPROVAL_SOP.md), [Rollback SOP](./ROLLBACK_SOP.md)

---

## 1. Incident Definition

```text
KnowledgeFoundationVersion.status     = RELEASED
KnowledgeFoundationRelease.artifactStatus = FAILED
```

### How it occurs (system behavior)

Release runs in two phases:

1. **Phase A (DB transaction):** Version → `RELEASED`; release row created with `manifestSha256`, `provenanceSnapshot`, `artifactStatus: PENDING`
2. **Phase B (filesystem):** Writes `knowledge/releases/v{version}/` → on success `artifactStatus: COMPLETE`; on failure → `FAILED`

If Phase B fails (disk full, permission error, container ephemeral FS, etc.), the version is **stuck in RELEASED + FAILED**.

### Impact

| Risk | Severity |
| ---- | -------- |
| Cannot activate | **High** — integrity gate requires `artifactStatus = COMPLETE` |
| Cannot re-run UI release | **High** — `generateReleasePackage()` requires status `APPROVED` |
| Trust chain recorded | **Medium** — DB row may already reference parent release |
| Audit gap | **Low** — `version.released` event may not emit (failure before success audit) |

---

## 2. Detection

### 2.1 Automated / dashboard signals

| Signal | Where |
| ------ | ----- |
| `artifactStatus = FAILED` | Governance report export, version detail integrity card |
| Integrity blockers | "No COMPLETE release row found in database" |
| Release error in UI | Operator saw release failure toast / 500 |

### 2.2 SQL confirmation (platform ops)

```sql
SELECT v.id, v."versionNumber", v.status, r.id AS release_id,
       r."artifactStatus", r."manifestSha256", r."createdAt"
FROM "KnowledgeFoundationVersion" v
JOIN "KnowledgeFoundationRelease" r ON r."versionId" = v.id
WHERE v.status = 'RELEASED'
  AND r."artifactStatus" = 'FAILED'
ORDER BY r."createdAt" DESC;
```

### 2.3 Detection checklist

- [ ] Version status confirmed `RELEASED`
- [ ] Latest release row `artifactStatus = FAILED`
- [ ] No other `COMPLETE` release row for same version
- [ ] Activation attempts blocked (expected)

---

## 3. Immediate Actions (first 15 minutes)

```text
FREEZE activation attempts on this version
NOTIFY ADMIN + platform ops
PRESERVE evidence — do not delete DB row or partial FS directory
OPEN incident ticket with versionNumber + release row id
```

### Operator checklist

- [ ] Post in ops channel: `KF RELEASE FAILED — v{X.Y.Z} — activation frozen`
- [ ] Assign incident owner (platform ops)
- [ ] Capture application error from server logs (CloudWatch / container logs)
- [ ] Check disk space / write permissions on `knowledge/releases/`
- [ ] Do **not** attempt activation
- [ ] Do **not** manually set version back to `APPROVED` without governance approval

---

## 4. Decision Tree

```text
                    RELEASED + FAILED detected
                              │
              ┌───────────────┴───────────────┐
              │                               │
     Can artifacts be restored or            Cannot restore /
     reconstructed to match DB truth?         hash unknown / data corrupt
              │                               │
             YES                              NO
              │                               │
    Path A: FS restore or                     Path C: Abandon forward
    Path B: DB-guided reconstruction          release + rollback or
              │                               new version forward
              ▼                               ▼
    Update artifactStatus → COMPLETE          See §7
    verifyReleaseIntegrity = PASS
              │
              ▼
         Exit: ready for activation
         (Release Approval SOP Step E–F)
```

---

## 5. Path A — Restore Filesystem from Backup

**Use when:** DB row has valid `manifestSha256` + `provenanceSnapshot`; backup likely has matching files.

### Steps

1. Locate latest backup containing `knowledge/releases/v{versionNumber}/`
   - S3 sync / storage backup / ECS volume snapshot
2. Restore directory to `{cwd}/knowledge/releases/v{versionNumber}/`
3. Verify file set present:
   - `manifest.json`
   - `knowledge-foundation.json`
   - `provenance-manifest.json`
   - `candidate-list.json`
   - `change-summary.json`
   - `release-notes.md`
4. Verify hash:

```bash
# Linux/macOS — hash must match DB manifestSha256
sha256sum knowledge/releases/v{versionNumber}/knowledge-foundation.json
```

5. Verify provenance file matches DB JSON (spot-check or `diff`)
6. Proceed to **§6 — Close FAILED state**
7. Run integrity verification in UI
8. Document recovery in incident ticket

### Exit criteria (Path A)

- [ ] All six artifact files present
- [ ] SHA-256 matches DB `manifestSha256`
- [ ] `provenance-manifest.json` equivalent to DB `provenanceSnapshot`
- [ ] `artifactStatus = COMPLETE` (after §6)
- [ ] `verifyReleaseIntegrity` = PASS

---

## 6. Path B — Reconstruct Artifacts from DB Source of Truth

**Use when:** No usable FS backup, but DB release row intact with `manifestSha256` and `provenanceSnapshot`.

**Important:** The UI **cannot** re-trigger release (version is already `RELEASED`). Reconstruction is a **governed ops procedure**.

### 6.1 Preconditions

- [ ] FAILED release row has non-null `manifestSha256`
- [ ] FAILED release row has non-null `provenanceSnapshot`
- [ ] `changeSummary` JSON present on release row
- [ ] Version bindings unchanged since failed release

### 6.2 Reconstruct files

1. Export DB fields (ops read-only query or admin script output):

```sql
SELECT r."manifestSha256", r."provenanceSnapshot", r."changeSummary",
       r."manifestPath", r."releaseNotes", v."versionNumber"
FROM "KnowledgeFoundationRelease" r
JOIN "KnowledgeFoundationVersion" v ON v.id = r."versionId"
WHERE r.id = '<release_id>';
```

2. Write `provenance-manifest.json` from `provenanceSnapshot` (exact JSON)

3. Rebuild `knowledge-foundation.json`:
   - Query bound candidates for version
   - Build payload consistent with release generator rules
   - **Must produce SHA-256 equal to `manifestSha256`**
   - If hash mismatch → stop; candidate data may have changed → go to Path C

4. Write remaining files from `changeSummary` + bindings:
   - `candidate-list.json`
   - `change-summary.json`
   - `release-notes.md`
   - `manifest.json` (include `sha256`, `previousReleaseId`, `previousReleaseHash` from release row)

5. Create directory: `knowledge/releases/v{versionNumber}/`

### 6.3 Close FAILED state (required system step)

**Current system behavior:** `verifyReleaseIntegrity()` queries only rows where `artifactStatus = COMPLETE`. A FAILED row is invisible to the integrity pass until status is updated.

After FS verification matches DB:

1. **Second approver required:** ADMIN + platform ops lead
2. Update release row (governed ops — document in ticket):

```sql
UPDATE "KnowledgeFoundationRelease"
SET "artifactStatus" = 'COMPLETE'
WHERE id = '<release_id>'
  AND "artifactStatus" = 'FAILED'
  AND "manifestSha256" IS NOT NULL;
```

3. Manually log recovery in platform audit (or add note to incident until automated event exists):

```text
Action: kf.release.recovery.completed
Version: v{X.Y.Z}
ReleaseId: <id>
Method: Path A | Path B
Approver: <name>
Integrity: PASS
```

4. Run **Integrity verification** in UI (`/knowledge-foundation/[id]`)
5. Confirm `knowledge.foundation.integrity.verified` in history

> **Known gap (R-06):** No application UI action sets `FAILED → COMPLETE`. This runbook documents the governed manual step until a future ops API is implemented.

---

## 7. Path C — Cannot Reconstruct Identically

**Use when:**

- `manifestSha256` missing on FAILED row
- Reconstructed hash does not match DB (bindings changed)
- Trust chain inconsistent
- Governance decides release is invalid

### Options

| Option | When | Procedure |
| ------ | ---- | --------- |
| **C1 — Rollback** (if ACTIVE exists elsewhere) | Failed release never activated; prior ACTIVE still valid | [Rollback SOP](./ROLLBACK_SOP.md) — only if operational need |
| **C2 — Forward new version** | Failed release abandoned | New DRAFT → bind → approve → release (new version number) |
| **C3 — Deprecate stuck RELEASED** | No ACTIVE impact; orphan release | ADMIN governance decision + document; **do not delete** release row (retention policy) |

**Do not** silently delete the FAILED release row — retention policy requires permanent record.

---

## 8. Post-Recovery Activation

Only after exit criteria met:

1. Follow [Release Approval SOP](./RELEASE_APPROVAL_SOP.md) **Step E** (integrity)
2. Follow **Step F** (activation) — ADMIN only
3. Close incident ticket with:
   - Recovery path used (A/B/C)
   - Hash verification evidence
   - Integrity audit event ID
   - Approver names

---

## 9. Exit Criteria (summary)

```text
artifactStatus = COMPLETE
verifyReleaseIntegrity = PASS
All FS artifacts present and hash-aligned with DB
Incident ticket closed with evidence attachments
```

---

## 10. Prevention

| Control | Action |
| ------- | ------ |
| Persistent storage | Mount `knowledge/releases/` on durable volume / S3 in production |
| Disk monitoring | Alert on volume > 80% |
| Pre-release check | Confirm write permissions in staging before production release |
| Backup sync | Daily S3 sync of `knowledge/releases/` (see retention policy) |
| Staging drill | Simulate release on staging before pilot production release |

---

## 11. Escalation

| Condition | Escalate to | SLA |
| --------- | ----------- | --- |
| FAILED on production during pilot window | Platform ops + Governance lead | 1 hour |
| Hash mismatch after reconstruction | Security + Governance | Immediate — treat as integrity incident |
| No path A/B/C success within 4 hours | Executive sponsor + pilot customer comms | 4 hours |

---

## 12. Document Control

| Version | Date | Change |
| ------- | ---- | ------ |
| 1.0 | 2026-06-21 | Initial Phase 29 P1 — R-06 operational closure |

**Next engineering improvement (deferred):** Ops API or admin action to retry Phase B and set `COMPLETE` without manual SQL.
