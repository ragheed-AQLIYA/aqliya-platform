"use client";

export function WorkflowRecordDescription({
  description,
}: {
  description?: string | null;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-sm font-semibold mb-2">الوصف</h2>
      {description ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {description}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground/50">لا يوجد وصف</p>
      )}
    </div>
  );
}
