/**
 * Backward-compatible re-export.
 *
 * ContentStudio domain logic moved to @/lib/content-studio/ (2026-07-12)
 * per ADR-003 and Wave B-1 refactoring.
 *
 * ContentStudio is a standalone Operational Content Workspace,
 * NOT a subsystem of LocalContentOS.
 *
 * New code should import from @/lib/content-studio/ directly.
 * This re-export is preserved for existing importers during migration.
 */

export * from "@/lib/content-studio/types";
export * from "@/lib/content-studio/contracts";
export * from "@/lib/content-studio/services";
export * from "@/lib/content-studio/workflow";
export * from "@/lib/content-studio/evidence";
export * from "@/lib/content-studio/review";
export * from "@/lib/content-studio/outputs";
export * from "@/lib/content-studio/ai";
export * from "@/lib/content-studio/permissions";
export {
  getContentRepository,
  resetContentRepositoryForTests,
  reloadContentRepositoryInstance,
  configureContentRepositoryBackend,
  getContentRepositoryBackend,
  describeContentRepositoryBackend,
  resolveContentRepositoryBackend,
} from "@/lib/content-studio/repository-instance";
export {
  assertTenantOrganizationId,
  assertContentItemInOrganization,
  assertCampaignInOrganization,
  assertSourceInOrganization,
} from "@/lib/content-studio/tenant-scope";
export type { ContentStudioRepository } from "@/lib/content-studio/repository-interface";
