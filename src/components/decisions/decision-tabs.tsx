"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabs = [
  { name: "Overview", href: "" },
  { name: "Tender", href: "/tender" },
  { name: "Simulation", href: "/simulation" },
  { name: "Recommendation", href: "/recommendation" },
  { name: "Governance", href: "/governance" },
  { name: "Report", href: "/report" },
]

export function DecisionTabs({ decisionId }: { decisionId: string }) {
  const pathname = usePathname()
  
  const currentTab = tabs.find(tab => {
    if (tab.href === "") {
      return pathname === `/decisions/${decisionId}`
    }
    return pathname === `/decisions/${decisionId}${tab.href}`
  })?.name || "Overview"

  return (
    <Tabs value={currentTab} className="mb-6">
      <TabsList className="grid w-full grid-cols-6">
        {tabs.map((tab) => (
          <Link key={tab.name} href={`/decisions/${decisionId}${tab.href}`}>
            <TabsTrigger value={tab.name} className="w-full">
              {tab.name}
            </TabsTrigger>
          </Link>
        ))}
      </TabsList>
    </Tabs>
  )
}
