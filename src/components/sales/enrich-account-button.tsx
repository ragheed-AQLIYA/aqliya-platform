"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  enrichCompanyAction,
  enrichAccountContactsAction,
} from "@/actions/sales-intel-actions";
import {
  Search,
  Users,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import type { EnrichedCompany, EnrichedContact } from "@/lib/sales/intelligence";

interface EnrichAccountButtonProps {
  accountId: string;
  accountName: string;
}

export function EnrichAccountButton({
  accountId,
  accountName,
}: EnrichAccountButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    company?: EnrichedCompany;
    contacts?: EnrichedContact[];
    error?: string;
  } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleEnrich = async () => {
    setLoading(true);
    setResult(null);
    try {
      // First, try to enrich the company
      const companyResult = await enrichCompanyAction("apollo", accountName);

      if (companyResult.success && companyResult.data) {
        // Then find contacts for this company
        const contactsResult = await enrichAccountContactsAction(accountId);
        setResult({
          company: companyResult.data,
          contacts: contactsResult.success
            ? contactsResult.data?.contacts
            : [],
        });
      } else {
        setResult({ error: companyResult.error ?? "Enrichment failed" });
      }
    } catch (err) {
      setResult({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
    setLoading(false);
  };

  const enriched = result?.company;

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEnrich}
        disabled={loading}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {loading ? "جاري الإثراء..." : "إثراء البيانات"}
      </Button>

      {result?.error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="h-4 w-4" />
          {result.error}
        </div>
      )}

      {enriched && (
        <div className="space-y-3 p-3 rounded-lg border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">بيانات مُثراة</span>
              <Badge variant="outline" className="text-xs">
                {enriched.source}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "إخفاء" : "تفاصيل"}
            </Button>
          </div>

          {expanded && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {enriched.industry && (
                <div>
                  <span className="text-muted-foreground">الصناعة:</span>{" "}
                  {enriched.industry}
                </div>
              )}
              {enriched.employeeCount && (
                <div>
                  <span className="text-muted-foreground">الموظفون:</span>{" "}
                  {enriched.employeeCount?.toLocaleString()}
                </div>
              )}
              {enriched.revenue && (
                <div>
                  <span className="text-muted-foreground">الإيرادات:</span>{" "}
                  ${enriched.revenue?.toLocaleString()}
                </div>
              )}
              {enriched.country && (
                <div>
                  <span className="text-muted-foreground">الدولة:</span>{" "}
                  {enriched.country}
                </div>
              )}
              {enriched.city && (
                <div>
                  <span className="text-muted-foreground">المدينة:</span>{" "}
                  {enriched.city}
                </div>
              )}
              {enriched.founded && (
                <div>
                  <span className="text-muted-foreground">التأسيس:</span>{" "}
                  {enriched.founded}
                </div>
              )}
              {enriched.linkedinUrl && (
                <div className="col-span-2">
                  <a
                    href={enriched.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    LinkedIn
                  </a>
                </div>
              )}
              {enriched.technologies && enriched.technologies.length > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">التقنيات:</span>{" "}
                  {enriched.technologies.slice(0, 8).join("، ")}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {result?.contacts && result.contacts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-green-600" />
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            تم العثور على {result.contacts.length} جهة اتصال
          </div>
          <div className="space-y-1">
            {result.contacts.slice(0, 5).map((c, i) => (
              <div
                key={c.id || i}
                className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
              >
                <div>
                  <span className="font-medium">{c.fullName}</span>
                  {c.title && (
                    <span className="text-muted-foreground">
                      {" "}
                      — {c.title}
                    </span>
                  )}
                </div>
                <Badge
                  variant={
                    c.emailStatus === "valid" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {c.emailStatus === "valid"
                    ? "✓ صالح"
                    : c.emailStatus === "risky"
                      ? "⚠ خطر"
                      : c.emailStatus ?? "?"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
