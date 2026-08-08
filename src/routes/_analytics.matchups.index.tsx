import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { MatchupExplorerView } from "@/components/sf6/views/matchup-explorer-view"
import {
  matchupExplorerQueryOptions,
  metaQueryOptions,
  resolvePeriod,
} from "@/lib/sf6/query-options"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { MatchupSearchSchema } from "@/lib/sf6/search"

const MatchupsPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/matchups/" })
  const search = useSearch({ from: "/_analytics/matchups/" })
  return <MatchupExplorerView period={period} search={search} meta={meta} />
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
      matchupExplorerQueryOptions({
        period,
        rank: deps.search.rank,
        controls: getEffectiveControls(deps.search.rank, deps.search.controls),
        character: deps.search.character,
        opponent: deps.search.opponent,
      }),
    )
    return { period }
  },
  component: MatchupsPage,
})

export { Route }
