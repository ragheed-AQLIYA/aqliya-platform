"use client";

import { Building2 } from "lucide-react";

interface OrgHeaderProps {
  name: string;
  nameAr: string;
}

export function OrgHeader({ name, nameAr }: OrgHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
        <Building2 className="h-7 w-7 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-black text-foreground">{nameAr}</h1>
        <p className="text-sm text-muted-foreground">
          {name} — مساحة مؤسسة داخل عقلية تستخدم المنتجات المفعلة لها.
        </p>
      </div>
    </div>
  );
}
