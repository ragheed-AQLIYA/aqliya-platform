import { Plus } from "lucide-react";

export function WorkflowClientListHeader({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold">العملاء</h2>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-3.5 w-3.5" />
        إنشاء عميل
      </button>
    </div>
  );
}
