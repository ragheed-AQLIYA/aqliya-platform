# Real TB Intake — Observation Framework

## Purpose
Provide structured observation criteria during the first real customer trial balance intake session. The observer records what happens without interfering. No architecture or governance changes are permitted mid-session.

---

## Pre-Flight Checklist
- [ ] Governance freeze confirmed (no rule changes during session)
- [ ] No architecture changes permitted during pilot
- [ ] Observer role assigned (non-participating)
- [ ] Recording method chosen (log sheet, screen recording, notes)
- [ ] Session timed (start / end)

---

## Methodology
1. **Observe first** — watch the session end-to-end without intervention.
2. **Analyze second** — review notes and recordings after the session ends.
3. **Optimize never** during the session — all improvement ideas are logged for post-pilot review only.

---

## Observation Domains

### 1. Data Quality
| What to observe | How to record | Success criteria |
|---|---|---|
| Column alignment between source TB and system schema | Note mismatches, missing columns, extra columns | Zero unmapped required fields |
| Numeric precision & scale | Record rounding or truncation events | All values land without data loss |
| Empty rows, merged cells, corruption | Count and classify issues | < 1% of rows affected |
| Duplicate accounts | List duplicates found | Zero duplicates accepted |

### 2. Mapping
| What to observe | How to record | Success criteria |
|---|---|---|
| Accounts that map automatically vs. manually | Count each category | ≥ 80% auto-mapped |
| Ambiguous mappings (one account → multiple targets) | Log each ambiguity | Resolved within 2 minutes each |
| Reviewer overrides | Capture before/after mapping | Override rationale documented |

### 3. Evidence
| What to observe | How to record | Success criteria |
|---|---|---|
| Supporting docs requested vs. provided | Count requested / received | ≥ 90% provided same-session |
| Evidence rejection events | Record rejection reason | Zero rejections without documented reason |

### 4. Reviewer Behavior
| What to observe | How to record | Success criteria |
|---|---|---|
| Time spent per account / per section | Record elapsed time per section | Average ≤ 3 min per account |
| Tool switching (Excel → system → PDF) | Count context switches | ≤ 5 switches per 10 accounts |
| Verbal hesitation or uncertainty | Note timestamps and triggers | Flag patterns for training |

### 5. Governance
| What to observe | How to record | Success criteria |
|---|---|---|
| Rules consulted | Which rules were opened / referenced | All relevant rules consulted |
| Deviations from published policy | Record deviation and context | Zero unapproved deviations |
| Escalations | Count and log outcome | Escalation resolved within 15 min |

### 6. Workflow
| What to observe | How to record | Success criteria |
|---|---|---|
| Step sequence followed vs. skipped | Check off each workflow step | ≥ 95% steps followed in order |
| Parallel vs. sequential work | Note when reviewer multitasks | No multitasking during mapping decisions |
| Breaks / interruptions | Log duration and cause | Total interruption time < 10 % of session |

---

## Post-Session Artifacts
- Completed observation log
- Screen recording (if applicable)
- Timed session log
- List of improvement ideas (filed, not acted upon)
