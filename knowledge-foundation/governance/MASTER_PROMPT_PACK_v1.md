# AQLIYA Master Prompt Pack v1

**Version:** 1.0  
**Charter:** `knowledge-foundation/charter/AQLIYA_KNOWLEDGE_FOUNDATION_CHARTER_v1.0.md` (FROZEN)  
**Governing statement:** This Foundation shall always privilege authoritative professional judgment over automated inference.

---

## Pack Rules (Non-Negotiable)

Every prompt in this pack must enforce:

1. **Knowledge Before AI** — Authority → Governance → Classification → Knowledge → Lineage → Memory → AI
2. **No Orphan Knowledge** — Reject outputs missing authority, version, confidence, lineage
3. **Human-Defensible Intelligence** — Decision → Rule → Standard → Source → Reviewer
4. **No LLM executable rules** — LLMs suggest; humans approve
5. **Charter freeze** — Do not reinterpret core principles during execution

All outputs must be structured for admission into `knowledge-foundation/` paths and must reference applicable artifacts in `knowledge-foundation/artifacts/`.

---

## Global System Preamble

Use this preamble at the start of every session prompt:

```text
You are building governed knowledge assets for AQLIYA Knowledge Foundation v1.0.

Operating philosophy: Knowledge First, Human Governed, AI Assisted.

Governing statement: This Foundation shall always privilege authoritative professional judgment over automated inference.

You must NOT:
- Create executable rules without authority attribution
- Omit version, confidence, or lineage metadata
- Produce conclusions that rely solely on model reasoning
- Bypass the admission requirements in knowledge-authority-matrix.json

You MUST:
- Classify every asset by type (A–E) and authority level (A–E)
- Provide source URL, source owner, version label, effective date
- Map each asset to domain, subdomain, entity, relationship, authority, usage (ontology)
- Mark all LLM-generated content as candidate until human review
- Output JSON or structured markdown suitable for knowledge-foundation/domains/{domain}/

Reference artifacts:
- knowledge-foundation/artifacts/knowledge-authority-matrix.json
- knowledge-foundation/artifacts/knowledge-confidence-model.json
- knowledge-foundation/artifacts/knowledge-lineage-model.json
- knowledge-foundation/artifacts/knowledge-version-policy.json
- knowledge-foundation/artifacts/knowledge-ontology.json
```

---

## Session 0 — Build Master Knowledge Catalog

**Objective:** Create the authoritative index of all knowledge domains, sources, and planned assets before domain ingestion.

**Prompt:**

```text
[GLOBAL SYSTEM PREAMBLE]

Task: Build the AQLIYA Master Knowledge Catalog v1.

Scope: Index all knowledge sources required for Sessions 0.5, 1, 2, and 3 only.
Do NOT expand to Sessions 4–12.

Deliverables:
1. knowledge-foundation/governance/master-knowledge-catalog.json
2. knowledge-foundation/governance/master-knowledge-catalog.md (human-readable)

For each catalog entry include:
- catalogId
- domain / subdomain (from knowledge-domain-map.json)
- authorityId and authorityLevel (from knowledge-authority-matrix.json)
- assetType (A–E)
- standardCode (if applicable, e.g. IFRS 15, ISA 315, ISQM 1)
- sourceUrl
- sourceOwner
- versionLabel
- effectiveDate
- jurisdiction
- plannedSession (0, 0.5, 1, 2, or 3)
- status (planned | in-progress | admitted)
- ontologyFields: domain, subdomain, entity, relationship, authority, usage

Organize by:
- Accounting (IFRS/IAS/IFRIC) — Session 1
- Audit (ISA/ISQM) — Session 2
- SOCPA — Session 3
- Governance — Sessions 0, 0.5

Minimum catalog size: 50 entries covering primary standards for Sessions 1–3.

Reject any entry that cannot satisfy No Orphan Knowledge requirements.
```

**Output path:** `knowledge-foundation/governance/master-knowledge-catalog.json`

---

## Session 0.5 — Design Knowledge Governance Model

**Objective:** Define admission gates, review workflow, and metadata validation rules.

**Prompt:**

```text
[GLOBAL SYSTEM PREAMBLE]

Task: Design the AQLIYA Knowledge Governance Model v1.

Deliverables:
1. knowledge-foundation/governance/knowledge-governance-model.json
2. knowledge-foundation/governance/knowledge-governance-model.md

The model must define:

1. Admission pipeline:
   staging → metadata validation → reviewer approval → canonical store

2. Roles:
   KNOWLEDGE_OPERATOR, KNOWLEDGE_REVIEWER, ADMIN

3. Validation rules mapped to:
   - knowledge-confidence-model.json (scoring gates)
   - knowledge-version-policy.json (required fields)
   - knowledge-lineage-model.json (minimum chain)
   - knowledge-storage-matrix.json (tier assignment)

4. Rejection criteria (explicit list matching Charter §9)

5. LLM assist boundaries:
   - candidate rule suggestion allowed
   - executable rule creation forbidden
   - human reviewer node mandatory

6. Perplexity output normalization:
   - required frontmatter template
   - JSON schema for domain file admission

Do not change charter principles. Implement them operationally.
```

**Output path:** `knowledge-foundation/governance/knowledge-governance-model.json`

---

## Session 1 — IFRS / IAS / IFRIC

**Objective:** Ingest primary accounting authority rules and implementation guidance for core IFRS standards.

**Prompt:**

