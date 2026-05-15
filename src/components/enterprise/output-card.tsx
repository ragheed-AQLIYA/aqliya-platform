import { cn } from "@/lib/utils";

interface OutputCardProps {
  title: string;
  items: string[];
  className?: string;
}

export function OutputCard({ title, items, className }: OutputCardProps) {
  return (
    <div
      className={cn(
        "rounded-[24px] border border-border/70 bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm",
        className,
      )}
    >
      <h3 className="mb-4 text-lg font-black text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="rounded-full border border-primary/10 bg-primary/[0.04] px-3.5 py-2 text-xs font-medium text-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
