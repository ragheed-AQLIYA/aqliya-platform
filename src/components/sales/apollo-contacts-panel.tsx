"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findContactsAction } from "@/actions/sales-intel-actions";
import type { EnrichedContact } from "@/lib/sales/intelligence";
import { Users, Loader2, Plus, Mail, Phone, Link2, Search } from "lucide-react";

export function ApolloContactsPanel({ accountName, accountId }: { accountName: string; accountId: string }) {
  const [contacts, setContacts] = useState<EnrichedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await findContactsAction("apollo", {
        keywords: [accountName],
        limit: 20,
      });
      if (result.success && result.data) {
        setContacts(result.data);
      }
      setSearched(true);
    } catch { /* fail silently */ }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5" />
            جهات اتصال من Apollo
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Search className="h-4 w-4 ml-1" />}
            {loading ? "بحث..." : searched ? "تحديث" : "بحث"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!searched ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            اضغط "بحث" لاستيراد جهات الاتصال من Apollo.io
          </p>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            لم يتم العثور على جهات اتصال
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {contacts.map((c, i) => (
              <div key={c.id || i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                <div>
                  <p className="font-medium">{c.fullName}</p>
                  {c.title && <p className="text-xs text-muted-foreground">{c.title}</p>}
                  <div className="flex gap-1 mt-1">
                    {c.email && (
                      <span className="text-xs flex items-center gap-0.5 text-muted-foreground">
                        <Mail className="h-3 w-3" /> {c.email}
                      </span>
                    )}
                    {c.phone && (
                      <span className="text-xs flex items-center gap-0.5 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.emailStatus === "valid" ? "default" : "secondary"} className="text-xs">
                    {c.emailStatus === "valid" ? "✓" : "?"}
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">
                    <Plus className="h-3 w-3 ml-1" /> إضافة
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
