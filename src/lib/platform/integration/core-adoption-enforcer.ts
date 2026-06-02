export function enforceCoreOnMutation(input: {
  productSlug: string;
  operation: string;
}): void {
  if (!input.productSlug) {
    throw new Error("core-adoption-enforcer: productSlug is required");
  }
}
