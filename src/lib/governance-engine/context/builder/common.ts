// Governance Engine — Execution Context Builder — Shared Helpers

export function sortIds<T extends { id: string }>(items: T[]): string[] {
  return items.map(i => i.id).sort((a, b) => a.localeCompare(b));
}
