# Pilot Success Criteria — AQLIYA

## Purpose

Define measurable criteria to evaluate whether a controlled pilot succeeded, needs extension, or should be stopped. Both AQLIYA and the customer agree on these before the pilot starts.

## When to Use

At pilot design stage. Reviewed at pilot midpoint and closeout.

---

## Success Criteria Template

### 1. Operational Criteria

| #   | Criterion           | Measure                                    | Target                | Met? |
| --- | ------------------- | ------------------------------------------ | --------------------- | ---- |
| 1.1 | User adoption       | Active users in the last 14 days           | ≥80% of invited users | ☐    |
| 1.2 | Workflow completion | Engagements/workflows completed vs started | ≥70% completion rate  | ☐    |
| 1.3 | Data upload success | Records uploaded without error             | ≥95% success rate     | ☐    |
| 1.4 | System uptime       | Platform availability during pilot hours   | ≥99.5%                | ☐    |

### 2. Quality Criteria

| #   | Criterion             | Measure                                          | Target          | Met? |
| --- | --------------------- | ------------------------------------------------ | --------------- | ---- |
| 2.1 | AI output accuracy    | AI review suggestions accepted by human reviewer | ≥70% acceptance | ☐    |
| 2.2 | Evidence completeness | Findings/outputs with linked evidence            | 100%            | ☐    |
| 2.3 | Export accuracy       | Exports generated without data errors            | 100%            | ☐    |

### 3. Governance Criteria

| #   | Criterion                       | Measure                             | Target | Met? |
| --- | ------------------------------- | ----------------------------------- | ------ | ---- |
| 3.1 | Audit trail completeness        | Every mutation logged in AuditEvent | 100%   | ☐    |
| 3.2 | Review/approval gate compliance | All outputs reviewed before export  | 100%   | ☐    |
| 3.3 | No unauthorized access          | Zero security incidents             | Zero   | ☐    |

### 4. Customer Satisfaction Criteria

| #   | Criterion                       | Measure                         | Target         | Met? |
| --- | ------------------------------- | ------------------------------- | -------------- | ---- |
| 4.1 | Customer satisfaction score     | Survey score (1-5)              | ≥4.0           | ☐    |
| 4.2 | Feature request ratio           | Requested vs delivered features | ≥60% delivered | ☐    |
| 4.3 | Customer willingness to convert | Stated interest in paid plan    | Yes            | ☐    |

### 5. Business Criteria

| #   | Criterion                     | Measure                                | Target                   | Met? |
| --- | ----------------------------- | -------------------------------------- | ------------------------ | ---- |
| 5.1 | Pilot completed within budget | Actual vs planned hours                | ≤110%                    | ☐    |
| 5.2 | Pilot completed on time       | Actual vs planned duration             | ≤120%                    | ☐    |
| 5.3 | No overclaims                 | Claims audit: marketing vs implemented | Zero material overclaims | ☐    |

---

## Decision Matrix

| Criteria Met                                     | Outcome                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| All operational + quality + governance criteria  | **Successful pilot** — recommend paid conversion                        |
| All criteria except customer satisfaction (≥3.0) | **Conditional pass** — address concerns, extend or convert with caveats |
| Any governance criterion failed                  | **Stop** — investigate and remediate before continuing                  |
| Business criteria substantially exceeded         | **Review scope** — may indicate under-scoping                           |
| Less than 50% of criteria met                    | **Fail** — do not convert. Document lessons.                            |

## Owner

- **Evaluation Lead:** AQLIYA Product Team
- **Customer review:** Customer Lead must confirm results

## Status

- [ ] Draft
- [ ] Agreed with Customer
- [ ] Midpoint Review Done
- [ ] Final Review Done
