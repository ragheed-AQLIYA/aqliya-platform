import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader({ disclaimerAr }: { disclaimerAr: string }) {
  return (
    <>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">
            \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u062a\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a
          </h1>
          <Badge variant="outline" className="text-[10px]">
            \u0644\u064a\u0633 CRM
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Revenue \u00b7 Pipeline \u00b7 ICP \u00b7 Proof \u00b7 Signals \u00b7 Recommendations \u00b7
          Learning \u00b7 Executive Risks \u2014 SalesOS v0.2
        </p>
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
          {disclaimerAr}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/sales/revenue" className="text-primary hover:underline">
          \u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0625\u064a\u0631\u0627\u062f\u0627\u062a
        </Link>
        <Link href="/sales/icp" className="text-primary hover:underline">
          ICP
        </Link>
        <Link href="/sales/intelligence" className="text-primary hover:underline">
          \u0630\u0643\u0627\u0621 \u0627\u0644\u0633\u0648\u0642
        </Link>
        <Link href="/sales" className="text-primary hover:underline">
          \u0645\u0631\u0643\u0632 \u0642\u064a\u0627\u062f\u0629 SalesOS
        </Link>
      </div>
    </>
  );
}
