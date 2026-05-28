"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ActionResult = { ok: boolean; error?: string; code?: string };

type DeleteAction = (
  projectId: string,
  entityId: string,
) => Promise<ActionResult>;

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  }
  return error || "تعذر إكمال الحذف";
}

export function LocalContentDeleteButton({
  projectId,
  entityId,
  entityLabel,
  action,
  confirmText,
  buttonLabel = "حذف",
}: {
  projectId: string;
  entityId: string;
  entityLabel: string;
  action: DeleteAction;
  confirmText?: string;
  buttonLabel?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      confirmText ||
        `سيتم حذف ${entityLabel} من هذا المشروع. لا يمكن التراجع عن هذا الإجراء.`,
    );

    if (!confirmed) return;

    setPending(true);
    setError(null);

    try {
      const result = await action(projectId, entityId);
      if (!result.ok) {
        setError(formatActionError(result.error ?? "", result.code));
        return;
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إكمال الحذف");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={handleDelete}
        className="gap-1"
      >
        <Trash2 className="h-4 w-4" />
        {pending ? "جارٍ الحذف..." : buttonLabel}
      </Button>
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}
