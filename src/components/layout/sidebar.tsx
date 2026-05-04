"use client"

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
    <div className="hidden border-l bg-background md:block w-64"> {/* تغيير border-r إلى border-l للـ RTL */}
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="font-bold text-lg">
            أكليا
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
                  <item.icon className="ml-2 h-4 w-4" /> {/* تبديل mr-2 إلى ml-2 للـ RTL */}
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
