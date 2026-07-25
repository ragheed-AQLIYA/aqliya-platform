"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

function sensitivityBadge(sensitivityLevel: string) {
  const map: Record<string, { label: string; className: string }> = {
    normal: { label: "عادي", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
    sensitive: { label: "حساس", className: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" },
    confidential: { label: "سري", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  };
  const entry = map[sensitivityLevel] || map.normal;
  return <Badge className={entry.className}>{entry.label}</Badge>;
}

interface ContactHeaderProps {
  name: string;
  sensitivityLevel: string;
}

export function ContactHeader({ name, sensitivityLevel }: ContactHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Link href="/contacts">
        <Button variant="ghost" size="icon">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Link>
      <h1 className="text-3xl font-bold flex-1">{name}</h1>
      {sensitivityBadge(sensitivityLevel)}
    </div>
  );
}
