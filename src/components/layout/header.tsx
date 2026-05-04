"use client"

import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="font-bold text-lg md:hidden">
          AQLIYA
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            AQLIYA Decision OS
          </span>
        </div>
      </div>
    </header>
  )
}
