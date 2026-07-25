"use client";

import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DecisionCardProps {
  prospect: any;
  submitting: boolean;
  decisionValue: string;
  decisionRationale: string;
  onDecisionValueChange: (v: string) => void;
  onDecisionRationaleChange: (v: string) => void;
  onSubmit: () => Promise<void>;
}

export function DecisionCard({
  prospect,
  submitting,
  decisionValue,
  decisionRationale,
  onDecisionValueChange,
  onDecisionRationaleChange,
  onSubmit,
}: DecisionCardProps) {
  return (
    <Card className={prospect.decisions?.length > 0 ? "border-green-200" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          قرار القبول
          {prospect.decisions?.length > 0 && (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prospect.decisions?.length > 0 ? (
          <div className="space-y-1 text-sm">
            <p>القرار: {prospect.decisions[0].decision}</p>
            <p className="text-xs text-muted-foreground">
              {prospect.decisions[0].rationale}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              اتخذ قراراً بناءً على تقييم المخاطر
            </p>
            <Select value={decisionValue} onValueChange={onDecisionValueChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accept">قبول</SelectItem>
                <SelectItem value="accept_with_conditions">قبول بشروط</SelectItem>
                <SelectItem value="decline">رفض</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              value={decisionRationale}
              onChange={(e) => onDecisionRationaleChange(e.target.value)}
              placeholder="مبررات القرار..."
              className="min-h-[60px]"
            />
            <Button size="sm" onClick={onSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="ml-1 h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="ml-1 h-3 w-3" />
              )}
              تسجيل القرار
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
