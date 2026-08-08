import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { MatchupAnalysisView } from "@/components/sf6/views/matchup-analysis-view"
import { matchupsQueryOptions, metaQueryOptions, resolvePeriod } from "@/lib/sf6/query-options"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { MatchupSearchSchema } from "@/lib/sf6/search"

const MatchupsPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/matchups/" })
  const search = useSearch({ from: "/_analytics/matchups/" })
  return <MatchupAnalysisView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/matchups/")({
  validateSearch: MatchupSearchSchema,
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const periods = getPeriodsForRank(deps.search.rank, meta.periods, meta.subdivisionPeriods)
    const period = resolvePeriod(deps.search.period, periods)
    void queryClient.prefetchQuery(
      matchupsQueryOptions({
        period,
        rank: deps.search.rank,
        character: deps.search.character,
        opponent: deps.search.opponent,
        opponentListControls: getEffectiveControls(
          deps.search.rank,
          deps.search.opponentListControls,
        ),
      }),
    )
    return { period }
  },
  component: MatchupsPage,
})

export { Route }
