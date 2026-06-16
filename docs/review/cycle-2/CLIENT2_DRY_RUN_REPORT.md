# Client #2 — Dry Run Report (Simulation)

**Audit date:** 2026-06-15  
**Mode:** Read-only walkthrough — no code execution, no DB mutations  
**Reference path:** `CLIENT2_EXECUTION_MAP.md`

---

## Simulated Flow

```text
Create Engagement → Upload TB → Classification → Human Review → Confirm
    → FS Generation → (Year 2) Re-classify → Firm Memory Reuse → KPI Collection
```

---

## Step-by-Step Dry Run

### 1. Create Engagement

| Item | Finding |
| ---- | ------- |
| **Path** | `/audit` UI → `EngagementForm` → `createEngagementAction` |
| **Defaults** | `presentationProfile: generic`, policy from resolver (`db/index.ts:2716`) |
| **Inputs** | `organizationId`, client name, fiscal period, team IDs |
| **Manual** | Select team members; ensure org matches Shalfa memory baseline |
| **Gap** | No Client #2-specific setup script (intentional per Cycle 2) |

### 2. Upload TB

| Item | Finding |
| ---- | ------- |
| **Path** | `uploadTrialBalanceAction` → `classifyTrialBalanceRows` |
| **Input** | XLSX file (`TB_FILE` env in scripts; UI upload in app) |
| **Output** | TB lines + suggested mappings |
| **Manual** | **Start timer** — Upload TB row in spreadsheet |
| **Gap** | No upload duration in system logs |

### 3. Classification

| Item | Finding |
| ---- | ------- |
| **Engine** | Rules → hybrid → firm memory lookup (`engine.ts`) |
| **History** | `logClassificationHistory` writes `source` field (`firm-memory.ts:107`) |
| **Reuse metric** | Depends on `source === "firm_memory"` in history |
| **Manual** | None during classify (automated) |
| **Gap** | Operator cannot see aggregate reuse until script run |

### 4. Human Review

| Item | Finding |
| ---- | ------- |
| **Path** | Mapping UI — review suggestions |
| **Manual** | **Primary time sink** — log Mapping Review minutes + reviewer level |
| **Exception log** | Count auto-accept vs manual correction vs new |
| **Gap** | No UI counter for corrections; spreadsheet only |
| **Bottleneck** | Reviewer may re-check all lines despite memory hit |

### 5. Confirm Mappings

| Item | Finding |
| ---- | ------- |
| **Path** | `confirmMappingAction` / bulk confirm |
| **Side effect** | `recordFirmMemoryFeedback` → pattern upsert, reviewer merge |
| **RBAC** | `admin`, `operator` only |
| **Manual** | Per-mapping or bulk; log exception counts |
| **Gap** | Bulk confirm may use single reviewer — weak TRUSTED path |

### 6. FS Generation

| Item | Finding |
| ---- | ------- |
| **Trigger** | Auto on confirm (`financial_statements.generated` event) or manual v2 rebuild |
| **Manual** | **Timer** — FS validation row |
| **Gap** | FS rebuild not transactional (R-003) — retry if partial fail |

### 7. Firm Memory Reuse (Year 2)

| Item | Finding |
| ---- | ------- |
| **Trigger** | Second TB upload or re-classify same engagement/new engagement same org |
| **Expected** | Higher `firm_memory` source rate in history |
| **Validate** | `npm run tb:memory-reuse-rate -- --engagement <id>` |
| **Manual** | Year 2 mapping review — compare time to Year 1 |

### 8. KPI Collection

| Script | Output |
| ------ | ------ |
| `phase-3c:validate` | Memory-only accuracy JSON |
| `tb:memory-reuse-rate` | `docs/audits/evidence/tb-memory-reuse-rate.json` |
| `phase-3d:validate-governance` | TRUSTED counts JSON |
| Spreadsheet | Hours Saved %, Manual Corrections % |

---

## Missing Operator Steps (Must Add)

| # | Step | Type |
| --- | ---- | ---- |
| 1 | Create spreadsheet **before** any work | Process |
| 2 | Write 1-page **Workflow Scope Definition** | Process |
| 3 | **Freeze scope** between Year 1 and Year 2 | Process |
| 4 | Assign **Reviewer B** distinct from Reviewer A | Process |
| 5 | Record **Year 1 total minutes** before starting Year 2 | Process |
| 6 | Run KPI scripts with correct `ENGAGEMENT_ID` | Operator |
| 7 | Draft `Client_2_Economics_Report_v1.md` | Deliverable |

---

## Missing Documentation

| Doc | Status |
| --- | ------ |
| Client #2 candidate requirements | ✅ This audit pack |
| Time study procedure | ✅ Checklist `6d712b5` |
| Spreadsheet template file | ❌ Not in repo (copy from markdown) |
| Workflow Scope Definition template | ❌ Operator creates |
| Economics report template | ❌ Pending first run (`Client_2_Economics_Report_v1.md`) |
| Shalfa Year 1 **time** baseline | ❌ **Does not exist** |

---

## Manual Bottlenecks

1. **Mapping review** — dominant economic lever; no automation of time capture  
2. **Exception counting** — manual tallies during review  
3. **Two-reviewer TRUSTED path** — requires coordination, not product workflow  
4. **KPI script runs** — CLI, not UI dashboard  
5. **Report authoring** — fully manual synthesis  

---

## Data Collection Gaps

| Gap | Severity | Mitigation |
| --- | -------- | ---------- |
| No Year 1 time baseline (Shalfa) | **Critical** | Start Y1 log on first Client #2 pass |
| No automated correction export | High | Exception log discipline |
| Reuse % ≠ hours saved | High | Tier 1 gate on hours |
| TRUSTED may stay 0 in one cycle | Medium | Extend measurement or accept Tier 2 partial |
| Partner hours not in checklist MD | Low | Spreadsheet column |

---

## Engineering Work Required?

```text
NO — for Client #2 economics measurement execution.
```

Optional parallel track: AWS deploy (operational, not economics).
