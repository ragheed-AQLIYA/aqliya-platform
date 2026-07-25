"use client";

export function ScoreBar({
  score,
  size = "md",
}: {
  score: number | null;
  size?: "sm" | "md" | "lg";
}) {
  if (score === null)
    return <span className="text-muted-foreground text-sm">—</span>;
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 50
        ? "bg-amber-500"
        : "bg-red-500";
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  return (
    <div className="flex items-center gap-2">
      <div className={`w-full ${h} rounded-full bg-gray-200`}>
        <div
          className={`${h} rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span
        className={`font-bold shrink-0 ${size === "sm" ? "text-xs" : "text-sm"}`}
      >
        {score}%
      </span>
    </div>
  );
}
