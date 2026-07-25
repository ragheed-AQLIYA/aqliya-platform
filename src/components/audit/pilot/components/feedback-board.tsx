"use client";

import { Plus, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PilotFeedback } from "@/types/audit";
import { FeedbackItem } from "./feedback-item";

const feedbackCategories = [
  "سير العمل",
  "منهجية التدقيق",
  "مخرجات الذكاء الاصطناعي",
  "التتبع",
  "تجربة المستخدم",
  "التصدير",
  "الأمان",
  "الأداء",
  "طلب العميل",
  "خطأ تقني",
];

interface FeedbackBoardProps {
  feedback: PilotFeedback[];
  expandedId: string | null;
  filterCat: string;
  filterStatus: string;
  onUpdateStatus: (id: string, status: string) => void;
  onToggleExpanded: (id: string | null) => void;
  onSetFilterCat: (v: string) => void;
  onSetFilterStatus: (v: string) => void;
  onOpenDialog: () => void;
  title: string;
  addFeedbackLabel: string;
  categoryFieldLabel: string;
  allCategoriesLabel: string;
  statusFieldLabel: string;
  allStatusesLabel: string;
  openLabel: string;
  inReviewLabel: string;
  acceptedLabel: string;
  resolvedLabel: string;
  dismissedLabel: string;
  noFeedbackLabel: string;
  sourceLabel: string;
  decisionLabel: string;
  ownerLabel: string;
  nextActionLabel: string;
  markInReviewLabel: string;
  acceptLabel: string;
  dismissLabel: string;
  markResolvedLabel: string;
}

export function FeedbackBoard({
  feedback,
  expandedId,
  filterCat,
  filterStatus,
  onUpdateStatus,
  onToggleExpanded,
  onSetFilterCat,
  onSetFilterStatus,
  onOpenDialog,
  title,
  addFeedbackLabel,
  categoryFieldLabel,
  allCategoriesLabel,
  statusFieldLabel,
  allStatusesLabel,
  openLabel,
  inReviewLabel,
  acceptedLabel,
  resolvedLabel,
  dismissedLabel,
  noFeedbackLabel,
  sourceLabel,
  decisionLabel,
  ownerLabel,
  nextActionLabel,
  markInReviewLabel,
  acceptLabel,
  dismissLabel,
  markResolvedLabel,
}: FeedbackBoardProps) {
  return (
    <Card>
      <CardHeader className="border-b px-3 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold break-words">
          <MessageSquare className="size-4 shrink-0" />
          {title}
        </CardTitle>
        <Button
          size="sm"
          className="self-start sm:self-auto"
          onClick={onOpenDialog}
        >
          <Plus className="size-3 me-1" />
          {addFeedbackLabel}
        </Button>
      </CardHeader>
      <CardContent className="pt-3 px-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Select
            value={filterCat}
            onValueChange={(v) => {
              if (v !== null) onSetFilterCat(v);
            }}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder={categoryFieldLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{allCategoriesLabel}</SelectItem>
              {feedbackCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(v) => {
              if (v !== null) onSetFilterStatus(v);
            }}
          >
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder={statusFieldLabel} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{allStatusesLabel}</SelectItem>
              <SelectItem value="open">{openLabel}</SelectItem>
              <SelectItem value="in_review">{inReviewLabel}</SelectItem>
              <SelectItem value="accepted">{acceptedLabel}</SelectItem>
              <SelectItem value="resolved">{resolvedLabel}</SelectItem>
              <SelectItem value="dismissed">{dismissedLabel}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {feedback.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground break-words">
            {noFeedbackLabel}
          </div>
        ) : (
          <div className="divide-y">
            {feedback
              .filter(
                (f) => filterCat === "all" || f.category === filterCat,
              )
              .filter(
                (f) =>
                  filterStatus === "all" || f.status === filterStatus,
              )
              .map((f) => (
                <FeedbackItem
                  key={f.id}
                  item={f}
                  expanded={expandedId === f.id}
                  onToggle={() =>
                    onToggleExpanded(expandedId === f.id ? null : f.id)
                  }
                  onUpdateStatus={onUpdateStatus}
                  sourceLabel={sourceLabel}
                  decisionLabel={decisionLabel}
                  ownerLabel={ownerLabel}
                  nextActionLabel={nextActionLabel}
                  markInReviewLabel={markInReviewLabel}
                  acceptLabel={acceptLabel}
                  dismissLabel={dismissLabel}
                  markResolvedLabel={markResolvedLabel}
                />
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
