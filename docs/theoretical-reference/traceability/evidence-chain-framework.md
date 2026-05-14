# Evidence Chain Framework

## Evidence lifecycle states and transitions

### State: Candidate

- **Trigger:** Submission of raw evidence (file upload, API push, ingestion event)
- **Reviewer:** Automated quality gate — format validation, checksum computation, schema conformance
- **Artifact:** Candidate evidence record with computed hash, timestamp, and source metadata
- **Next State:** Verified (on quality check pass) / Rejected (on quality check failure with reason)

### State: Verified

- **Trigger:** Quality check pass; evidence is structurally sound and referentially intact
- **Reviewer:** Automated chain-of-custody service — links candidate record to its source, computes linkage hash
- **Artifact:** Verified evidence record with structural hash, provenance metadata, and chain-of-custody link
- **Next State:** Accepted (on content review approval) / Rejected (on content review rejection with audit note)

### State: Accepted

- **Trigger:** Human content review approval (or automated approval for low-risk evidence classes)
- **Reviewer:** Human reviewer with appropriate authority level; automated rules engine for low-risk classes
- **Artifact:** Accepted evidence record with reviewer identity, approval timestamp, and authority level used
- **Next State:** Referenced (when linked to a finding or recommendation)

### State: Referenced

- **Trigger:** A finding or recommendation record creates a `derived_from` or `supports` link to the accepted evidence
- **Reviewer:** Workflow engine — enforces that only accepted evidence can be referenced; rejects references to Candidate or Verified evidence
- **Artifact:** Referenced evidence record enriched with back-references from all findings and recommendations that cite it
- **Next State:** (Terminal — may be superseded if evidence is replaced via a new Candidate cycle)

## Integrity invariants

- The hash chain from Candidate → Verified → Accepted is append-only; no record is ever mutated in place
- A Rejected evidence record retains its prior state hash so the rejection decision is traceable
- Referenced evidence cannot be deleted; deletion attempts produce a tombstone event citing the referencing records
- Evidence in Verified state may be superseded by a new Candidate if content review fails; the superseded record is marked as Obsolete
