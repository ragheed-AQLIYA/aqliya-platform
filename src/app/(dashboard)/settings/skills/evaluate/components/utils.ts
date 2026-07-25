export function scoreColor(score: number, threshold: number): string {
  if (score >= threshold) return "text-green-600 dark:text-green-400";
  if (score >= threshold * 0.7) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function levelLabel(level: number): string {
  return `L${level}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
