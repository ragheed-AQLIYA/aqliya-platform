"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  linkDealEvidenceAction,
  unlinkDealEvidenceAction,
} from "@/actions/sales-actions";
import type { SalesEvidenceLinkView } from "@/lib/sales/evidence-links";
import { Link2, Unlink, RefreshCw } from "lucide-react";

function formatActionError(error: string, code?: string): string {
  if (code === "FORBIDDEN" || error === "Access denied") {
    return "لا تملك صلاحية ربط الأدلة";
  }
  if (code === "VALIDATION") {
    return error.replace(/^SalesOS validation:\s*/i, "");
  }
  if (error.includes("not found or not accessible")) {
    return "معرّف الدليل غير موجود أو خارج نطاق المنظمة";
  }
  if (error.includes("another organization")) {
    return "الدليل ينتمي لمنظمة أخرى";
  }
  return error || "تعذر ربط الدليل";
}

export function DealEvidencePanel({
  dealId,
  links,
}: {
  dealId: string;
  links: SalesEvidenceLinkView[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLinkSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await linkDealEvidenceAction(dealId, formData);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر ربط الدليل");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink(linkId: string) {
    setUnlinkingId(linkId);
    setError(null);
    try {
      const res = await unlinkDealEvidenceAction(dealId, linkId);
      if (res.ok) {
        router.refresh();
      } else {
        setError(formatActionError(res.error, res.code));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر إزالة الربط");
    } finally {
      setUnlinkingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        مراجع أدلة من Core (DecisionOS / LocalContentOS / AuditOS عبر platform org).
        أدخل معرّف دليل موجود — لا رفع ملفات من SalesOS.
      </p>

      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا أدلة مربوطة بعد.</p>
      ) : (
        <ul className="space-y-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-md border p-3 text-sm"
            >
              <div>
                <p className="font-medium">{link.title}</p>
                <p className="text-xs text-muted-foreground">
                  {link.evidenceId} · {link.type} · {link.evidenceSource}
                  {!link.resolved ? " · مرجع مخزّن (لم يُحل)" : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={unlinkingId === link.id}
                onClick={() => handleUnlink(link.id)}
              >
                {unlinkingId === link.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
                <span className="sr-only">إزالة الربط</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form action={handleLinkSubmit} className="space-y-3 border-t pt-4">
        <div className="space-y-1">
          <Label htmlFor="evidenceId">معرّف الدليل (Evidence ID)</Label>
          <Input
            id="evidenceId"
            name="evidenceId"
            placeholder="cuid من DecisionEvidence أو LocalContentEvidence"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="evidenceSource">المصدر (اختياري)</Label>
          <select
            id="evidenceSource"
            name="evidenceSource"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            disabled={loading}
            defaultValue=""
          >
            <option value="">تلقائي</option>
            <option value="decision">DecisionOS</option>
            <option value="local_content">LocalContentOS</option>
            <option value="audit">AuditOS</option>
          </select>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          ربط دليل
        </Button>
      </form>
    </div>
  );
}
