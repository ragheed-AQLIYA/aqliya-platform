// ─── App Bootstrap — Run Once at Module Import ───
// Registers all provider factories and starts the health runtime.
// Imported by the root layout to ensure early initialization.

import "server-only";

let initialized = false;

/**
 * Initialize all platform services.
 * Safe to call multiple times — runs only once.
 */
export async function bootstrap(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const startMs = Date.now();

  try {
    // 1. Register all known provider factories into ProviderRegistry
    const { registerAllFactories } = await import(
      "@/lib/integration/factory-registry"
    );
    registerAllFactories();

    // 2. Start the integration health runtime
    const { getHealthRuntime } = await import(
      "@/lib/integration/health-runtime"
    );
    getHealthRuntime().start();

    const elapsed = Date.now() - startMs;
    console.log(`[Bootstrap] Platform initialized in ${elapsed}ms`);
  } catch (err) {
    console.error(
      "[Bootstrap] Initialization failed:",
      err instanceof Error ? err.message : String(err),
    );
    // Bootstrap failure should not crash the app
  }
}
