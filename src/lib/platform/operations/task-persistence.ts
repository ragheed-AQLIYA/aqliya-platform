import type { TaskCenterItem } from "./task-center";

const TASK_PERSISTENCE_ENABLED = false;

export function isTaskFilePersistenceEnabled(): boolean {
  return TASK_PERSISTENCE_ENABLED;
}

export async function loadTaskSnapshot(): Promise<{
  organizations?: Record<string, TaskCenterItem[]>;
} | null> {
  return null;
}

export async function saveTaskSnapshot(
  _organizations: Record<string, TaskCenterItem[]>,
): Promise<void> {
}
