"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, Cloud, Server } from "lucide-react";
import {
  getAiSettingsAction,
  saveAiSettingsAction,
  type AiExecutionMode,
  type AiSettingsSnapshot,
} from "@/actions/ai-settings-actions";

export default function AiSettingsPage() {
  const [settings, setSettings] = useState<AiSettingsSnapshot | null>(null);
  const [mode, setMode] = useState<AiExecutionMode>("cloud");
  const [cloudProvider, setCloudProvider] = useState("openai");
  const [cloudModel, setCloudModel] = useState("");
  const [localBaseUrl, setLocalBaseUrl] = useState("");
  const [localModel, setLocalModel] = useState("");
  const [hybridPolicy, setHybridPolicy] = useState<
    Record<string, "local" | "cloud">
  >({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getAiSettingsAction()
      .then((s) => {
        setSettings(s);
        setMode(s.executionMode);
        setCloudProvider(s.cloudProvider);
        setCloudModel(s.cloudModel);
        setLocalBaseUrl(s.localBaseUrl);
        setLocalModel(s.localModel);
        setHybridPolicy(s.hybridPolicy);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  const onSave = () => {
    startTransition(async () => {
      try {
        await saveAiSettingsAction({
          executionMode: mode,
          cloudProvider,
          cloudModel,
          localBaseUrl,
          localModel,
          hybridPolicy: mode === "hybrid" ? hybridPolicy : undefined,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6" dir="rtl">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6" />
          إعدادات الذكاء الاصطناعي
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Cloud / Local / Hybrid — وفق ADR-001. المفاتيح السرية تُدار عبر البيئة أو
          Secret Vault.
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            نموذج التشغيل
          </CardTitle>
          <CardDescription>
            Cycle 1: Cloud. Local/Hybrid متاح من Cycle 2 عند تفعيل Ollama.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Execution Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as AiExecutionMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cloud">Cloud</SelectItem>
                <SelectItem value="local">Local (Ollama)</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Cloud className="h-4 w-4" /> Cloud Provider
              </Label>
              <Select value={cloudProvider} onValueChange={setCloudProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="cloud">Azure / Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cloud Model</Label>
              <Input
                value={cloudModel}
                onChange={(e) => setCloudModel(e.target.value)}
                placeholder="gpt-4o / claude-sonnet-4-20250514"
              />
            </div>
          </div>

          {(mode === "local" || mode === "hybrid") && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Server className="h-4 w-4" /> Ollama Base URL
                </Label>
                <Input
                  value={localBaseUrl}
                  onChange={(e) => setLocalBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
              </div>
              <div className="space-y-2">
                <Label>Local Model</Label>
                <Input
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  placeholder="qwen3 / deepseek / llama3"
                />
              </div>
            </div>
          )}

          {mode === "hybrid" && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label>Hybrid Task Routing</Label>
              <p className="text-muted-foreground text-xs">
                اختر Local (Ollama) أو Cloud لكل نوع مهمة — ADR-001 Cycle 2.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["tb_classification", "تصنيف ميزان المراجعة"],
                  ["account_mapping", "ربط الحسابات"],
                  ["notes_generation", "إنشاء الإيضاحات"],
                  ["report_writing", "كتابة التقارير"],
                  ["audit_findings", "نتائج التدقيق"],
                  ["analytical_review", "المراجعة التحليلية"],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{label}</span>
                    <Select
                      value={hybridPolicy[key] ?? "cloud"}
                      onValueChange={(v) =>
                        setHybridPolicy((prev) => ({
                          ...prev,
                          [key]: v as "local" | "cloud",
                        }))
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {settings && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant={settings.providersConfigured.openai ? "default" : "secondary"}>
                OpenAI {settings.providersConfigured.openai ? "✓" : "—"}
              </Badge>
              <Badge variant={settings.providersConfigured.anthropic ? "default" : "secondary"}>
                Anthropic {settings.providersConfigured.anthropic ? "✓" : "—"}
              </Badge>
              <Badge variant={settings.providersConfigured.local ? "default" : "secondary"}>
                Local {settings.providersConfigured.local ? "✓" : "—"}
              </Badge>
            </div>
          )}

          <Button onClick={onSave} disabled={pending}>
            {pending ? "جاري الحفظ…" : saved ? "تم الحفظ" : "حفظ الإعدادات"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
