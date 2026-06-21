import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
  globalIgnores([
    // Build/output
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Non-TS root files
    "*.js",
    "*.mjs",

    // Non-source directories
    "docs/**",
    "knowledge-foundation/**",
    "archive/**",
    "backups/**",
    "prisma/**",
    "scripts/**",

    // Test files (linted separately if needed)
    "src/__tests__/**",
    "src/__mocks__/**",
    "**/*.test.ts",

    // Known noisy modules — suppress until targeted cleanup
    "src/components/audit/trial-balance/**",
    "src/components/audit/review/**",
    "src/components/audit/pilot/**",
    "src/components/decisions/**",
    "src/lib/recommendation/**",
    "src/lib/simulation/**",
    "src/lib/decision/**",
    "src/lib/platform/**",
    "src/lib/decision-type-config.ts",
    "src/actions/approval.ts",
    "src/actions/decisions.ts",
    "src/actions/decision-export.ts",
    "src/actions/decision-intelligence.ts",
    "src/actions/decision-learning.ts",
    "src/actions/decision-outcomes.ts",
    "src/actions/decision-sector.ts",
    "src/actions/decision-signals-alerts.ts",
    "src/actions/decision-templates.ts",
    "src/actions/simulation.ts",
    "src/actions/tender.ts",
    "src/app/(dashboard)/**",

    // SalesOS v02 intelligence layer — complex domain logic with intentional any
    "src/lib/sales/v02/**",
    "src/lib/sales/vnext/**",
    "src/lib/sales/prisma-repository.ts",
    "src/lib/sales/institutional-memory.ts",
    "src/lib/sales/reporting.ts",
    "src/lib/sales/seed-data.ts",
    "src/lib/sales/crm/**",

    // Integration adapters — external API responses require any
    "src/lib/integration/**",

    // LocalContent workbook AI — complex AI response parsing
    "src/lib/local-content/workbook/**",

    // Audit UI components — complex Prisma result shapes and action callbacks
    "src/components/audit/independence/**",
    "src/components/audit/quality/**",
    "src/components/audit/materiality/**",
    "src/components/audit/review-notes/**",
    "src/components/audit/knowledge/**",
    "src/components/audit/acceptance/**",
    "src/components/audit/evidence/**",
    "src/components/audit/factory-map/**",
    "src/components/audit/lead-schedules/**",
    "src/components/audit/notes/**",
    "src/components/audit/reconciliation/**",
    "src/components/audit/rules/**",
    "src/components/audit/statements/**",
    "src/components/monitoring/**",
    "src/components/sales/**",
    "src/components/workflowos/**",

    // Action bridge files — simplified types bridging forms to engine methods
    "src/actions/audit-review-notes-actions.ts",
    "src/actions/audit-working-papers-actions.ts",
    "src/actions/contact-export-actions.ts",
    "src/actions/contact-review-actions.ts",

    // App pages with complex server-action result shapes
    "src/app/local-content/outputs/**",
    "src/app/local-content/pilot-readiness/**",
    "src/app/local-content/projects/**/ai-advisor/**",
    "src/app/local-content/review-center/**",
    "src/app/local-content/settings/integrations/**",
    "src/app/local-content/workbook/**",
    "src/app/office-ai/advanced/**",
    "src/app/risk/**",
    "src/app/sales/**",
    "src/app/sampling/**",
    "src/app/settings/audit-bridge/**",
    "src/app/settings/organization/advanced/**",
    "src/app/settings/retention/**",

    // Auth providers — external OAuth shape mapping
    "src/lib/auth/sso-providers.ts",
  ]),
]);

export default eslintConfig;
