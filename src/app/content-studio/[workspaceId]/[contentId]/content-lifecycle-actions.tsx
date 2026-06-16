"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, CheckCircle2, XCircle, Megaphone, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  submitForReviewAction,
  approveContentAction,
  rejectContentAction,
  publishContentAction,
  archiveContentAction,
} from "../../actions";

type ContentStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

interface ActionConfig {
  action: (id: string, extra?: string) => Promise<{ ok: boolean; error?: string }>;
  label: string;
  icon: typeof Send;
  variant: "default" | "secondary" | "destructive" | "outline";
  fromStatuses: ContentStatus[];
  needsReason?: boolean;
  needsNotes?: boolean;
  confirmLabel?: string;
}

const ACTIONS: ActionConfig[] = [
  {
    action: (id) => submitForReviewAction(id),
    label: "تقديم للمراجعة",
    icon: Send,
    variant: "secondary",
    fromStatuses: ["DRAFT"],
  },
  {
    action: (id, notes) => approveContentAction(id, notes),
    label: "اعتماد",
    icon: CheckCircle2,
    variant: "default",
    fromStatuses: ["IN_REVIEW"],
    needsNotes: true,
    confirmLabel: "اعتماد المحتوى",
  },
  {
    action: (id, reason) => rejectContentAction(id, reason ?? ""),
    label: "رفض",
    icon: XCircle,
    variant: "destructive",
    fromStatuses: ["IN_REVIEW"],
    needsReason: true,
    confirmLabel: "رفض المحتوى",
  },
  {
    action: (id) => publishContentAction(id),
    label: "نشر",
    icon: Megaphone,
    variant: "default",
    fromStatuses: ["APPROVED"],
  },
  {
    action: (id) => archiveContentAction(id),
    label: "أرشفة",
    icon: Archive,
    variant: "outline",
    fromStatuses: ["PUBLISHED"],
  },
];

export function ContentLifecycleActions({
  contentId,
  status,
  workspaceId,
}: {
  contentId: string;
  status: ContentStatus;
  workspaceId: string;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActionConfig | null>(null);
  const [extraValue, setExtraValue] = useState("");

  const triggerAction = useCallback(
    (action: ActionConfig) => {
      setActiveAction(action);
      setExtraValue("");
      setError(null);
      setDialogOpen(true);
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!activeAction) return;
    setLoading(true);
    setError(null);
    const result = await activeAction.action(contentId, extraValue || undefined);
    setLoading(false);
    if (result.ok) {
      setDialogOpen(false);
      router.refresh();
    } else {
      setError(result.error ?? "فشلت العملية");
    }
  }, [activeAction, contentId, extraValue, router]);

  const available = ACTIONS.filter((a) =>
    a.fromStatuses.includes(status),
  );

  if (available.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {available.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={() => triggerAction(action)}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Button>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeAction?.confirmLabel ?? activeAction?.label}
            </DialogTitle>
            <DialogDescription>
              {activeAction?.needsReason
                ? "أدخل سبب الرفض"
                : activeAction?.needsNotes
                  ? "أضف ملاحظات (اختياري)"
                  : "تأكيد الإجراء"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {activeAction?.needsReason || activeAction?.needsNotes ? (
              <Textarea
                value={extraValue}
                onChange={(e) => setExtraValue(e.target.value)}
                placeholder={
                  activeAction?.needsReason
                    ? "سبب الرفض..."
                    : "ملاحظات..."
                }
                rows={3}
              />
            ) : null}
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button
                variant={
                  activeAction?.variant === "destructive"
                    ? "destructive"
                    : "default"
                }
                onClick={handleConfirm}
                disabled={
                  loading ||
                  (activeAction?.needsReason === true && !extraValue.trim())
                }
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {activeAction?.confirmLabel ?? "تأكيد"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
