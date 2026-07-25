"use client";

interface DateField {
  label: string;
  value: Date | null | undefined;
}

export function WorkflowRecordTimeline({ record }: { record: { createdAt: Date; submittedAt?: Date | null; approvedAt?: Date | null; archivedAt?: Date | null } }) {
  const dateFields: DateField[] = [
    { label: "تاريخ الإنشاء", value: record.createdAt },
    { label: "تاريخ الإرسال", value: record.submittedAt },
    { label: "تاريخ الاعتماد", value: record.approvedAt },
    { label: "تاريخ الأرشفة", value: record.archivedAt },
  ].filter((f) => f.value);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-sm font-semibold mb-3">التواريخ</h2>
      <div className="grid grid-cols-2 gap-3">
        {dateFields.map((f) => (
          <div key={f.label}>
            <span className="block text-[10px] text-muted-foreground">
              {f.label}
            </span>
            <span className="text-sm">
              {new Date(f.value!).toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
