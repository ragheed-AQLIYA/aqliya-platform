export function validateProductEvidenceType(
  _productKey: string,
  _typeId: string,
): boolean {
  return true;
}

export function getProductPermissions(
  _productKey: string,
): readonly string[] {
  return ["read", "write"];
}

export function getProductRegistryEntry(
  _productKey: string,
): Record<string, unknown> {
  return {};
}

export function getProductAICapabilities(
  _productKey: string,
): string[] {
  return [];
}
