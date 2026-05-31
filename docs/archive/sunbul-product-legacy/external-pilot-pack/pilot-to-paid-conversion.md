# Sunbul — Pilot-to-Paid Conversion

**Version:** 1.0
**Date:** 2026-05-18
**Classification:** Internal — Sunbul Team

---

## Conversion Logic

```
Pilot completes → Success criteria scored
  → Score ≥ 4.0 → Ready for conversion
  → Score 3.0–3.9 → Address gaps, then convert
  → Score < 3.0 → Do not convert, document learnings
```

## When to Propose Paid Plan

Propose the paid plan when:

1. Pilot duration has ended (4 weeks, unless extended)
2. Success criteria scored and reviewed
3. Client decision maker has seen the scoring
4. Client has expressed interest in continuing
5. No blocking issues remain unresolved

Do NOT propose if:

- Client has not actively used the system in 2+ weeks
- Client has unresolved blockers
- Client decision maker is not engaged

## What to Offer

| Tier | Description | Target |
|---|---|---|
| **Pilot Extension** | 1–2 months at reduced rate | Clients who need more time |
| **Monthly Subscription** | Per-client monthly fee | Clients with consistent case volume |
| **Annual Subscription** | Discounted annual rate | Committed clients |

## Pricing Placeholder

> **Note:** Final pricing is not set. Use these ranges as starting points.

| Model | Price Range | Includes |
|---|---|---|
| Per-client / month | $500–$2,000 | Single client workspace, up to 10 users |
| Per-case | $10–$50 | Pay-as-you-go, no monthly commitment |
| Enterprise | Custom | Multiple clients, dedicated support |

## Pricing Discussion Points

- Sunbul is currently cloud-only (hosted by AQLIYA)
- On-Prem/Private deployment would require additional pricing
- File storage limits may affect pricing
- Support level affects pricing
- Number of users per client may affect pricing

## Commercial Risks

| Risk | Mitigation |
|---|---|
| Client wants On-Prem deployment | Explain that On-Prem is not yet available |
| Client wants AI features | Explain that AI is not yet implemented |
| Client wants SSO/AD | Explain that SSO is not yet available |
| Client wants 100+ users | Discuss scaling and pricing |
| Client wants custom workflow | Discuss AQLIYA Studio (not yet built) |

## Follow-up Structure

| Day | Action |
|---|---|
| Day 0 | Closeout meeting |
| Day 1 | Send feedback form results and success criteria scoring |
| Day 3 | Send conversion proposal |
| Day 7 | Follow-up call to discuss proposal |
| Day 14 | Decision deadline |
| Day 15+ | Either onboarding as paid client or closeout |

## Decision Memo Template

```
To: [Client Decision Maker]
From: Sunbul Pilot Lead
Date: [Date]
Subject: Sunbul Pilot Results & Next Steps

Pilot Summary:
- Duration: [X] weeks
- Cases created: [X]
- Cases approved: [X]
- Documents uploaded: [X]

Success Criteria Score: [X]/5

Recommendation:
Based on the pilot results, we recommend [continuing / not continuing].

Proposal:
[Details of proposed plan]

Next Step:
[What happens next]
```

## Conversion Priorities

The following must be true before a client converts to paid:

1. ☐ Success criteria scored 3.0+ overall
2. ☐ Client operator confirms value
3. ☐ Client reviewer confirms value
4. ☐ Client decision maker approves
5. ☐ No unresolved blockers
6. ☐ Payment method agreed
7. ☐ Terms agreed
8. ☐ Data handling agreed (keep / export / delete pilot data)
