export interface ProductCapability {
  key: string;
  name: string;
  description: string;
  version: string;
  requiredPermissions: string[];
  metadata?: Record<string, unknown>;
}

export interface ProductDefinition {
  key: string;
  name: string;
  description: string;
  status: string;
  version: string;
  routePrefix: string;
  requiresWorkspace: boolean;
  requiresTenant: boolean;
  requiredPermissions: string[];
  supportedLanguages: string[];
  capabilities: ProductCapability[];
}

export function defineProduct(definition: ProductDefinition): ProductDefinition {
  return definition;
}
