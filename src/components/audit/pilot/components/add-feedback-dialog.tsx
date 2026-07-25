"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface AddFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newFeedback: {
    title: string;
    description: string;
    source: string;
    category: string;
    severity: string;
  };
  onChange: (value: {
    title: string;
    description: string;
    source: string;
    category: string;
    severity: string;
  }) => void;
  onSubmit: () => void;
  submitting: boolean;
  dialogTitleLabel: string;
  dialogDescriptionLabel: string;
  titleLabel: string;
  titlePlaceholderLabel: string;
  descriptionLabel: string;
  descriptionPlaceholderLabel: string;
  sourceLabel: string;
  sourcePlaceholderLabel: string;
  categoryFieldLabel: string;
  severityFieldLabel: string;
  lowLabel: string;
  mediumLabel: string;
  highLabel: string;
  criticalLabel: string;
  cancelLabel: string;
  savingLabel: string;
  saveFeedbackLabel: string;
}

export function AddFeedbackDialog({
  open,
  onOpenChange,
  newFeedback,
  onChange,
  onSubmit,
  submitting,
  dialogTitleLabel,
  dialogDescriptionLabel,
  titleLabel,
  titlePlaceholderLabel,
  descriptionLabel,
  descriptionPlaceholderLabel,
  sourceLabel,
  sourcePlaceholderLabel,
  categoryFieldLabel,
  severityFieldLabel,
  lowLabel,
  mediumLabel,
  highLabel,
  criticalLabel,
  cancelLabel,
  savingLabel,
  saveFeedbackLabel,
}: AddFeedbackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitleLabel}</DialogTitle>
          <DialogDescription>{dialogDescriptionLabel}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>{titleLabel}</Label>
            <Input
              value={newFeedback.title}
              onChange={(e) =>
                onChange({ ...newFeedback, title: e.target.value })
              }
              placeholder={titlePlaceholderLabel}
            />
          </div>
          <div>
            <Label>{descriptionLabel}</Label>
            <Textarea
              value={newFeedback.description}
              onChange={(e) =>
                onChange({ ...newFeedback, description: e.target.value })
              }
              placeholder={descriptionPlaceholderLabel}
            />
          </div>
          <div>
            <Label>{sourceLabel}</Label>
            <Input
              value={newFeedback.source}
              onChange={(e) =>
                onChange({ ...newFeedback, source: e.target.value })
              }
              placeholder={sourcePlaceholderLabel}
            />
          </div>
          <div>
            <Label>{categoryFieldLabel}</Label>
            <Select
              value={newFeedback.category}
              onValueChange={(v) => {
                if (v !== null)
                  onChange({ ...newFeedback, category: v });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {feedbackCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{severityFieldLabel}</Label>
            <Select
              value={newFeedback.severity}
              onValueChange={(v) => {
                if (v !== null)
                  onChange({ ...newFeedback, severity: v });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{lowLabel}</SelectItem>
                <SelectItem value="medium">{mediumLabel}</SelectItem>
                <SelectItem value="high">{highLabel}</SelectItem>
                <SelectItem value="critical">{criticalLabel}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            disabled={!newFeedback.title.trim() || submitting}
            onClick={onSubmit}
          >
            {submitting ? savingLabel : saveFeedbackLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
