"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createOutreachCampaignAction } from "@/actions/sales-intel-actions";
import { Send, Plus, Trash2, Loader2, CheckCircle2, ArrowRight, Clock, Mail } from "lucide-react";

interface CampaignStep {
  type: "email" | "delay";
  subject?: string;
  template?: string;
  delayDays?: number;
}

export function CampaignBuilder({ dealId, dealName }: { dealId: string; dealName: string }) {
  const [name, setName] = useState(`حملة ${dealName}`);
  const [steps, setSteps] = useState<CampaignStep[]>([
    { type: "email", subject: "تقديم AQLIYA", template: "مرحباً {{name}}، أود تعريفكم بمنصة AQLIYA..." },
    { type: "delay", delayDays: 4 },
    { type: "email", subject: "متابعة — حالة استخدام", template: "مرحباً {{name}}، أردت المتابعة..." },
    { type: "delay", delayDays: 4 },
    { type: "email", subject: "دعوة لاجتماع", template: "مرحباً {{name}}، هل ترغب في جدولة اجتماع?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; campaignId?: string; error?: string } | null>(null);

  const addStep = () => {
    setSteps([...steps, { type: "email", subject: "", template: "" }]);
  };

  const removeStep = (i: number) => {
    setSteps(steps.filter((_, idx) => idx !== i));
  };

  const updateStep = (i: number, update: Partial<CampaignStep>) => {
    setSteps(steps.map((s, idx) => (idx === i ? { ...s, ...update } : s)));
  };

  const handleLaunch = async () => {
    setLoading(true);
    try {
      const resp = await createOutreachCampaignAction({
        dealId,
        name,
        contactIds: [],
        steps: steps.map((s, i) => ({
          id: `step-${i}`,
          type: s.type === "delay" ? "delay" : "email",
          template: s.template,
          subject: s.subject,
          delayDays: s.delayDays,
          conditions: {} as Record<string, unknown>,
        })),
      });
      setResult(resp.success ? { success: true, campaignId: resp.campaignId } : { success: false, error: resp.error });
    } catch (err) {
      setResult({ success: false, error: err instanceof Error ? err.message : "فشل" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h3 className="text-lg font-bold">منشئ الحملات</h3>
        <p className="text-sm text-muted-foreground">Campaign Builder — صمم حملة تواصل متعددة الخطوات</p>
      </div>

      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الحملة" />

      <div className="space-y-2">
        {steps.map((step, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {step.type === "email" ? <Mail className="h-3 w-3 ml-1" /> : <Clock className="h-3 w-3 ml-1" />}
                  {step.type === "email" ? `يوم ${i + 1}` : `انتظار ${step.delayDays ?? 3} أيام`}
                </Badge>
                <select
                  value={step.type}
                  onChange={(e) => updateStep(i, { type: e.target.value as "email" | "delay" })}
                  className="text-xs border rounded px-1 py-0.5"
                >
                  <option value="email">إيميل</option>
                  <option value="delay">انتظار</option>
                </select>
                <Button variant="ghost" size="sm" className="mr-auto text-red-500 h-6 w-6 p-0" onClick={() => removeStep(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              {step.type === "email" && (
                <div className="space-y-2">
                  <Input
                    value={step.subject ?? ""}
                    onChange={(e) => updateStep(i, { subject: e.target.value })}
                    placeholder="موضوع الإيميل"
                    className="text-sm h-8"
                  />
                  <Textarea
                    value={step.template ?? ""}
                    onChange={(e) => updateStep(i, { template: e.target.value })}
                    placeholder="نص الإيميل... استخدم {{name}}"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              )}
              {step.type === "delay" && (
                <Input
                  type="number"
                  value={step.delayDays ?? 3}
                  onChange={(e) => updateStep(i, { delayDays: parseInt(e.target.value) || 3 })}
                  placeholder="عدد الأيام"
                  className="text-sm h-8 w-24"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addStep}>
          <Plus className="h-4 w-4 ml-1" /> إضافة خطوة
        </Button>
        <Button size="sm" onClick={handleLaunch} disabled={loading || !name} className="gap-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Send className="h-4 w-4 ml-1" />}
          {loading ? "جاري الإطلاق..." : "إطلاق الحملة"}
        </Button>
      </div>

      {result?.success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded text-green-700 text-sm">
          <CheckCircle2 className="h-4 w-4" /> تم إطلاق الحملة بنجاح — {result.campaignId}
        </div>
      )}
      {result?.success === false && (
        <div className="p-3 bg-red-50 rounded text-red-700 text-sm">{result.error}</div>
      )}
    </div>
  );
}
