const MAX_HISTORY = 100;

export interface RunHistoryEntry {
  id: string;
  startedAt: string;
  completedAt: string;
  totalAffected: number;
  durationMs: number;
  triggeredBy: string;
}

const store: RunHistoryEntry[] = [];

export function getHistory(): RunHistoryEntry[] {
  return [...store].reverse();
}

export function addHistory(entry: RunHistoryEntry): void {
  store.push(entry);
  if (store.length > MAX_HISTORY) {
    store.splice(0, store.length - MAX_HISTORY);
  }
}
