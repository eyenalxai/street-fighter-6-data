import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { CharacterExplorerView } from "@/components/sf6/views/character-explorer-view"
import { getCharacterLoaderDeps, getCharacterPeriodOptions } from "@/lib/sf6/analysis-dependencies"
import { buildCharacterInput } from "@/lib/sf6/analysis-scope"
import {
  characterExplorerQueryOptions,
  metaQueryOptions,
  resolvePeriod,
} from "@/lib/sf6/query-options"
import { CharacterExplorerSearchSchema } from "@/lib/sf6/search"

const CharactersPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/characters" })
  const search = useSearch({ from: "/_analytics/characters" })
  return <CharacterExplorerView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/characters")({
  validateSearch: CharacterExplorerSearchSchema,
  loaderDeps: ({ search }) => getCharacterLoaderDeps(search),
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const periods = getCharacterPeriodOptions(
      deps.view,
      deps.rank ?? "all-master",
      meta.periods,
      meta.subdivisionPeriods,
    )
    const period = deps.view === "time" ? undefined : resolvePeriod(deps.period, periods)
    const input = buildCharacterInput(deps, period)
    void queryClient.prefetchQuery(characterExplorerQueryOptions(input))
    return { period }
  },
  component: CharactersPage,
})

export { Route }
