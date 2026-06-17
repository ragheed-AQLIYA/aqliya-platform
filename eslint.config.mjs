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
    "src/lib/platform-audit.ts",
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
  ]),
]);

export default eslintConfig;
