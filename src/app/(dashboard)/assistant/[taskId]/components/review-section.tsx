"use client";

import {
  Shield,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Archive,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReviewSectionProps {
  status: string;
  isArchived: boolean;
  canReview: boolean;
  onSubmitForReview: () => Promise<void>;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  onArchive: () => Promise<void>;
}

export function ReviewSection({
  status,
  isArchived,
  canReview,
  onSubmitForReview,
  onApprove,
  onReject,
  onArchive,
}: ReviewSectionProps) {
  if (isArchived) return null;

  return (
    <Card className="mb-6 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" /> Review & Governance / المراجعة
          والحوكمة
        </CardTitle>
        <CardDescription>
          All outputs must be reviewed before final use
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canReview ? (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onSubmitForReview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" /> Submit for Review
            </Button>
            <Button onClick={onApprove} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Approve / اعتماد
            </Button>
            <Button
              onClick={onReject}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" /> Reject / رفض
            </Button>
          </div>
        ) : status === "approved" ? (
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5" />
            <span>Task approved. Output can be used as reference.</span>
          </div>
        ) : status === "rejected" ? (
          <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
            <XCircle className="h-5 w-5" />
            <span>Task rejected. Review feedback and regenerate.</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Review actions not available in current status.
          </p>
        )}

        {status !== "archived" && status !== "approved" && (
          <div className="mt-3">
            <Button
              onClick={onArchive}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Archive className="h-3.5 w-3.5" /> Archive Task
            </Button>
          </div>
        )}

        <div className="mt-4 p-3 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              <p className="font-medium mb-0.5">
                Governance Notice / إشعار الحوكمة
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Outputs are DRAFT until reviewed and approved</li>
                <li>Do not use as final output without human approval</li>
                <li>All actions are logged to the platform audit trail</li>
                <li>AI suggests — humans decide</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
