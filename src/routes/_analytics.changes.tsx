import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { ChangeExplorerView } from "@/components/sf6/views/change-explorer-view"
import {
  changeExplorerQueryOptions,
  metaQueryOptions,
  resolvePeriod,
} from "@/lib/sf6/query-options"
import { getEffectivePlayerControl, getPeriodsForRank } from "@/lib/sf6/rank-selection"
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
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const periods = getPeriodsForRank(deps.search.rank, meta.periods, meta.subdivisionPeriods)
    const latest = periods.at(-1)
    const previous = periods.at(-2) ?? latest
    if (latest === undefined || previous === undefined) {
      throw new Error("At least one reporting period is required")
    }
    const fromPeriod = resolvePeriod(deps.search.fromPeriod ?? previous, periods)
    const toPeriod = resolvePeriod(deps.search.toPeriod ?? latest, periods)
    void queryClient.prefetchQuery(
      changeExplorerQueryOptions({
        fromPeriod,
        toPeriod,
        rank: deps.search.rank,
        playerControl: getEffectivePlayerControl(deps.search.rank, deps.search.playerControl),
        focusCharacters: deps.search.focusCharacters,
      }),
    )
    return { fromPeriod, toPeriod }
  },
  component: ChangesPage,
})

export { Route }
