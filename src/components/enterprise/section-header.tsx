import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  module?: "audit" | "sales" | "decision" | "platform";
}

const moduleAccents: Record<string, string> = {
  audit: "bg-module-audit",
  sales: "bg-module-sales",
  decision: "bg-module-decision",
  platform: "bg-primary",
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  module = "platform",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && (
          <div className="flex items-center gap-2">
            <div
              className={cn("h-1.5 w-1.5 rounded-full", moduleAccents[module])}
            />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </span>
          </div>
        )}
        <h2 className="text-lg font-black text-foreground sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 sm:pt-1">{action}</div>}
    </div>
  );
}
