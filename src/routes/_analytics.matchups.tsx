import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { MatchupExplorerView } from "@/components/sf6/views/matchup-explorer-view"
import {
  getMatchupLoaderDeps,
  getMatchupPeriodOptions,
  hasSelectedCharacters,
} from "@/lib/sf6/analysis-dependencies"
import { buildCounterpickInput, buildMatchupInput } from "@/lib/sf6/analysis-scope"
import {
  counterpickPlannerQueryOptions,
  matchupExplorerQueryOptions,
  metaQueryOptions,
  resolvePeriod,
} from "@/lib/sf6/query-options"
import { MatchupSearchSchema } from "@/lib/sf6/search"

const MatchupsPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/matchups" })
  const search = useSearch({ from: "/_analytics/matchups" })
  return <MatchupExplorerView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/matchups")({
  head: () => {
    return {
      meta: [
        { title: "Matchup explorer · SF6 Ranked Lab" },
        {
          name: "description",
          content: "Compare matchups, inspect character profiles, and plan counterpicks.",
        },
      ],
    }
  },
  validateSearch: MatchupSearchSchema,
  loaderDeps: ({ search }) => getMatchupLoaderDeps(search),
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const periods = getMatchupPeriodOptions(
      deps.view,
      deps.rank ?? "all-master",
      meta.periods,
      meta.subdivisionPeriods,
    )
    const period = deps.view === "time" ? undefined : resolvePeriod(deps.period, periods)
    if (deps.view === "counterpicks") {
      if (hasSelectedCharacters(deps.opponents)) {
        void queryClient.prefetchQuery(
          counterpickPlannerQueryOptions(buildCounterpickInput(deps, period)),
        )
      }
    } else {
      void queryClient.prefetchQuery(matchupExplorerQueryOptions(buildMatchupInput(deps, period)))
    }
    return { period }
  },
  component: MatchupsPage,
})

export { Route }
