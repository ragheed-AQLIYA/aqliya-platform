"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Building2,
  UserCheck,
  FileSearch,
  Target,
  ChevronDown,
  ChevronUp,
  XCircle,
  Scale,
  DollarSign,
  Shield,
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
  createProspectAction,
  listProspectsAction,
  getProspectAction,
  submitKycAction,
  assessClientRiskAction,
  makeAcceptanceDecisionAction,
  getPipelineAction,
} from "@/actions/audit-client-acceptance-actions";

interface ClientAcceptanceDashboardProps {
  auditOrganizationId: string;
}

const statusLabels: Record<string, string> = {
  lead: "عميل محتمل",
  qualified: "مؤهل",
  kyc_in_progress: "قيد التحقق",
  declined: "مرفوض",
  accepted: "مقبول",
};

const statusColors: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-100 text-blue-700",
  kyc_in_progress: "bg-amber-100 text-amber-700",
  declined: "bg-red-100 text-red-700",
  accepted: "bg-green-100 text-green-700",
};

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
  decline: "bg-red-100 text-red-700",
};

export function ClientAcceptanceDashboard({
  auditOrganizationId,
}: ClientAcceptanceDashboardProps) {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [loading, setLoading] = useState(true);
  const [pipeline, setPipeline] = useState<any>(null);
  const [prospects, setProspects] = useState<any[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New prospect form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newSource, setNewSource] = useState("inbound");
  const [newIndustry, setNewIndustry] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newReferredBy, setNewReferredBy] = useState("");

  // KYC form
  const [kycData, setKycData] = useState({
    regulatoryStatus: "",
    regulatoryBody: "",
    pepCheck: "pending",
    sanctionCheck: "pending",
    adverseMediaCheck: "pending",
    notes: "",
  });

  // Risk assessment form
  const [riskFactors, setRiskFactors] = useState([
    { name: "entity_risk", weight: 0.25, score: 5, rationale: "" },
    { name: "industry_risk", weight: 0.20, score: 5, rationale: "" },
    { name: "financial_risk", weight: 0.20, score: 5, rationale: "" },
    { name: "governance_risk", weight: 0.15, score: 5, rationale: "" },
    { name: "regulatory_risk", weight: 0.20, score: 5, rationale: "" },
  ]);

  // Decision form
  const [decisionValue, setDecisionValue] = useState("accept");
  const [decisionRationale, setDecisionRationale] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");

  const orgId = auditOrganizationId || "org-aqliya";

  const loadPipeline = useCallback(async () => {
    setLoading(true);
    try {
      const [p, pros] = await Promise.all([
        getPipelineAction(orgId),
        listProspectsAction(orgId),
      ]);
      setPipeline(p);
      setProspects(pros);
    } catch { /* ignore */ }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  async function handleCreateProspect() {
    if (!newCompany.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createProspectAction({
        organizationId: orgId,
        source: newSource,
        companyName: newCompany,
        industry: newIndustry || undefined,
        contactName: newContact || undefined,
        contactEmail: newEmail || undefined,
        contactPhone: newPhone || undefined,
        estimatedFee: newFee ? Number(newFee) : undefined,
        referredBy: newReferredBy || undefined,
      });
      setSuccess(`تم إنشاء عميل محتمل: ${newCompany}`);
      setShowNewForm(false);
      resetProspectForm();
      await loadPipeline();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء العميل المحتمل");
    }
    setSubmitting(false);
  }

  async function handleSelectProspect(id: string) {
    try {
      const p = await getProspectAction(id);
      setSelectedProspect(p);
      setActiveTab("detail");
    } catch { /* ignore */ }
  }

  async function handleSubmitKyc() {
    if (!selectedProspect) return;
    setSubmitting(true);
    try {
      await submitKycAction(selectedProspect.id, kycData);
      setSuccess("تم إكمال فحص العناية الواجبة");
      const updated = await getProspectAction(selectedProspect.id);
      setSelectedProspect(updated);
      await loadPipeline();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إرسال KYC");
    }
    setSubmitting(false);
  }

  async function handleAssessRisk() {
    if (!selectedProspect) return;
    setSubmitting(true);
    try {
      await assessClientRiskAction({
        prospectId: selectedProspect.id,
        assessmentType: "acceptance",
        riskFactors,
      });
      setSuccess("تم تقييم المخاطر");
      const updated = await getProspectAction(selectedProspect.id);
      setSelectedProspect(updated);
      await loadPipeline();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تقييم المخاطر");
    }
    setSubmitting(false);
  }

  async function handleMakeDecision() {
    if (!selectedProspect) return;
    setSubmitting(true);
    try {
      await makeAcceptanceDecisionAction({
        prospectId: selectedProspect.id,
        decisionType: "acceptance",
        decision: decisionValue,
        rationale: decisionRationale,
        conditions: conditions.length > 0 ? conditions : undefined,
      });
      setSuccess("تم تسجيل قرار القبول");
      const updated = await getProspectAction(selectedProspect.id);
      setSelectedProspect(updated);
      await loadPipeline();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تسجيل القرار");
    }
    setSubmitting(false);
  }

  function resetProspectForm() {
    setNewCompany("");
    setNewSource("inbound");
    setNewIndustry("");
    setNewContact("");
    setNewEmail("");
    setNewPhone("");
    setNewFee("");
    setNewReferredBy("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline">
            <Target className="ml-2 h-4 w-4" />
            خط الأنابيب
          </TabsTrigger>
          <TabsTrigger value="new">
            <Plus className="ml-2 h-4 w-4" />
            عميل جديد
          </TabsTrigger>
          <TabsTrigger value="detail" disabled={!selectedProspect}>
            <Building2 className="ml-2 h-4 w-4" />
            تفاصيل العميل
          </TabsTrigger>
        </TabsList>

        {/* === PIPELINE TAB === */}
        <TabsContent value="pipeline" className="space-y-4">
          {/* Pipeline stats */}
          <div className="grid gap-4 sm:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  الإجمالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{pipeline?.totalProspects ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  عملاء حاليون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{pipeline?.totalClients ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  بانتظار المراجعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-600">
                  {pipeline?.pendingContinuance ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  مؤهلون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {pipeline?.byStatus?.qualified ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  مقبولون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {pipeline?.byStatus?.accepted ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Prospect list */}
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
                  onClick={() => handleSelectProspect(p.id)}
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
                      <span>
                        {new Date(p.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === NEW PROSPECT TAB === */}
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                إضافة عميل محتمل جديد
              </CardTitle>
              <CardDescription>
                أدخل معلومات العميل المحتمل لبدء عملية القبول
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>اسم الشركة *</Label>
                  <Input
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="الشركة السعودية القابضة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>المصدر</Label>
                  <Select value={newSource} onValueChange={setNewSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">واردة</SelectItem>
                      <SelectItem value="referral">إحالة</SelectItem>
                      <SelectItem value="tender">مناقصة</SelectItem>
                      <SelectItem value="existing_client_referral">إحالة عميل حالي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>القطاع</Label>
                  <Input
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="مقاولات، طاقة، خدمات..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم جهة الاتصال</Label>
                  <Input
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="أحمد محمد"
                  />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="a@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+966 5X XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الرسوم التقديرية</Label>
                  <Input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(e.target.value)}
                    placeholder="500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>مقدم الإحالة</Label>
                  <Input
                    value={newReferredBy}
                    onChange={(e) => setNewReferredBy(e.target.value)}
                    placeholder="اسم مقدم الإحالة"
                  />
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={handleCreateProspect}
                disabled={submitting || !newCompany.trim()}
              >
                {submitting ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="ml-2 h-4 w-4" />
                )}
                إضافة عميل محتمل
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === PROSPECT DETAIL TAB === */}
        <TabsContent value="detail" className="space-y-4">
          {selectedProspect && (
            <>
              {/* Header */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold">{selectedProspect.companyName}</h2>
                        <Badge className={statusColors[selectedProspect.status] ?? ""}>
                          {statusLabels[selectedProspect.status] ?? selectedProspect.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedProspect.industry} | {selectedProspect.source} | منذ{" "}
                        {new Date(selectedProspect.createdAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-sm">
                    {selectedProspect.contactName && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-4 w-4" />
                        {selectedProspect.contactName}
                      </span>
                    )}
                    {selectedProspect.contactEmail && (
                      <span>{selectedProspect.contactEmail}</span>
                    )}
                    {selectedProspect.estimatedFee && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {selectedProspect.estimatedFee.toLocaleString()} SAR
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Workflow step: 1. KYC (if not done) / 2. Risk / 3. Decision */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* KYC Card */}
                <Card className={selectedProspect.kycPackage ? "border-green-200" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileSearch className="h-4 w-4" />
                      الفحص النظري (KYC)
                      {selectedProspect.kycPackage && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProspect.kycPackage ? (
                      <div className="space-y-1 text-sm">
                        <p>PEP: {selectedProspect.kycPackage.pepCheck}</p>
                        <p>Sanctions: {selectedProspect.kycPackage.sanctionCheck}</p>
                        <p>Media: {selectedProspect.kycPackage.adverseMediaCheck}</p>
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
                            onChange={(e) => setKycData(prev => ({ ...prev, regulatoryBody: e.target.value }))}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">PEP</Label>
                              <Select value={kycData.pepCheck} onValueChange={(v) => setKycData(prev => ({ ...prev, pepCheck: v }))}>
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
                              <Select value={kycData.sanctionCheck} onValueChange={(v) => setKycData(prev => ({ ...prev, sanctionCheck: v }))}>
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
                              <Select value={kycData.adverseMediaCheck} onValueChange={(v) => setKycData(prev => ({ ...prev, adverseMediaCheck: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="clear">نظيف</SelectItem>
                                  <SelectItem value="flagged">ملحوظ</SelectItem>
                                  <SelectItem value="pending">قيد التحقق</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button size="sm" onClick={handleSubmitKyc} disabled={submitting}>
                            {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : null}
                            إرسال الفحص
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Assessment Card */}
                <Card className={selectedProspect.riskAssessment ? "border-blue-200" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Scale className="h-4 w-4" />
                      تقييم المخاطر
                      {selectedProspect.riskAssessment && (
                        <Badge className={riskColors[selectedProspect.riskAssessment.overallRiskLevel]}>
                          {selectedProspect.riskAssessment.overallRiskLevel}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProspect.riskAssessment ? (
                      <div className="space-y-1 text-sm">
                        <p>الدرجة: {selectedProspect.riskAssessment.overallRiskScore}/10</p>
                        <p>المستوى: {selectedProspect.riskAssessment.overallRiskLevel}</p>
                        <p>الحالة: {selectedProspect.riskAssessment.status}</p>
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
                                const newFactors = [...riskFactors];
                                newFactors[i] = { ...rf, score: Number(e.target.value) };
                                setRiskFactors(newFactors);
                              }}
                              className="w-full h-1.5 rounded-full"
                            />
                          </div>
                        ))}
                        <Button size="sm" onClick={handleAssessRisk} disabled={submitting}>
                          {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : null}
                          تقييم المخاطر
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Decision Card */}
                <Card className={selectedProspect.decisions?.length > 0 ? "border-green-200" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4" />
                      قرار القبول
                      {selectedProspect.decisions?.length > 0 && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProspect.decisions?.length > 0 ? (
                      <div className="space-y-1 text-sm">
                        <p>القرار: {selectedProspect.decisions[0].decision}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedProspect.decisions[0].rationale}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          اتخذ قراراً بناءً على تقييم المخاطر
                        </p>
                        <Select value={decisionValue} onValueChange={setDecisionValue}>
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
                          onChange={(e) => setDecisionRationale(e.target.value)}
                          placeholder="مبررات القرار..."
                          className="min-h-[60px]"
                        />
                        <Button size="sm" onClick={handleMakeDecision} disabled={submitting}>
                          {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <CheckCircle2 className="ml-1 h-3 w-3" />}
                          تسجيل القرار
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
