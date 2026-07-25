import "server-only";
import type { SecretResolver } from "./common";
import { SecretResolverImpl, getResolverInstance } from "./implementation";

export {
  SecretPurpose,
  type SecretSource,
  type SecretResult,
  type SecretResolver,
  type GovernanceSecretEvent,
  type OperationalSecretEvent,
} from "./common";

export {
  invalidateSecretCache,
  getSecretCacheSize,
  clearSecretCache,
} from "./cache";

export {
  recordGovernanceEvent,
  emitTelemetryEvent,
} from "./governance";

/** Singleton SecretResolver instance. All integration credential reads flow through this. */
export const secretResolver: SecretResolver = getResolverInstance();
