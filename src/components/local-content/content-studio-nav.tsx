"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/local-content", label: "مركز القيادة" },
  { href: "/local-content/projects", label: "مشاريع الامتثال" },
  { href: "/local-content/analytics", label: "تحليلات الإنفاق" },
  { href: "/local-content/classification-rules", label: "قواعد التصنيف" },
  { href: "/local-content/campaigns", label: "الحملات" },
  { href: "/local-content/review", label: "المراجعة" },
  { href: "/local-content/outputs", label: "المخرجات" },
];

export function ContentStudioNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b pb-3">
      {links.map((link) => {
        const active =
          link.href === "/local-content"
            ? pathname === link.href
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            prefetch={
              link.href === "/local-content/review" ||
              link.href === "/local-content/outputs"
                ? false
                : undefined
            }
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
