"use client";

import { useEffect, useState } from "react";
import { getDecisions } from "@/actions/decisions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, FileText, Users, Shield, Download, Eye, Search } from "lucide-react";

interface ReadinessItem {
  label: string;
  labelAr: string;
  met: boolean;
  details: string;
  icon: React.ReactNode;
}

export default function DecisionOSPilotReadiness() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDecisions().then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setDecisions(res.data);
      }
    });
  }, []);

  const totalDecisions = decisions.length;
  const approvedDecisions = decisions.filter(
    (d) => d.status === "APPROVED" || d.status === "IMPLEMENTED",
  ).length;
  const hasEvidence = decisions.some((d) => d.evidence?.length > 0);
  const hasApprovals = decisions.some((d) => d.approvals?.length > 0);

  const readinessItems: ReadinessItem[] = [
    {
      label: "Decision Creation",
      labelAr: "إنشاء القرارات",
      met: totalDecisions > 0,
      details: totalDecisions > 0
        ? `${totalDecisions} قرار تم إنشاؤه`
        : "لم يتم إنشاء أي قرار بعد",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Approval Workflow",
      labelAr: "سير عمل الموافقات",
      met: hasApprovals,
      details: hasApprovals
        ? "تم اختبار سير عمل الموافقات"
        : "لم يتم اختبار الموافقات بعد",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      label: "Evidence Upload",
      labelAr: "رفع المستندات",
      met: hasEvidence,
      details: hasEvidence
        ? "تم رفع مستندات دعم"
        : "لم يتم رفع مستندات بعد",
      icon: <Eye className="h-5 w-5" />,
    },
    {
      label: "Export & Reports",
      labelAr: "التصدير والتقارير",
      met: true,
      details: "تصدير PDF و JSON و Markdown مع دعم اللغة العربية",
      icon: <Download className="h-5 w-5" />,
    },
    {
      label: "Audit Trail",
      labelAr: "سجل التدقيق",
      met: true,
      details: "جميع العمليات مسجلة في سجل التدقيق",
      icon: <Search className="h-5 w-5" />,
    },
    {
      label: "Role-Based Access",
      labelAr: "التحكم بالصلاحيات",
      met: true,
      details: "VIEWER, OPERATOR, REVIEWER, APPROVER with tenant isolation",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  const metCount = readinessItems.filter((i) => i.met).length;
  const readinessPercent = Math.round((metCount / readinessItems.length) * 100);
  const isReady = metCount === readinessItems.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحقق من جاهزية DecisionOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">جاهزية DecisionOS للتجربة</h1>
        <p className="text-muted-foreground">
          DecisionOS Pilot Readiness — تقييم جاهزية نظام قرارات المؤسسة
        </p>
      </div>

      {/* Readiness Score */}
      <Card className={isReady ? "border-green-500" : "border-amber-500"}>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">
              {isReady ? <CheckCircle2 className="h-12 w-12 text-green-500" /> : <AlertTriangle className="h-12 w-12 text-amber-500" />}
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isReady ? "جاهز للتجربة" : "قيد التحضير"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isReady
                  ? "نظام DecisionOS جاهز بالكامل للتجربة مع العملاء"
                  : `اكتمال ${readinessPercent}% — يحتاج ${readinessItems.length - metCount} متطلبات إضافية`}
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-2 max-w-md">
                <div
                  className={`h-full rounded-full transition-all ${
                    isReady ? "bg-green-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {readinessItems.map((item) => (
          <Card key={item.label} className={item.met ? "border-green-200" : "border-red-200"}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${item.met ? "text-green-500" : "text-red-400"}`}>
                  {item.met ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{item.icon}</span>
                    <div>
                      <p className="font-medium">{item.labelAr}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">{item.details}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      {totalDecisions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات القرارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{totalDecisions}</p>
                <p className="text-xs text-muted-foreground">إجمالي القرارات</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{approvedDecisions}</p>
                <p className="text-xs text-muted-foreground">قرارات معتمدة</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{totalDecisions - approvedDecisions}</p>
                <p className="text-xs text-muted-foreground">قيد المراجعة</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {decisions.filter((d) => d.evidence?.length > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">بها مستندات دعم</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action guide */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <h3 className="font-bold mb-2">📋 دليل استخدام DecisionOS</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Badge variant="outline">1</Badge>
              إنشاء قرار جديد مع تحديد النوع والأهداف والمعايير
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline">2</Badge>
              إضافة خيارات متعددة وتحليل المخاطر
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline">3</Badge>
              رفع مستندات الدعم ومراجعتها قبل الاعتماد
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline">4</Badge>
              إرسال للمراجعة والاعتماد من قبل المخولين
            </li>
            <li className="flex items-center gap-2">
              <Badge variant="outline">5</Badge>
              تصدير القرار بصيغة PDF أو JSON مع سجل التدقيق
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
