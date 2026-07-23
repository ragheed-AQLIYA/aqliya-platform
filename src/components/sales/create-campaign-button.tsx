"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createOutreachCampaignAction } from "@/actions/sales-intel-actions";
import {
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Clock,
  MessageSquare,
} from "lucide-react";

/**
 * CreateCampaignButton — launches SmartLead outreach campaign for deal contacts.
 * Embedded in deal detail pages.
 */
export function CreateCampaignButton({
  dealId,
  dealName,
  contactCount,
}: {
  dealId: string;
  dealName: string;
  contactCount: number;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    campaignId?: string;
    error?: string;
  } | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const resp = await createOutreachCampaignAction({
        dealId,
        name: `حملة ${dealName} — ${new Date().toLocaleDateString("ar-SA")}`,
        contactIds: [], // Populated from deal contacts
        steps: [
          { type: "email", subject: "تقديم AQLIYA", template: "مرحباً {{name}}، أود تعريفكم بمنصة AQLIYA...", delayDays: 0 },
          { type: "delay", delayDays: 4 },
          { type: "email", subject: "متابعة — حالة استخدام", template: "مرحباً {{name}}، أردت المتابعة بخصوص...", delayDays: 0 },
          { type: "delay", delayDays: 4 },
          { type: "email", subject: "دعوة لاجتماع", template: "مرحباً {{name}}، هل ترغب في جدولة اجتماع...", delayDays: 0 },
        ],
      });

      if (resp.success && resp.campaignId) {
        setResult({ success: true, campaignId: resp.campaignId });
      } else {
        setResult({ success: false, error: resp.error ?? "فشل إنشاء الحملة" });
      }
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "فشل إنشاء الحملة",
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {!result && (
        <Button
          variant="default"
          size="sm"
          onClick={handleCreate}
          disabled={loading || contactCount === 0}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {loading ? "جاري إنشاء الحملة..." : "إطلاق حملة تواصل"}
        </Button>
      )}

      {contactCount === 0 && !result && (
        <p className="text-xs text-muted-foreground">
          لا توجد جهات اتصال مرتبطة بهذه الصفقة. أضف جهات اتصال أولاً.
        </p>
      )}

      {result?.success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              تم إطلاق الحملة بنجاح
            </p>
            <p className="text-xs text-green-600">
              الحملة: {result.campaignId} · {contactCount} جهة اتصال
            </p>
            <p className="text-xs text-green-600 mt-1">
              سيتم إرسال الإيميلات تلقائياً عبر SmartLead. ستتلقى تنبيهات عند الرد.
            </p>
          </div>
        </div>
      )}

      {result?.success === false && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <XCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{result.error}</p>
        </div>
      )}

      {/* Campaign template preview */}
      {!result && contactCount > 0 && (
        <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground">
            معاينة خطوات الحملة:
          </p>
          <div className="space-y-1">
            <StepPreview
              icon={<Mail className="h-3 w-3" />}
              day="اليوم 1"
              text="إيميل تعريفي — تقديم AQLIYA"
            />
            <StepPreview
              icon={<Clock className="h-3 w-3" />}
              day="اليوم 4"
              text="متابعة — حالة استخدام محددة"
            />
            <StepPreview
              icon={<MessageSquare className="h-3 w-3" />}
              day="اليوم 8"
              text="إيميل أخير — دعوة لاجتماع"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StepPreview({
  icon,
  day,
  text,
}: {
  icon: React.ReactNode;
  day: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {icon}
      <Badge variant="outline" className="text-[10px] px-1">
        {day}
      </Badge>
      <span>{text}</span>
    </div>
  );
}
