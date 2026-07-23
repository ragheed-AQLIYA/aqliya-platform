"use client";

import { useState, useEffect } from "react";
import {
  checkIntelProviderHealthAction,
  listIntelProvidersAction,
} from "@/actions/sales-intel-actions";
import type { SalesIntelProviderId } from "@/lib/sales/intelligence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Wifi, WifiOff, Activity } from "lucide-react";

interface ProviderStatus {
  id: SalesIntelProviderId;
  label: string;
  labelAr: string;
  description: string;
  status: "healthy" | "unhealthy" | "checking" | "unconfigured";
  latencyMs?: number;
  rateLimitRemaining?: number;
  error?: string;
}

const PROVIDER_INFO: Record<
  SalesIntelProviderId,
  { label: string; labelAr: string; description: string }
> = {
  apollo: {
    label: "Apollo.io",
    labelAr: "أبولو",
    description: "275M contacts, ICP search, email verification",
  },
  ocean: {
    label: "Ocean.io",
    labelAr: "أوشن",
    description: "Lookalike company discovery, ICP enrichment",
  },
  clay: {
    label: "Clay",
    labelAr: "كلاي",
    description: "Waterfall enrichment, multi-source data blending",
  },
  smartlead: {
    label: "SmartLead AI",
    labelAr: "سمارت ليد",
    description: "Email outreach automation, reply detection, meetings",
  },
  linkedin: {
    label: "LinkedIn",
    labelAr: "لينكدإن",
    description: "Professional profiles, company data enrichment",
  },
  custom: {
    label: "Custom",
    labelAr: "مخصص",
    description: "Custom API integration",
  },
};

export function IntelConnectorsPanel() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const result = await listIntelProvidersAction();
      if (result.success) {
        const statuses: ProviderStatus[] = result.providers.map((id) => ({
          id,
          ...PROVIDER_INFO[id],
          status: "checking" as const,
        }));
        setProviders(statuses);

        // Check health for each
        for (const status of statuses) {
          try {
            const health = await checkIntelProviderHealthAction(status.id);
            setProviders((prev) =>
              prev.map((p) =>
                p.id === status.id
                  ? {
                      ...p,
                      status: health.success
                        ? "healthy"
                        : health.error?.includes("not configured")
                          ? "unconfigured"
                          : "unhealthy",
                      latencyMs: health.latencyMs,
                      rateLimitRemaining: health.rateLimitRemaining,
                      error: health.error,
                    }
                  : p,
              ),
            );
          } catch {
            setProviders((prev) =>
              prev.map((p) =>
                p.id === status.id
                  ? { ...p, status: "unconfigured" as const }
                  : p,
              ),
            );
          }
        }
      }
    } catch {
      // Failed to list providers
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const statusBadge = (status: ProviderStatus["status"]) => {
    switch (status) {
      case "healthy":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <Wifi className="h-3 w-3" />
            متصل
          </Badge>
        );
      case "unhealthy":
        return (
          <Badge className="bg-red-100 text-red-800 gap-1">
            <WifiOff className="h-3 w-3" />
            معطل
          </Badge>
        );
      case "checking":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 gap-1">
            <Activity className="h-3 w-3 animate-pulse" />
            جاري الفحص
          </Badge>
        );
      case "unconfigured":
        return (
          <Badge className="bg-gray-100 text-gray-600 gap-1">
            غير مهيأ
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-3" dir="rtl">
        <h3 className="text-lg font-bold">موصلات ذكاء المبيعات</h3>
        <p className="text-sm text-muted-foreground">Sales Intelligence Connectors</p>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">موصلات ذكاء المبيعات</h3>
          <p className="text-sm text-muted-foreground">
            Sales Intelligence Connectors
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadProviders}
          disabled={loading}
        >
          <RefreshCcw className="h-4 w-4 ml-1" />
          تحديث
        </Button>
      </div>

      <div className="grid gap-3">
        {providers.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.labelAr}</span>
                <span className="text-xs text-muted-foreground">
                  {p.label}
                </span>
                {statusBadge(p.status)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {p.description}
              </p>
              {p.status === "healthy" && p.latencyMs && (
                <p className="text-xs text-green-600 mt-1">
                  زمن الاستجابة: {p.latencyMs}ms
                  {p.rateLimitRemaining !== undefined &&
                    ` · الحد المتبقي: ${p.rateLimitRemaining}`}
                </p>
              )}
              {p.status === "unhealthy" && p.error && (
                <p className="text-xs text-red-500 mt-1">{p.error}</p>
              )}
              {p.status === "unconfigured" && (
                <p className="text-xs text-gray-500 mt-1">
                  أضف {p.labelAr}_API_KEY في متغيرات البيئة للتفعيل
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
