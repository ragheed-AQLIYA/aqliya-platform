import type {
  SalesNbaSnoozePreset,
  SalesNbaUiState,
  SalesNextBestActionItem,
} from "./types";

export const NBA_SNOOZE_HOURS: Record<SalesNbaSnoozePreset, number> = {
  "1d": 24,
  "3d": 72,
  "1w": 168,
};

export function snoozeUntilFromPreset(
  preset: SalesNbaSnoozePreset,
  fromMs = Date.now(),
): string {
  const hours = NBA_SNOOZE_HOURS[preset];
  return new Date(fromMs + hours * 60 * 60 * 1000).toISOString();
}

export function isNbaUiStateActive(
  state: SalesNbaUiState | undefined,
  nowMs = Date.now(),
): boolean {
  if (!state) return false;
  if (state.disposition === "dismissed") return true;
  if (state.disposition === "snoozed" && state.snoozedUntil) {
    return new Date(state.snoozedUntil).getTime() > nowMs;
  }
  return false;
}

export function filterNextBestActionsByUiState(
  actions: SalesNextBestActionItem[],
  states: Iterable<SalesNbaUiState>,
  nowMs = Date.now(),
): SalesNextBestActionItem[] {
  const byKey = new Map<string, SalesNbaUiState>();
  for (const state of states) {
    byKey.set(state.actionKey, state);
  }
  return actions.filter((action) => !isNbaUiStateActive(byKey.get(action.id), nowMs));
}
