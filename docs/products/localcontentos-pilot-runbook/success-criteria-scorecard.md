# LocalContentOS — Success Criteria Scorecard

**Status:** Pilot Operations Guide — not software
**Purpose:** Scoring framework for evaluating pilot success across key dimensions

---

## Scoring Dimensions

| #   | Dimension                          | Weight | Description                                                           |
| --- | ---------------------------------- | ------ | --------------------------------------------------------------------- |
| 1   | Data Availability                  | 15%    | Completeness and quality of customer data submitted                   |
| 2   | Vendor Classification Completeness | 15%    | Percentage of vendors successfully classified                         |
| 3   | Spend Classification Completeness  | 15%    | Percentage of spend amount successfully classified                    |
| 4   | Evidence Coverage                  | 15%    | Percentage of classifications with supporting evidence                |
| 5   | Findings Quality                   | 10%    | Relevance, specificity, and actionability of findings                 |
| 6   | Management Usefulness              | 10%    | Whether management found the pilot outputs useful for decision-making |
| 7   | Repeatability                      | 10%    | Whether the process can be repeated for future periods                |
| 8   | Conversion Readiness               | 10%    | Whether the customer is ready to proceed to the next phase            |

---

## Scoring Levels

| Score | Label         | Meaning                                             |
| ----- | ------------- | --------------------------------------------------- |
| 0     | Not Available | Dimension cannot be assessed or data is missing     |
| 1     | Weak          | Dimension falls significantly short of expectations |
| 2     | Usable        | Dimension meets minimum expectations but has gaps   |
| 3     | Strong        | Dimension exceeds expectations                      |

---

## Scoring Table

### 1. Data Availability (Weight: 15%)

| Score | Criteria                                                                                |
| ----- | --------------------------------------------------------------------------------------- |
| 3     | All required templates received. All required fields populated. Data passes validation. |
| 2     | All required templates received. Some optional fields missing. Minor validation issues. |
| 1     | Required templates incomplete (> 10% missing fields). Multiple validation issues.       |
| 0     | Critical templates missing. Data cannot be processed.                                   |

### 2. Vendor Classification Completeness (Weight: 15%)

| Score | Criteria                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------ |
| 3     | > 95% of vendors classified (Local, Non-Local, Mixed). Only confirmed Undetermined cases remain. |
| 2     | 80–95% of vendors classified. Some Undetermined with known action items.                         |
| 1     | 50–80% of vendors classified. Significant Undetermined population.                               |
| 0     | < 50% of vendors classified.                                                                     |

### 3. Spend Classification Completeness (Weight: 15%)

| Score | Criteria                                                          |
| ----- | ----------------------------------------------------------------- |
| 3     | > 95% of total spend amount classified (Local, Non-Local, Mixed). |
| 2     | 80–95% of total spend amount classified.                          |
| 1     | 50–80% of total spend amount classified.                          |
| 0     | < 50% of total spend amount classified.                           |

### 4. Evidence Coverage (Weight: 15%)

| Score | Criteria                                                           |
| ----- | ------------------------------------------------------------------ |
| 3     | > 80% of classifications have High or Medium confidence evidence.  |
| 2     | 60–80% of classifications have High or Medium confidence evidence. |
| 1     | 30–60% of classifications have High or Medium confidence evidence. |
| 0     | < 30% of classifications have acceptable evidence.                 |

### 5. Findings Quality (Weight: 10%)

| Score | Criteria                                                                                              |
| ----- | ----------------------------------------------------------------------------------------------------- |
| 3     | Findings are specific, evidence-based, quantified, and actionable. Clear recommendations with owners. |
| 2     | Findings are relevant and evidence-based but lack quantification or specific recommendations.         |
| 1     | Findings are general or vague. Limited actionable content.                                            |
| 0     | No meaningful findings produced.                                                                      |

### 6. Management Usefulness (Weight: 10%)

| Score | Criteria                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------ |
| 3     | Management confirms pilot outputs are directly useful for decision-making. Specific decisions enabled. |
| 2     | Management finds outputs informative but needs additional analysis for decisions.                      |
| 1     | Management views outputs as interesting but not immediately actionable.                                |
| 0     | Management does not find value in the pilot outputs.                                                   |

### 7. Repeatability (Weight: 10%)

