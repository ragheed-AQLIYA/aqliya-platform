import type { KernelResult } from "../types";

export interface SecretValue {
  key: string;
  value: string;
  metadata?: Record<string, unknown>;
}

export interface ISecretsVault {
  get(key: string, organizationId: string): Promise<KernelResult<string>>;
  set(key: string, value: string, organizationId: string): Promise<KernelResult<void>>;
  rotate(key: string, organizationId: string): Promise<KernelResult<string>>;
  list(organizationId: string): Promise<KernelResult<string[]>>;
  delete(key: string, organizationId: string): Promise<KernelResult<void>>;
}
