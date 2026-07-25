"use client";
import { useMemo, useCallback } from "react";

interface TaskCountItem {
  status: string;
  _count: number;
}

export interface UseAssistantData {
  taskCounts: TaskCountItem[];
}

export function useAssistantStats(data: UseAssistantData) {
  const totalTasks = useMemo(
    () => data.taskCounts.reduce((sum, c) => sum + c._count, 0),
    [data.taskCounts],
  );

  const getCount = useCallback(
    (status: string) =>
      data.taskCounts.find((c) => c.status === status)?._count || 0,
    [data.taskCounts],
  );

  return { totalTasks, getCount };
}
