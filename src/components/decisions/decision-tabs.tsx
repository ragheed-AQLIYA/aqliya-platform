"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabs = [
  { name: "Overview", href: "" },
  { name: "Intake", href: "/intake" },
  { name: "Framework", href: "/framework" },
  { name: "Scenarios", href: "/scenarios" },
  { name: "Risks", href: "/risks" },
  { name: "Recommendation", href: "/recommendation" },
  { name: "Insight", href: "/insight" },
  { name: "What to Do", href: "/what-to-do" },
  { name: "Overview", href: "/overview" },
  { name: "Sector", href: "/sector" },
  { name: "Signals", href: "/signals" },
  { name: "Alerts", href: "/alerts" },
  { name: "Tender", href: "/tender" },
  { name: "Simulation", href: "/simulation" },
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
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-10">
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
