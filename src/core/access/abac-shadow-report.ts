/**
 * ABAC Shadow Report — re-export from Intelligence Core.
 *
 * Path migration: @/core/access/* → @/lib/core/policy/access/*
 * Canonical implementation lives at @/lib/core/policy/access/abac-shadow-report.
 */
export {
  getAbacShadowMismatchReport,
  AbacShadowReport,
  type AbacShadowMismatchRow,
  type AbacShadowMismatchReport,
} from "@/lib/core/policy/access/abac-shadow-report";
