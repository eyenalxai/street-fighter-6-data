import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { TrendComparisonView } from "@/components/sf6/views/trend-comparison-view"
import { metaQueryOptions, trendsQueryOptions } from "@/lib/sf6/query-options"
import { TrendSearchSchema } from "@/lib/sf6/search"

const TrendsPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const search = useSearch({ from: "/_analytics/comparisons/trends" })
  return <TrendComparisonView search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/comparisons/trends")({
  validateSearch: TrendSearchSchema,
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(metaQueryOptions())
    void queryClient.prefetchQuery(
      trendsQueryOptions({
        league: deps.search.league,
        controls: deps.search.controls,
        characters: deps.search.characters,
      }),
    )
  },
  component: TrendsPage,
})

export { Route }
