"use client";

import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NextActionBanner({
  href,
  label,
  reason,
}: {
  href: string;
  label: string;
  reason: string | null;
}) {
  return (
    <Card className="rounded-[24px] border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            المتطلب التالي قبل الاعتماد: {label}
          </p>
          {reason && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {reason}
            </p>
          )}
        </div>
        <Link href={href}>
          <Button size="sm" variant="outline">
            {label}
            <ArrowRight className="mr-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
