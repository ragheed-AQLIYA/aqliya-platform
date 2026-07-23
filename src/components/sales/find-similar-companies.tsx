"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchCompaniesAction } from "@/actions/sales-intel-actions";
import type { EnrichedCompany } from "@/lib/sales/intelligence";
import {
  Search,
  Building2,
  Loader2,
  ExternalLink,
  Users,
  DollarSign,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

export function FindSimilarCompanies() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EnrichedCompany[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Try Ocean.io first (lookalike), fallback to Apollo
      let companies: EnrichedCompany[] = [];

      try {
        const oceanResult = await searchCompaniesAction("ocean", {
          domain: domain.trim(),
          limit: 15,
        });
        if (oceanResult.success && oceanResult.data) {
          companies = oceanResult.data;
        }
      } catch {
        // Ocean failed
      }

      if (companies.length === 0) {
        try {
          const apolloResult = await searchCompaniesAction("apollo", {
            name: domain.trim(),
            limit: 10,
          });
          if (apolloResult.success && apolloResult.data) {
            companies = apolloResult.data;
          }
        } catch {
          // Apollo also failed
        }
      }

      setResults(companies);
      if (companies.length === 0) {
        setError("لم يتم العثور على شركات مشابهة");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل البحث");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex gap-2">
        <Input
          placeholder="أدخل domain الشركة... (مثال: stripe.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading || !domain.trim()}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin ml-1" />
          ) : (
            <Search className="h-4 w-4 ml-1" />
          )}
          بحث
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <div className="text-sm text-muted-foreground p-4 text-center">
          لم يتم العثور على نتائج. تأكد من اسم النطاق أو جرب البحث بكلمة مفتاحية.
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            تم العثور على {results.length} شركة مشابهة لـ{" "}
            <strong>{domain}</strong>
          </p>
          <div className="grid gap-2">
            {results.map((c) => (
              <Card key={c.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">{c.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {c.source}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                        {c.industry && (
                          <span className="text-muted-foreground">
                            🏭 {c.industry}
                          </span>
                        )}
                        {c.employeeCount && (
                          <span className="text-muted-foreground">
                            <Users className="h-3 w-3 inline ml-1" />
                            {c.employeeCount.toLocaleString()}
                          </span>
                        )}
                        {c.revenue && (
                          <span className="text-muted-foreground">
                            <DollarSign className="h-3 w-3 inline ml-1" />$
                            {(c.revenue / 1_000_000).toFixed(0)}M
                          </span>
                        )}
                        {c.country && (
                          <span className="text-muted-foreground">
                            <MapPin className="h-3 w-3 inline ml-1" />
                            {c.country}
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {c.linkedinUrl && (
                        <a
                          href={c.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-muted rounded"
                          title="LinkedIn"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <a
                        href={`/sales/accounts/new?name=${encodeURIComponent(c.name)}&source=${c.source}`}
                        className="p-1 hover:bg-muted rounded"
                        title="أضف كحساب"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
