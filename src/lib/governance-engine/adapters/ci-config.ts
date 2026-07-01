export const GOVERNANCE_CI_WORKFLOW = `name: Governance Gate
on: [pull_request]
jobs:
  governance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - name: Validate Governance
        run: npx tsx src/lib/governance-engine/cli/index.ts validate governance --format ci --strict
      - name: Generate Reports
        run: npx tsx src/lib/governance-engine/cli/index.ts generate all --force
      - name: Check Freshness
        run: npx tsx src/lib/governance-engine/cli/index.ts validate freshness --format ci
`;

export const GOV_CONFIG_YAML = `governance:
  strict: true
  rules:
    GR-001: blocking
    GR-002: blocking
    GR-003: blocking
    GR-004: warning
    GR-005: blocking
    GR-006: blocking
    GR-007: blocking
    GR-008: blocking
    GR-009: blocking
    GR-010: warning
    GR-011: warning
    GR-012: blocking
    GR-013: blocking
`;
