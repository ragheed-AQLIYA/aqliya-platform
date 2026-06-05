"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  Database,
  Download,
  Play,
  Shield,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  Eye,
} from "lucide-react";

type Policy = {
  modelName: string;
  retentionDays: number;
  action: "delete" | "archive" | "anonymize";
  enabled: boolean;
  notifyBeforeDelete?: boolean;
  overridden?: boolean;
};

type DryRunResult = {
  modelName: string;
  action: string;
  recordsFound: number;
  sampleRecordIds: string[];
  retentionDays: number;
};

type RunHistory = {
  id: string;
  startedAt: string;
  completedAt: string;
  totalAffected: number;
  durationMs: number;
  triggeredBy: string;
};

type Hold = {
  id: string;
  recordType: string;
  recordId: string;
  reason: string;
  createdById?: string;
  createdAt: string;
};

function getModelLabel(modelName: string): string {
  const labels: Record<string, string> = {
    PlatformAuditLog: "سجل التدقيق",
    ScimProvisioningEvent: "أحداث SCIM",
    CrmSyncLog: "سجل مزامنة CRM",
    ErpSyncLog: "سجل مزامنة ERP",
    PlatformNotification: "الإشعارات",
    Session: "جلسات المستخدم",
    IngestionDocument: "مستندات الاستيراد",
    IngestionBatch: "دفعات الاستيراد",
    IntelligenceQuery: "استعلامات الذكاء",
    Decision: "القرارات",
    AuditEngagement: "مهام المراجعة",
    User: "المستخدمين",
    PlatformSecret: "أسرار المنصة",
  };
  return labels[modelName] ?? modelName;
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    delete: "حذف",
    archive: "أرشفة",
    anonymize: "إخفاء الهوية",
  };
  return map[action] ?? action;
}

function actionVariant(
  action: string,
): "default" | "destructive" | "secondary" {
  const map: Record<string, "default" | "destructive" | "secondary"> = {
    delete: "destructive",
    archive: "secondary",
    anonymize: "default",
  };
  return map[action] ?? "default";
}

function daysLabel(days: number): string {
  if (days <= 0) return "أبداً";
  if (days < 30) return `${days} يوم`;
  if (days < 365) return `${Math.round(days / 30)} شهر`;
  return `${Math.round(days / 365)} سنة`;
}

