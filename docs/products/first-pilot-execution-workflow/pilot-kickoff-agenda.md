# Pilot Kickoff Agenda — AQLIYA

## Purpose

First structured meeting with the customer to align expectations, scope, rules, and next steps. This meeting sets the tone for the entire pilot.

## When to Use

After scope template is signed and before any data is ingested or first demo delivered.

## Inputs

- Signed pilot scope template (`pilot-control-pack/pilot-scope-template.md`)
- Customer data handling rules (`pilot-control-pack/customer-data-handling-rules.md`)
- Demo and pilot claims script (`pilot-control-pack/demo-and-pilot-claims-script.md`)

---

## Kickoff Agenda (90 min)

### 1. Opening Framing (10 min)

- Welcome and introductions
- AQLIYA positioning: "Private Governed Institutional Intelligence Platform"
- Trust principle: "AI assists. Humans decide. Evidence governs."
- What AQLIYA IS:
  - A governed intelligence platform for institutional workflows
  - Evidence-based, auditable, human-supervised
- What AQLIYA IS NOT:
  - ❌ Not a generic AI chatbot
  - ❌ Not autonomous decision-making
  - ❌ Not a CRM
  - ❌ Not SaaS-only

### 2. Product Scope Walkthrough (15 min)

- Products in scope (AuditOS primary, LocalContentOS as agreed)
- Products explicitly out of scope
- Features in scope per product
- Demo environment vs pilot environment

**Allowed language:**

- AuditOS: "جاهز للتشغيل مع إشراف" / "Ready for supervised operation"
- LocalContentOS: "جاهز للبايلوت بشروط" / "Pilot-ready with conditions"

**Prohibited language:**

- "Production-ready" or "Enterprise-hardened"

### 3. Data Handling Rules (15 min)

Review `pilot-control-pack/customer-data-handling-rules.md`:

- What data is needed
- Data minimization principle
- Tenant isolation
- Encryption (at rest + in transit)
- Access control — only assigned team
- No data sharing across organizations
- Retention period + deletion process
- Prohibited: public AI services, personal devices, credential sharing

### 4. Success Criteria (10 min)

Review `pilot-control-pack/pilot-success-criteria.md`:

- Operational criteria (adoption, completion, uptime)
- Quality criteria (AI accuracy, evidence completeness)
- Governance criteria (audit trail, review gates)
- Customer satisfaction criteria
- Business criteria
- Decision matrix: what success means for conversion

### 5. Communication & Rhythm (10 min)

- Weekly customer touchpoint (60 min)
- AQLIYA internal weekly review
- Communication channel (email/Slack/Teams)
- Escalation path for issues
- Who to contact for what

### 6. Timeline & Milestones (10 min)

| Milestone               | Target Date | Owner |
| ----------------------- | ----------- | ----- |
| Data intake complete    |             |       |
| First demo session      |             |       |
| Midpoint review         |             |       |
| Success criteria review |             |       |
| Closeout                |             |       |

### 7. Stop Conditions (10 min)

Review `pilot-control-pack/pilot-stop-conditions.md`:

- 🔴 Hard Stop: data breach, cross-tenant leak, unauthorized AI decision
- 🟡 Pause: system outage, data integrity, overclaim detected
- 🟢 Watch: minor bugs, adoption dip

**Emphasize:** Any team member on either side can raise a stop condition.

### 8. Next Steps (10 min)

- Customer provides data (per data intake checklist)
- First demo session scheduled
- Weekly rhythm confirmed
- Questions and open items

---

## Post-Kickoff Checklist

| #   | Action                            | Owner         | Done |
| --- | --------------------------------- | ------------- | ---- |
| 1   | Share meeting notes with customer | AQLIYA Lead   | ☐    |
| 2   | Confirm data intake timeline      | AQLIYA Lead   | ☐    |
| 3   | Schedule first demo session       | AQLIYA Lead   | ☐    |
| 4   | Create pilot command center       | AQLIYA Lead   | ☐    |
| 5   | Confirm customer contact list     | Customer Lead | ☐    |

## Owner

- **Kickoff Lead:** AQLIYA Pilot Lead
- **Attendees:** AQLIYA Lead + Tech Lead, Customer Lead + Stakeholders

## Related Files in Pilot Control Pack

- `pilot-control-pack/pilot-scope-template.md`
- `pilot-control-pack/customer-data-handling-rules.md`
- `pilot-control-pack/demo-and-pilot-claims-script.md`
- `pilot-control-pack/pilot-success-criteria.md`
- `pilot-control-pack/pilot-stop-conditions.md`

## Status

- [ ] Draft
- [ ] Scheduled
- [ ] Completed
