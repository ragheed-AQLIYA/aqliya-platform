# SPEC-GOV-06: CI Integration

> **Engineering Specification** | **GitHub Actions**

---

## 1. Pipeline Integration

```
PR Created → Governance Validation → Build → Tests → Deploy
                │                        │        │        │
                ▼                        ▼        ▼        ▼
           Pre-merge gate           Quality  Coverage  Release
```

## 2. Required Sequence

```
Step 1: Governance Validation (MANDATORY GATE)
  aqliya-gov validate governance --format ci --strict
  → If FAIL: block merge, annotate PR

Step 2: Build
  npm run build
  → If FAIL: block merge

Step 3: Tests
  npm test
  → If FAIL: block merge

Step 4: Deploy (after merge)
  npm run build && npm run start
```

## 3. GitHub Actions Workflow

```yaml
name: Governance Gate
on: [pull_request]

jobs:
  governance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      
      - name: Validate Governance
        run: npx aqliya-gov validate governance --format ci --strict
      
      - name: Validate Freeze Compliance
        run: npx aqliya-gov validate freeze --format ci
      
      - name: Check Freshness
        run: npx aqliya-gov validate freshness --format ci
      
      - name: Generate Reports
        run: npx aqliya-gov generate all --force
      
      - name: Upload Governance Report
        uses: actions/upload-artifact@v4
        with:
          name: governance-report
          path: docs/governance/evidence-catalog/
      
      - name: Post PR Comment
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const output = process.env.GOVERNANCE_OUTPUT;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Governance Validation Result\n\n${output}`
            });
```

## 4. Pre-merge Gate Configuration

```yaml
# .github/gov-config.yml
governance:
  strict: true
  rules:
    - GR-001  # Immutable IDs — blocking
    - GR-002  # Derived Artifacts — blocking
    - GR-003  # Evidence Manifest — blocking
    - GR-004  # Glossary Precision — warning
    - GR-005  # Three-tier Review — blocking
    - GR-006  # Decision Preconditions — blocking
    - GR-007  # Evidence Independence — blocking
    - GR-008  # Shared Evidence — blocking
    - GR-009  # Capability Evidence — blocking
    - GR-010  # Marginal Efficiency — warning
    - GR-011  # Quality Preservation — warning
    - GR-012  # Historical Consistency — blocking
    - GR-013  # Conflict Preservation — blocking
  
  exceptions:
    - rule: GR-004
      path: "docs/archive/**"
      reason: "Archived docs may contain historical terminology"
```

## 5. Pre-release Gate

```yaml
name: Pre-release Governance Audit
on:
  release:
    types: [prereleased]

jobs:
  governance-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Full Governance Audit
        run: npx aqliya-gov audit --scope all --output governance-audit.json
      
      - name: Check Blocking Issues
        run: |
          if jq -e '.summary.blocking == true' governance-audit.json; then
            echo "Blocking governance issues found"
            exit 1
          fi
      
      - name: Attach Audit Report
        uses: actions/upload-artifact@v4
        with:
          name: governance-audit
          path: governance-audit.json
```

## 6. Build Gate Contract

```
Governance validation must complete before:
  - npm run build
  - npm test
  - npm run deploy

Governance failure must:
  - Block the merge
  - Annotate the PR with details
  - Suggest fixes
```

## 7. Monitoring & Metrics

Every CI run produces:
- Governance status (pass/fail)
- Rule-by-rule results
- Freshness metrics
- Integrity scores
- Coverage changes
- Timing (should be <30s for full validation)
