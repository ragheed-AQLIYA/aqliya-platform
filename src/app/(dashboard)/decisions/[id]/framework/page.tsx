"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DecisionTabs } from "@/components/decisions/decision-tabs";
import {
  DecisionProgress,
  buildStageStatus,
} from "@/components/decisions/decision-progress";
import {
  getDecisionFramework,
  updateDecisionFramework,
  getWorkflowReadiness,
} from "@/actions/decisions";
import { getDecisionTypeConfig } from "@/lib/decision-type-config";
import type {
  DecisionFrameworkState,
  DecisionIntake,
} from "@/lib/types/decision";

type FrameworkForm = {
  context: string;
  purpose: string;
  options: string;
  criteria: string;
  values: string;
  informationGaps: string;
  certainty: string;
  assumptions: string;
};

type FrameworkRecord = FrameworkForm & {
  id: string;
  decisionId: string;
};

const emptyForm: FrameworkForm = {
  context: "",
  purpose: "",
  options: "",
  criteria: "",
  values: "",
  informationGaps: "",
  certainty: "",
  assumptions: "",
};

function getStateVariant(isComplete?: boolean) {
  return isComplete ? ("default" as const) : ("secondary" as const);
}

function getIntakeVariant(status?: string) {
  if (status === "accepted") return "default" as const;
  if (status === "rejected") return "destructive" as const;
  return "secondary" as const;
}

