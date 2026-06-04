"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createIcpInsightAdminAction,
  createTerritoryAdminAction,
  deleteIcpInsightAdminAction,
  deleteTerritoryAdminAction,
} from "@/actions/sales-admin-actions";
import type { SalesICPInsight } from "@/lib/sales/types";
import type { SalesTerritory } from "@/lib/sales/sales-territory-store";
import { SALES_ICP_DIMENSIONS } from "@/lib/sales/types";

export function IcpTerritoryAdminPanel({
  insights,
  territories,
}: {
  insights: SalesICPInsight[];
  territories: SalesTerritory[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [icpDim, setIcpDim] = useState<string>(SALES_ICP_DIMENSIONS[0]);
  const [icpHypothesis, setIcpHypothesis] = useState("");
  const [territoryCode, setTerritoryCode] = useState("");
  const [territoryName, setTerritoryName] = useState("");
  const [territoryRegion, setTerritoryRegion] = useState("");

  return (
    <div className="space-y-8 rounded-lg border p-4" dir="rtl">
      <div>
        <h2 className="text-lg font-bold">إدارة ICP والمناطق (S7-08)</h2>
        <p className="text-xs text-muted-foreground mt-1">
          مسودات محكومة — تتطلب مراجعة بشرية قبل اعتماد ICP التشغيلي.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-2">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">رؤى ICP</h3>
        <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
          {insights.map((i) => (
            <li
              key={i.id}
              className="flex justify-between gap-2 border rounded px-2 py-1"
            >
              <span className="truncate">
                {i.dimension}: {i.hypothesis.slice(0, 60)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive shrink-0"
                onClick={async () => {
                  const res = await deleteIcpInsightAdminAction(i.id);
                  if (!res.ok) setError(res.error);
                  else router.refresh();
                }}
              >
                حذف
              </Button>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label>البُعد</Label>
            <select
              className="w-full border rounded-md h-9 px-2 text-sm"
              value={icpDim}
              onChange={(e) => setIcpDim(e.target.value)}
            >
              {SALES_ICP_DIMENSIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>فرضية</Label>
            <Input
              value={icpHypothesis}
              onChange={(e) => setIcpHypothesis(e.target.value)}
            />
          </div>
        </div>
        <Button
          size="sm"
          onClick={async () => {
            setError(null);
            const res = await createIcpInsightAdminAction({
              dimension: icpDim as (typeof SALES_ICP_DIMENSIONS)[number],
              hypothesis: icpHypothesis || "فرضية جديدة",
              evidenceSummary: "أُضيفت من لوحة الإدارة",
            });
            if (!res.ok) setError(res.error);
            else {
              setIcpHypothesis("");
              router.refresh();
            }
          }}
        >
          إضافة رؤية ICP
        </Button>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">المناطق (Territory)</h3>
        <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
          {territories.map((t) => (
            <li
              key={t.id}
              className="flex justify-between gap-2 border rounded px-2 py-1"
            >
              <span>
                {t.code} — {t.nameAr} ({t.regionLabel})
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive shrink-0"
                onClick={async () => {
                  const res = await deleteTerritoryAdminAction(t.id);
                  if (!res.ok) setError(res.error);
                  else router.refresh();
                }}
              >
                حذف
              </Button>
            </li>
          ))}
        </ul>
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <Label>الرمز</Label>
            <Input
              value={territoryCode}
              onChange={(e) => setTerritoryCode(e.target.value)}
            />
          </div>
          <div>
            <Label>الاسم</Label>
            <Input
              value={territoryName}
              onChange={(e) => setTerritoryName(e.target.value)}
            />
          </div>
          <div>
            <Label>المنطقة</Label>
            <Input
              value={territoryRegion}
              onChange={(e) => setTerritoryRegion(e.target.value)}
            />
          </div>
        </div>
        <Button
          size="sm"
          onClick={async () => {
            setError(null);
            const res = await createTerritoryAdminAction({
              code: territoryCode || "NEW",
              nameAr: territoryName || "منطقة جديدة",
              regionLabel: territoryRegion || "غير محدد",
            });
            if (!res.ok) setError(res.error);
            else {
              setTerritoryCode("");
              setTerritoryName("");
              setTerritoryRegion("");
              router.refresh();
            }
          }}
        >
          إضافة منطقة
        </Button>
      </section>
    </div>
  );
}
