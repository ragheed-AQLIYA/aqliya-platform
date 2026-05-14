# DecisionOS Templates

## Goal

Provide reusable decision templates so users can start different decision types with pre-filled objectives, framework guidance, scenarios, risks, and recommended workflow.

## Template Architecture

### `src/lib/decision/decision-templates.ts`

Defines the `DecisionTemplate` interface and all template data.

### Template Structure

Each template includes:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique template identifier |
| `type` | string | Decision type this template applies to |
| `label` | string | Display name |
| `description` | string | Short description of the template |
| `titlePattern` | string | Suggested title format |
| `descriptionPrompt` | string | Prompt for the description field |
| `priority` | string | Default priority level |
| `suggestedObjectives` | string[] | Pre-filled objectives |
| `suggestedConstraints` | string[] | Pre-filled constraints |
| `suggestedAssumptions` | string[] | Pre-filled assumptions |
| `suggestedAlternatives` | string[] | Pre-filled alternatives |
| `frameworkGuidance` | object | Guidance for all 8 framework fields |
| `scenarioSuggestions` | array | Suggested scenarios with name/description |
| `commonRisks` | string[] | Typical risks for this decision type |
| `recommendedNextStep` | string | Guidance on what to do after creation |

## Templates Added

| Template ID | Type | Label | Priority |
|-------------|------|-------|----------|
| `tender` | TENDER | Tender Evaluation | HIGH |
| `investment` | INVESTMENT | Investment Decision | HIGH |
| `strategic` | STRATEGIC | Strategic Direction | HIGH |
| `hiring` | HIRING | Key Hiring Decision | MEDIUM |
| `procurement` | PROCUREMENT | Procurement Decision | MEDIUM |
| `custom` | CUSTOM | Custom Decision | MEDIUM |

### Template Details

#### Tender Evaluation
- **4 objectives**: Financial viability, capacity assessment, strategic fit, risk identification
- **4 constraints**: Budget, capacity, compliance, technical requirements
- **4 assumptions**: Stable requirements, cost accuracy, resource availability, payment terms
- **4 alternatives**: Full bid, partial bid, no bid, joint venture
- **3 scenarios**: Win Full, Win Partial, No Award
- **5 common risks**: Cost overrun, resource unavailability, payment delays, regulatory changes, competitor pressure

#### Investment Decision
- **4 objectives**: ROI maximization, strategic alignment, financial capacity, risk mitigation
- **4 constraints**: Capital, compliance, timeline, risk tolerance
- **4 assumptions**: Market stability, realistic projections, cost ranges, regulatory stability
- **4 alternatives**: Full commitment, phased approach, alternative investment, defer
- **3 scenarios**: Best Case, Expected Case, Worst Case
- **5 common risks**: Market downturn, cost overruns, regulatory changes, liquidity, execution

#### Strategic Direction
- **4 objectives**: Vision alignment, competitive positioning, readiness assessment, cost-benefit balance
- **4 constraints**: Resources, culture, stakeholders, external environment
- **4 assumptions**: Market trends, capability development, stakeholder support, competitive evolution
- **4 alternatives**: Full commitment, pilot, maintain status quo, pivot
- **3 scenarios**: Strategic Success, Partial Achievement, Strategic Failure
- **5 common risks**: Misalignment, competitive response, market shifts, resistance, resources

#### Key Hiring Decision
- **4 objectives**: Right candidate, role alignment, cost-quality balance, time-to-fill
- **4 constraints**: Budget, timeline, skills, cultural fit
- **4 assumptions**: Talent pool, competitive compensation, realistic requirements, onboarding resources
- **4 alternatives**: Full-time, contract, redistribute, delay
- **3 scenarios**: Ideal Hire, Acceptable Hire, No Suitable Candidate
- **5 common risks**: Mismatch, extended vacancy, compensation misalignment, cultural misfit, budget overrun

#### Procurement Decision
- **4 objectives**: Best vendor, standards alignment, TCO optimization, supplier relationships
- **4 constraints**: Budget, quality, delivery, due diligence
- **4 assumptions**: Accurate proposals, measurable standards, realistic timelines, negotiable terms
- **4 alternatives**: Single vendor, multi-vendor, in-house build, delay
- **3 scenarios**: Optimal Vendor, Acceptable Vendor, Procurement Failure
- **5 common risks**: Underperformance, hidden costs, quality issues, vendor lock-in, supply chain

