"use client";

import { Scale, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { riskColors } from "./constants";
import type { RiskFactor } from "./use-acceptance-workflow";

interface RiskCardProps {
  prospect: any;
  submitting: boolean;
  riskFactors: RiskFactor[];
  onRiskFactorsChange: React.Dispatch<React.SetStateAction<RiskFactor[]>>;
  onSubmit: () => Promise<void>;
}

export function RiskCard({
  prospect,
  submitting,
  riskFactors,
  onRiskFactorsChange,
  onSubmit,
}: RiskCardProps) {
  return (
    <Card className={prospect.riskAssessment ? "border-blue-200" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Scale className="h-4 w-4" />
          تقييم المخاطر
          {prospect.riskAssessment && (
            <Badge className={riskColors[prospect.riskAssessment.overallRiskLevel]}>
              {prospect.riskAssessment.overallRiskLevel}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prospect.riskAssessment ? (
          <div className="space-y-1 text-sm">
            <p>الدرجة: {prospect.riskAssessment.overallRiskScore}/10</p>
            <p>المستوى: {prospect.riskAssessment.overallRiskLevel}</p>
            <p>الحالة: {prospect.riskAssessment.status}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              قيم مخاطر العميل المحتمل
            </p>
            {riskFactors.map((rf, i) => (
              <div key={rf.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{rf.name}</span>
                  <span className="font-medium">{rf.score}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rf.score}
                  onChange={(e) => {
                    onRiskFactorsChange((prev) => {
                      const next = [...prev];
                      next[i] = { ...rf, score: Number(e.target.value) };
                      return next;
                    });
                  }}
                  className="w-full h-1.5 rounded-full"
                />
              </div>
            ))}
            <Button size="sm" onClick={onSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : null}
              تقييم المخاطر
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
