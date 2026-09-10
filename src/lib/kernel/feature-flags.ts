/**
 * Kernel-level sync bridge for feature flags.
 *
 * Re-exports the synchronous functions from the feature-flag registry
 * so consumers import from the kernel layer instead of the platform layer.
 *
 * The kernel contract (IFeatureFlagService) remains async for DI access,
 * but these sync wrappers are provided for server-side consumers that
 * need synchronous checks (e.g. in Server Actions, route handlers, engines).
 */
export { isEnabled, requireEnabled, getFlag } from "@/lib/platform/feature-flags/registry";
