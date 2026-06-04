"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { archiveEngagementAction } from "@/actions/audit-actions";
import { evaluateEngagementArchival } from "@/lib/audit/engagement-archival";
import { Archive, Loader2 } from "lucide-react";

interface ArchiveEngagementButtonProps {
  engagementId: string;
  engagementStatus: string;
  canArchive: boolean;
}

export function ArchiveEngagementButton({
  engagementId,
  engagementStatus,
  canArchive,
}: ArchiveEngagementButtonProps) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);

  const archival = evaluateEngagementArchival(engagementStatus);

  if (engagementStatus === "archived") {
    return (
      <Link
        href="/audit/archived"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        عرض الأرشيف
      </Link>
    );
  }

  if (!canArchive || !archival.canArchive) return null;

  async function handleArchive() {
    if (
      !confirm(
        "هل أنت متأكد من أرشفة هذا التكليف؟ لا يمكن التراجع عن هذه العملية.",
      )
    )
      return;

    setArchiving(true);
    try {
      const result = await archiveEngagementAction(engagementId);
      if (result.success) {
        router.refresh();
      }
    } catch {
      alert("فشلت عملية الأرشفة. يرجى المحاولة مرة أخرى.");
    } finally {
      setArchiving(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleArchive}
      disabled={archiving}
      className="text-muted-foreground hover:text-destructive"
    >
      {archiving ? (
        <Loader2 className="ml-1 h-4 w-4 animate-spin" />
      ) : (
        <Archive className="ml-1 h-4 w-4" />
      )}
      {archiving ? "جارِ الأرشفة..." : "أرشفة"}
    </Button>
  );
}
