import { RegistryLoader } from '../registry/loader';
import type { GovernanceRegistries } from '../types/entities';

export const DEFAULT_SCOPE = '../../../../docs/governance/';

export interface LoadResult {
  registries: GovernanceRegistries;
  exitCode: number;
}

export async function loadRegistries(
  scope?: string,
): Promise<LoadResult> {
  const loader = new RegistryLoader();
  try {
    const registries = await loader.load(scope ?? DEFAULT_SCOPE);
    return { registries, exitCode: 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`Failed to load registries: ${message}\n`);
    return { registries: null as unknown as GovernanceRegistries, exitCode: 2 };
  }
}
