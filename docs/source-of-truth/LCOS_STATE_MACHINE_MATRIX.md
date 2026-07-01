# LocalContentOS State Machine Matrix

**Status:** Active  
**Version:** 1.0  
**Date:** 2026-07-01  
**Source:** `prisma/schema.prisma` — LocalContentOS models  

## 1. LocalContentProject

**Model:** `LocalContentProject`  
**Field:** `status` (String)  

### States

```
Draft → DataCollection → ClassificationInProgress → EvidenceReview → FindingsDrafted → InReview → Approved → ReportReady → Exported
                                                                         ↓                ↓
                                                                      Returned ─────→ InReview
                                                                         ↓
                                                                    Archived
```

### Transition Table

| # | From                      | To                        | Who Can Trigger  | Audit Event Generated                     |
|---|---------------------------|---------------------------|------------------|-------------------------------------------|
| 1 | Draft                     | DataCollection            | OPERATOR         | `PROJECT_STATUS_CHANGED: Draft→DataCollection` |
| 2 | DataCollection            | ClassificationInProgress  | OPERATOR         | `PROJECT_STATUS_CHANGED: DataCollection→ClassificationInProgress` |
| 3 | ClassificationInProgress  | EvidenceReview            | OPERATOR         | `PROJECT_STATUS_CHANGED: ClassificationInProgress→EvidenceReview` |
| 4 | EvidenceReview            | FindingsDrafted           | OPERATOR         | `PROJECT_STATUS_CHANGED: EvidenceReview→FindingsDrafted` |
| 5 | FindingsDrafted           | InReview                  | OPERATOR         | `PROJECT_STATUS_CHANGED: FindingsDrafted→InReview` |
| 6 | InReview                  | Approved                  | REVIEWER         | `PROJECT_STATUS_CHANGED: InReview→Approved` |
| 7 | InReview                  | Returned                  | REVIEWER         | `PROJECT_STATUS_CHANGED: InReview→Returned` |
| 8 | Returned                  | InReview                  | OPERATOR         | `PROJECT_STATUS_CHANGED: Returned→InReview` |
| 9 | Approved                  | ReportReady               | OPERATOR         | `PROJECT_STATUS_CHANGED: Approved→ReportReady` |
| 10| ReportReady               | Exported                  | OPERATOR         | `PROJECT_STATUS_CHANGED: ReportReady→Exported` |
| 11| Draft                     | Archived                  | ADMIN            | `PROJECT_STATUS_CHANGED: Draft→Archived` |
| 12| Exported                  | Archived                  | ADMIN            | `PROJECT_STATUS_CHANGED: Exported→Archived` |
| 13| Approved                  | ReportReady               | OPERATOR         | `PROJECT_STATUS_CHANGED: Approved→ReportReady` |

### Invalid Transitions

| From             | To                        | Reason                                           |
|------------------|---------------------------|--------------------------------------------------|
| Any → ReportReady | Non-Approved             | Only Approved projects can generate reports      |
| Any → Exported    | Non-ReportReady          | Report must be ready before export                |
| Archived → Any    | —                         | Archived is terminal; requires admin un-archive   |
| Draft → InReview  | —                         | Must pass through intermediate states             |
| DataCollection → Approved | —               | Evidence review and findings required             |

---

## 2. LcEvidence (LocalContentEvidence)

**Model:** `LocalContentEvidence`  
**Field:** `status` (String) — default: `uploaded`

### States

```
uploaded → linked → reviewed → verified
              ↓         ↓
            missing   rejected
```

### Transition Table

| # | From       | To        | Who Can Trigger  | Audit Event Generated                          |
|---|------------|-----------|------------------|-----------------------------------------------|
| 1 | uploaded   | linked    | OPERATOR         | `EVIDENCE_STATUS_CHANGED: uploaded→linked`    |
| 2 | linked     | reviewed  | REVIEWER         | `EVIDENCE_STATUS_CHANGED: linked→reviewed`    |
| 3 | reviewed   | verified  | REVIEWER         | `EVIDENCE_STATUS_CHANGED: reviewed→verified`  |
| 4 | reviewed   | rejected  | REVIEWER         | `EVIDENCE_STATUS_CHANGED: reviewed→rejected`  |
| 5 | uploaded   | missing   | OPERATOR         | `EVIDENCE_STATUS_CHANGED: uploaded→missing`   |
| 6 | linked     | missing   | OPERATOR         | `EVIDENCE_STATUS_CHANGED: linked→missing`     |
| 7 | rejected   | uploaded  | OPERATOR         | `EVIDENCE_STATUS_CHANGED: rejected→uploaded`  |
| 8 | missing    | uploaded  | OPERATOR         | `EVIDENCE_STATUS_CHANGED: missing→uploaded`   |

### Invalid Transitions

