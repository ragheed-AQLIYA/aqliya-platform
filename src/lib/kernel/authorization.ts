/**
 * Kernel-level bridge for authorization.
 *
 * Re-exports the `enforce` and `isAllowed` action guards from the
 * authorization module so consumers import from the kernel layer.
 *
 * The kernel Policy contract (IPolicyEngine) provides lower-level
 * `authorize()` and `checkPermission()` for DI-based access.
 * These sync wrappers provide the higher-level server action guard.
 */
export { enforce, isAllowed } from "@/lib/authorization/action-guard";
