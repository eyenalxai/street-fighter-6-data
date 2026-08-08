import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { RankComparisonView } from "@/components/sf6/views/rank-comparison-view"
import {
  metaQueryOptions,
  rankProgressionQueryOptions,
  resolvePeriod,
} from "@/lib/sf6/query-options"
import { RankComparisonSearchSchema } from "@/lib/sf6/search"

const RankComparisonPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/comparisons/ranks" })
  const search = useSearch({ from: "/_analytics/comparisons/ranks" })
  return <RankComparisonView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/comparisons/ranks")({
  validateSearch: RankComparisonSearchSchema,
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const period = resolvePeriod(deps.search.period, meta.periods, meta.latestPeriod)
    void queryClient.prefetchQuery(
      rankProgressionQueryOptions({
        period,
        controls: deps.search.controls,
        character: deps.search.character,
      }),
    )
    return { period }
  },
  component: RankComparisonPage,
})

export { Route }
