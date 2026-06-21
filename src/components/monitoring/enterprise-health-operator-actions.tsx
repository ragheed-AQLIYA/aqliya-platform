"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  processPlatformOutboxAction,
  retryFailedOutboxAction,
} from "@/actions/platform-operator-actions";

export function EnterpriseHealthOperatorActions() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: "process" | "retry") {
    setMessage(null);
    startTransition(async () => {
      try {
        if (action === "process") {
          const result = await processPlatformOutboxAction();
          setMessage(
            `تمت المعالجة: ${result.processed} · فشل: ${result.failed}`,
          );
        } else {
          const result = await retryFailedOutboxAction();
          setMessage(`أُعيدت ${result.retried} أحداث failed إلى pending`);
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "فشلت العملية");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run("process")}
      >
        معالجة Outbox
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run("retry")}
      >
        إعادة failed
      </Button>
      {message ? (
        <p className="text-xs text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
