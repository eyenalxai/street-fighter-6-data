import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { ChangeExplorerView } from "@/components/sf6/views/change-explorer-view"
import { getChangeLoaderDeps } from "@/lib/sf6/analysis-dependencies"
import { buildChangeInput } from "@/lib/sf6/analysis-scope"
import {
  changeExplorerQueryOptions,
  metaQueryOptions,
  resolvePeriod,
} from "@/lib/sf6/query-options"
import { getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { ChangeSearchSchema } from "@/lib/sf6/search"

const ChangesPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { fromPeriod, toPeriod } = useLoaderData({ from: "/_analytics/changes" })
  const search = useSearch({ from: "/_analytics/changes" })
  return (
    <ChangeExplorerView fromPeriod={fromPeriod} toPeriod={toPeriod} search={search} meta={meta} />
  )
}

const Route = createFileRoute("/_analytics/changes")({
  validateSearch: ChangeSearchSchema,
  loaderDeps: ({ search }) => getChangeLoaderDeps(search),
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const periods = getPeriodsForRank(deps.rank, meta.periods, meta.subdivisionPeriods)
    const latest = periods.at(-1)
    const previous = periods.at(-2) ?? latest
    if (latest === undefined || previous === undefined) {
      throw new Error("At least one reporting period is required")
    }
    const fromPeriod = resolvePeriod(deps.fromPeriod ?? previous, periods)
    const toPeriod = resolvePeriod(deps.toPeriod ?? latest, periods)
    const input = buildChangeInput(deps, fromPeriod, toPeriod)
    void queryClient.prefetchQuery(changeExplorerQueryOptions(input))
    return { fromPeriod, toPeriod }
  },
  component: ChangesPage,
})

export { Route }
