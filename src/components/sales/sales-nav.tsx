"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/sales", label: "لوحة المبيعات" },
  { href: "/sales/deals", label: "الصفقات" },
  { href: "/sales/deals/new", label: "صفقة جديدة" },
] as const;

export function SalesNav({ activePath }: { activePath?: string }) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname ?? "/sales";
  return (
    <nav
      className="flex flex-wrap gap-2 border-b pb-3 mb-6"
      aria-label="تنقل SalesOS"
    >
      {links.map((link) => {
        const active =
          currentPath === link.href ||
          (link.href !== "/sales" && currentPath.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
