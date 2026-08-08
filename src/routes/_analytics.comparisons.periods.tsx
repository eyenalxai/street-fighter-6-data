import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { PeriodComparisonView } from "@/components/sf6/views/period-comparison-view"
import { metaQueryOptions, periodComparisonQueryOptions } from "@/lib/sf6/query-options"
import { PeriodComparisonSearchSchema } from "@/lib/sf6/search"

const PeriodsPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { fromPeriod, toPeriod } = useLoaderData({ from: "/_analytics/comparisons/periods" })
  const search = useSearch({ from: "/_analytics/comparisons/periods" })
  return (
    <PeriodComparisonView fromPeriod={fromPeriod} toPeriod={toPeriod} search={search} meta={meta} />
  )
}

const Route = createFileRoute("/_analytics/comparisons/periods")({
  validateSearch: PeriodComparisonSearchSchema,
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const fromPeriod = deps.search.fromPeriod ?? meta.periods[0] ?? meta.latestPeriod
    const toPeriod = deps.search.toPeriod ?? meta.latestPeriod
    if (fromPeriod !== toPeriod) {
      void queryClient.prefetchQuery(
        periodComparisonQueryOptions({
          fromPeriod,
          toPeriod,
          league: deps.search.league,
          controls: deps.search.controls,
        }),
      )
    }
    return { fromPeriod, toPeriod }
  },
  component: PeriodsPage,
})

export { Route }
