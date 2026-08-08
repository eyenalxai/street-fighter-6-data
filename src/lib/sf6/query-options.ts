import type { RouterClient } from "@orpc/server"

import type { router } from "@/lib/orpc/router"

import { orpc } from "@/lib/orpc/client"

import type { ReportingPeriod } from "./model"

import { resolveNearestPeriod } from "./rank-selection"

type AppClient = RouterClient<typeof router>
type MetaData = Awaited<ReturnType<AppClient["meta"]>>
type RosterOverviewData = Awaited<ReturnType<AppClient["rosterOverview"]>>
type CharacterExplorerData = Awaited<ReturnType<AppClient["characterExplorer"]>>
type MatchupExplorerData = Awaited<ReturnType<AppClient["matchupExplorer"]>>
type CounterpickPlannerData = Awaited<ReturnType<AppClient["counterpickPlanner"]>>
type ChangeExplorerData = Awaited<ReturnType<AppClient["changeExplorer"]>>
type RosterOverviewInput = Parameters<AppClient["rosterOverview"]>[0]
type CharacterExplorerInput = Parameters<AppClient["characterExplorer"]>[0]
type MatchupExplorerInput = Parameters<AppClient["matchupExplorer"]>[0]
type CounterpickPlannerInput = Parameters<AppClient["counterpickPlanner"]>[0]
type ChangeExplorerInput = Parameters<AppClient["changeExplorer"]>[0]

const metaQueryOptions = () => {
  return {
    ...orpc.meta.queryOptions(),
    staleTime: Infinity,
  }
}
const rosterOverviewQueryOptions = (input: RosterOverviewInput) =>
  orpc.rosterOverview.queryOptions({ input })
const characterExplorerQueryOptions = (input: CharacterExplorerInput) =>
  orpc.characterExplorer.queryOptions({ input })
const matchupExplorerQueryOptions = (input: MatchupExplorerInput) =>
  orpc.matchupExplorer.queryOptions({ input })
const counterpickPlannerQueryOptions = (input: CounterpickPlannerInput) =>
  orpc.counterpickPlanner.queryOptions({ input })
const changeExplorerQueryOptions = (input: ChangeExplorerInput) =>
  orpc.changeExplorer.queryOptions({ input })

const resolvePeriod = (
  requested: ReportingPeriod | undefined,
  available: readonly ReportingPeriod[],
): ReportingPeriod => resolveNearestPeriod(requested, available)

export {
  changeExplorerQueryOptions,
  characterExplorerQueryOptions,
  counterpickPlannerQueryOptions,
  matchupExplorerQueryOptions,
  metaQueryOptions,
  rosterOverviewQueryOptions,
  resolvePeriod,
  type MetaData,
  type RosterOverviewData,
  type CharacterExplorerData,
  type MatchupExplorerData,
  type CounterpickPlannerData,
  type ChangeExplorerData,
}
