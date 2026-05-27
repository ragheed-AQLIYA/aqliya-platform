# AuditOS Pilot Scope Creep Prevention Policy

## Purpose

Pilot sessions generate feature requests. This is expected and healthy. But uncontrolled feature addition during pilot phase destroys focus, distracts from governance hardening, and delays real market readiness.

**This policy exists to protect the pilot from its own success.**

---

## Principle

**The pilot is not a discovery phase for features.**
**The pilot is a verification phase for the current product.**

We pilot what exists. We do not build what is requested during pilot — unless it blocks the pilot itself.

---

## Classification of Pilot Feedback

All participant feedback falls into one of these categories:

| Category             | Definition                                          | Action                            |
| -------------------- | --------------------------------------------------- | --------------------------------- |
| **Blocker**          | Participant cannot complete the workflow            | Fix before next session           |
| **Friction**         | Workflow is confusing, slow, or unintuitive         | Log, prioritize after pilot       |
| **Trust gap**        | Participant does not trust the output or governance | Fix before broader rollout        |
| **Missing feature**  | Something the participant expected to exist         | Log for post-pilot roadmap        |
| **Misunderstanding** | Feature exists but participant didn't find it       | Improve UX or documentation       |
| **Out of scope**     | Request is outside AuditOS product definition       | Decline, explain product boundary |

---

## Feature Acceptance Gates

For a feature request to be accepted during pilot phase, it must pass ALL gates:

### Gate 1: Is it a blocker?

**Question:** Without this feature, can the participant complete the audited workflow?

- YES → Proceed to Gate 2
- NO → Log for post-pilot roadmap. Do not build.

### Gate 2: Is it governance-critical?

**Question:** Does the absence of this feature create a trust, evidence, or compliance risk?

- YES → Proceed to Gate 3
- NO → Log for post-pilot roadmap. Do not build.

### Gate 3: Is it minimal?

**Question:** Can this be implemented in 1-2 days with no schema change, no new route, no new model?

- YES → Proceed to Gate 4
- NO → Log for post-pilot roadmap. Do not build.

### Gate 4: Does it preserve existing guarantees?

**Question:** Does this change preserve RBAC, tenant isolation, audit trail, review workflow, and all existing governance guarantees?

- YES → Approved for pilot fix
- NO → Do not build. Redesign first, then reconsider.

### Decision Matrix

| Blocker? | Governance? | Minimal? | Preserves? | Decision                                 |
| -------- | ----------- | -------- | ---------- | ---------------------------------------- |
| Yes      | Yes         | Yes      | Yes        | **Fix immediately**                      |
| Yes      | Yes         | No       | Yes        | Log, schedule as post-pilot priority     |
| Yes      | No          | Yes      | Yes        | Consider, but flag as scope risk         |
| No       | No          | Any      | Any        | **Decline.** Log for post-pilot roadmap. |
| Any      | Any         | Any      | No         | **Decline.** Must redesign first.        |

---

## Specific Prohibitions

The following are explicitly prohibited during pilot phase:

- **New product modules** — no DecisionOS, SalesOS, or other system work
- **New AI providers** — no real LLM integration during pilot
- **Schema changes** — no new models, no migrations
- **New routes** — no new API endpoints or pages
- **UI redesign** — no layout or visual overhaul
- **Architecture changes** — no storage provider swap, no rate limiter replacement
- **Dependency additions** — no new npm packages
- **Performance optimization** — unless it's a blocker
- **Beta features** — no "experimental" toggles or half-built features

---

## Handling Feature Requests During Sessions

### When a participant asks for a feature:

1. **Listen fully.** Do not interrupt or justify.
2. **Acknowledge.** "That's interesting. I've noted it."
3. **Classify.** Is it a blocker, friction, or nice-to-have?
4. **If not a blocker:** "We're focused on the current workflow for pilot. I've logged this for our roadmap."
5. **If a blocker:** "Let me assess this. If it's critical to your workflow, we'll prioritize it."
6. **Do NOT:** Promise timelines. Say "we'll build that." Defend why it's not there.

### After the session:

1. Log the feature request in the post-session review (07)
2. Classify per the matrix above
3. If it passes all gates, create a minimal issue
4. If it does not pass, close the issue with explanation

---

## Post-Pilot Feature Process

After the pilot phase ends, this policy is replaced by a standard product roadmap process:

1. All logged feature requests are reviewed
2. Prioritized by: blocker frequency → trust impact → adoption impact → effort
3. Roadmapped for the next product phase
4. No request is automatically included — each must be justified

---

## Enforcement

| Role                 | Responsibility                                      |
| -------------------- | --------------------------------------------------- |
| Founder / Pilot lead | Enforce this policy during sessions and planning    |
| Reviewer             | Challenge any feature work that does not pass gates |
| Auditor              | Flag scope creep in post-session reviews (07)       |

**Violations:**

- Building a feature that does not pass the gates is a policy violation
- Violations must be documented in the next post-session review
- Repeated violations trigger a pilot halt and architecture review

---

## Document Version

| Version | Date       | Author   | Change                                |
| ------- | ---------- | -------- | ------------------------------------- |
| 1.0     | 2026-05-28 | OpenCode | Initial scope creep prevention policy |