#### Custom Decision
- **4 objectives**: Clear objectives, stakeholder identification, evaluation criteria, documentation
- **4 constraints**: Budget, timeline, compliance, governance
- **4 assumptions**: Information accuracy, stakeholder stability, external conditions, resource availability
- **4 alternatives**: Proceed, modify, defer, alternative
- **3 scenarios**: Best Outcome, Expected Outcome, Worst Outcome
- **5 common risks**: Incomplete information, misalignment, resource constraints, external factors, implementation

## Creation Behavior

### Manual Creation (Unchanged)
- User fills title, type, description, priority, target date
- Decision created with empty intake data
- Existing behavior preserved

### Template Creation (New)
1. User selects "Start from Template" mode
2. Grid of available templates displayed with label, description, priority, and content counts
3. User clicks a template to preview its contents
4. Preview shows: objectives, scenarios, common risks, recommended next step
5. Form fields pre-filled with template defaults (title pattern, description prompt, priority)
6. User can edit all fields before creation
7. On submit: decision created with pre-filled objectives, constraints, assumptions, alternatives
8. Audit log includes `templateId` in the `after` JSON

### Server Action: `createDecisionFromTemplate`
- Validates template exists
- Validates decision type
- Creates decision with template-derived priority
- Creates all intake entities (objectives, constraints, assumptions, alternatives)
- Logs audit with template reference
- Returns decision + template guidance data

## UI Flow

### New Decision Page (`/decisions/new`)

**Mode Toggle:**
- "Start from Scratch" — traditional manual creation
- "Start from Template" — template selection grid

**Template Grid:**
- Cards showing label, description, priority badge
- Content counts: objectives, scenarios, common risks
- Click to select and preview

**Template Preview:**
- Full card with template details
- Grid layout: objectives, scenarios, risks, recommended next step
- "Change Template" button to go back
- Form fields pre-populated with template defaults

**Form:**
- Title pre-filled with template pattern (editable)
- Type locked to template type (editable)
- Description pre-filled with template prompt (editable)
- Priority pre-filled with template default (editable)
- Target date empty (user-defined)

## Backward Compatibility

| Scenario | Behavior |
|----------|----------|
| Existing decisions | Unaffected — no schema changes |
| Manual creation | Unchanged — same flow as before |
| Template creation | Creates same Decision model with pre-filled intake data |
| Audit logs | Template creation includes `templateId` in `after` JSON |

### Future Enhancement: Template Tracking

Currently, there is no `templateId` or `templateSource` field on the Decision model. Template origin is only tracked in the audit log. Future schema enhancement could add:

```prisma
model Decision {
  templateId   String?
  templateSource String?  // "manual" | "template"
}
```

This would enable:
- Filtering decisions by template origin
- Template usage analytics
- Template effectiveness tracking

## Changed Files

| File | Change |
|------|--------|
| `src/lib/decision/decision-templates.ts` | New: template definitions for 6 decision types |
| `src/actions/decision-templates.ts` | New: server actions for template listing and creation |
| `src/app/(dashboard)/decisions/new/page.tsx` | Updated: template mode toggle, template grid, preview card, template-based creation |

## Remaining Risks

1. **No template versioning** — Templates are static code; changes affect all new decisions but not existing ones
2. **No template customization** — Users cannot modify templates or create custom ones
3. **No template usage analytics** — Cannot track which templates are most used or effective
4. **No template origin tracking in schema** — Only in audit log; requires future schema change
5. **Framework guidance not auto-applied** — Templates provide guidance text but don't auto-fill framework; user must manually apply guidance
6. **Scenario and risk suggestions not auto-created** — Templates suggest scenarios and risks but don't create them; user must manually add

## Recommended TASK-017

**Title:** Template Management & Analytics

**Scope:**
- Admin template management UI (create, edit, deactivate templates)
- Custom user templates (organization-specific)
- Template usage analytics (most used, completion rates, time-to-approval)
- Auto-apply framework guidance on creation
- Auto-create suggested scenarios and risks from template
- Template origin tracking in Decision schema
- Template versioning with migration support
