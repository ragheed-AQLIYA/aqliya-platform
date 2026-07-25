"use client";

import { useState } from "react";
import { FileSearch, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KycData } from "./use-acceptance-workflow";

interface KycCardProps {
  prospect: any;
  submitting: boolean;
  kycData: KycData;
  onKycDataChange: React.Dispatch<React.SetStateAction<KycData>>;
  onSubmit: () => Promise<void>;
}

export function KycCard({
  prospect,
  submitting,
  kycData,
  onKycDataChange,
  onSubmit,
}: KycCardProps) {
  return (
    <Card className={prospect.kycPackage ? "border-green-200" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileSearch className="h-4 w-4" />
          الفحص النظري (KYC)
          {prospect.kycPackage && (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prospect.kycPackage ? (
          <div className="space-y-1 text-sm">
            <p>PEP: {prospect.kycPackage.pepCheck}</p>
            <p>Sanctions: {prospect.kycPackage.sanctionCheck}</p>
            <p>Media: {prospect.kycPackage.adverseMediaCheck}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              أكمل فحص العناية الواجبة للعميل
            </p>
            <div className="space-y-2">
              <Input
                placeholder="الجهة التنظيمية"
                value={kycData.regulatoryBody}
                onChange={(e) =>
                  onKycDataChange((prev) => ({ ...prev, regulatoryBody: e.target.value }))
                }
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">PEP</Label>
                  <Select
                    value={kycData.pepCheck}
                    onValueChange={(v) =>
                      onKycDataChange((prev) => ({ ...prev, pepCheck: v }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">نظيف</SelectItem>
                      <SelectItem value="flagged">ملحوظ</SelectItem>
                      <SelectItem value="pending">قيد التحقق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Sanctions</Label>
                  <Select
                    value={kycData.sanctionCheck}
                    onValueChange={(v) =>
                      onKycDataChange((prev) => ({ ...prev, sanctionCheck: v }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">نظيف</SelectItem>
                      <SelectItem value="flagged">ملحوظ</SelectItem>
                      <SelectItem value="pending">قيد التحقق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Media</Label>
                  <Select
                    value={kycData.adverseMediaCheck}
                    onValueChange={(v) =>
                      onKycDataChange((prev) => ({ ...prev, adverseMediaCheck: v }))
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">نظيف</SelectItem>
                      <SelectItem value="flagged">ملحوظ</SelectItem>
                      <SelectItem value="pending">قيد التحقق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button size="sm" onClick={onSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : null}
                إرسال الفحص
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
