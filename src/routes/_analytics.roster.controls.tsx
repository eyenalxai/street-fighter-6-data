import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { ControlComparisonView } from "@/components/sf6/views/control-comparison-view"
import {
  controlComparisonQueryOptions,
  metaQueryOptions,
  resolvePeriod,
} from "@/lib/sf6/query-options"
import { ControlComparisonSearchSchema } from "@/lib/sf6/search"

const ControlComparisonPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/roster/controls" })
  const search = useSearch({ from: "/_analytics/roster/controls" })
  return <ControlComparisonView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/roster/controls")({
  validateSearch: ControlComparisonSearchSchema,
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const period = resolvePeriod(deps.search.period, meta.periods, meta.latestPeriod)
    void queryClient.prefetchQuery(
      controlComparisonQueryOptions({
        period,
        league: deps.search.league,
      }),
    )
    return { period }
  },
  component: ControlComparisonPage,
})

export { Route }
