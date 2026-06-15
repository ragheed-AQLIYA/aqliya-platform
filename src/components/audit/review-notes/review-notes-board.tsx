"use client";

// ─── AuditOS L6.6 Review Notes Workflow Board ───

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Send,
  Flag,
  Gauge,
  ListChecks,
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
  createReviewNoteAction,
  listReviewNotesAction,
  assignReviewNoteAction,
  startReviewNoteWorkAction,
  respondReviewNoteAction,
  reviewReviewNoteAction,
  escalateReviewNoteAction,
  getReviewNoteSLAMetricsAction,
  getReviewNoteSLATargetsAction,
} from "@/actions/audit-review-notes-actions";

interface ReviewNotesBoardProps {
  engagementId: string;
}

export function ReviewNotesBoard({ engagementId }: ReviewNotesBoardProps) {
  const [activeTab, setActiveTab] = useState("board");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<any[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<any>(null);
  const [slaTargets, setSlaTargets] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New note form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTargetType, setNewTargetType] = useState("finding");
  const [newTargetId, setNewTargetId] = useState("");
  const [newTargetLabel, setNewTargetLabel] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newStage, setNewStage] = useState("execution");
  const [newComment, setNewComment] = useState("");
  const [newAssignee, setNewAssignee] = useState("");

  // Response & review
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewConclusion, setReviewConclusion] = useState<string>("satisfactory");
  const [reviewComment, setReviewComment] = useState("");
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationLevel, setEscalationLevel] = useState("manager");
  const [filterStatus, setFilterStatus] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      const [n, m, t] = await Promise.all([
        listReviewNotesAction(engagementId, filterStatus !== "all" ? { status: filterStatus } : undefined),
        getReviewNoteSLAMetricsAction(engagementId),
        getReviewNoteSLATargetsAction(),
      ]);
      setNotes(n);
      setSlaMetrics(m);
      setSlaTargets(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تحميل ملاحظات المراجعة");
    }
    setLoading(false);
  }, [engagementId, filterStatus]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  async function handleCreateNote() {
    setSubmitting(true);
    setError(null);
    try {
      await createReviewNoteAction({
        engagementId,
        targetType: newTargetType,
        targetId: newTargetId,
        targetLabel: newTargetLabel || undefined,
        reviewStage: newStage,
        priority: newPriority,
        comment: newComment,
        assignedToId: newAssignee || undefined,
      });
      setSuccess("تم إنشاء ملاحظة المراجعة");
      setShowNewForm(false);
      resetForm();
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء الملاحظة");
    }
    setSubmitting(false);
  }

  async function handleRespond(noteId: string) {
    if (!responseText.trim()) return;
    setSubmitting(true);
    try {
      await respondReviewNoteAction(noteId, engagementId, responseText);
      setRespondingId(null);
      setResponseText("");
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إرسال الرد");
    }
    setSubmitting(false);
  }

  async function handleReview(noteId: string) {
    setSubmitting(true);
    try {
      await reviewReviewNoteAction(noteId, engagementId, reviewConclusion as any, reviewComment);
      setReviewingId(null);
      setReviewComment("");
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل مراجعة الملاحظة");
    }
    setSubmitting(false);
  }

  async function handleEscalate(noteId: string) {
    if (!escalationReason.trim()) return;
    setSubmitting(true);
    try {
      await escalateReviewNoteAction(noteId, engagementId, escalationLevel, escalationReason);
      setEscalatingId(null);
      setEscalationReason("");
      await loadNotes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تصعيد الملاحظة");
    }
    setSubmitting(false);
  }

  function resetForm() {
    setNewTargetType("finding");
    setNewTargetId("");
    setNewTargetLabel("");
    setNewPriority("medium");
    setNewStage("execution");
    setNewComment("");
    setNewAssignee("");
  }

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      raised: "bg-slate-100 text-slate-700",
      assigned: "bg-blue-100 text-blue-700",
      in_progress: "bg-amber-100 text-amber-700",
      responded: "bg-violet-100 text-violet-700",
      evidenced: "bg-cyan-100 text-cyan-700",
      reviewed: "bg-indigo-100 text-indigo-700",
      closed: "bg-green-100 text-green-700",
    };
    return colors[s] ?? "bg-gray-100 text-gray-600";
  };

  const priorityColor = (p: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-amber-100 text-amber-700",
      low: "bg-slate-100 text-slate-600",
    };
    return colors[p] ?? "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="board">
            <ListChecks className="ml-2 h-4 w-4" />
            لوحة الملاحظات
          </TabsTrigger>
          <TabsTrigger value="sla">
            <Clock className="ml-2 h-4 w-4" />
            مؤشرات الأداء
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="ml-2 h-4 w-4" />
            ملاحظة جديدة
          </TabsTrigger>
        </TabsList>

        {/* === BOARD TAB === */}
        <TabsContent value="board" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {["all", "raised", "assigned", "in_progress", "responded", "closed"].map(
              (s) => (
                <Button
                  key={s}
                  variant={filterStatus === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(s)}
                >
                  {s === "all"
                    ? `الكل (${notes.length})`
                    : `${s} (${notes.filter((n) => n.status === s).length})`}
                </Button>
              ),
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {notes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد ملاحظات مراجعة
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id} className="border-border/70">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={priorityColor(note.priority)}>
                            {note.priority === "critical" ? "حرج" : note.priority === "high" ? "عالي" : note.priority === "medium" ? "متوسط" : "منخفض"}
                          </Badge>
                          <Badge className={statusColor(note.status)}>
                            {note.status === "raised" ? "مرفوعة" : note.status === "assigned" ? "مكلف" : note.status === "in_progress" ? "قيد التنفيذ" : note.status === "responded" ? "تم الرد" : note.status === "evidenced" ? "معززة بدليل" : note.status === "reviewed" ? "تمت المراجعة" : note.status === "closed" ? "مغلقة" : note.status}
                          </Badge>
                          {note.reviewNoteNumber && (
                            <span className="text-xs font-mono text-muted-foreground">
                              {note.reviewNoteNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {note.targetLabel || `${note.targetType}: ${note.targetId}`}
                        </p>
                        <p className="font-medium mt-2">{note.comment}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {note.raiserName || note.raiserId}
                          </span>
                          {note.assignedToId && (
                            <span className="flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              مكلف لـ: {note.assignedToId}
                            </span>
                          )}
                          {note.slaTargetHours && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              SLA: {note.slaTargetHours} ساعة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Response section */}
                    {note.status !== "closed" && note.status !== "reviewed" && (
                      <div className="mt-3 border-t pt-3">
                        {/* Respond */}
                        {respondingId === note.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="اكتب ردك على الملاحظة..."
                              className="min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleRespond(note.id)} disabled={submitting}>
                                {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <Send className="ml-1 h-3 w-3" />}
                                إرسال الرد
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setRespondingId(null); setResponseText(""); }}>
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setRespondingId(note.id)}>
                              <MessageSquare className="ml-1 h-3 w-3" />
                              رد
                            </Button>
                            {["raised", "assigned"].includes(note.status) && (
                              <Button size="sm" variant="outline" onClick={async () => { await startReviewNoteWorkAction(note.id, engagementId); loadNotes(); }}>
                                <Clock className="ml-1 h-3 w-3" />
                                بدء العمل
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => setEscalatingId(note.id)}>
                              <AlertTriangle className="ml-1 h-3 w-3" />
                              تصعيد
                            </Button>
                          </div>
                        )}

                        {/* Escalation form */}
                        {escalatingId === note.id && (
                          <div className="mt-2 space-y-2 border rounded-md p-3">
                            <Label>مستوى التصعيد</Label>
                            <Select value={escalationLevel} onValueChange={setEscalationLevel}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manager">مدير</SelectItem>
                                <SelectItem value="partner">شريك</SelectItem>
                                <SelectItem value="ethics">أخلاقيات</SelectItem>
                                <SelectItem value="quality">جودة</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              value={escalationReason}
                              onChange={(e) => setEscalationReason(e.target.value)}
                              placeholder="سبب التصعيد..."
                              className="min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" variant="destructive" onClick={() => handleEscalate(note.id)} disabled={submitting}>
                                {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : null}
                                تصعيد
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setEscalatingId(null); setEscalationReason(""); }}>
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Review/close section */}
                        {reviewingId === note.id ? (
                          <div className="mt-2 space-y-2 border rounded-md p-3">
                            <Label>القرار</Label>
                            <Select value={reviewConclusion} onValueChange={setReviewConclusion}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="satisfactory">مقبول - إغلاق</SelectItem>
                                <SelectItem value="needs_revision">يحتاج مراجعة</SelectItem>
                                <SelectItem value="re_open">إعادة فتح</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="تعليق المراجعة..."
                              className="min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleReview(note.id)} disabled={submitting}>
                                {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <CheckCircle2 className="ml-1 h-3 w-3" />}
                                تأكيد
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setReviewingId(null); setReviewComment(""); }}>
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        ) : (
                          note.status === "responded" || note.status === "evidenced" ? (
                            <Button size="sm" className="mt-2" onClick={() => setReviewingId(note.id)}>
                              <CheckCircle2 className="ml-1 h-3 w-3" />
                              مراجعة وإغلاق
                            </Button>
                          ) : null
                        )}
                      </div>
                    )}

                    {/* Escalations */}
                    {note.escalations && note.escalations.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {note.escalations.map((esc: any) => (
                          <div key={esc.id} className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            {esc.escalationLevel}: {esc.reason}
                            {esc.resolvedAt && (
                              <Badge className="bg-green-100 text-green-700">تم الحل</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Response & closure info */}
                    {note.responseDescription && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <p className="text-xs font-medium text-muted-foreground mb-1">الرد:</p>
                        <p>{note.responseDescription}</p>
                      </div>
                    )}
                    {note.closedAt && (
                      <p className="mt-1 text-xs text-green-600">
                        أغلقت: {new Date(note.closedAt).toLocaleDateString("ar-SA")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* === SLA TAB === */}
        <TabsContent value="sla" className="space-y-4">
          {slaMetrics ? (
            <>
              <div className="grid gap-4 sm:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      إجمالي الملاحظات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{slaMetrics.total}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      مفتوحة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-amber-600">{slaMetrics.open}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      مخالفة SLA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">{slaMetrics.breached}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                      متوسط وقت الحل
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{slaMetrics.avgResolutionHours}h</p>
                  </CardContent>
                </Card>
              </div>

              {/* SLA Targets */}
              {slaTargets && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">أهداف SLA حسب الأولوية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(slaTargets).map(([priority, target]: [string, any]) => (
                        <div key={priority} className="flex items-center justify-between text-sm">
                          <Badge className={priorityColor(priority)}>
                            {priority === "critical" ? "حرج" : priority === "high" ? "عالي" : priority === "medium" ? "متوسط" : "منخفض"}
                          </Badge>
                          <span>الاستجابة: {target.responseHrs}h | الحل: {target.resolutionHrs}h</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد بيانات أداء
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === CREATE TAB === */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                ملاحظة مراجعة جديدة
              </CardTitle>
              <CardDescription>
                أضف ملاحظة مراجعة لتكليف فريق العمل بمتابعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>نوع المستهدف</Label>
                  <Select value={newTargetType} onValueChange={setNewTargetType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="finding">نتيجة</SelectItem>
                      <SelectItem value="statement">قائمة مالية</SelectItem>
                      <SelectItem value="note">إيضاح</SelectItem>
                      <SelectItem value="evidence">دليل</SelectItem>
                      <SelectItem value="working_paper">ورقة عمل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>معرف المستهدف</Label>
                  <Input
                    value={newTargetId}
                    onChange={(e) => setNewTargetId(e.target.value)}
                    placeholder="معرف العنصر"
                  />
                </div>
                <div className="space-y-2">
                  <Label>وصف المستهدف</Label>
                  <Input
                    value={newTargetLabel}
                    onChange={(e) => setNewTargetLabel(e.target.value)}
                    placeholder="وصف مختصر للعنصر"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الأولوية</Label>
                  <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">حرج</SelectItem>
                      <SelectItem value="high">عالي</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="low">منخفض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>مرحلة المراجعة</Label>
                  <Select value={newStage} onValueChange={setNewStage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">تخطيط</SelectItem>
                      <SelectItem value="execution">تنفيذ</SelectItem>
                      <SelectItem value="reporting">إعداد التقارير</SelectItem>
                      <SelectItem value="completion">إكمال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>تكليف (اختياري)</Label>
                  <Input
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    placeholder="معرف المستخدم"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>نص الملاحظة</Label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="اكتب ملاحظة المراجعة..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                className="mt-4"
                onClick={handleCreateNote}
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="ml-2 h-4 w-4" />
                )}
                {submitting ? "جارٍ الإنشاء..." : "إنشاء ملاحظة المراجعة"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
