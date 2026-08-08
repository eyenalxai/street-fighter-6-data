import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { MatchupAnalysisView } from "@/components/sf6/views/matchup-analysis-view"
import { matchupsQueryOptions, metaQueryOptions, resolvePeriod } from "@/lib/sf6/query-options"
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
    const period = resolvePeriod(deps.search.period, meta.periods, meta.latestPeriod)
    void queryClient.prefetchQuery(
      matchupsQueryOptions({
        period,
        league: deps.search.league,
        character: deps.search.character,
        opponent: deps.search.opponent,
        opponentListControls: deps.search.opponentListControls,
      }),
    )
    return { period }
  },
  component: MatchupsPage,
})

export { Route }
