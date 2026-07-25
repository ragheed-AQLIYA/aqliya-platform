"use client";

export function InstitutionalLearningEvidenceList({
  entityId,
  evidenceMap,
}: {
  entityId: string;
  evidenceMap: Record<string, string[]>;
}) {
  const items = evidenceMap[entityId] ?? [];
  if (items.length === 0) {
    return <p className="text-[10px] text-muted-foreground">لا أدلة مسجلة</p>;
  }
  return (
    <ul className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
      {items.slice(0, 3).map((item) => (
        <li key={`${entityId}-${item}`} className="truncate">
          · {item}
        </li>
      ))}
    </ul>
  );
}
