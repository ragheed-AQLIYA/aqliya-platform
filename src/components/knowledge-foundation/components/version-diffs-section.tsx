"use client";

interface DiffEntry {
  id: string;
  toVersion: { id: string; versionNumber: string };
  riskScore: number;
  breakingChange: boolean;
  summary: string | null;
  generatedAt: string;
}

interface Props {
  diffsAsFrom?: DiffEntry[];
}

export function VersionDiffsSection({ diffsAsFrom }: Props) {
  if (!diffsAsFrom || diffsAsFrom.length === 0) return null;

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">الفروقات (كنقطة بداية)</h3>
      {diffsAsFrom.map((d) => (
        <div
          key={d.id}
          className="mb-2 rounded-lg border bg-muted/30 p-3 text-sm"
        >
          <p>
            إلى v{d.toVersion.versionNumber}
            {d.breakingChange && (
              <span className="mr-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                تغيير جذري
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {d.summary ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            خطورة: {d.riskScore} · {new Date(d.generatedAt).toLocaleDateString("ar-SA")}
          </p>
        </div>
      ))}
    </section>
  );
}
