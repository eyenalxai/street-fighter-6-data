import type { RouterClient } from "@orpc/server"
import type { QueryClient } from "@tanstack/react-query"

import type { router } from "@/lib/orpc/router"

import { orpc } from "@/lib/orpc/client"

import type { ReportingPeriod } from "./model"
import type { DashboardSearch } from "./search"

type AppClient = RouterClient<typeof router>
type MetaData = Awaited<ReturnType<AppClient["meta"]>>
type LeaderboardInput = Parameters<AppClient["leaderboard"]>[0]
type TrendsInput = Parameters<AppClient["trends"]>[0]
type RankProgressionInput = Parameters<AppClient["rankProgression"]>[0]
type ControlComparisonInput = Parameters<AppClient["controlComparison"]>[0]
type MatchupsInput = Parameters<AppClient["matchups"]>[0]
type CounterpicksInput = Parameters<AppClient["counterpicks"]>[0]
type PeriodComparisonInput = Parameters<AppClient["periodComparison"]>[0]
type SimilarityInput = Parameters<AppClient["similarity"]>[0]
type BalanceInput = Parameters<AppClient["balance"]>[0]

const metaQueryOptions = () => orpc.meta.queryOptions()
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
const similarityQueryOptions = (input: SimilarityInput) => orpc.similarity.queryOptions({ input })
const balanceQueryOptions = (input: BalanceInput) => orpc.balance.queryOptions({ input })

const resolvePeriod = (
  requested: ReportingPeriod | undefined,
  available: readonly ReportingPeriod[],
  latest: ReportingPeriod,
): ReportingPeriod =>
  requested !== undefined && available.includes(requested) ? requested : latest

const prefetchDashboardQuery = async (
  queryClient: QueryClient,
  search: DashboardSearch,
  meta: MetaData,
  period: ReportingPeriod,
): Promise<void> => {
  switch (search.view) {
    case "leaderboard": {
      await queryClient.prefetchQuery(
        leaderboardQueryOptions({
          period,
          league: search.league,
          controls: search.controls,
        }),
      )
      break
    }
    case "trends": {
      await queryClient.prefetchQuery(
        trendsQueryOptions({
          league: search.league,
          controls: search.controls,
          characters: [search.character],
        }),
      )
      break
    }
    case "ranks": {
      await queryClient.prefetchQuery(
        rankProgressionQueryOptions({
          period,
          league: search.league,
          controls: search.controls,
          character: search.character,
        }),
      )
      break
    }
    case "control": {
      await queryClient.prefetchQuery(
        controlComparisonQueryOptions({
          period,
          league: search.league,
        }),
      )
      break
    }
    case "matchups": {
      await queryClient.prefetchQuery(
        matchupsQueryOptions({
          period,
          league: search.league,
          controls: search.controls,
          character: search.character,
          opponent: search.opponent,
        }),
      )
      break
    }
    case "counterpicks": {
      await queryClient.prefetchQuery(
        counterpicksQueryOptions({
          period,
          league: search.league,
          controls: search.controls,
          target: search.character,
          threats: [search.character, search.opponent],
        }),
      )
      break
    }
    case "compare": {
      await queryClient.prefetchQuery(
        periodComparisonQueryOptions({
          fromPeriod: meta.periods[0] ?? period,
          toPeriod: period,
          league: search.league,
          controls: search.controls,
        }),
      )
      break
    }
    case "similarity": {
      await queryClient.prefetchQuery(
        similarityQueryOptions({
          period,
          league: search.league,
          controls: search.controls,
          character: search.character,
          clusterCount: 4,
        }),
      )
      break
    }
    case "balance": {
      await queryClient.prefetchQuery(
        balanceQueryOptions({
          period,
          league: search.league,
          controls: search.controls,
        }),
      )
      break
    }
    default: {
      break
    }
  }
}

export {
  balanceQueryOptions,
  controlComparisonQueryOptions,
  counterpicksQueryOptions,
  leaderboardQueryOptions,
  matchupsQueryOptions,
  metaQueryOptions,
  periodComparisonQueryOptions,
  prefetchDashboardQuery,
  rankProgressionQueryOptions,
  resolvePeriod,
  similarityQueryOptions,
  trendsQueryOptions,
  type MetaData,
}
