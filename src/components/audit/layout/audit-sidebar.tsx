"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  SearchCheck,
  ListChecks,
  Eye,
  ShieldCheck,
  FileOutput,
  History,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "لوحة القيادة", href: "/audit", icon: LayoutDashboard, hash: "" },
  {
    label: "الارتباطات",
    href: "/audit#engagements",
    icon: Briefcase,
    hash: "engagements",
  },
  {
    label: "العملاء",
    href: "/audit#clients",
    icon: Building2,
    hash: "clients",
  },
  {
    label: "ميزان المراجعة",
    href: "/audit#trial-balances",
    icon: FileSpreadsheet,
    hash: "trial-balances",
  },
  {
    label: "القوائم المالية",
    href: "/audit#statements",
    icon: FileText,
    hash: "statements",
  },
  {
    label: "الأدلة",
    href: "/audit#evidence",
    icon: FolderOpen,
    hash: "evidence",
  },
  {
    label: "النتائج",
    href: "/audit#findings",
    icon: SearchCheck,
    hash: "findings",
  },
  {
    label: "التوصيات",
    href: "/audit#recommendations",
    icon: ListChecks,
    hash: "recommendations",
  },
  { label: "المراجعات", href: "/audit#reviews", icon: Eye, hash: "reviews" },
  {
    label: "الاعتماد",
    href: "/audit#approval",
    icon: ShieldCheck,
    hash: "approval",
  },
  {
    label: "النشر",
    href: "/audit#publication",
    icon: FileOutput,
    hash: "publication",
  },
  {
    label: "سجل التدقيق",
    href: "/audit#audit-trail",
    icon: History,
    hash: "audit-trail",
  },
  {
    label: "الإعدادات",
    href: "/audit#settings",
    icon: Settings,
    hash: "settings",
  },
  {
    label: "المشرفون",
    href: "/audit/admin/users",
    icon: ShieldCheck,
    hash: "",
  },
];

function AuditSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash.slice(1));
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  function isActive(item: (typeof navItems)[number]) {
    if (pathname === "/audit" && item.hash === "" && activeHash === "")
      return true;
    if (pathname === "/audit" && item.hash !== "" && activeHash === item.hash)
      return true;
    if (item.href !== "/audit" && pathname?.startsWith(item.href)) return true;
    return false;
  }

  function handleClick(e: React.MouseEvent, item: (typeof navItems)[number]) {
    if (item.hash) {
      e.preventDefault();
      router.push(item.href);
      setActiveHash(item.hash);
      const el = document.getElementById(item.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-l bg-background overflow-x-hidden">
      <div className="flex h-14 shrink-0 items-center border-b px-3 overflow-hidden">
        <Link
          href="/audit"
          className="flex items-center gap-2 min-w-0"
          aria-label="AQLIYA"
        >
          <Image
            src="/brand/aqliya-logo-approved.png"
            alt="AQLIYA"
            width={116}
            height={34}
            priority
            className="h-8 w-auto shrink-0"
          />
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-black tracking-wide text-primary truncate">
              AQLIYA
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground truncate">
              أوديت أو إس / ذكاء مالي
            </div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={(e) => handleClick(e, item)}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium min-h-[44px] transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { AuditSidebar };
