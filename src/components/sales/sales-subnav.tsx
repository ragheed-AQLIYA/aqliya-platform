"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Target,
  Activity,
  Brain,
  Users,
  TrendingUp,
  LineChart,
  Filter,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/sales", labelAr: "مركز القيادة", icon: LayoutDashboard, exact: true },
  { href: "/sales/accounts", labelAr: "الحسابات", icon: Building2 },
  { href: "/sales/opportunities", labelAr: "المسار", icon: Target },
  { href: "/sales/activities", labelAr: "الأنشطة", icon: Activity },
  { href: "/sales/intelligence", labelAr: "الذكاء", icon: Brain },
  { href: "/sales/icp", labelAr: "ICP", icon: Users },
  { href: "/sales/revenue", labelAr: "الإيرادات", icon: TrendingUp },
  { href: "/sales/forecast", labelAr: "التوقعات", icon: LineChart },
  { href: "/sales/funnel", labelAr: "قمع التحويل", icon: Filter },
] as const;

export function SalesSubNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-6 flex flex-wrap gap-1 rounded-xl border bg-muted/40 p-1"
      dir="rtl"
      aria-label="تنقل SalesOS"
    >
      {NAV_ITEMS.map((item) => {
        const { href, labelAr, icon: Icon } = item;
        const exact = "exact" in item ? item.exact : false;
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {labelAr}
          </Link>
        );
      })}
    </nav>
  );
}
