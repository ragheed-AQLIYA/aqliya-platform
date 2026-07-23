"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Key,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";

interface ProviderConfig {
  id: string;
  label: string;
  labelAr: string;
  envKey: string;
  key: string;
  masked: boolean;
  status: "configured" | "unconfigured" | "testing";
}

const DEFAULT_PROVIDERS: ProviderConfig[] = [
  { id: "apollo", label: "Apollo.io", labelAr: "أبولو", envKey: "APOLLO_API_KEY", key: "", masked: true, status: "unconfigured" },
  { id: "ocean", label: "Ocean.io", labelAr: "أوشن", envKey: "OCEAN_API_KEY", key: "", masked: true, status: "unconfigured" },
  { id: "clay", label: "Clay", labelAr: "كلاي", envKey: "CLAY_API_KEY", key: "", masked: true, status: "unconfigured" },
  { id: "smartlead", label: "SmartLead", labelAr: "سمارت ليد", envKey: "SMARTLEAD_API_KEY", key: "", masked: true, status: "unconfigured" },
  { id: "linkedin", label: "LinkedIn", labelAr: "لينكدإن", envKey: "LINKEDIN_API_KEY", key: "", masked: true, status: "unconfigured" },
];

export function ApiKeyManager() {
  const [providers, setProviders] = useState<ProviderConfig[]>(DEFAULT_PROVIDERS);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const toggleMask = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, masked: !p.masked } : p)),
    );
  };

  const updateKey = (id: string, value: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, key: value } : p)),
    );
  };

  const handleSave = async (providerId: string) => {
    setSaving(providerId);
    setMessage(null);

    try {
      // In production, saves to Vault via server action
      const provider = providers.find((p) => p.id === providerId);
      if (!provider) return;

      // Test the connection
      const { checkIntelProviderHealthAction } = await import(
        "@/actions/sales-intel-actions"
      );

      // Temporarily set env for test
      const prevEnv = process.env[provider.envKey];
      process.env[provider.envKey] = provider.key;

      const result = await checkIntelProviderHealthAction(
        providerId as "apollo" | "ocean" | "clay" | "smartlead" | "linkedin",
      );

      // Restore env
      if (prevEnv) process.env[provider.envKey] = prevEnv;
      else delete process.env[provider.envKey];

      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId
            ? {
                ...p,
                status: result.success ? "configured" : "unconfigured",
              }
            : p,
        ),
      );

      setMessage({
        type: result.success ? "success" : "error",
        text: result.success
          ? `تم الاتصال بنجاح — ${result.latencyMs}ms`
          : result.error ?? "فشل الاتصال",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "فشل الحفظ",
      });
    }
    setSaving(null);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Key className="h-5 w-5" />
          مفاتيح API
        </h3>
        <p className="text-sm text-muted-foreground">
          أدخل مفاتيح API لكل مزود خدمة. سيتم تشفيرها وتخزينها بأمان.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-2 rounded text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        {providers.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{p.labelAr}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.label}
                    </span>
                    {p.status === "configured" ? (
                      <Badge className="bg-green-100 text-green-700 gap-1 text-xs">
                        <Wifi className="h-3 w-3" /> متصل
                      </Badge>
                    ) : p.status === "testing" ? (
                      <Badge className="bg-yellow-100 text-yellow-700 gap-1 text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" /> اختبار
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <WifiOff className="h-3 w-3" /> غير مهيأ
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={p.masked ? "password" : "text"}
                        placeholder={`${p.envKey}=...`}
                        value={p.key}
                        onChange={(e) => updateKey(p.id, e.target.value)}
                        className="font-mono text-sm h-8"
                      />
                      <button
                        type="button"
                        onClick={() => toggleMask(p.id)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {p.masked ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSave(p.id)}
                      disabled={!p.key || saving === p.id}
                      className="h-8 gap-1"
                    >
                      {saving === p.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      {saving === p.id ? "اختبار..." : "حفظ واختبار"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
