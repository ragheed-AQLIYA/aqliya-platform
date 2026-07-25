"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FormData {
  recommendedAction: string;
  rationale: string;
  expectedNextState: string;
  scopeExclusions: string;
  assumptionsUsed: string;
  risksAccepted: string;
  risksRejected: string;
  humanReviewRequired: boolean;
}

interface Props {
  formData: FormData;
  error: string;
  saving: boolean;
  onFieldChange: (field: string, value: string) => void;
  onToggleHumanReview: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const fields = [
  { id: "recommendedAction", label: "الإجراء الموصى به", placeholder: "اشرح الإجراء الموصى به بوضوح..." },
  { id: "rationale", label: "المبررات", placeholder: "اشرح منطق هذه التوصية وأسبابها..." },
  { id: "expectedNextState", label: "الحالة المتوقعة لاحقًا", placeholder: "صف الحالة المتوقعة بعد تطبيق هذه التوصية..." },
  { id: "scopeExclusions", label: "ما هو خارج النطاق", placeholder: "حدد بوضوح ما لا يشمله هذا القرار..." },
  { id: "assumptionsUsed", label: "الافتراضات المستخدمة", placeholder: "اذكر الافتراضات التي بُنيت عليها هذه التوصية..." },
  { id: "risksAccepted", label: "المخاطر المقبولة", placeholder: "اذكر المخاطر التي قُبلت ضمن هذه التوصية..." },
  { id: "risksRejected", label: "المخاطر المرفوضة أو المخففة", placeholder: "اذكر المخاطر التي رُفضت أو جرى تخفيفها..." },
];

export function RecommendationForm({ formData, error, saving, onFieldChange, onToggleHumanReview, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fields.map(({ id, label, placeholder }) => (
        <div className="space-y-2" key={id}>
          <Label htmlFor={id}>{label}</Label>
          <Textarea
            id={id}
            value={String((formData as unknown as Record<string, unknown>)[id] ?? "")}
            onChange={(e) => onFieldChange(id, e.target.value)}
            placeholder={placeholder}
            required
          />
        </div>
      ))}

      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <input
          type="checkbox"
          id="humanReviewRequired"
          checked={formData.humanReviewRequired}
          onChange={onToggleHumanReview}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="humanReviewRequired">تتطلب مراجعة بشرية</Label>
      </div>

      {error && <div className="text-destructive text-sm">{error}</div>}

      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        حفظ التوصية
      </Button>
    </form>
  );
}
