"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSamplingForm } from "./components/use-sampling-form";
import { SamplingFormFields } from "./components/sampling-form-fields";
import { SamplingResultCard } from "./components/sampling-result-card";

interface AuditSamplingFormProps {
  engagementId: string;
  lineCount: number;
}

export function AuditSamplingForm({
  engagementId,
  lineCount,
}: AuditSamplingFormProps) {
  const { result, error, pending, method, setMethod, handleSubmit } =
    useSamplingForm(engagementId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">معاملات العينة</CardTitle>
        </CardHeader>
        <CardContent>
          <SamplingFormFields
            method={method}
            pending={pending}
            error={error}
            lineCount={lineCount}
            onMethodChange={setMethod}
            handleSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      {result && <SamplingResultCard result={result} />}
    </div>
  );
}
