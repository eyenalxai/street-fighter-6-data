import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { PeriodComparisonView } from "@/components/sf6/views/period-comparison-view"
import {
  metaQueryOptions,
  periodComparisonQueryOptions,
  resolvePeriod,
} from "@/lib/sf6/query-options"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
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
    const periods = getPeriodsForRank(deps.search.rank, meta.periods, meta.subdivisionPeriods)
    const fromPeriod = resolvePeriod(deps.search.fromPeriod ?? periods[0], periods)
    const toPeriod = resolvePeriod(deps.search.toPeriod ?? periods.at(-1), periods)
    if (fromPeriod !== toPeriod) {
      void queryClient.prefetchQuery(
        periodComparisonQueryOptions({
          fromPeriod,
          toPeriod,
          rank: deps.search.rank,
          controls: getEffectiveControls(deps.search.rank, deps.search.controls),
        }),
      )
    }
    return { fromPeriod, toPeriod }
  },
  component: PeriodsPage,
})

export { Route }
