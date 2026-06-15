"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Target, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  createQualityObjectiveAction,
  listQualityObjectivesAction,
  getIsqm1CategoriesAction,
} from "@/actions/audit-isqm1-actions";

interface Props {
  auditOrganizationId: string;
}

export function QualityObjectivesCrud({ auditOrganizationId }: Props) {
  const [objectives, setObjectives] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    objectiveType: "firm",
    category: "leadership",
    description: "",
    targetState: "",
    reference: "",
  });

  const orgId = auditOrganizationId || "org-aqliya";

  useEffect(() => {
    Promise.all([
      listQualityObjectivesAction(orgId),
      getIsqm1CategoriesAction(),
    ]).then(([objs, cats]) => {
      setObjectives(objs);
      setCategories(cats);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [orgId]);

  async function handleCreate() {
    if (!formData.description.trim()) return;
    setSubmitting(true); setError(null);
    try {
      const result = await createQualityObjectiveAction({
        organizationId: orgId,
        ...formData,
      });
      setObjectives(prev => [result, ...prev]);
      setShowForm(false);
      setSuccess("تم إنشاء هدف الجودة");
      setFormData({ objectiveType: "firm", category: "leadership", description: "", targetState: "", reference: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء الهدف");
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-4" dir="rtl">
      {error && <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><AlertTriangle className="h-4 w-4" />{error}</div>}
      {success && <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" />{success}</div>}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">أهداف الجودة</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="ml-1 h-4 w-4" />
          هدف جديد
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">النوع</Label>
                <Select value={formData.objectiveType} onValueChange={v => setFormData(p => ({ ...p, objectiveType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firm">مكتب التدقيق</SelectItem>
                    <SelectItem value="engagement">مهمة التدقيق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">التصنيف</Label>
                <Select value={formData.category} onValueChange={v => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => (
                      <SelectItem key={c.category} value={c.category}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">وصف الهدف</Label>
              <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="min-h-[60px]" placeholder="وصف هدف الجودة..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الوضع المستهدف</Label>
              <Input value={formData.targetState} onChange={e => setFormData(p => ({ ...p, targetState: e.target.value }))} placeholder="النتيجة المرجوة" />
            </div>
            <Button size="sm" onClick={handleCreate} disabled={submitting}>
              {submitting ? <Loader2 className="ml-1 h-3 w-3 animate-spin" /> : <Target className="ml-1 h-3 w-3" />}
              إنشاء الهدف
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : objectives.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-muted-foreground">لا توجد أهداف جودة</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {objectives.map((obj) => (
            <Card key={obj.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{obj.description}</p>
                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                      <Badge variant="outline">{obj.category}</Badge>
                      <span>{obj.reference ?? "—"}</span>
                    </div>
                  </div>
                  <Badge className={obj.status === "active" ? "bg-green-100 text-green-700" : ""}>{obj.status}</Badge>
                </div>
                {obj.targetState && <p className="text-xs text-muted-foreground mt-1">الهدف: {obj.targetState}</p>}
                {obj.risks && obj.risks.length > 0 && <p className="text-xs text-amber-600 mt-1">{obj.risks.length} مخاطر مرتبطة</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
