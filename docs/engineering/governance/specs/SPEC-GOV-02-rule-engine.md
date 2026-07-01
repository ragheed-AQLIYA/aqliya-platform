# SPEC-GOV-02: Rule Engine

> **Engineering Specification** | **M2 Baseline:** Frozen v1.2  
> **Covers:** GR-001 through GR-013

---

## 1. Rule Engine Architecture

```
Input: Resolved Entities + Relationships
    ↓
Rule Scheduler (ordered by dependency)
    ↓
GR-001 → GR-002 → ... → GR-013
    ↓
Each Rule produces:
  - PASS / FAIL / WARN
  - Findings (FND-REV-YYYY-NNNN)
  - Severity
  - Suggested fix
    ↓
Aggregated into RuleEngineReport
```

## 2. Rule Specifications

### GR-001: Immutable IDs Rule

| Field | Value |
|-------|-------|
| **Purpose** | Ensure CLM/EV/SRC/AUTH/DEC/REV/FND IDs never change |
| **Inputs** | All registry entities |
| **Validation** | Check no ID has been reassigned or modified. Compare current IDs against baseline registry hash. |
| **Failure** | Any ID modified |
| **Severity** | Critical |
| **Fix** | Revert ID change. Create new entity with new ID if content changed. |
| **Blocking** | Yes — blocks merge |
| **Logging** | Entity ID, previous value, current value |

### GR-002: Derived Artifacts Rule

| Field | Value |
|-------|-------|
| **Purpose** | Ensure Manifests and Dossiers are never manually edited |
| **Inputs** | Manifest files, Dossier files, Claim Registry |
| **Validation** | Check that Manifest content matches auto-generated output from current Claims. Check no content exists in Manifest that doesn't trace to a Claim. |
| **Failure** | Manifest contains orphan content |
| **Severity** | High |
| **Fix** | Regenerate Manifest from Claims |
| **Blocking** | Yes |
| **Logging** | File, orphan section, manual edit timestamp |

### GR-003: Evidence Manifest Rule

| Field | Value |
|-------|-------|
| **Purpose** | No L-level change without an Evidence Manifest |
| **Inputs** | DEC-IDs of type MAT, Manifest files |
| **Validation** | For each MAT decision, check that MANIFEST-Product.md exists |
| **Failure** | MAT decision with no Manifest |
| **Severity** | Critical |
| **Blocking** | Yes |

### GR-004: Glossary Precision Rule

| Field | Value |
|-------|-------|
| **Purpose** | Ban ambiguous status terms |
| **Inputs** | All governance docs |
| **Validation** | Regex search for forbidden terms: "Strategic Future", "Planned", "Coming Soon", "Future Product" |
| **Failure** | Match found |
| **Severity** | Medium |
| **Fix** | Replace with explicit Four Dimensions values |
| **Blocking** | Warning only |

### GR-005: Three-tier Review Separation

| Field | Value |
|-------|-------|
| **Purpose** | No single agent may both produce evidence and decide L-levels |
| **Inputs** | DEC-IDs, Evidence authorship metadata |
| **Validation** | Check that DEC authority ≠ evidence producer for same product |
| **Failure** | Same agent for both |
| **Severity** | Critical |
| **Blocking** | Yes |

### GR-006: Decision Preconditions Rule

| Field | Value |
|-------|-------|
| **Purpose** | All 6 preconditions met before any MAT decision |
| **Inputs** | Manifest, Dossier, Provenance, Integrity, Review, Findings |
| **Validation** | Check each precondition for the product |
| **Failure** | Any precondition not met |
| **Severity** | Critical |
| **Blocking** | Yes |

### GR-007: Evidence Independence Check

| Field | Value |
|-------|-------|
| **Purpose** | No circular evidence chains |
| **Inputs** | Evidence → Source → Document chains |
| **Validation** | Trace each EV → SRC → DOC. Ensure no EV references another EV. Ensure no circular paths. |
| **Failure** | Circular dependency found |
| **Severity** | High |
| **Blocking** | Yes |

### GR-008: Shared Evidence Canonicalization

