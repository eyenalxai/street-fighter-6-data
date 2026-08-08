import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { CounterpickPlannerView } from "@/components/sf6/views/counterpick-planner-view"
import { counterpicksQueryOptions, metaQueryOptions, resolvePeriod } from "@/lib/sf6/query-options"
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
    const period = resolvePeriod(deps.search.period, meta.periods, meta.latestPeriod)
    if (deps.search.opponents.length > 0) {
      void queryClient.prefetchQuery(
        counterpicksQueryOptions({
          period,
          league: deps.search.league,
          controls: deps.search.controls,
          opponents: deps.search.opponents,
        }),
      )
    }
    return { period }
  },
  component: CounterpicksPage,
})

export { Route }
