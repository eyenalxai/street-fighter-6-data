import { createFileRoute, useLoaderData } from "@tanstack/react-router"

import { Dashboard } from "@/components/sf6/dashboard"
import { metaQueryOptions, prefetchDashboardQuery, resolvePeriod } from "@/lib/sf6/query-options"
import { DashboardSearchSchema } from "@/lib/sf6/search"

const viewsUsingCharacter = new Set(["trends", "ranks", "matchups", "counterpicks", "similarity"])
const viewsUsingOpponent = new Set(["matchups", "counterpicks"])

const DashboardRoute = () => {
  const { meta, period, search } = useLoaderData({ from: "/" })
  return <Dashboard meta={meta} period={period} search={search} />
}

const Route = createFileRoute("/")({
  validateSearch: DashboardSearchSchema,
  loaderDeps: ({ search }) => {
    return {
      view: search.view,
      period: search.view === "trends" ? undefined : search.period,
      league: search.league,
      controls: search.view === "control" ? undefined : search.controls,
      character: viewsUsingCharacter.has(search.view) ? search.character : undefined,
      opponent: viewsUsingOpponent.has(search.view) ? search.opponent : undefined,
    }
  },
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const search = DashboardSearchSchema.parse(deps)
    const period = resolvePeriod(search.period, meta.periods, meta.latestPeriod)
    void prefetchDashboardQuery(queryClient, search, meta, period)
    return { meta, period, search }
  },
  component: DashboardRoute,
})

export { Route }
