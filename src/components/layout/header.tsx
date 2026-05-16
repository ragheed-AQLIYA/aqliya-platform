"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const workspaceLabel = pathname?.startsWith("/audit")
    ? "AuditOS"
    : pathname?.startsWith("/decisions") ||
        pathname?.startsWith("/organizations") ||
        pathname?.startsWith("/settings") ||
        pathname?.startsWith("/intelligence")
      ? "DecisionOS"
      : "AQLIYA Platform";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 md:hidden"
          aria-label="AQLIYA"
        >
          <Image
            src="/brand/aqliya-logo-approved.png"
            alt="AQLIYA"
            width={32}
            height={32}
            priority
          />
          <span className="font-bold tracking-wide text-primary">AQLIYA</span>
        </Link>
        <div className="flex items-center">
          <span className="text-sm font-medium text-primary">
            {workspaceLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
