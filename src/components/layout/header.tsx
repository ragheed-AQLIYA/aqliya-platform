"use client"

import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 md:hidden" aria-label="AQLIYA home">
          <Image src="/brand/aqliya-mark.svg" alt="" width={32} height={32} priority />
          <span className="font-bold tracking-wide text-primary">AQLIYA</span>
        </Link>
        <div className="flex items-center">
          <span className="text-sm font-medium text-primary">
            Mind the Future
          </span>
        </div>
      </div>
    </header>
  )
}
