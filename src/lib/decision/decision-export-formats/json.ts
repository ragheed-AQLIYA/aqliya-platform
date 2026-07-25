import type { ExportData } from "./types";

export function formatExportJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}
