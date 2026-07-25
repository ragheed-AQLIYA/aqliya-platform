"use client";

import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateTabProps {
  targetType: string;
  targetId: string;
  targetLabel: string;
  priority: string;
  stage: string;
  assignee: string;
  comment: string;
  error: string | null;
  submitting: boolean;
  onTargetTypeChange: (v: string) => void;
  onTargetIdChange: (v: string) => void;
  onTargetLabelChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onStageChange: (v: string) => void;
  onAssigneeChange: (v: string) => void;
  onCommentChange: (v: string) => void;
  onSubmit: () => void;
}

export function CreateTab({
  targetType,
  targetId,
  targetLabel,
  priority,
  stage,
  assignee,
  comment,
  error,
  submitting,
  onTargetTypeChange,
  onTargetIdChange,
  onTargetLabelChange,
  onPriorityChange,
  onStageChange,
  onAssigneeChange,
  onCommentChange,
  onSubmit,
}: CreateTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          ملاحظة مراجعة جديدة
        </CardTitle>
        <CardDescription>
          أضف ملاحظة مراجعة لتكليف فريق العمل بمتابعة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>نوع المستهدف</Label>
            <Select value={targetType} onValueChange={onTargetTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finding">نتيجة</SelectItem>
                <SelectItem value="statement">قائمة مالية</SelectItem>
                <SelectItem value="note">إيضاح</SelectItem>
                <SelectItem value="evidence">دليل</SelectItem>
                <SelectItem value="working_paper">ورقة عمل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>معرف المستهدف</Label>
            <Input
              value={targetId}
              onChange={(e) => onTargetIdChange(e.target.value)}
              placeholder="معرف العنصر"
            />
          </div>
          <div className="space-y-2">
            <Label>وصف المستهدف</Label>
            <Input
              value={targetLabel}
              onChange={(e) => onTargetLabelChange(e.target.value)}
              placeholder="وصف مختصر للعنصر"
            />
          </div>
          <div className="space-y-2">
            <Label>الأولوية</Label>
            <Select value={priority} onValueChange={onPriorityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">حرج</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>مرحلة المراجعة</Label>
            <Select value={stage} onValueChange={onStageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">تخطيط</SelectItem>
                <SelectItem value="execution">تنفيذ</SelectItem>
                <SelectItem value="reporting">إعداد التقارير</SelectItem>
                <SelectItem value="completion">إكمال</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>تكليف (اختياري)</Label>
            <Input
              value={assignee}
              onChange={(e) => onAssigneeChange(e.target.value)}
              placeholder="معرف المستخدم"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>نص الملاحظة</Label>
            <Textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="اكتب ملاحظة المراجعة..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          className="mt-4"
          onClick={onSubmit}
          disabled={submitting || !comment.trim()}
        >
          {submitting ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="ml-2 h-4 w-4" />
          )}
          {submitting ? "جارٍ الإنشاء..." : "إنشاء ملاحظة المراجعة"}
        </Button>
      </CardContent>
    </Card>
  );
}
