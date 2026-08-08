import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { CharacterExplorerView } from "@/components/sf6/views/character-explorer-view"
import {
  characterExplorerQueryOptions,
  metaQueryOptions,
  resolvePeriod,
} from "@/lib/sf6/query-options"
import {
  getEffectivePlayerControl,
  getPeriodsForRank,
  getRankComparisonPeriods,
} from "@/lib/sf6/rank-selection"
import { CharacterExplorerSearchSchema } from "@/lib/sf6/search"

const CharactersPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/characters" })
  const search = useSearch({ from: "/_analytics/characters" })
  return <CharacterExplorerView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/characters")({
  validateSearch: CharacterExplorerSearchSchema,
  loaderDeps: ({ search }) => {
    return { search }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const periods =
      deps.search.mode === "ranks"
        ? getRankComparisonPeriods(meta.periods, meta.subdivisionPeriods)
        : getPeriodsForRank(deps.search.rank, meta.periods, meta.subdivisionPeriods)
    const period = resolvePeriod(deps.search.period, periods)
    void queryClient.prefetchQuery(
      characterExplorerQueryOptions({
        period,
        rank: deps.search.rank,
        playerControl: getEffectivePlayerControl(deps.search.rank, deps.search.playerControl),
        characters: deps.search.characters,
        mode: deps.search.mode,
      }),
    )
    return { period }
  },
  component: CharactersPage,
})

export { Route }