```text
[GLOBAL SYSTEM PREAMBLE]

Task: Build governed IFRS/IAS/IFRIC knowledge assets for AQLIYA Knowledge Foundation.

Authority: IFRS Foundation (Level A) — https://www.ifrs.org/
Asset types: A (Authority Rules), B (Implementation Guidance where applicable)

Priority standards (minimum):
- IFRS 15 (Revenue)
- IFRS 16 (Leases)
- IFRS 9 (Financial Instruments)
- IAS 1 (Presentation)
- IAS 12 (Income Taxes)
- IFRS for SMEs (overview and key differences)

For EACH standard produce:
1. knowledge-foundation/domains/ifrs/{standard-code}/asset.json
2. knowledge-foundation/domains/ifrs/{standard-code}/rules.json (executable rules — Type A)
3. knowledge-foundation/domains/ifrs/{standard-code}/guidance.json (Type B where applicable)

Each asset must include full version policy fields:
assetId, versionLabel, issueDate, effectiveDate, jurisdiction, status, sourceUrl, sourceOwner

Each rule must include:
- paragraphReference
- ruleText (verbatim or precisely cited)
- confidenceScore (per knowledge-confidence-model.json)
- ontology: domain, subdomain, entity, relationship, authority, usage
- lineageParentId (link to source document asset)

Map usage to engines: tb-intelligence, mapping-engine, disclosure-engine

Do NOT paraphrase standards as executable rules without paragraph citation.
Mark all LLM interpretations as Type B with confidence ≤ 90.
```

**Output path:** `knowledge-foundation/domains/ifrs/`

---

## Session 2 — ISA / ISQM

**Objective:** Ingest auditing and quality management standards from IAASB.

**Prompt:**

```text
[GLOBAL SYSTEM PREAMBLE]

Task: Build governed ISA and ISQM knowledge assets for AQLIYA Knowledge Foundation.

Authority: IAASB (Level A) — https://www.iaasb.org/
Asset types: A (Authority Rules), B (Implementation Guidance), D (Operational Intelligence templates)

Priority standards (minimum):
- ISA 315 (Identifying and Assessing Risks)
- ISA 330 (Responses to Assessed Risks)
- ISA 500 (Audit Evidence)
- ISA 540 (Auditing Accounting Estimates)
- ISA 700 (Forming Opinion)
- ISQM 1 (Quality Management)

For EACH standard produce:
1. knowledge-foundation/domains/isa/{standard-code}/asset.json (or isqm/ for ISQM 1)
2. knowledge-foundation/domains/isa/{standard-code}/rules.json
3. knowledge-foundation/domains/isa/{standard-code}/procedures.json (Type D procedure templates)

Cross-link to accounting domain where applicable (e.g. ISA 540 ↔ IFRS estimates).

Each asset must satisfy lineage minimum chain and version policy.
Map usage to: audit-intelligence, risk-library, findings-library, evidence-catalog

Finding and procedure templates are Type D — require reviewer approval before operational use.
```

**Output paths:**
- `knowledge-foundation/domains/isa/`
- `knowledge-foundation/domains/isqm/`

---

## Session 3 — SOCPA

**Objective:** Ingest Saudi jurisdiction overlay for accounting and auditing standards.

**Prompt:**

```text
[GLOBAL SYSTEM PREAMBLE]

Task: Build governed SOCPA knowledge assets for AQLIYA Knowledge Foundation.

Authority: SOCPA (Level A) — https://www.socpa.org.sa/
Jurisdiction: saudi-arabia
Asset types: A (Authority Rules), B (Implementation Guidance)

Scope:
- SOCPA accounting standards and their relationship to IFRS adoption in KSA
- SOCPA auditing standards and their relationship to ISA
- Zakat and tax presentation requirements where published by SOCPA
- Professional and regulatory circulars with executable effect

For EACH SOCPA standard/circular produce:
1. knowledge-foundation/domains/socpa/{standard-code}/asset.json
2. knowledge-foundation/domains/socpa/{standard-code}/rules.json
3. knowledge-foundation/domains/socpa/{standard-code}/jurisdiction-overlay.json

jurisdiction-overlay.json must:
- Link to base IFRS/ISA assetId (jurisdiction-overlay relationship)
- Preserve base standard version history (do not replace IFRS/ISA assets)
- Include supersession rules per knowledge-version-policy.json

Confidence: Authority A + validated + current = 95–100 for primary SOCPA rules.

After Session 3: STOP. Do not proceed to Sessions 4–12.
```

**Output path:** `knowledge-foundation/domains/socpa/`

---

## Output Normalization Template

All Perplexity or agent outputs must use this frontmatter before admission:

```yaml
---
catalogId: kf-{domain}-{standard}-{sequence}
assetId: kf-{domain}-{type}-{sequence}
assetType: A|B|C|D|E
authorityLevel: A|B|C|D|E
authorityId: {from authority matrix}
domain: {from domain map}
subdomain: {from domain map}
versionLabel: {required}
effectiveDate: {YYYY-MM-DD}
sourceUrl: {required}
sourceOwner: {required}
confidenceScore: {0-100}
validationStatus: pending-review
reviewStatus: pending
session: 0|0.5|1|2|3
charterVersion: 1.0
---
```

---

## Post-Session Checklist

After each session, verify:

- [ ] All outputs land in correct `knowledge-foundation/` paths
- [ ] No orphan knowledge (authority, version, confidence, lineage present)
- [ ] Executable rules (Type A) have Authority A or approved overlay only
- [ ] LLM content marked `validationStatus: pending-review`
- [ ] Domain map and catalog updated with admission status
- [ ] Charter v1.0 unchanged
