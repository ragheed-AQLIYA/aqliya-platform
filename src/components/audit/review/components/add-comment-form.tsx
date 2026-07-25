"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, AlertTriangle } from "lucide-react";

interface AddCommentFormProps {
  commentTargetType: string;
  commentTargetId: string;
  newComment: string;
  sending: boolean;
  commentError: string | null;
  targetOptions: { id: string; label: string }[];
  onTargetTypeChange: (value: string) => void;
  onTargetIdChange: (value: string) => void;
  onCommentChange: (value: string) => void;
  onSubmit: () => void;
}

export function AddCommentForm({
  commentTargetType,
  commentTargetId,
  newComment,
  sending,
  commentError,
  targetOptions,
  onTargetTypeChange,
  onTargetIdChange,
  onCommentChange,
  onSubmit,
}: AddCommentFormProps) {
  const t = useTranslations("audit.review");

  return (
    <Card className="rounded-[24px] border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{t("addComment")}</CardTitle>
        <CardDescription>{t("addCommentDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs">{t("targetType")}</Label>
                <Select
                  value={commentTargetType}
                  onValueChange={(v) => {
                    if (v !== null) onTargetTypeChange(v);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statement_line">{t("statementLine")}</SelectItem>
                    <SelectItem value="note">{t("note")}</SelectItem>
                    <SelectItem value="finding">{t("finding")}</SelectItem>
                    <SelectItem value="evidence">{t("evidence")}</SelectItem>
                    <SelectItem value="recommendation">{t("recommendation")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs">{t("targetEntity")}</Label>
                <Select
                  value={commentTargetId}
                  onValueChange={(v) => {
                    if (v !== null) onTargetIdChange(v);
                  }}
                  disabled={targetOptions.length === 0}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue
                      placeholder={
                        targetOptions.length === 0 ? t("noEntities") : t("selectTarget")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {targetOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder={t("commentPlaceholder")}
              className="min-h-[60px]"
            />
          </div>
          <div className="flex flex-col gap-1 pt-1 lg:pt-5">
            <Button size="sm" onClick={onSubmit} disabled={!newComment.trim() || sending}>
              <Send className="size-4 me-1" />
              {sending ? t("sending") : t("send")}
            </Button>
          </div>
        </div>
        {commentError && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{commentError}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
