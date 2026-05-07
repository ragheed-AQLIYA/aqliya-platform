"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Settings } from "lucide-react"

const navigation = [
  { name: "القرارات", href: "/decisions", icon: LayoutDashboard },
  { name: "المنظمات", href: "/organizations", icon: Users },
  { name: "الإعدادات", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden w-64 border-l bg-background md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-3" aria-label="AQLIYA home">
            <Image src="/brand/aqliya-mark.svg" alt="" width={36} height={36} priority />
            <div className="leading-tight">
              <div className="font-black tracking-wide text-primary">AQLIYA</div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Mind the Future</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="ml-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
