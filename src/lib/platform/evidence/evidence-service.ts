export async function registerEvidence(
  _input: unknown,
): Promise<{ id: string }> {
  return { id: `ev-${Date.now()}` };
}