| Field | Value |
|-------|-------|
| **Purpose** | Shared capabilities must have one canonical EV |
| **Inputs** | All EV, all Claims referencing capabilities |
| **Validation** | For each capability (CAP-NNN), check that exactly one canonical EV exists. No duplicate EV for same capability across products. |
| **Failure** | Duplicate capability EV found |
| **Severity** | High |
| **Fix** | Remove duplicate, redirect claims to canonical EV |
| **Blocking** | Yes |

### GR-009: Capability Evidence Canonicalization

| Field | Value |
|-------|-------|
| **Purpose** | Engine products: 1 EV per capability, product maturity = derived |
| **Inputs** | Engine-type products, their Claims, their EV |
| **Validation** | For each Engine, check: (1) each capability mapped to exactly 1 EV, (2) product maturity is Derived (no standalone EV) |
| **Failure** | Engine has standalone maturity EV |
| **Severity** | High |
| **Blocking** | Yes |

### GR-010: Marginal Knowledge Efficiency

| Field | Value |
|-------|-------|
| **Purpose** | Evidence cost must decrease as products scale |
| **Inputs** | Per-product metrics: Claims count, New EV count |
| **Validation** | Calculate MK-01 (Claims/NewEV). Must not decrease compared to previous product in same wave. |
| **Failure** | MK-01 decreases significantly (>20%) |
| **Severity** | Medium |
| **Blocking** | Warning only — trend monitoring |

### GR-011: Knowledge Quality Preservation

| Field | Value |
|-------|-------|
| **Purpose** | Reducing new EV must not reduce quality |
| **Inputs** | KQI components: Evidence Quality, Confidence, Traceability |
| **Validation** | Calculate KQI for new product. Must not decrease compared to baseline. |
| **Failure** | KQI decreases |
| **Severity** | High |
| **Blocking** | Warning only |

### GR-012: Historical Consistency Preservation

| Field | Value |
|-------|-------|
| **Purpose** | No deleted history — SupersededBy must link |
| **Inputs** | Historical HC-IDs, DEC-IDs, Claim history |
| **Validation** | (1) Every historical contradiction has HC-ID. (2) No deleted Claims — SupersededBy chain exists. (3) Timeline rebuildable from log. |
| **Failure** | Missing HC-ID or broken SupersededBy chain |
| **Severity** | High |
| **Blocking** | Yes |

### GR-013: Governance Conflict Preservation

| Field | Value |
|-------|-------|
| **Purpose** | Conflicting facts across dimensions must be preserved independently |
| **Inputs** | Claims across different dimensions for same product |
| **Validation** | For each product with dimensional conflicts (e.g., L3 in docs vs L5 in code): check that ALL conflicting claims are preserved. No claim deleted to hide conflict. |
| **Failure** | Dimensional conflict claim deleted |
| **Severity** | Critical |
| **Blocking** | Yes |

## 3. Rule Execution Order

```
Phase 1: Structural (GR-001, GR-002) — no entity resolution needed
Phase 2: Identity (GR-003, GR-004, GR-005) — requires product list
Phase 3: Integrity (GR-006, GR-007, GR-008) — requires full entity resolution
Phase 4: Pattern (GR-009, GR-010, GR-011) — requires metrics
Phase 5: Historical (GR-012, GR-013) — requires full history
```

## 4. Rule Engine Interface

```typescript
interface RuleEngine {
  execute(context: GovernanceContext): Promise<RuleEngineReport>;
}

interface RuleEngineReport {
  rules: RuleResult[];       // GR-001 to GR-013
  summary: {
    passed: number;
    failed: number;
    warned: number;
    blocked: boolean;
    blockReasons: string[];
  };
  timestamp: string;
  baselineVersion: string;  // M2 v1.2
}

interface RuleResult {
  ruleId: string;           // GR-001
  name: string;             // Immutable IDs Rule
  status: 'pass' | 'fail' | 'warn' | 'error';
  severity: 'critical' | 'high' | 'medium' | 'low';
  findings: Finding[];
  duration: number;         // ms
}
```
