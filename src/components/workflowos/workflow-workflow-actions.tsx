"use client";

import { useState } from "react";
import {
  workflow_submitRecord,
  workflow_approveRecord,
  workflow_returnRecord,
  workflow_archiveRecord,
} from "@/actions/workflowos-actions";
import { Loader2, Send, CheckCircle2, Undo2, Archive, Ban } from "lucide-react";

type WorkflowUserRole = "PlatformAdmin" | "Operator" | "Reviewer";

interface WorkflowAction {
  key: string;
  label: string;
  icon: React.ElementType;
  variant: "primary" | "warning" | "danger" | "ghost";
  allowed: boolean;
  disabledReason?: string;
}

export function WorkflowWorkflowActions({
  clientId,
  recordId,
  status,
  userRole,
  onActionComplete,
}: {
  clientId: string;
  recordId: string;
  status: string;
  userRole: WorkflowUserRole;
  onActionComplete: () => void;
}) {
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [showReturnForm, setShowReturnForm] = useState(false);

  const isAdmin = userRole === "PlatformAdmin";
  const isOperator = userRole === "Operator";
  const isReviewer = userRole === "Reviewer" || isAdmin;

  const actions: WorkflowAction[] = [
    {
      key: "submit",
      label: "إرسال للمراجعة",
      icon: Send,
      variant: "primary",
      allowed: status === "Draft" && (isOperator || isAdmin),
    },
    {
      key: "approve",
      label: "اعتماد",
      icon: CheckCircle2,
      variant: "primary",
      allowed: status === "UnderReview" && isReviewer,
    },
    {
      key: "return",
      label: "إرجاع",
      icon: Undo2,
      variant: "warning",
      allowed: status === "UnderReview" && isReviewer,
    },
    {
      key: "archive",
      label: "أرشفة",
      icon: Archive,
      variant: "ghost",
      allowed: status === "Approved" && isAdmin,
    },
  ];

  async function handleAction(key: string) {
    setAction(key);
    setError(null);

    let result: { success: boolean; error?: string };
    switch (key) {
      case "submit":
        result = await workflow_submitRecord(clientId, recordId);
        break;
      case "approve":
        result = await workflow_approveRecord(clientId, recordId);
        break;
      case "return":
        result = await workflow_returnRecord(
          clientId,
          recordId,
          returnNotes || undefined,
        );
        break;
      case "archive":
        result = await workflow_archiveRecord(clientId, recordId);
        break;
      default:
        result = { success: false, error: "إجراء غير معروف" };
    }

    setAction(null);
    setShowReturnForm(false);
    setReturnNotes("");

    if (result.success) {
      onActionComplete();
    } else {
      setError(result.error ?? "حدث خطأ أثناء تنفيذ الإجراء");
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-status-error/10 p-3 text-xs text-status-error">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          if (!a.allowed && status !== "Archived") {
            return (
              <button
                key={a.key}
                disabled
                className="inline-flex items-center gap-2 rounded-lg border bg-muted px-3 py-2 text-xs text-muted-foreground/50 cursor-not-allowed"
                title={a.disabledReason ?? "غير مسموح بهذا الإجراء"}
              >
                <Ban className="h-3.5 w-3.5" />
                {a.label}
              </button>
            );
          }
          if (!a.allowed) return null;

          return (
            <div key={a.key}>
              {a.key === "return" && showReturnForm ? (
                <div className="flex items-center gap-2">
                  <input
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="ملاحظات الإرجاع..."
                    className="w-40 rounded-md border bg-background px-2 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => handleAction("return")}
                    disabled={action === "return"}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-status-warning px-3 py-1.5 text-xs font-medium text-white hover:bg-status-warning/90 disabled:opacity-50"
                  >
                    {action === "return" && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    تأكيد
                  </button>
                  <button
                    onClick={() => {
                      setShowReturnForm(false);
                      setReturnNotes("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (a.key === "return") {
                      setShowReturnForm(true);
                      return;
                    }
                    handleAction(a.key);
                  }}
                  disabled={action === a.key}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                    a.variant === "primary"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : a.variant === "warning"
                        ? "bg-status-warning text-white hover:bg-status-warning/90"
                        : a.variant === "ghost"
                          ? "border bg-background hover:bg-muted"
                          : "border bg-background hover:bg-muted"
                  }`}
                >
                  {action === a.key ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  {a.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
