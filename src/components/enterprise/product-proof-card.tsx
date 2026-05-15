import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductProofCardProps {
  title: string;
  problem: string;
  system: string;
  output: string;
  flow: string[];
  href: string;
  note?: string;
  className?: string;
}

export function ProductProofCard({
  title,
  problem,
  system,
  output,
  flow,
  href,
  note,
  className,
}: ProductProofCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-background via-background to-muted/20 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_50px_-18px_rgba(37,99,235,0.28)]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-aqliya-cyan/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="border-b bg-gradient-to-r from-muted/40 to-transparent px-5 py-4">
        <div className="mb-3 inline-flex rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
          خط نظام
        </div>
        <h3 className="text-base font-bold leading-7 text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col space-y-4 p-5 sm:p-6">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-destructive/75">
            الفجوة الحالية
          </span>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {problem}
          </p>
        </div>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/75">
            كيف يعالجها النظام
          </span>
          <p className="mt-1.5 text-sm leading-6 text-foreground">{system}</p>
        </div>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600/75">
            القيمة الناتجة
          </span>
          <p className="mt-1.5 text-sm leading-6 text-foreground">{output}</p>
        </div>

        <div className="mt-auto rounded-xl border border-border/60 bg-muted/20 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            سلسلة التشغيل
          </p>
          <div className="flex flex-wrap items-center gap-1">
            {flow.map((step, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="rounded-md bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground shadow-sm">
                  {step}
                </span>
                {i < flow.length - 1 && (
                  <svg
                    className="h-2 w-2 text-muted-foreground/40 rtl:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {note && (
          <p className="border-t border-dashed pt-3 text-xs leading-6 text-muted-foreground/90">
            {note}
          </p>
        )}
      </div>
    </Link>
  );
}
