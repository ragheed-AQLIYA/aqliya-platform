"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

interface RelationTarget {
  id: string;
  name: string;
}

interface Relation {
  id: string;
  relationType: string;
  description?: string | null;
  targetContact?: RelationTarget;
  sourceContact?: RelationTarget;
}

interface RelationsCardProps {
  contactId: string;
  outgoingRelations?: Relation[];
  incomingRelations?: Relation[];
}

export function RelationsCard({ contactId, outgoingRelations, incomingRelations }: RelationsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          العلاقات
        </CardTitle>
        <Link href={`/contacts/${contactId}/relations/new`}>
          <Button size="sm" variant="outline">
            إضافة علاقة
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {(outgoingRelations?.length ?? 0) === 0 && (incomingRelations?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground text-sm">لا توجد علاقات مسجلة</p>
        ) : (
          <div className="space-y-3">
            {outgoingRelations?.map((rel) => (
              <div key={rel.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{rel.relationType}</Badge>
                  <span>→</span>
                  <Link href={`/contacts/${rel.targetContact?.id}`} className="hover:underline font-medium">
                    {rel.targetContact?.name}
                  </Link>
                </div>
                {rel.description && (
                  <span className="text-sm text-muted-foreground">{rel.description}</span>
                )}
              </div>
            ))}
            {incomingRelations?.map((rel) => (
              <div key={rel.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Link href={`/contacts/${rel.sourceContact?.id}`} className="hover:underline font-medium">
                    {rel.sourceContact?.name}
                  </Link>
                  <span>→</span>
                  <Badge variant="secondary">{rel.relationType}</Badge>
                </div>
                {rel.description && (
                  <span className="text-sm text-muted-foreground">{rel.description}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
