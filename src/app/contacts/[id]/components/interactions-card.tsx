"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar } from "lucide-react";

function interactionTypeIcon(type: string) {
  const map: Record<string, string> = {
    meeting: "📅",
    call: "📞",
    email: "📧",
    message: "💬",
    note: "📝",
    other: "📌",
  };
  return map[type] || "📌";
}

function interactionTypeLabel(type: string) {
  const map: Record<string, string> = {
    meeting: "اجتماع",
    call: "مكالمة",
    email: "بريد إلكتروني",
    message: "رسالة",
    note: "ملاحظة",
    other: "أخرى",
  };
  return map[type] || type;
}

interface Interaction {
  id: string;
  interactionType: string;
  occurredAt: string | Date;
  subject?: string | null;
  summary?: string | null;
}

interface InteractionsCardProps {
  contactId: string;
  interactions?: Interaction[];
}

export function InteractionsCard({ contactId, interactions }: InteractionsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          التفاعلات
        </CardTitle>
        <Link href={`/contacts/${contactId}/interactions/new`}>
          <Button size="sm" variant="outline">
            تسجيل تفاعل
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {!interactions || interactions.length === 0 ? (
          <p className="text-muted-foreground text-sm">لا توجد تفاعلات مسجلة</p>
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="border-r-4 border-primary pr-4 py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>{interactionTypeIcon(interaction.interactionType)}</span>
                  <Badge variant="outline" className="text-xs">
                    {interactionTypeLabel(interaction.interactionType)}
                  </Badge>
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(interaction.occurredAt).toLocaleDateString("ar-SA")}</span>
                </div>
                {interaction.subject && (
                  <p className="font-medium">{interaction.subject}</p>
                )}
                {interaction.summary && (
                  <p className="text-sm text-muted-foreground mt-1">{interaction.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