| From         | To           | Reason                                       |
|--------------|--------------|----------------------------------------------|
| uploaded     | verified     | Must pass through linked + reviewed           |
| uploaded     | rejected     | Must be reviewed before rejection             |
| verified     | any          | Verified is terminal                          |
| missing      | reviewed     | Must be re-uploaded first                     |

---

## 3. LcFinding (LocalContentFinding)

**Model:** `LocalContentFinding`  
**Field:** `status` (String) — default: `draft`

### States

```
draft → submitted → reviewed → resolved
              ↓         ↓
           draft      dismissed
```

### Transition Table

| # | From       | To          | Who Can Trigger | Audit Event Generated                       |
|---|------------|-------------|-----------------|---------------------------------------------|
| 1 | draft      | submitted   | OPERATOR        | `FINDING_STATUS_CHANGED: draft→submitted`   |
| 2 | submitted  | reviewed    | REVIEWER        | `FINDING_STATUS_CHANGED: submitted→reviewed`|
| 3 | reviewed   | resolved    | OPERATOR        | `FINDING_STATUS_CHANGED: reviewed→resolved` |
| 4 | reviewed   | dismissed   | REVIEWER        | `FINDING_STATUS_CHANGED: reviewed→dismissed`|
| 5 | submitted  | draft       | REVIEWER        | `FINDING_STATUS_CHANGED: submitted→draft`   |
| 6 | dismissed  | draft       | OPERATOR        | `FINDING_STATUS_CHANGED: dismissed→draft`   |
| 7 | resolved   | draft       | OPERATOR        | `FINDING_STATUS_CHANGED: resolved→draft`    |

### Invalid Transitions

| From         | To           | Reason                                    |
|--------------|--------------|-------------------------------------------|
| draft        | reviewed     | Must be submitted first                    |
| draft        | resolved     | Must pass through submitted + reviewed     |
| draft        | dismissed    | Must be reviewed first                     |
| submitted    | resolved     | Must be reviewed first                     |

---

## 4. LcReview (LocalContentReview)

**Model:** `LocalContentReview`  
**Field:** `status` (String) — default: `pending`

### States

```
pending → in_review → completed
              ↓
           returned
```

### Transition Table

| # | From       | To          | Who Can Trigger | Audit Event Generated                        |
|---|------------|-------------|-----------------|---------------------------------------------|
| 1 | pending    | in_review   | REVIEWER        | `REVIEW_STATUS_CHANGED: pending→in_review`  |
| 2 | in_review  | completed   | REVIEWER        | `REVIEW_STATUS_CHANGED: in_review→completed`|
| 3 | in_review  | returned    | REVIEWER        | `REVIEW_STATUS_CHANGED: in_review→returned` |
| 4 | returned   | in_review   | REVIEWER        | `REVIEW_STATUS_CHANGED: returned→in_review` |
| 5 | pending    | completed   | REVIEWER        | `REVIEW_STATUS_CHANGED: pending→completed`  |

### Invalid Transitions

| From         | To           | Reason                                    |
|--------------|--------------|-------------------------------------------|
| pending      | returned     | Must be in_review first                    |
| completed    | any          | Completed is terminal                      |
| returned     | completed    | Must re-enter in_review first              |

---

## 5. LcScore (Computed — LcWorkbook.lcScore)

**Note:** There is no standalone `LcScore` model. The local content score is a computed field (`lcScore`) on `LcWorkbook`. Its lifecycle is managed by the workbook's state transitions and AI engine.

### Phases

```
pending → calculated → approved
```

| Phase       | Meaning                                            |
|-------------|----------------------------------------------------|
| pending     | Workbook created but score not yet computed         |
| calculated  | Score computed by AI engine; stored in lcScore      |
| approved    | Score reviewed and manually approved                |

### Transition Table

| # | From        | To           | Who Can Trigger | Trigger Event                                |
|---|-------------|--------------|-----------------|----------------------------------------------|
| 1 | pending     | calculated   | SYSTEM (AI)     | First workbook completion or manual calc      |
| 2 | pending     | calculated   | OPERATOR        | Manual score calculation via workbook action   |
| 3 | calculated  | approved     | REVIEWER        | Score approval; accepted by reviewer          |
| 4 | calculated  | pending      | OPERATOR        | Recalculation requested; score reset          |
| 5 | approved    | pending      | OPERATOR        | Data revision invalidates approved score      |

### Invalid Transitions

| From         | To           | Reason                                    |
|--------------|--------------|-------------------------------------------|
| pending      | approved     | Score must be calculated first              |
| approved     | calculated   | Must reset to pending first                 |

---

## Governance Rules

| Rule                                | Applies To                    |
|-------------------------------------|-------------------------------|
| Transitions to Approved/Reviewed only by REVIEWER role | All 5 models    |
| Transitions to Archived/Dismissed only by ADMIN role   | Project, Finding|
| Score calculation is SYSTEM-only; manual recalc requires OPERATOR | LcScore        |
| All state transitions write a `LocalContentAuditEvent` | All 5 models    |
| No transition bypasses intermediate required states     | All 5 models    |
