"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileSpreadsheet,
  GitBranch,
  FileText,
  FolderOpen,
  Link2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    label: "نظرة عامة",
    href: "/auditos",
    icon: Sparkles,
    desc: "مسار عرض ثابت",
  },
  {
    label: "ميزان المراجعة",
    href: "/auditos/trial-balance",
    icon: FileSpreadsheet,
    desc: "بيانات عرض ثابتة",
  },
  {
    label: "تصنيف الحسابات",
    href: "/auditos/mapping",
    icon: GitBranch,
    desc: "ربط توضيحي بالمعايير",
  },
  {
    label: "القوائم المالية",
    href: "/auditos/statements",
    icon: FileText,
    desc: "مخرجات تجريبية فقط",
  },
  {
    label: "الأدلة والملاحظات",
    href: "/auditos/evidence",
    icon: FolderOpen,
    desc: "أدلة معقمة للعرض",
  },
  {
    label: "التتبع",
    href: "/auditos/traceability",
    icon: Link2,
    desc: "سجل عرض ثابت",
  },
];

export function DemoSidebar() {
  const pathname = usePathname();
  const currentIdx = steps.findIndex((s) => s.href === pathname);

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-l bg-background lg:flex">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-3" aria-label="AQLIYA">
          <Image
            src="/brand/aqliya-logo-approved.png"
            alt="AQLIYA"
            width={110}
            height={33}
            className="shrink-0 h-8 w-auto"
          />
        </Link>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="mb-2 rounded-md bg-muted/50 px-3 py-2">
          <p className="text-xs font-bold text-muted-foreground">
            تجربة AuditOS العامة
          </p>
          <p className="text-[10px] text-muted-foreground/70">
            بيانات ثابتة، قراءة فقط، بلا تنزيلات
          </p>
        </div>

        <nav aria-label="مراحل عرض AuditOS" className="space-y-1">
          {steps.map((step, i) => {
            const isActive = pathname === step.href;
            const isPast = currentIdx > i;
            return (
              <Link
                key={step.href}
                href={step.href}
                className={cn(
                  "flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : isPast
                      ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                      : "text-muted-foreground/60",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isPast
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground/60",
                  )}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-sm">{step.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {step.desc}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى AQLIYA
        </Link>
      </div>
    </aside>
  );
}
