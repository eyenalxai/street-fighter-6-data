import { useNavigate } from "@tanstack/react-router"
import { Swords } from "lucide-react"
import { Suspense } from "react"

import type { ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { DashboardSearch } from "@/lib/sf6/search"

import { formatReportingPeriod } from "@/lib/sf6/model"

import { FilterBar } from "./filter-bar"
import { TabNav } from "./tab-nav"
import { ViewErrorBoundary } from "./view-error-boundary"
import { ViewLoading } from "./view-loading"
import { BalanceView } from "./views/balance-view"
import { ControlView } from "./views/control-view"
import { CounterpickView } from "./views/counterpick-view"
import { DateComparisonView } from "./views/date-comparison-view"
import { LeaderboardView } from "./views/leaderboard-view"
import { MatchupView } from "./views/matchup-view"
import { RankProgressionView } from "./views/rank-progression-view"
import { SimilarityView } from "./views/similarity-view"
import { TrendView } from "./views/trend-view"

type DashboardProps = {
  meta: MetaData
  period: ReportingPeriod
  search: DashboardSearch
}
type DashboardViewProps = DashboardProps & {
  onChange: (changes: Partial<DashboardSearch>) => void
}

const Dashboard = ({ meta, period, search }: DashboardProps) => {
  const navigate = useNavigate({ from: "/" })
  const onChange = (changes: Partial<DashboardSearch>): void => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
    })
  }

  const viewProps: DashboardViewProps = { meta, period, search, onChange }
  const activeView = (() => {
    switch (search.view) {
      case "leaderboard": {
        return <LeaderboardView {...viewProps} />
      }
      case "trends": {
        return <TrendView {...viewProps} />
      }
      case "ranks": {
        return <RankProgressionView {...viewProps} />
      }
      case "control": {
        return <ControlView {...viewProps} />
      }
      case "matchups": {
        return <MatchupView {...viewProps} />
      }
      case "counterpicks": {
        return <CounterpickView {...viewProps} />
      }
      case "compare": {
        return <DateComparisonView {...viewProps} />
      }
      case "similarity": {
        return <SimilarityView {...viewProps} />
      }
      case "balance": {
        return <BalanceView {...viewProps} />
      }
      default: {
        return null
      }
    }
  })()
  const resetKey = [
    search.view,
    period,
    search.league,
    search.controls,
    search.character,
    search.opponent,
  ].join("|")

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1600px] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center bg-primary text-primary-foreground">
            <Swords className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight tracking-tight">SF6 Ranked Lab</h1>
            <p className="text-xs text-muted-foreground">
              Character and matchup analytics from Buckler reporting periods
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <span className="font-mono tabular-nums text-foreground">{meta.counts.characters}</span>
          characters
          <span className="mx-1 text-border">|</span>
          <span className="font-mono tabular-nums text-foreground">{meta.counts.periods}</span>
          periods
          <span className="mx-1 text-border">|</span>
          <span className="font-mono tabular-nums text-foreground">{meta.counts.leagues}</span>
          ranks
        </div>
      </header>

      <FilterBar search={search} period={period} meta={meta} onChange={onChange} />
      <TabNav view={search.view} onChange={onChange} />

      <main className="flex-1 px-4 py-5 md:px-6">
        <Suspense fallback={<ViewLoading />}>
          <ViewErrorBoundary resetKey={resetKey}>{activeView}</ViewErrorBoundary>
        </Suspense>
      </main>

      <footer className="border-t border-border px-4 py-4 text-xs text-muted-foreground md:px-6">
        Buckler data is organized by reporting period. Win rates shown as “matchup average” are
        unweighted means across available reported opponents; missing cells are unavailable. Current
        selection: {formatReportingPeriod(period)}.
      </footer>
    </div>
  )
}

export { Dashboard, type DashboardViewProps }