| Score | Criteria                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------- |
| 3     | Process is clearly documented. Templates can be reused. Next period would require minimal rework. |
| 2     | Process is mostly documented. Some steps would require rework but methodology is sound.           |
| 1     | Process was ad-hoc. Significant effort would be needed to repeat.                                 |
| 0     | Process cannot be reproduced.                                                                     |

### 8. Conversion Readiness (Weight: 10%)

| Score | Criteria                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------ |
| 3     | Customer is ready and willing to proceed. Decision owner identified. Commercial terms discussed. |
| 2     | Customer is interested but needs additional discussion. Potential obstacles identified.          |
| 1     | Customer is unsure. Significant concerns remain.                                                 |
| 0     | Customer is not ready or not interested in proceeding.                                           |

---

## Score Calculation

```
Weighted Score = Σ (Dimension Score × Weight)
Maximum Score = 3.0
```

### Example Calculation

| Dimension                          | Score | Weight   | Contribution   |
| ---------------------------------- | ----- | -------- | -------------- |
| Data Availability                  | 3     | 15%      | 0.45           |
| Vendor Classification Completeness | 2     | 15%      | 0.30           |
| Spend Classification Completeness  | 2     | 15%      | 0.30           |
| Evidence Coverage                  | 2     | 15%      | 0.30           |
| Findings Quality                   | 2     | 10%      | 0.20           |
| Management Usefulness              | 3     | 10%      | 0.30           |
| Repeatability                      | 2     | 10%      | 0.20           |
| Conversion Readiness               | 2     | 10%      | 0.20           |
| **Total**                          |       | **100%** | **2.25 / 3.0** |

---

## Score Interpretation

| Score Range   | Label      | Meaning                                                                  |
| ------------- | ---------- | ------------------------------------------------------------------------ |
| **2.5 – 3.0** | Excellent  | Pilot fully successful. Ready for next phase.                            |
| **2.0 – 2.4** | Strong     | Pilot successful with minor gaps. Recommend proceed with conditions.     |
| **1.5 – 1.9** | Acceptable | Pilot achieved basic objectives. Gaps need addressing before next phase. |
| **1.0 – 1.4** | Weak       | Pilot partially successful. Significant gaps remain. Consider extension. |
| **< 1.0**     | Poor       | Pilot did not achieve objectives. Do not proceed without major changes.  |

---

## Decision Thresholds

| Score     | Recommended Decision                                                 |
| --------- | -------------------------------------------------------------------- |
| ≥ 2.5     | **Proceed to Paid Pilot / MVP** — Strong confidence in next phase    |
| 2.0 – 2.4 | **Proceed with Conditions** — Address specific gaps while proceeding |
| 1.5 – 1.9 | **Extend Pilot** — Resolve gaps before committing to next phase      |
| 1.0 – 1.4 | **Pause / Re-evaluate** — Significant issues need resolution         |
| < 1.0     | **Do Not Proceed** — Pilot was not successful                        |

---

## Go / Conditional Go / No-Go Thresholds

| Decision           | Criteria                                                               |
| ------------------ | ---------------------------------------------------------------------- |
| **Go**             | Overall score ≥ 2.5 AND no single dimension below 2.0                  |
| **Conditional Go** | Overall score ≥ 2.0 AND conditions documented for dimensions below 2.0 |
| **No-Go**          | Overall score < 2.0 OR any critical dimension (1-4) below 1.5          |

---

## Scorecard Template

Copy this table into the Pilot Summary for scoring:

| #   | Dimension                          | Score (0-3) | Weight   | Contribution | Notes |
| --- | ---------------------------------- | ----------- | -------- | ------------ | ----- |
| 1   | Data Availability                  |             | 15%      |              |       |
| 2   | Vendor Classification Completeness |             | 15%      |              |       |
| 3   | Spend Classification Completeness  |             | 15%      |              |       |
| 4   | Evidence Coverage                  |             | 15%      |              |       |
| 5   | Findings Quality                   |             | 10%      |              |       |
| 6   | Management Usefulness              |             | 10%      |              |       |
| 7   | Repeatability                      |             | 10%      |              |       |
| 8   | Conversion Readiness               |             | 10%      |              |       |
|     | **Total**                          |             | **100%** | **/ 3.0**    |       |

**Overall Score:** / 3.0
**Decision:** Go / Conditional Go / No-Go
**Conditions (if Conditional Go):**
