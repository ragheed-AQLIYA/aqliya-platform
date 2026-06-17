"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Plus, Loader2 } from "lucide-react";
import type { RiskFlag } from "@/actions/contact-actions";

interface RiskFlagsPanelProps {
  contactId: string;
  initialFlags: RiskFlag[];
}

const TYPE_LABELS: Record<string, string> = {
  compliance: "امتثال",
  data_privacy: "خصوصية بيانات",
  relationship: "علاقة",
  contractual: "تعاقدي",
  financial: "مالي",
  other: "أخرى",
};

const SEVERITY_LABELS: Record<string, { label: string; className: string }> = {
  low: { label: "منخفض", className: "bg-green-100 text-green-800" },
  medium: { label: "متوسط", className: "bg-amber-100 text-amber-800" },
  high: { label: "عالي", className: "bg-orange-100 text-orange-800" },
  critical: { label: "خطير", className: "bg-red-100 text-red-800" },
};

export function RiskFlagsPanel({ contactId, initialFlags }: RiskFlagsPanelProps) {
  const [flags, setFlags] = useState<RiskFlag[]>(initialFlags);
  const [loading, setLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("compliance");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const activeFlags = flags.filter((f) => !f.resolvedAt);
  const resolvedFlags = flags.filter((f) => f.resolvedAt);

  async function handleAdd() {
    if (!description.trim()) return;
    setLoading("add");
    setError("");
    try {
      const { addContactRiskFlag } = await import("@/actions/contact-actions");
      const newFlag = await addContactRiskFlag(contactId, {
        type: type as RiskFlag["type"],
        severity: severity as RiskFlag["severity"],
        description: description.trim(),
      });
      if (newFlag && "data" in newFlag) {
        setFlags((prev) => [...prev, newFlag.data as RiskFlag]);
      }
      setDescription("");
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إضافة العلم");
    } finally {
      setLoading(null);
    }
  }

  async function handleResolve(flagId: string) {
    setLoading(`resolve-${flagId}`);
    try {
      const { resolveContactRiskFlag } = await import("@/actions/contact-actions");
      await resolveContactRiskFlag(contactId, flagId);
      setFlags((prev) =>
        prev.map((f) =>
          f.id === flagId ? { ...f, resolvedAt: new Date().toISOString() } : f,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل حل العلم");
    } finally {
      setLoading(null);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setFlags(initialFlags); }, [initialFlags]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5" />
          علامات المخاطر
          {activeFlags.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {activeFlags.length}
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="ml-1 h-4 w-4" />
          إضافة
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
        )}

        {showForm && (
          <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
            <div>
              <label className="text-xs font-medium">النوع</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
              >
                <option value="compliance">امتثال</option>
                <option value="data_privacy">خصوصية بيانات</option>
                <option value="relationship">علاقة</option>
                <option value="contractual">تعاقدي</option>
                <option value="financial">مالي</option>
                <option value="other">أخرى</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">الخطورة</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
              >
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
                <option value="critical">خطير</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">الوصف</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف خطر..."
                rows={2}
                className="mt-1 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAdd}
                disabled={loading === "add" || !description.trim()}
                size="sm"
              >
                {loading === "add" ? (
                  <Loader2 className="ml-1 h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="ml-1 h-3 w-3" />
                )}
                إضافة
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {flags.length === 0 && !showForm && (
          <p className="text-muted-foreground text-sm">لا توجد علامات مخاطر</p>
        )}

        {activeFlags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">نشطة</p>
            {activeFlags.map((flag) => (
              <div key={flag.id} className="border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={SEVERITY_LABELS[flag.severity]?.className || ""}>
                    {SEVERITY_LABELS[flag.severity]?.label || flag.severity}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABELS[flag.type] || flag.type}
                  </Badge>
                </div>
                <p className="text-sm">{flag.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {flag.createdBy} • {new Date(flag.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                  <Button
                    onClick={() => handleResolve(flag.id)}
                    disabled={loading === `resolve-${flag.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    {loading === `resolve-${flag.id}` ? (
                      <Loader2 className="h-3 w-3 animate-spin ml-1" />
                    ) : (
                      <CheckCircle className="h-3 w-3 ml-1" />
                    )}
                    حل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {resolvedFlags.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium">
              تم الحل ({resolvedFlags.length})
            </summary>
            <div className="mt-2 space-y-2">
              {resolvedFlags.map((flag) => (
                <div key={flag.id} className="border rounded-lg p-2 opacity-60">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[flag.type] || flag.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{flag.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
