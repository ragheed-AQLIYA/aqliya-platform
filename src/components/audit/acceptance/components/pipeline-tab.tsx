"use client";

import { Building2, UserCheck, DollarSign, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusLabels, statusColors, riskColors } from "./constants";

interface PipelineTabProps {
  pipeline: any;
  prospects: any[];
  onSelectProspect: (id: string) => Promise<void>;
}

export function PipelineTab({ pipeline, prospects, onSelectProspect }: PipelineTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">الإجمالي</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pipeline?.totalProspects ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">عملاء حاليون</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pipeline?.totalClients ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">بانتظار المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{pipeline?.pendingContinuance ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">مؤهلون</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{pipeline?.byStatus?.qualified ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">مقبولون</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{pipeline?.byStatus?.accepted ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {prospects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            لا توجد عملاء محتملين. أضف عميلاً جديداً للبدء.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {prospects.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => onSelectProspect(p.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{p.companyName}</span>
                      <Badge className={statusColors[p.status] ?? ""}>
                        {statusLabels[p.status] ?? p.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {p.industry && <span>{p.industry}</span>}
                      {p.contactName && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {p.contactName}
                        </span>
                      )}
                      {p.estimatedFee && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {p.estimatedFee.toLocaleString()} {p.estimatedFeeCurrency}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.riskAssessment && (
                      <Badge className={riskColors[p.riskAssessment.overallRiskLevel] ?? ""}>
                        مخاطر {p.riskAssessment.overallRiskLevel}
                      </Badge>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                  <span>المصدر: {p.source}</span>
                  <span>|</span>
                  <span>{new Date(p.createdAt).toLocaleDateString("ar-SA")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
