import type { RouterClient } from "@orpc/server"

import type { router } from "@/lib/orpc/router"

import { orpc } from "@/lib/orpc/client"

import type { ReportingPeriod } from "./model"

import { resolveNearestPeriod } from "./rank-selection"

type AppClient = RouterClient<typeof router>
type MetaData = Awaited<ReturnType<AppClient["meta"]>>
type LeaderboardInput = Parameters<AppClient["leaderboard"]>[0]
type TrendsInput = Parameters<AppClient["trends"]>[0]
type RankProgressionInput = Parameters<AppClient["rankProgression"]>[0]
type ControlComparisonInput = Parameters<AppClient["controlComparison"]>[0]
type MatchupsInput = Parameters<AppClient["matchups"]>[0]
type CounterpicksInput = Parameters<AppClient["counterpicks"]>[0]
type PeriodComparisonInput = Parameters<AppClient["periodComparison"]>[0]

const metaQueryOptions = () => {
  return {
    ...orpc.meta.queryOptions(),
    staleTime: Infinity,
  }
}
const leaderboardQueryOptions = (input: LeaderboardInput) =>
  orpc.leaderboard.queryOptions({ input })
const trendsQueryOptions = (input: TrendsInput) => orpc.trends.queryOptions({ input })
const rankProgressionQueryOptions = (input: RankProgressionInput) =>
  orpc.rankProgression.queryOptions({ input })
const controlComparisonQueryOptions = (input: ControlComparisonInput) =>
  orpc.controlComparison.queryOptions({ input })
const matchupsQueryOptions = (input: MatchupsInput) => orpc.matchups.queryOptions({ input })
const counterpicksQueryOptions = (input: CounterpicksInput) =>
  orpc.counterpicks.queryOptions({ input })
const periodComparisonQueryOptions = (input: PeriodComparisonInput) =>
  orpc.periodComparison.queryOptions({ input })

const resolvePeriod = (
  requested: ReportingPeriod | undefined,
  available: readonly ReportingPeriod[],
): ReportingPeriod => resolveNearestPeriod(requested, available)

export {
  controlComparisonQueryOptions,
  counterpicksQueryOptions,
  leaderboardQueryOptions,
  matchupsQueryOptions,
  metaQueryOptions,
  periodComparisonQueryOptions,
  rankProgressionQueryOptions,
  resolvePeriod,
  trendsQueryOptions,
  type MetaData,
}
