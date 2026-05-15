import Link from "next/link";
import { cn } from "@/lib/utils";

interface EnterpriseCTAProps {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export function EnterpriseCTA({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  align = "center",
  className,
}: EnterpriseCTAProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-4xl rounded-[28px] border border-border/70 bg-gradient-to-br from-background via-background to-primary/[0.03] p-6 shadow-sm sm:p-12",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        الخطوة التالية
      </p>
      <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
      <div
        className={cn(
          "mt-8 flex flex-wrap gap-4",
          align === "center" && "justify-center",
          align === "right" && "justify-start",
        )}
      >
        <Link
          href={primaryHref}
          className="btn-primary h-12 w-full px-8 text-base sm:w-auto"
        >
          {primaryLabel}
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="btn-outline h-12 w-full px-8 text-base sm:w-auto"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
