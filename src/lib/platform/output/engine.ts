export function getOutputsByProduct(
  _productKey: string,
): { id: string; labelEn?: string; labelAr?: string }[] {
  return [];
}

export function getRequiredApprovalForOutput(
  _productSlug: string,
  _outputTypeId: string,
): boolean {
  return false;
}