export default function RetentionSettingsPage() {
  // State
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [history, setHistory] = useState<RunHistory[]>([]);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [dryRunResults, setDryRunResults] = useState<DryRunResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"policies" | "holds" | "history">("policies");

  // Edit state
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editDays, setEditDays] = useState(0);
  const [editAction, setEditAction] = useState<"delete" | "archive" | "anonymize">("delete");
  const [editEnabled, setEditEnabled] = useState(true);

  // Hold state
  const [newHoldType, setNewHoldType] = useState("");
  const [newHoldId, setNewHoldId] = useState("");
  const [newHoldReason, setNewHoldReason] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [policiesRes, historyRes, holdsRes] = await Promise.all([
        fetch("/api/platform/retention/policies"),
        fetch("/api/platform/retention/history"),
        fetch("/api/platform/retention/holds"),
      ]);

      if (policiesRes.ok) {
        const data = (await policiesRes.json()) as { policies: Policy[] };
        setPolicies(data.policies);
      }
      if (historyRes.ok) {
        const data = (await historyRes.json()) as { history: RunHistory[] };
        setHistory(data.history);
      }
      if (holdsRes.ok) {
        const data = (await holdsRes.json()) as { holds: Hold[] };
        setHolds(data.holds);
      }
    } catch {
      setError("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setDryRunResults(null);
    try {
      const res = await fetch("/api/platform/retention/run", { method: "POST" });
      if (res.ok) {
        await fetchData();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "فشل في تشغيل سياسات الاحتفاظ");
      }
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setRunning(false);
    }
  }

  async function handleDryRun() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/retention/dry-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = (await res.json()) as { results: DryRunResult[] };
        setDryRunResults(data.results);
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "فشل في تشغيل المعاينة");
      }
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setRunning(false);
    }
  }

  async function handleSavePolicy(modelName: string) {
    setError(null);
    try {
      const res = await fetch("/api/platform/retention/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName,
          retentionDays: editDays,
          action: editAction,
          enabled: editEnabled,
        }),
      });
      if (res.ok) {
        setEditingModel(null);
        await fetchData();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "فشل في حفظ السياسة");
      }
    } catch {
      setError("خطأ في الاتصال");
    }
  }

  async function handleResetPolicy(modelName: string) {
    setError(null);
    try {
      const res = await fetch(
        `/api/platform/retention/policies?modelName=${encodeURIComponent(modelName)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        await fetchData();
      }
    } catch {
      setError("خطأ في الاتصال");
    }
  }

  async function handleAddHold() {
    if (!newHoldType || !newHoldId || !newHoldReason) return;
    setError(null);
    try {
      const res = await fetch("/api/platform/retention/holds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType: newHoldType,
          recordId: newHoldId,
          reason: newHoldReason,
        }),
      });
      if (res.ok) {
        setNewHoldType("");
        setNewHoldId("");
        setNewHoldReason("");
        await fetchData();
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "فشل في إضافة التعليق");
      }
    } catch {
      setError("خطأ في الاتصال");
    }
  }

  async function handleRemoveHold(holdId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/platform/retention/holds/${holdId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchData();
      }
    } catch {
      setError("خطأ في الاتصال");
    }
  }

  function startEdit(policy: Policy) {
    setEditingModel(policy.modelName);
    setEditDays(policy.retentionDays);
    setEditAction(policy.action);
    setEditEnabled(policy.enabled);
  }

  const totalDryRecords =
    dryRunResults?.reduce((s, r) => s + r.recordsFound, 0) ?? 0;

  if (loading) {
    return (
      <main className="p-8 max-w-5xl mx-auto" dir="rtl">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">سياسات الاحتفاظ بالبيانات</h1>
        <Badge variant="outline">Admin</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        إدارة سياسات الاحتفاظ بالبيانات وحذف السجلات المنتهية صلاحيتها. جميع
        العمليات مسجلة في سجل التدقيق.
      </p>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="mr-auto"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6" role="tablist">
        <Button
          variant={activeTab === "policies" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("policies")}
          role="tab"
          aria-selected={activeTab === "policies"}
        >
          <Database className="h-4 w-4 ml-1" />
          السياسات
        </Button>
        <Button
          variant={activeTab === "holds" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("holds")}
          role="tab"
          aria-selected={activeTab === "holds"}
        >
          <Shield className="h-4 w-4 ml-1" />
          التعليقات ({holds.length})
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("history")}
          role="tab"
          aria-selected={activeTab === "history"}
        >
          <Clock className="h-4 w-4 ml-1" />
          سجل التشغيل
        </Button>
      </div>

      {/* Policies Tab */}
      {activeTab === "policies" && (
        <>
          {/* Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">تشغيل سياسات الاحتفاظ</CardTitle>
              <CardDescription>
                تنفيذ معاينة أو تطبيق فعلي لسياسات الاحتفاظ بالبيانات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleDryRun}
                  disabled={running}
                >
                  {running ? (
                    <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 ml-1" />
                  )}
                  معاينة الحذف
                </Button>
                <Button onClick={handleRun} disabled={running}>
                  {running ? (
                    <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 ml-1" />
                  )}
                  تطبيق السياسات
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dry Run Results */}
          {dryRunResults && (
            <Card className="mb-6 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg">نتائج المعاينة</CardTitle>
                <CardDescription>
                  {totalDryRecords} سجل سيكون متأثراً
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>النموذج</TableHead>
                      <TableHead>الإجراء</TableHead>
                      <TableHead>السجلات</TableHead>
                      <TableHead>فترة الاحتفاظ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dryRunResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          لا توجد سجلات منتهية الصلاحية
                        </TableCell>
                      </TableRow>
                    ) : (
                      dryRunResults.map((r) => (
                        <TableRow key={r.modelName}>
                          <TableCell className="font-medium">
                            {getModelLabel(r.modelName)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={actionVariant(r.action)}>
                              {actionLabel(r.action)}
                            </Badge>
                          </TableCell>
                          <TableCell>{r.recordsFound}</TableCell>
                          <TableCell>{daysLabel(r.retentionDays)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Policy List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">قائمة السياسات</CardTitle>
              <CardDescription>
                {policies.length} سياسة احتفاظ بالبيانات
              </CardDescription>
            </CardHeader>
            <CardContent>
              {policies.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  لا توجد سياسات احتفاظ
                </p>
              ) : (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div
                      key={policy.modelName}
                      className={`rounded-md border p-4 ${
                        policy.overridden
                          ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                          : !policy.enabled
                            ? "border-muted bg-muted/30"
                            : "border-muted bg-card"
                      }`}
                    >
                      {editingModel === policy.modelName ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="h-4 w-4" />
                            <span className="font-medium">
                              {getModelLabel(policy.modelName)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">مدة الاحتفاظ (أيام)</Label>
                              <Input
                                type="number"
                                min={0}
                                value={editDays}
                                onChange={(e) =>
                                  setEditDays(Number(e.target.value))
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs">الإجراء</Label>
                              <Select
                                value={editAction}
                                onValueChange={(v) =>
                                  setEditAction(
                                    v as "delete" | "archive" | "anonymize",
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="delete">حذف</SelectItem>
                                  <SelectItem value="archive">أرشفة</SelectItem>
                                  <SelectItem value="anonymize">
                                    إخفاء الهوية
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">الحالة</Label>
                              <Select
                                value={editEnabled ? "enabled" : "disabled"}
                                onValueChange={(v) =>
                                  setEditEnabled(v === "enabled")
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="enabled">
                                    مفعل
                                  </SelectItem>
                                  <SelectItem value="disabled">
                                    معطل
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSavePolicy(policy.modelName)}
                            >
                              حفظ
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingModel(null)}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {getModelLabel(policy.modelName)}
                                </span>
                                {policy.overridden && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200"
                                  >
                                    مخصص
                                  </Badge>
                                )}
                                {!policy.enabled && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-gray-100 text-gray-600"
                                  >
                                    معطل
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{daysLabel(policy.retentionDays)}</span>
                                <Badge
                                  variant={actionVariant(policy.action)}
                                  className="text-[10px]"
                                >
                                  {actionLabel(policy.action)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(policy)}
                            >
                              تعديل
                            </Button>
                            {policy.overridden && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleResetPolicy(policy.modelName)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Holds Tab */}
      {activeTab === "holds" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">تعليقات الاحتفاظ</CardTitle>
            <CardDescription>
              تمنع التعليقات حذف السجلات المهمة لأسباب قانونية أو امتثال
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Hold */}
            <div className="p-4 rounded-md border mb-4 space-y-3">
              <h3 className="text-sm font-medium">إضافة تعليق جديد</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">نوع السجل</Label>
                  <Input
                    placeholder="مثال: PlatformAuditLog"
                    value={newHoldType}
                    onChange={(e) => setNewHoldType(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">معرف السجل</Label>
                  <Input
                    placeholder="معرف السجل"
                    value={newHoldId}
                    onChange={(e) => setNewHoldId(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">السبب</Label>
                  <Input
                    placeholder="سبب التعليق"
                    value={newHoldReason}
                    onChange={(e) => setNewHoldReason(e.target.value)}
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAddHold}
                disabled={!newHoldType || !newHoldId || !newHoldReason}
              >
                إضافة تعليق
              </Button>
            </div>

            {/* Hold List */}
            {holds.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                لا توجد تعليقات نشطة
              </p>
            ) : (
              <div className="space-y-2">
                {holds.map((hold) => (
                  <div
                    key={hold.id}
                    className="flex items-start justify-between gap-2 rounded-md border p-3"
                  >
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">{hold.recordType}</span>
                        <span className="text-muted-foreground text-xs font-mono">
                          {hold.recordId.slice(0, 12)}...
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {hold.reason}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHold(hold.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">سجل تشغيل السياسات</CardTitle>
            <CardDescription>
              عمليات تطبيق سياسات الاحتفاظ السابقة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                لا توجد عمليات سابقة
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>بواسطة</TableHead>
                    <TableHead>السجلات المتأثرة</TableHead>
                    <TableHead>المدة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.completedAt).toLocaleString("ar-SA")}
                      </TableCell>
                      <TableCell>{entry.triggeredBy}</TableCell>
                      <TableCell>{entry.totalAffected}</TableCell>
                      <TableCell>{entry.durationMs}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
