# AQLIYA Notion + GitHub + OpenCode Sync Structure

## Architecture

```
Notion (Source of Truth for Planning)
│
├── AQLIYA Roadmap Database (Layer-level view)
├── Epics Database (Cross-layer workstreams)
├── Tasks Database (Individual units of work)
├── Decisions Database (Architecture decisions, scope choices)
├── Risks Database (Risk register, live status)
├── Documentation Index (Link to docs/)
│
└── GitHub Issues (Bidirectional sync)
        │
        ▼
    OpenCode (AI execution engine)
        │
        ▼
    Implementation (Code changes)
        │
        ▼
    Status Update (Pull request / commit reference)
        │
        ▼
    Notion Sync (Update status, link to PR/commit)
```

## Database Schemas (Notion-ready)

### 1. Roadmap Database — `01-roadmap-database.csv`

| Property | Type | Description |
| --- | --- | --- |
| Layer | Number (0–10) | Production Program layer |
| Name | Title | Layer name |
| Status | Select (Not Started / Active / Frozen / Deferred) | Current build status |
| Dependencies | Relation → Roadmap DB | Which layers this depends on |
| Build Phase | Select (Foundation / Shared Intelligence / Product / Hardening / Certification / Air-Gapped) | Phase category |
| L0–L6 Level | Number | Current maturity level |
| Description | Text | Scope summary |
| Epic Count | Formula (count of related epics) | Auto-calculated |

**Import:** `01-roadmap-database.csv`

---

### 2. Epics Database — `02-epics.csv`

| Property | Type | Description |
| --- | --- | --- |
| Epic ID | Text (EPIC-X.Y) | Unique identifier |
| Layer | Relation → Roadmap DB | Which layer this epic belongs to |
| Name | Title | Epic name |
| Status | Select (Not Started / In Progress / Done / Deferred) | Current status |
| Priority | Select (Critical / High / Medium / Low) | Priority level |
| Dependencies | Relation → Epics DB | Blocking epics |
| Description | Text | Work summary |
| Task Count | Formula (count of related tasks) | Auto-calculated |
| GitHub Milestone | URL | Link to GitHub milestone |

**Import:** `02-epics.csv`

---

### 3. Tasks Database — `03-tasks.csv`

| Property | Type | Description |
| --- | --- | --- |
| Task ID | Text (T-X.Y.Z) | Unique identifier |
| Epic | Relation → Epics DB | Parent epic |
| Layer | Rollup from Epic | Auto-populated |
| Name | Title | Task name |
| Status | Select (Not Started / In Progress / Done / Blocked) | Current status |
| Priority | Select (Critical / High / Medium / Low) | Priority |
| Effort | Select (XS / S / M / L / XL) | Estimated effort |
| Dependencies | Relation → Tasks DB | Blocking tasks |
| Blocking | Checkbox (Yes/No) | Is this a blocking task? |
| Parallel | Checkbox (Yes/No) | Can this run in parallel? |
| Optional | Checkbox (Yes/No) | Can this be skipped? |
| GitHub Issue | URL | Link to GitHub issue |
| Assigned To | Person | Owner |
| Notes | Text | Implementation notes |

**Import:** `03-tasks.csv`

---

### 4. Decisions Database

| Property | Type | Description |
| --- | --- | --- |
| Decision ID | Text (D-N) | Unique identifier |
| Title | Title | Decision title |
| Context | Text | 1-sentence grounding |
| ELI10 | Text | Plain English explanation |
| Recommendation | Text | Chosen option with reason |
| Options | Text (multi) | A/B options with pros/cons |
| Status | Select (Proposed / Accepted / Rejected / Superseded) | Decision status |
| Date | Date | Decision date |
| Related Layer | Relation → Roadmap DB | Affected layers |
| Related Tasks | Relation → Tasks DB | Affected tasks |

**Import:** Create new database from template.

---

### 5. Risks Database

Based on Phase 11 — Risk Register in the roadmap.

| Property | Type | Description |
| --- | --- | --- |
| Risk ID | Text (R-N) | Unique identifier |
| Title | Title | Risk title |
| Severity | Select (Critical / High / Medium / Low) | Severity level |
| Business Impact | Text | Business consequence |
| Technical Impact | Text | Technical consequence |
| Mitigation Status | Select (Open / In Progress / Mitigated / Closed) | Current status |
| Effort to Mitigate | Select (S / M / L / XL) | Effort estimate |
| Owner | Person | Responsible person |
| Related Epics | Relation → Epics DB | Mitigation epics |
| Notes | Text | Status updates |

**Import:** Create new database from risk register data.

---

## Sync Workflow

### Phase 1 — Initial Setup (this session)

1. Create Notion databases from the CSV files in `docs/execution-backlog/`
2. Create GitHub Issues from OpenCode backlog
3. Link Notion tasks to GitHub issues via URL property

### Phase 2 — OpenCode Execution

When OpenCode starts a task:

1. Move Notion task → "In Progress"
2. Create GitHub issue → assign to epic milestone
3. Implement code changes
4. Create PR referencing issue
5. Update Notion task → "Done" with PR URL

### Phase 3 — Status Sync

```
OpenCode → git commit/PR → GitHub Issue → Notion (via manual sync or webhook)
```

For initial phase, sync is manual: developer/OpenCode updates Notion after each PR.

---

## CSV Import Instructions (Notion)

### Import steps

1. In Notion, click **Settings & Members → Import → CSV**
2. Import each file in order:
   - `01-roadmap-database.csv` → Roadmap DB
   - `02-epics.csv` → Epics DB
   - `03-tasks.csv` → Tasks DB
3. Create relation properties:
   - In Epics DB: add Relation to Roadmap DB (Layer)
   - In Tasks DB: add Relation to Epics DB (Epic)
4. Create rollup properties:
   - In Roadmap DB: rollup Epic Count from Epics DB
   - In Epics DB: rollup Task Count from Tasks DB
5. Create formula properties for auto-calculated fields
6. Create Decisions and Risks databases manually (no CSV)

### Template gallery

For repeatable setup, save each database as a Notion template.
