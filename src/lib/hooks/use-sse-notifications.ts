"use client";

import { useState, useEffect } from "react";

export type NotificationItem = {
  id: string;
  productKey: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

type SSEState = {
  notifications: NotificationItem[];
  counts: { critical: number; warning: number; info: number };
  connected: boolean;
  error: string | null;
};

export function useSSENotifications(): SSEState {
  const [state, setState] = useState<SSEState>({
    notifications: [],
    counts: { critical: 0, warning: 0, info: 0 },
    connected: false,
    error: null,
  });

  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onopen = () => {
      setState((prev) => ({ ...prev, connected: true, error: null }));
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setState((prev) => ({
          ...prev,
          notifications: data.notifications ?? [],
          counts: data.counts ?? { critical: 0, warning: 0, info: 0 },
          connected: true,
          error: null,
        }));
      } catch {
        // ignore parse errors
      }
    };

    eventSource.addEventListener("update", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setState((prev) => ({
          ...prev,
          notifications: data.notifications ?? [],
          counts: data.counts ?? { critical: 0, warning: 0, info: 0 },
          connected: true,
          error: null,
        }));
      } catch {
        // ignore parse errors
      }
    });

    eventSource.onerror = () => {
      setState((prev) => ({
        ...prev,
        connected: false,
        error: "انقطع الاتصال. جاري إعادة المحاولة...",
      }));
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return state;
}
