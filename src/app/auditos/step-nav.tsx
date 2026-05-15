import Link from "next/link";

const steps = [
  "/auditos",
  "/auditos/trial-balance",
  "/auditos/mapping",
  "/auditos/statements",
  "/auditos/evidence",
  "/auditos/traceability",
];

export function StepNav({
  current,
  label,
}: {
  current: string;
  label?: string;
}) {
  const idx = steps.indexOf(current);
  const prev = idx > 0 ? steps[idx - 1] : null;
  const next = idx < steps.length - 1 ? steps[idx + 1] : null;

  return (
    <nav
      className="mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
      aria-label="التنقل بين خطوات AuditOS"
    >
      <div className="w-full sm:w-auto">
        {prev && (
          <Link
            href={prev}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:w-auto"
          >
            ← المرحلة السابقة
          </Link>
        )}
      </div>
      <span className="text-center text-xs text-muted-foreground">
        {label ?? `${idx + 1} / ${steps.length}`}
      </span>
      <div className="w-full sm:w-auto">
        {next && (
          <Link
            href={next}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
          >
            المرحلة التالية ←
          </Link>
        )}
      </div>
    </nav>
  );
}
