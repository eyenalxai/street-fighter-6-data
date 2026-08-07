import type { LucideIcon } from "lucide-react"

import {
  ArrowLeftRight,
  BarChart3,
  Crosshair,
  LineChart,
  Network,
  Scale,
  Swords,
  Target,
  TrendingUp,
} from "lucide-react"

import type { DashboardView } from "@/lib/sf6/model"
import type { DashboardSearch } from "@/lib/sf6/search"

import { cn } from "@/lib/utils"

type Tab = {
  id: DashboardView
  label: string
  icon: LucideIcon
}

const TABS: Tab[] = [
  { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
  { id: "trends", label: "Trends", icon: LineChart },
  { id: "ranks", label: "Rank Progression", icon: TrendingUp },
  { id: "control", label: "Control Types", icon: Crosshair },
  { id: "matchups", label: "Matchups", icon: Swords },
  { id: "counterpicks", label: "Counterpicks", icon: Target },
  { id: "compare", label: "Period Compare", icon: ArrowLeftRight },
  { id: "similarity", label: "Similarity", icon: Network },
  { id: "balance", label: "Balance", icon: Scale },
]

type TabNavProps = {
  view: DashboardSearch["view"]
  onChange: (changes: Partial<DashboardSearch>) => void
}

const TabNav = ({ view, onChange }: TabNavProps) => (
  <nav
    className="flex gap-1 overflow-x-auto border-b border-border px-4 md:px-6"
    aria-label="Analytics views"
    role="tablist"
  >
    {TABS.map(({ id, label, icon: Icon }) => {
      const active = view === id
      return (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => {
            onChange({ view: id })
          }}
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
            active
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </button>
      )
    })}
  </nav>
)

export { TabNav }
