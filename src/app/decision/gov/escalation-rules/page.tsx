"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, ArrowRight } from "lucide-react";

interface EscalationRule {
  id: string;
  organizationId: string;
  decisionTemplateId: string | null;
  escalateAfterHours: number;
  targetRoleSlug: string;
  isActive: boolean;
  createdAt: Date;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function EscalationRulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState<EscalationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EscalationRule | null>(null);
  const [formHours, setFormHours] = useState("24");
  const [formRole, setFormRole] = useState("reviewer");
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadRules() {
    setLoading(true);
    try {
      const { getEscalationRules } = await import("../actions");
      const result = await getEscalationRules();
      if (result.success) {
        setRules(result.data);
      } else {
        setError(result.error ?? "فشل تحميل القواعد");
      }
    } catch {
      setError("فشل تحميل القواعد");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  function openCreateDialog() {
    setEditingRule(null);
    setFormHours("24");
    setFormRole("reviewer");
    setFormActive(true);
    setDialogOpen(true);
  }

  function openEditDialog(rule: EscalationRule) {
    setEditingRule(rule);
    setFormHours(String(rule.escalateAfterHours));
    setFormRole(rule.targetRoleSlug);
    setFormActive(rule.isActive);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { createEscalationRuleAction, updateEscalationRuleAction } = await import("../actions");

      const data = {
        escalateAfterHours: parseInt(formHours, 10),
        targetRoleSlug: formRole,
        isActive: formActive,
      };

      const result = editingRule
        ? await updateEscalationRuleAction(editingRule.id, data)
        : await createEscalationRuleAction(data);

      if (!result.success) {
        setError(result.error ?? "فشل الحفظ");
        return;
      }

      setDialogOpen(false);
      await loadRules();
    } catch {
      setError("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ruleId: string) {
    if (!window.confirm("هل أنت متأكد من حذف قاعدة التصعيد هذه؟")) return;
    try {
      const { deleteEscalationRuleAction } = await import("../actions");
      const result = await deleteEscalationRuleAction(ruleId);
      if (result.success) {
        await loadRules();
      } else {
        setError(result.error ?? "فشل الحذف");
      }
    } catch {
      setError("فشل الحذف");
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <button
              onClick={() => router.push("/decision/gov")}
              className="hover:text-foreground transition-colors"
            >
              حوكمة القرارات
            </button>
            <ArrowRight className="h-3 w-3" />
            <span>قواعد التصعيد</span>
          </div>
          <h1 className="text-2xl font-bold">قواعد التصعيد</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة قواعد تصعيد القرارات للمراجعين عند تجاوز المهلة
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 ml-1" />
              قاعدة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRule ? "تعديل قاعدة التصعيد" : "قاعدة تصعيد جديدة"}
              </DialogTitle>
              <DialogDescription>
                حدد المهلة الزمنية والدور المستهدف للتصعيد
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="hours">المهلة (ساعات)</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  placeholder="مثال: 24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">الدور المستهدف</Label>
                <Select value={formRole} onValueChange={setFormRole}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reviewer">مراجع</SelectItem>
                    <SelectItem value="manager">مدير</SelectItem>
                    <SelectItem value="admin">مسؤول</SelectItem>
                    <SelectItem value="compliance">امتثال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="active">قاعدة نشطة</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "جاري الحفظ..." : editingRule ? "تحديث" : "إنشاء"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">جميع القواعد</CardTitle>
          <CardDescription>
            {rules.length} قاعدة تصعيد
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>لا توجد قواعد تصعيد</p>
              <Button variant="outline" className="mt-3" size="sm" onClick={openCreateDialog}>
                إنشاء قاعدة تصعيد
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الدور المستهدف</TableHead>
                  <TableHead>المهلة (ساعات)</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.targetRoleSlug}</TableCell>
                    <TableCell>{rule.escalateAfterHours}</TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "نشط" : "متوقف"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(rule.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(rule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
