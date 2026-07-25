import { UserPlus } from "lucide-react";

export function MembershipHeader({
  clientName,
  showAdd,
  onToggleAdd,
}: {
  clientName: string;
  showAdd: boolean;
  onToggleAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-sm font-semibold">العضويات</h2>
        <p className="text-[10px] text-muted-foreground">{clientName}</p>
      </div>
      <button
        onClick={onToggleAdd}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
      >
        <UserPlus className="h-3.5 w-3.5" />
        إضافة عضو
      </button>
    </div>
  );
}
