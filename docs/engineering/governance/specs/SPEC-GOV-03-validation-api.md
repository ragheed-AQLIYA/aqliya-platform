# SPEC-GOV-03: Validation API

> **Engineering Specification** | **CLI + CI Integration Contract**

---

## 1. API Functions

### validateClaims()

```
Input:
  - Optional filter: product, dimension, confidence, status
  - Optional scope: all, wave, product

Output:
  - Total claims
  - Completeness distribution (100%, ≥80%, <80%)
  - Claims with no evidence (orphans)
  - Claims with no authority (orphans)
  - Dimension coverage per product

Exit codes:
  0 — all claims valid
  1 — orphan claims found
  2 — completeness <80% found
```

### validateEvidence()

```
Input:
  - Optional filter: tier, product, quality
  - Optional scope: all, wave, product

Output:
  - Total evidence items
  - Tier distribution (T1–T7)
  - Quality distribution (Strong/Moderate/Weak)
  - Evidence with no claims (orphans)  
  - Freshness status (fresh/expiring/expired)

Exit codes:
  0 — all evidence valid
  1 — orphan evidence
  2 — expired evidence
```

### validateProducts()

```
Input:
  - Optional filter: type, status, intent

Output:
  - Total products
  - Entity type distribution
  - Missing KA assignments
  - Missing AUTH assignments
  - Products without manifests
  - Products without dossiers

Exit codes:
  0 — all products valid
  1 — products with missing KA/AUTH
  2 — products without required artifacts
```

### validateAuthorities()

```
Input:
  - Optional filter: knowledgeArea

Output:
  - Total authorities
  - Products without authority
  - Claims without authority
  - Duplicate authorities

Exit codes:
  0 — all authorities valid
  1 — orphan products
  2 — duplicate authorities
```

### validateRelationships()

```
Input:
  - Relationship IDs to check (C01–C21)

Output:
  - Per-relationship status
  - Broken relationships
  - Cardinality violations

Exit codes:
  0 — all relationships valid
  1 — relationship violations
```

### validateIntegrity()

```
Input:
  - Optional scope: product

Output:
  - Integrity score per product
  - Broken chains (Claim→Evidence→Source→Document)
  - Circular dependencies
  - Missing freshness

Exit codes:
  0 — integrity OK
  1 — integrity < 100%
```

### validateFreshness()

```
Input:
  - Threshold days (default: 90)

Output:
  - Fresh items
  - Expiring items (≤30 days)
  - Expired items

Exit codes:
  0 — all fresh
  1 — expiring items
  2 — expired items
```

### validateFreeze()

```
Input:
  - Baseline version (default: M2 v1.2)

Output:
  - Freeze compliance status
  - Violations (entity changes, relationship changes, rule changes)
  - ADR coverage for exceptions

Exit codes:
  0 — freeze maintained
  1 — freeze violation detected
```

### validateDecisions()

```
Input:
  - Optional filter: type, product, status

Output:
  - Total decisions
  - Preconditions met per MAT decision
  - Stale decisions (review date passed)

Exit codes:
  0 — all valid
  1 — precondition failures
  2 — stale decisions
```

### validateGovernance()

```
Input:
  - Optional scope: full, quick, product

Output:
  - Execution of all 13 GR rules
  - Per-rule results
  - Blocking failures
  - Warning summary

Exit codes:
  0 — governance OK
  1 — governance violations
  2 — blocking violations
```

## 2. Response Models

```typescript
interface ValidationResponse {
  status: 'pass' | 'fail' | 'warn' | 'error';
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  results: ValidationResult[];
  metadata: {
    duration: number;
    timestamp: string;
    engineVersion: string;
    baselineVersion: string;
  };
}

interface ValidationResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'error';
  severity: 'critical' | 'high' | 'medium' | 'low';
  details: string;
  findings: string[];
  suggestedFix?: string;
}
```

## 3. Error Model

```typescript
interface ValidationError {
  code: string;
  message: string;
  entityType?: string;
  entityId?: string;
  severity: 'error' | 'warning' | 'info';
  blocking: boolean;
}
```

## 4. Request Models

```typescript
interface ValidationRequest {
  scope: 'all' | 'wave1' | 'wave2' | 'wave3' | 'product';
  productId?: string;
  rules?: string[];           // specific GRs to check
  format: 'cli' | 'json' | 'ci';
  verbose: boolean;
  strict: boolean;            // warnings become errors
}
```
