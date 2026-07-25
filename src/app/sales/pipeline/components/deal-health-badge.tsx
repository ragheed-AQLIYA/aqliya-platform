import { cn } from "@/lib/utils";

const LEVEL_STYLES: Record<string, string> = {
  HEALTHY: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  WATCH: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  AT_RISK: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
};

const LEVEL_LABELS: Record<string, string> = {
  HEALTHY: "سليم",
  WATCH: "مراقبة",
  AT_RISK: "عالي المخاطر",
};

export function DealHealthBadge({
  healthLevel,
  score,
}: {
  healthLevel: string;
  score: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        LEVEL_STYLES[healthLevel] ?? LEVEL_STYLES.AT_RISK
      )}
      title={`الدرجة: ${score}/100`}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          healthLevel === "HEALTHY"
            ? "bg-emerald-500"
            : healthLevel === "WATCH"
              ? "bg-amber-500"
              : "bg-red-500"
        )}
      />
      {LEVEL_LABELS[healthLevel] ?? healthLevel}
    </span>
  );
}
