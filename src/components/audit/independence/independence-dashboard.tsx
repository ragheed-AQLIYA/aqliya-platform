"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  FileText,
  Scale,
  UserCheck,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  listRegisterAction,
  getRegisterEntryAction,
  registerPersonAction,
  declareFinancialInterestAction,
  declareEmploymentAction,
  identifyThreatAction,
  proposeSafeguardAction,
  runConflictCheckAction,
  createConfirmationCycleAction,
  getConfirmationStatusAction,
  getIndependenceDashboardAction,
  getThreatCategoriesAction,
} from "@/actions/audit-independence-actions";

interface IndependenceDashboardProps {
  auditOrganizationId: string;
}

export function IndependenceDashboard({ auditOrganizationId }: IndependenceDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [register, setRegister] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New person form
  const [newPersonId, setNewPersonId] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonRole, setNewPersonRole] = useState("staff");

  // Financial interest form
  const [fiRegisterId, setFiRegisterId] = useState("");
  const [fiType, setFiType] = useState("direct_investment");
  const [fiIssuer, setFiIssuer] = useState("");

  // Employment form
  const [empRegisterId, setEmpRegisterId] = useState("");
  const [empEntityName, setEmpEntityName] = useState("");
  const [empType, setEmpType] = useState("client");
  const [empRelationship, setEmpRelationship] = useState("family_member");

  // Threat form
  const [threatRegisterId, setThreatRegisterId] = useState("");
  const [threatCategory, setThreatCategory] = useState("self_interest");
  const [threatDescription, setThreatDescription] = useState("");
  const [threatLevel, setThreatLevel] = useState("moderate");

  // Conflict check
  const [conflictClientName, setConflictClientName] = useState("");
  const [conflictResult, setConflictResult] = useState<any>(null);

  // Confirmation
  const [confirmYear, setConfirmYear] = useState(new Date().getFullYear().toString());
  const [confirmStatus, setConfirmStatus] = useState<any>(null);

  // Threat categories
  const [threatCategories, setThreatCategories] = useState<any[]>([]);

  const orgId = auditOrganizationId || "org-aqliya";

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, reg, cats] = await Promise.all([
        getIndependenceDashboardAction(orgId),
        listRegisterAction(orgId),
        getThreatCategoriesAction(),
      ]);
      setDashboard(dash);
      setRegister(reg);
      setThreatCategories(cats);
    } catch { /* ignore */ }
    setLoading(false);
  }, [orgId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleRegisterPerson() {
    if (!newPersonId.trim() || !newPersonName.trim()) return;
    setSubmitting(true);
    try {
      await registerPersonAction({
        organizationId: orgId,
        entityId: newPersonId,
        entityName: newPersonName,
        entityRole: newPersonRole,
      });
      setSuccess(`تم تسجيل: ${newPersonName}`);
      setNewPersonId(""); setNewPersonName("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل التسجيل");
    }
    setSubmitting(false);
  }

  async function handleDeclareInterest() {
    if (!fiRegisterId || !fiIssuer) return;
    setSubmitting(true);
    try {
      await declareFinancialInterestAction({ registerId: fiRegisterId, interestType: fiType, issuerName: fiIssuer });
      setSuccess("تم الإفصاح عن المصلحة المالية");
      setFiIssuer("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الإفصاح");
    }
    setSubmitting(false);
  }

  async function handleDeclareEmployment() {
    if (!empRegisterId || !empEntityName) return;
    setSubmitting(true);
    try {
      await declareEmploymentAction({
        registerId: empRegisterId,
        relatedEntityName: empEntityName,
        relatedEntityType: empType,
        relationshipType: empRelationship,
      });
      setSuccess("تم الإفصاح عن علاقة العمل");
      setEmpEntityName("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الإفصاح");
    }
    setSubmitting(false);
  }

  async function handleIdentifyThreat() {
    if (!threatRegisterId || !threatDescription) return;
    setSubmitting(true);
    try {
      await identifyThreatAction({
        registerId: threatRegisterId,
        threatCategory,
        threatDescription,
        threatLevel,
      });
      setSuccess("تم تسجيل تهديد الاستقلالية");
      setThreatDescription("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تسجيل التهديد");
    }
    setSubmitting(false);
  }

  async function handleConflictCheck() {
    if (!conflictClientName.trim()) return;
    setSubmitting(true);
    try {
      const result = await runConflictCheckAction("", conflictClientName);
      setConflictResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل فحص التعارض");
    }
    setSubmitting(false);
  }

  async function handleCreateConfirmationCycle() {
    setSubmitting(true);
    try {
      const result = await createConfirmationCycleAction(orgId, Number(confirmYear));
      setSuccess(`تم إنشاء ${result.totalConfirmations} تأكيد`);
      const status = await getConfirmationStatusAction(orgId, Number(confirmYear));
      setConfirmStatus(status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء دورة التأكيد");
    }
    setSubmitting(false);
  }

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-600",
      suspended: "bg-red-100 text-red-700",
      pending: "bg-amber-100 text-amber-700",
      completed: "bg-green-100 text-green-700",
      flagged: "bg-red-100 text-red-700",
      identified: "bg-red-100 text-red-700",
      assessed: "bg-amber-100 text-amber-700",
      mitigated: "bg-blue-100 text-blue-700",
      accepted: "bg-gray-100 text-gray-600",
      resolved: "bg-green-100 text-green-700",
      passed: "bg-green-100 text-green-700",
    };
    return colors[s] ?? "bg-gray-100 text-gray-600";
  };

  const threatLevelColor = (l: string) => {
    if (l === "significant") return "bg-red-100 text-red-700";
    if (l === "moderate") return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><Shield className="ml-2 h-4 w-4" />نظرة عامة</TabsTrigger>
          <TabsTrigger value="register"><Users className="ml-2 h-4 w-4" />السجل</TabsTrigger>
          <TabsTrigger value="threats"><AlertTriangle className="ml-2 h-4 w-4" />التهديدات</TabsTrigger>
          <TabsTrigger value="conflict"><Search className="ml-2 h-4 w-4" />التعارض</TabsTrigger>
          <TabsTrigger value="confirm"><FileText className="ml-2 h-4 w-4" />التأكيد السنوي</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">إجمالي المسجلين</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{dashboard?.totalRegistered ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">النشطون</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-green-600">{dashboard?.activePersons ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">تهديدات مفتوحة</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-amber-600">{dashboard?.openThreats ?? 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">تأكيدات معلقة</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-red-600">{dashboard?.pendingConfirmations ?? 0}</p></CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">تسجيل شخص جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={newPersonId} onChange={e => setNewPersonId(e.target.value)} placeholder="معرف المستخدم" />
                <Input value={newPersonName} onChange={e => setNewPersonName(e.target.value)} placeholder="الاسم" />
                <Select value={newPersonRole} onValueChange={setNewPersonRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">شريك</SelectItem>
                    <SelectItem value="manager">مدير</SelectItem>
                    <SelectItem value="staff">موظف</SelectItem>
                    <SelectItem value="affiliate">منتسب</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleRegisterPerson} disabled={submitting}>
                  {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <Plus className="ml-1 h-3 w-3" />}
                  تسجيل
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">آخر التهديدات</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboard?.recentThreats?.length > 0 ? (
                  <div className="space-y-2">
                    {dashboard.recentThreats.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between text-sm border-b pb-1">
                        <span className="truncate">{t.threatDescription}</span>
                        <Badge className={threatLevelColor(t.threatLevel)}>{t.threatLevel}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد تهديدات مسجلة</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* REGISTER */}
        <TabsContent value="register" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">سجل الاستقلالية</h3>
          </div>
          {register.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">سجل الاستقلالية فارغ</CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {register.map((entry) => (
                <Card key={entry.id} className="cursor-pointer hover:border-primary/50" onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{entry.entityName}</p>
                        <p className="text-xs text-muted-foreground">{entry.entityRole}</p>
                      </div>
                      <Badge className={statusColor(entry.status)}>{entry.status}</Badge>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>مصالح: {entry.financialInterests?.length ?? 0}</span>
                      <span>علاقات: {entry.employmentRelationships?.length ?? 0}</span>
                      <span>تهديدات: {entry.threats?.length ?? 0}</span>
                    </div>

                    {/* Expanded detail */}
                    {selectedEntry?.id === entry.id && (
                      <div className="mt-3 border-t pt-3 space-y-3">
                        {/* Financial Interests */}
                        <div>
                          <p className="text-xs font-medium mb-1">المصالح المالية</p>
                          <div className="space-y-1">
                            {entry.financialInterests?.map((fi: any) => (
                              <div key={fi.id} className="text-xs flex justify-between bg-gray-50 p-1 rounded">
                                <span>{fi.issuerName} ({fi.interestType})</span>
                                {fi.amount && <span>{fi.amount.toLocaleString()} {fi.currency}</span>}
                              </div>
                            ))}
                          </div>
                          {/* Quick add financial interest */}
                          <div className="flex gap-2 mt-1">
                            <Input size={20} placeholder="المصدر" value={fiRegisterId === entry.id ? fiIssuer : ""}
                              onChange={e => { setFiRegisterId(entry.id); setFiIssuer(e.target.value); }} className="h-7 text-xs" />
                            <Button size="xs" variant="outline" onClick={() => {
                              setFiRegisterId(entry.id); setFiType("direct_investment");
                              if (fiIssuer) handleDeclareInterest();
                            }}>إضافة</Button>
                          </div>
                        </div>

                        {/* Employment Relationships */}
                        <div>
                          <p className="text-xs font-medium mb-1">علاقات العمل</p>
                          {entry.employmentRelationships?.map((er: any) => (
                            <div key={er.id} className="text-xs bg-gray-50 p-1 rounded mb-1">
                              {er.relatedEntityName} — {er.relationshipType}
                            </div>
                          ))}
                        </div>

                        {/* Threats */}
                        <div>
                          <p className="text-xs font-medium mb-1">التهديدات</p>
                          {entry.threats?.map((t: any) => (
                            <div key={t.id} className="text-xs bg-red-50 p-1 rounded mb-1 flex justify-between">
                              <span>{t.threatDescription}</span>
                              <Badge className={threatLevelColor(t.threatLevel)}>{t.threatLevel}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* THREATS */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">تسجيل تهديد جديد</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Select value={threatRegisterId} onValueChange={setThreatRegisterId}>
                <SelectTrigger><SelectValue placeholder="اختر الشخص" /></SelectTrigger>
                <SelectContent>
                  {register.filter(r => r.status === "active").map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.entityName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={threatCategory} onValueChange={setThreatCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {threatCategories.map((c: any) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={threatLevel} onValueChange={setThreatLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="moderate">متوسط</SelectItem>
                  <SelectItem value="significant">كبير</SelectItem>
                </SelectContent>
              </Select>
              <div className="sm:col-span-2">
                <Textarea value={threatDescription} onChange={e => setThreatDescription(e.target.value)}
                  placeholder="وصف التهديد..." className="min-h-[60px]" />
              </div>
              <Button size="sm" onClick={handleIdentifyThreat} disabled={submitting}>
                {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <AlertTriangle className="ml-1 h-3 w-3" />}
                تسجيل التهديد
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">التهديدات المسجلة</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.openThreats === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد تهديدات مفتوحة</p>
              ) : (
                <p className="text-sm">{dashboard?.openThreats ?? 0} تهديد مفتوح</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONFLICT CHECK */}
        <TabsContent value="conflict" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">فحص تضارب المصالح</CardTitle>
              <CardDescription>أدخل اسم العميل لفحص التعارض مع جميع المسجلين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={conflictClientName} onChange={e => setConflictClientName(e.target.value)}
                  placeholder="اسم العميل أو الشركة" />
                <Button onClick={handleConflictCheck} disabled={submitting}>
                  {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <Search className="ml-1 h-3 w-3" />}
                  فحص
                </Button>
              </div>

              {conflictResult && (
                <div className="border rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={statusColor(conflictResult.status)}>
                      {conflictResult.status === "passed" ? "لا يوجد تضارب" : `تضارب (${conflictResult.totalConflicts})`}
                    </Badge>
                  </div>
                  {conflictResult.conflicts?.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b pb-1">
                      <span>{c.personName} — {c.description}</span>
                      <Badge className={threatLevelColor(c.severity === "high" ? "significant" : "moderate")}>
                        {c.severity}
                      </Badge>
                    </div>
                  ))}
                  {conflictResult.status === "passed" && (
                    <p className="text-sm text-green-600">لا توجد تعارضات مع هذا العميل</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANNUAL CONFIRMATION */}
        <TabsContent value="confirm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">التأكيد السنوي للاستقلالية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>السنة</Label>
                  <Input value={confirmYear} onChange={e => setConfirmYear(e.target.value)} />
                </div>
                <Button onClick={handleCreateConfirmationCycle} disabled={submitting}>
                  {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <FileText className="ml-1 h-3 w-3" />}
                  إنشاء دورة التأكيد
                </Button>
              </div>

              {confirmStatus && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Card><CardContent className="p-2 text-center"><p className="text-lg font-bold">{confirmStatus.completed}</p><p className="text-xs">مكتمل</p></CardContent></Card>
                  <Card><CardContent className="p-2 text-center"><p className="text-lg font-bold text-amber-600">{confirmStatus.pending}</p><p className="text-xs">معلق</p></CardContent></Card>
                  <Card><CardContent className="p-2 text-center"><p className="text-lg font-bold text-red-600">{confirmStatus.flagged}</p><p className="text-xs">ملحوظ</p></CardContent></Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
