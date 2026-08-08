import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { LeaderboardView } from "@/components/sf6/views/leaderboard-view"
import { leaderboardQueryOptions, metaQueryOptions, resolvePeriod } from "@/lib/sf6/query-options"
import { RosterSearchSchema } from "@/lib/sf6/search"

const RosterPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/roster/" })
  const search = useSearch({ from: "/_analytics/roster/" })
  return <LeaderboardView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/roster/")({
  validateSearch: RosterSearchSchema,
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const period = resolvePeriod(deps.search.period, meta.periods, meta.latestPeriod)
    void queryClient.prefetchQuery(
      leaderboardQueryOptions({
        period,
        league: deps.search.league,
        controls: deps.search.controls,
      }),
    )
    return { period }
  },
  component: RosterPage,
})

export { Route }
