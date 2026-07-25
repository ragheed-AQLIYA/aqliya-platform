"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Briefcase, Building2, FileText, Tags } from "lucide-react";

interface ContactInfo {
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  organizationName?: string | null;
  notes?: string | null;
  tags?: string[] | null;
}

interface ContactInfoCardProps {
  contact: ContactInfo;
}

export function ContactInfoCard({ contact }: ContactInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>معلومات الاتصال</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contact.email && (
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span dir="ltr">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span dir="ltr">{contact.phone}</span>
          </div>
        )}
        {contact.position && (
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <span>{contact.position}</span>
          </div>
        )}
        {contact.department && (
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span>{contact.department}</span>
          </div>
        )}
        {contact.organizationName && (
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span>{contact.organizationName}</span>
          </div>
        )}
        {contact.notes && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <span className="whitespace-pre-wrap">{contact.notes}</span>
          </div>
        )}
        {Array.isArray(contact.tags) && contact.tags.length > 0 && (
          <div className="flex items-start gap-3">
            <Tags className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {contact.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
