# AuditOS Evidence-to-Proof Pipeline

## Purpose

Transform raw pilot session evidence into documented, shareable proof of product readiness, market fit, and governance strength.

---

## Pipeline Stages

```
Raw Evidence → Filtered Observations → Verified Findings → Proof Artifacts → Proof Library
```

---

## Stage 1: Raw Evidence Collection

**Source:** Every pilot session produces these raw artifacts:

| Artifact                    | Source                     | Format           |
| --------------------------- | -------------------------- | ---------------- |
| Session observations        | Evidence capture (05)      | Structured notes |
| Participant verbatim quotes | Operator notes             | Raw text         |
| Screenshots                 | During session             | PNG/JPG          |
| Audit logs                  | PlatformAuditLog records   | Structured DB    |
| Workflow recordings         | Screen recording (consent) | Video            |
| Incident reports            | Escalation template (04)   | Structured notes |
| Post-session review         | Review template (07)       | Structured notes |

**Rules:**

- Preserve ALL raw evidence
- Do not edit or summarize at this stage
- Tag with session ID and timestamp
- Store in `docs/products/pilot-evidence/<session-id>/`

---

## Stage 2: Filtered Observations

**Process:** Extract meaningful patterns from raw evidence.

| Filter        | Question                                            | Action            |
| ------------- | --------------------------------------------------- | ----------------- |
| Relevance     | Does this relate to product, governance, or market? | Keep / Discard    |
| Repeatability | Did more than one participant experience this?      | Pattern / Outlier |
| Severity      | Is this a blocker, friction, or insight?            | Classify          |
| Actionable    | Can we act on this?                                 | Yes / Log         |

**Output:** Filtered observation log with classification:

```
Session ID | Observation | Type | Severity | Pattern? | Action item
```

---

## Stage 3: Verified Findings

**Process:** Convert filtered observations into verified findings.

### Finding Format

```md
## Finding: <title>

**Source sessions:** [list of session IDs]

**Observation (verbatim):**

> "What the participant said"

**Classification:**

- Type: [Blocker / Friction / Trust gap / Workflow gap / Adoption signal]
- Severity: [Critical / High / Medium / Low]
- Repeatability: [Single / Multiple / Universal]

**Evidence attached:**

- [x] Screenshot <file>
- [x] Audit log <id>
- [x] Operator note <section>

**Assessment:**
What this means for the product, governance, or market position.

**Action:**

- [ ] Fix before next phase
- [ ] Monitor in next sessions
- [ ] Accept as known limitation
```

### Verification Rules

- A finding is "verified" when:
  1. Captured in session evidence (05)
  2. Confirmed in post-session review (07)
  3. Cross-referenced with audit logs where applicable
- Findings based on single session = "preliminary"
- Findings replicated across 2+ sessions = "validated"

---

## Stage 4: Proof Artifacts

**Process:** Turn verified findings into market-facing proof.

### Artifact Types

| Artifact                 | Purpose                 | Source                               |
| ------------------------ | ----------------------- | ------------------------------------ |
| Case study               | Market-facing narrative | 3+ sessions with one organization    |
| Testimonial (attributed) | Social proof            | Participant agrees to named quote    |
| Testimonial (anonymous)  | Social proof            | Participant agrees to quote, no name |
| Workflow recording       | Demonstration           | Screen recording with consent        |
| Export sample            | Output quality          | Generated PDF/XLSX with demo data    |
| Metric snapshot          | Scale/performance       | Dashboard screenshots                |

### Conversion Rules

| Event                                      | Artifact                         |
| ------------------------------------------ | -------------------------------- |
| Participant says "this solves our problem" | Capture as testimonial candidate |
| Participant says "I would use this"        | Capture as adoption signal       |
| Participant brings their own data          | Capture as trust signal          |
| Session runs without issues                | Capture as stability signal      |
| Governance feature praised                 | Capture as differentiator signal |

### Do NOT Convert to Proof

- Hypothetical statements ("I would use this if...")
- Feature requests ("Add X and then it's perfect")
- Compliments without specifics ("It's nice")

---

## Stage 5: Proof Library

### Structure

```
docs/products/proof-library/
├── case-studies/
│   └── <organization-name>-<date>.md
├── testimonials/
│   ├── attributed/
│   │   └── <name>-<org>-<date>.md
│   └── anonymous/
│       └── <id>-<date>.md
├── recordings/
│   └── <session-id>-<description>.md  (metadata + link)
├── export-samples/
│   └── auditos-pilot-export-<date>.pdf
├── metric-snapshots/
│   └── <description>-<date>.png
└── master-index.md
```

### Library Rules

- Every artifact must link back to its source session
- Attributed testimonials require signed consent
- Case studies require participant review before publishing
- No artifact is added without a verified finding behind it
- Stale artifacts (older than 6 months) are reviewed or archived

---

## Pipeline Gate: Session → Proof

| Gate | Question               | Pass criteria                                       |
| ---- | ---------------------- | --------------------------------------------------- |
| G1   | Session completed?     | Evidence capture (05) submitted                     |
| G2   | Observations filtered? | Filtered observation log created                    |
| G3   | Findings verified?     | At least 1 verified finding                         |
| G4   | Proof artifact ready?  | Finding qualifies as proof per conversion rules     |
| G5   | Consent obtained?      | Participant agrees to use (attributed or anonymous) |

Only artifacts that pass all 5 gates enter the proof library.

---

## Confidentiality

- All raw evidence is confidential to AQLIYA
- No proof artifact is published without explicit participant consent
- Participants may withdraw consent at any time
- Withdrawn artifacts are removed from the proof library within 48 hours
- Participants may review case studies before publication
