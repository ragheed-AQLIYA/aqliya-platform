import { cn } from "@/lib/utils";

interface SectionEyebrowProps {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SectionEyebrow({
  label,
  title,
  description,
  align = "center",
  className,
}: SectionEyebrowProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-3xl",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-gradient-to-r from-primary/10 to-aqliya-cyan/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
        {label}
      </span>
      <h2 className="mt-5 text-2xl font-black leading-tight tracking-tight text-balance sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}
