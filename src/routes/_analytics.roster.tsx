import { createFileRoute, useLoaderData, useSearch } from "@tanstack/react-router"

import { RosterOverviewView } from "@/components/sf6/views/roster-overview-view"
import { loadRouteQuery } from "@/lib/query-client"
import { getRosterLoaderDeps, getRosterPeriodOptions } from "@/lib/sf6/analysis-dependencies"
import { buildRosterInput } from "@/lib/sf6/analysis-scope"
import {
  metaQueryOptions,
  resolvePeriod,
  rosterOverviewQueryOptions,
} from "@/lib/sf6/query-options"
import { RosterSearchSchema } from "@/lib/sf6/search"

const RosterPage = () => {
  const { meta } = useLoaderData({ from: "/_analytics" })
  const { period } = useLoaderData({ from: "/_analytics/roster" })
  const search = useSearch({ from: "/_analytics/roster" })
  return <RosterOverviewView period={period} search={search} meta={meta} />
}

const Route = createFileRoute("/_analytics/roster")({
  validateSearch: RosterSearchSchema,
  loaderDeps: ({ search }) => getRosterLoaderDeps(search),
  loader: async ({ context: { queryClient }, deps }) => {
    const meta = await queryClient.ensureQueryData(metaQueryOptions())
    const periods = getRosterPeriodOptions(
      deps.view,
      deps.rank ?? "all-master",
      meta.periods,
      meta.subdivisionPeriods,
    )
    const period = deps.view === "time" ? undefined : resolvePeriod(deps.period, periods)
    const input = buildRosterInput(deps, period)
    await loadRouteQuery(queryClient, rosterOverviewQueryOptions(input))
    return { period }
  },
  component: RosterPage,
})

export { Route }
