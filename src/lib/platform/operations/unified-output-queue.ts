export async function registerOutputQueueEntry(
  _entry: Record<string, unknown>,
): Promise<string> {
  return `queue-${Date.now()}`;
}
