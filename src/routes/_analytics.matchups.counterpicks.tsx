import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { CounterpickPlannerView } from "@/components/sf6/views/counterpick-planner-view"
import { counterpicksQueryOptions, metaQueryOptions, resolvePeriod } from "@/lib/sf6/query-options"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { CounterpickSearchSchema } from "@/lib/sf6/search"

const CounterpicksPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/matchups/counterpicks" })
  const search = useSearch({ from: "/_analytics/matchups/counterpicks" })
  return <CounterpickPlannerView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/matchups/counterpicks")({
  validateSearch: CounterpickSearchSchema,
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const periods = getPeriodsForRank(deps.search.rank, meta.periods, meta.subdivisionPeriods)
    const period = resolvePeriod(deps.search.period, periods)
    if (deps.search.opponents.length > 0) {
      void queryClient.prefetchQuery(
        counterpicksQueryOptions({
          period,
          rank: deps.search.rank,
          controls: getEffectiveControls(deps.search.rank, deps.search.controls),
          opponents: deps.search.opponents,
        }),
      )
    }
    return { period }
  },
  component: CounterpicksPage,
})

export { Route }
