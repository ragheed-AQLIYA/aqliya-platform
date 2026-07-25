"use client";

import { useReportWebVitals } from "next/web-vitals";
import { clientLogger } from "@/lib/observability/client-logger";

export function WebVitals() {
  useReportWebVitals((metric) => {
    clientLogger.info("Web vital", { name: metric.name, value: metric.rating, id: metric.id });
  });
  return null;
}
