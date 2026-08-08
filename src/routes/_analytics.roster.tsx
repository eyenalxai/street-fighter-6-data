import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { RosterOverviewView } from "@/components/sf6/views/roster-overview-view"
import { getRosterModePlayerControl } from "@/lib/sf6/analysis-scope"
import {
  metaQueryOptions,
  resolvePeriod,
  rosterOverviewQueryOptions,
} from "@/lib/sf6/query-options"
import { getPeriodsForRank, getRankComparisonPeriods } from "@/lib/sf6/rank-selection"
import { RosterSearchSchema } from "@/lib/sf6/search"

const RosterPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/roster" })
  const search = useSearch({ from: "/_analytics/roster" })
  return <RosterOverviewView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/roster")({
  validateSearch: RosterSearchSchema,
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const periods =
      deps.search.mode === "landscape"
        ? getRankComparisonPeriods(meta.periods, meta.subdivisionPeriods)
        : getPeriodsForRank(deps.search.rank, meta.periods, meta.subdivisionPeriods)
    const period = resolvePeriod(deps.search.period, periods)
    void queryClient.prefetchQuery(
      rosterOverviewQueryOptions({
        period,
        rank: deps.search.rank,
        playerControl: getRosterModePlayerControl(
          deps.search.rank,
          deps.search.mode,
          deps.search.playerControl,
        ),
        mode: deps.search.mode,
      }),
    )
    return { period }
  },
  component: RosterPage,
})

export { Route }
