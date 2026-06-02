"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  dismissSalesNbaActionAction,
  snoozeSalesNbaActionAction,
} from "@/actions/sales-actions";

const DISMISS_LABEL_AR = "تجاهل";
const SNOOZE_LABEL_AR = "تأجيل أسبوع";
const BUSY_DISMISS_AR = "جارٍ التجاهل…";
const BUSY_SNOOZE_AR = "جارٍ التأجيل…";
const ERROR_AR = "تعذّر تحديث الإجراء. حاول مرة أخرى.";

export function NextBestActionRowActions({
  organizationId,
  actionId,
}: {
  organizationId: string;
  actionId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyKind, setBusyKind] = useState<"dismiss" | "snooze" | null>(null);

  function run(
    kind: "dismiss" | "snooze",
    fn: () => Promise<{ ok: boolean; error?: string }>,
  ) {
    setError(null);
    setBusyKind(kind);
    startTransition(async () => {
      const res = await fn();
      setBusyKind(null);
      if (!res.ok) {
        setError(res.error ?? ERROR_AR);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={pending}
          aria-label={`${DISMISS_LABEL_AR} — ${actionId}`}
          onClick={() =>
            run("dismiss", () =>
              dismissSalesNbaActionAction(organizationId, actionId),
            )
          }
        >
          {pending && busyKind === "dismiss" ? BUSY_DISMISS_AR : DISMISS_LABEL_AR}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          disabled={pending}
          aria-label={`${SNOOZE_LABEL_AR} — ${actionId}`}
          onClick={() =>
            run("snooze", () =>
              snoozeSalesNbaActionAction(organizationId, actionId),
            )
          }
        >
          {pending && busyKind === "snooze" ? BUSY_SNOOZE_AR : SNOOZE_LABEL_AR}
        </Button>
      </div>
      {error ? (
        <p className="max-w-[12rem] text-right text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
