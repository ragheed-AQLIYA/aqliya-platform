import { cn } from "@/lib/utils";

interface GuidedDemoPanelProps {
  title?: string;
  questions: string[];
  className?: string;
}

export function GuidedDemoPanel({
  title = "دليل الاستعراض",
  questions,
  className,
}: GuidedDemoPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
        {title}
      </h3>
      <ul className="space-y-3">
        {questions.map((q, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span className="text-sm leading-7 text-foreground">{q}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