export default function DecisionFrameworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [intake, setIntake] = useState<DecisionIntake | null>(null);
  const [frameworkState, setFrameworkState] =
    useState<DecisionFrameworkState | null>(null);
  const [decisionType, setDecisionType] = useState<string>("CUSTOM");
  const [readiness, setReadiness] = useState<any>(null);
  const [formData, setFormData] = useState<FrameworkForm>(emptyForm);

  useEffect(() => {
    async function resolveParams() {
      const { id: decisionId } = await params;
      setId(decisionId);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const decisionId: string = id;

    async function loadData() {
      const [frameworkResult, readinessResult] = await Promise.all([
        getDecisionFramework(decisionId),
        getWorkflowReadiness(decisionId),
      ]);

      if (frameworkResult.success && frameworkResult.data) {
        const framework = frameworkResult.data
          .framework as FrameworkRecord | null;
        setIntake(frameworkResult.data.intake);
        setFrameworkState(frameworkResult.data.frameworkState);
        setDecisionType(frameworkResult.data.type || "CUSTOM");
        setFormData(
          framework
            ? {
                context: framework.context,
                purpose: framework.purpose,
                options: framework.options,
                criteria: framework.criteria,
                values: framework.values,
                informationGaps: framework.informationGaps,
                certainty: framework.certainty,
                assumptions: framework.assumptions,
              }
            : emptyForm,
        );
      } else {
        setError(frameworkResult.error || "Failed to load decision framework");
      }

      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data);
      }

      setLoading(false);
    }

    loadData();
  }, [id]);

  function handleChange(field: keyof FrameworkForm, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    if (success) setSuccess(false);
    if (error) setError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!id || intake?.status !== "accepted") return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateDecisionFramework(id, formData);

    if (result.success && result.data) {
      setFormData(result.data.framework);
      setFrameworkState(result.data.frameworkState);
      setSuccess(true);
      const readinessResult = await getWorkflowReadiness(id);
      if (readinessResult.success && readinessResult.data) {
        setReadiness(readinessResult.data);
      }
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "فشل في حفظ إطار القرار");
    }

    setSaving(false);
  }

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} />
        <div className="mt-6 text-center">جارٍ التحميل...</div>
      </div>
    );
  }

  const blocked = intake?.status !== "accepted";
  const config = getDecisionTypeConfig(decisionType);
  const stages = readiness
    ? buildStageStatus("framework", {
        intakeAccepted: readiness.intakeAccepted,
        frameworkComplete: readiness.frameworkComplete,
        scenariosComplete: readiness.scenariosComplete,
        risksComplete: readiness.risksComplete,
        simulationReady: readiness.simulationReady,
        recommendationReady: readiness.recommendationReady,
      })
    : [];

  return (
    <div>
      <DecisionTabs decisionId={id} decisionType={decisionType} />
      <div className="mx-auto mt-6 max-w-4xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black">أ-١٫١ إطار القرار</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              {config.frameworkGuidance}
            </p>
          </div>
          {frameworkState && !blocked && (
            <Badge variant={getStateVariant(frameworkState.isComplete)}>
              {frameworkState.isComplete ? "مكتمل" : "غير مكتمل"}
            </Badge>
          )}
        </div>

        {readiness && (
          <div className="mb-6">
            <DecisionProgress
              stages={stages}
              decisionType={decisionType}
              missingInputs={readiness.missingInputs}
              dataQuality={readiness.dataQuality}
            />
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-2xl bg-green-50 p-3 text-sm text-green-600">
            تم حفظ الإطار بنجاح. يُحسّن ذلك درجات الملاءمة الاستراتيجية والجدوى.
          </div>
        )}

        {blocked ? (
          <section className="rounded-[24px] border border-border/70 p-5 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-bold">الإطار محظور</h3>
              <Badge variant={getIntakeVariant(intake?.status)}>
                {intake?.status.replace("_", " ") || "الاستلام مفقود"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              أ-١٫١ لا يمكن المتابعة قبل قبول أ-١٫٠ الاستلام. حل مشكلات الاستلام
              أولاً.
            </p>
            {intake && (
              <ul className="mt-4 list-disc pl-5 text-sm">
                {intake.requiredNextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <>
            {frameworkState && !frameworkState.isComplete && (
              <section className="mb-6 rounded-[24px] border border-border/70 p-4 shadow-sm">
                <h3 className="text-sm font-bold">الخطوات التالية المطلوبة</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {frameworkState.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </section>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-[24px] border border-border/70 p-5 shadow-sm"
            >
              <div className="space-y-2">
                <Label htmlFor="context">السياق *</Label>
                <Textarea
                  id="context"
                  value={formData.context}
                  onChange={(event) =>
                    handleChange("context", event.target.value)
                  }
                  placeholder="خلفية القرار والحدود وأصحاب المصلحة والتوقيت"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  إكمال حقول الإطار يزيد جودة البيانات ودرجات الملاءمة
                  الاستراتيجية مباشرة.
                </p>
              </div>
              <div>
                <Label htmlFor="purpose">الغرض *</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(event) =>
                    handleChange("purpose", event.target.value)
                  }
                  placeholder="ما يجب أن يحققه هذا القرار"
                />
              </div>
              <div>
                <Label htmlFor="options">الخيارات *</Label>
                <Textarea
                  id="options"
                  value={formData.options}
                  onChange={(event) =>
                    handleChange("options", event.target.value)
                  }
                  placeholder="خيار واحد في كل سطر"
                />
              </div>
              <div>
                <Label htmlFor="criteria">المعايير *</Label>
                <Textarea
                  id="criteria"
                  value={formData.criteria}
                  onChange={(event) =>
                    handleChange("criteria", event.target.value)
                  }
                  placeholder="معايير التقييم، واحد في كل سطر"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  المعايير المفصّلة تُحسّن تسجيل الملاءمة الاستراتيجية.
                </p>
              </div>
              <div>
                <Label htmlFor="values">القيم *</Label>
                <Textarea
                  id="values"
                  value={formData.values}
                  onChange={(event) =>
                    handleChange("values", event.target.value)
                  }
                  placeholder="مبادئ القرار وتفضيلات المفاضلة والثوابت"
                />
              </div>
              <div>
                <Label htmlFor="informationGaps">فجوات المعلومات *</Label>
                <Textarea
                  id="informationGaps"
                  value={formData.informationGaps}
                  onChange={(event) =>
                    handleChange("informationGaps", event.target.value)
                  }
                  placeholder="المجهولات أو الأدلة المفقودة"
                />
              </div>
              <div>
                <Label htmlFor="certainty">اليقين *</Label>
                <Input
                  id="certainty"
                  value={formData.certainty}
                  onChange={(event) =>
                    handleChange("certainty", event.target.value)
                  }
                  placeholder="عالٍ، متوسط، منخفض، أو شرح مستوى الثقة"
                />
              </div>
              <div>
                <Label htmlFor="assumptions">الافتراضات *</Label>
                <Textarea
                  id="assumptions"
                  value={formData.assumptions}
                  onChange={(event) =>
                    handleChange("assumptions", event.target.value)
                  }
                  placeholder="الافتراضات التي يعتمد عليها هذا الإطار"
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "جارٍ الحفظ..." : "حفظ الإطار"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
