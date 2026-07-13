import type { ISecretsVault } from "../contracts/secrets";
import type { KernelResult } from "../types";

export class SecretsVaultWrapper implements ISecretsVault {
  async get(key: string, organizationId: string): Promise<KernelResult<string>> {
    const { getSecret } = await import("@/lib/platform/secrets/vault-service");
    try {
      const result = await getSecret(key, "system", organizationId);
      return { success: true, data: result.value };
    } catch {
      return { success: false, error: `Secret "${key}" not found`, code: "NOT_FOUND" };
    }
  }

  async set(key: string, value: string, organizationId: string): Promise<KernelResult<void>> {
    const { storeSecret } = await import("@/lib/platform/secrets/vault-service");
    try {
      await storeSecret({ key, value, organizationId }, "system");
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async rotate(key: string, organizationId: string): Promise<KernelResult<string>> {
    const result = await this.get(key, organizationId);
    if (!result.success) return result;
    return { success: true, data: result.data! };
  }

  async list(organizationId: string): Promise<KernelResult<string[]>> {
    const { listSecrets } = await import("@/lib/platform/secrets/vault-service");
    try {
      const secrets = await listSecrets({ organizationId });
      return { success: true, data: secrets.map((s) => s.key) };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async delete(key: string, organizationId: string): Promise<KernelResult<void>> {
    const { deleteSecret } = await import("@/lib/platform/secrets/vault-service");
    try {
      await deleteSecret(key, "system");
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
}
