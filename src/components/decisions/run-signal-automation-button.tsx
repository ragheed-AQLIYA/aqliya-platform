"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { runMonitoringSignalAutomationAction } from "@/actions/decision-signals-alerts";

export function RunSignalAutomationButton({
  decisionId,
}: {
  decisionId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setPending(true);
    setMessage(null);
    const res = await runMonitoringSignalAutomationAction(decisionId);
    setPending(false);
    if ("error" in res && res.error) {
      setMessage(res.error);
      return;
    }
    const created =
      "created" in res && typeof res.created === "number" ? res.created : 0;
    setMessage(`تم إنشاء ${created} إشارة مراقبة (نظام)`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" disabled={pending} onClick={run}>
        {pending ? "جاري التوليد…" : "توليد إشارات مراقبة (تلقائي)"}
      </Button>
      {message ? (
        <span className="text-xs text-muted-foreground">{message}</span>
      ) : null}
    </div>
  );
}
