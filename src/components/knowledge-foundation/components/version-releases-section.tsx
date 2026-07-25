"use client";

interface ReleaseEntry {
  id: string;
  releaseNotes: string | null;
  createdAt: string;
  createdBy?: { id: string; name: string | null } | null;
}

interface Props {
  releases?: ReleaseEntry[];
}

export function VersionReleasesSection({ releases }: Props) {
  if (!releases || releases.length === 0) return null;

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold">الإطلاقات</h3>
      {releases.map((r) => (
        <div
          key={r.id}
          className="mb-2 rounded-lg border bg-muted/30 p-3 text-sm"
        >
          <p className="font-medium">
            {new Date(r.createdAt).toLocaleDateString("ar-SA")}
          </p>
          {r.releaseNotes && (
            <p className="mt-1 text-xs text-muted-foreground">
              {r.releaseNotes}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            بواسطة: {r.createdBy?.name ?? r.createdBy?.id ?? "—"}
          </p>
        </div>
      ))}
    </section>
  );
}
