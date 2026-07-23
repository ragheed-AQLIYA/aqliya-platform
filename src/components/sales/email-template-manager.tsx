"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, Mail, Copy, CheckCircle2 } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: "intro" | "follow_up" | "closing" | "custom";
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "intro-1",
    name: "تعريف أولي",
    subject: "تقديم AQLIYA — منصة ذكاء مؤسسي",
    body: `مرحباً {{name}}،

أتمنى أن تكون بخير. أود تعريفكم بمنصة AQLIYA — منصة ذكاء مؤسسي خاصة تساعد المؤسسات على بناء أنظمة محكومة قائمة على الأدلة.

هل ترغب في جدولة مكالمة تعريفية لمدة 15 دقيقة؟

مع التحية،
{{sender_name}}`,
    variables: ["name", "sender_name"],
    category: "intro",
  },
  {
    id: "follow-1",
    name: "متابعة — حالة استخدام",
    subject: "متابعة: AQLIYA لـ {{company}}",
    body: `مرحباً {{name}}،

أردت المتابعة بخصوص كيف يمكن لـ AQLIYA مساعدة {{company}} في {{use_case}}.

عملاؤنا في قطاع {{industry}} حققوا تحسيناً بنسبة {{improvement}}% في كفاءة التدقيق خلال أول 3 أشهر.

هل لديك وقت هذا الأسبوع لمناقشة هذا؟

مع التحية،
{{sender_name}}`,
    variables: ["name", "company", "use_case", "industry", "improvement", "sender_name"],
    category: "follow_up",
  },
  {
    id: "close-1",
    name: "دعوة أخيرة",
    subject: "اجتماع تجريبي — AQLIYA × {{company}}",
    body: `مرحباً {{name}}،

أتفهم أن الوقت ضيق. لذلك أقدم لكم جلسة تجريبية سريعة (20 دقيقة) نستعرض فيها AQLIYA مباشرة على بياناتكم.

حدد الوقت المناسب: {{calendar_link}}

مع التحية،
{{sender_name}}`,
    variables: ["name", "company", "calendar_link", "sender_name"],
    category: "closing",
  },
];

export function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = (template: EmailTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === template.id ? template : t)),
    );
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (نسخة)`,
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setEditing(newTemplate);
  };

  const handleNew = () => {
    const newTemplate: EmailTemplate = {
      id: `custom-${Date.now()}`,
      name: "قالب جديد",
      subject: "",
      body: "",
      variables: [],
      category: "custom",
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setEditing(newTemplate);
  };

  const renderBody = (body: string) => {
    return body.replace(/\{\{(\w+)\}\}/g, (_match: string, varName: string) => {
      return `<span class="bg-blue-100 text-blue-800 px-1 rounded text-xs font-mono">{{${varName}}}</span>`;
    });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            قوالب الإيميلات
          </h3>
          <p className="text-sm text-muted-foreground">
            Email Templates — استخدم {'{{'}variable{'}}'}</p>
        </div>
        <div className="flex gap-2">
          {saved && (
            <Badge className="bg-green-100 text-green-700 gap-1">
              <CheckCircle2 className="h-3 w-3" /> تم الحفظ
            </Badge>
          )}
          <Button size="sm" onClick={handleNew} variant="outline">
            <Plus className="h-4 w-4 ml-1" /> جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {templates.map((t) => (
          <Card key={t.id}>
            {editing?.id === t.id ? (
              <CardContent className="p-4 space-y-3">
                <Input
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  placeholder="اسم القالب"
                />
                <Input
                  value={editing.subject}
                  onChange={(e) =>
                    setEditing({ ...editing, subject: e.target.value })
                  }
                  placeholder="موضوع الإيميل"
                />
                <Textarea
                  value={editing.body}
                  onChange={(e) =>
                    setEditing({ ...editing, body: e.target.value })
                  }
                  placeholder="نص الإيميل... استخدم {{name}} للمتغيرات"
                  rows={5}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave(editing)}>
                    <Save className="h-4 w-4 ml-1" /> حفظ
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(null)}
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{t.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {t.category === "intro" ? "تعريف" : t.category === "follow_up" ? "متابعة" : t.category === "closing" ? "إغلاق" : "مخصص"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      الموضوع: {t.subject}
                    </p>
                    <div
                      className="text-xs text-muted-foreground line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: renderBody(t.body),
                      }}
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(t)}
                    >
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicate(t)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(t.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
