import { os } from "@orpc/server"
import * as z from "zod"

import { getControlComparison } from "@/lib/sf6/analytics/average-win-rate"
import {
  getLandscapeSeries,
  getRankLandscapeSeries,
  getRosterRankConsistency,
  getRosterMetrics,
  getRosterTimeConsistency,
} from "@/lib/sf6/analytics/comparisons"
import {
  getMetricEntry,
  getPeriodEntries,
  getRankEntries,
} from "@/lib/sf6/analytics/loaders.server"
import { getUsageStats } from "@/lib/sf6/analytics/usage"
import { CharacterIdSchema, PlayerControlSchema, ReportingPeriodSchema } from "@/lib/sf6/model"
import { getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank, RankIdSchema, RANKS } from "@/lib/sf6/ranks"
import { getSnapshotPeriodAvailability } from "@/lib/sf6/snapshot-periods.server"
import { getUsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { withSnapshotErrors } from "./execute.server"
import { CharacterMetricRowSchema, ControlComparisonResultSchema } from "./shared"

const RosterOverviewInputSchema = z.discriminatedUnion("view", [
  z.object({
    view: z.literal("snapshot"),
    period: ReportingPeriodSchema,
    rank: RankIdSchema,
    playerControl: PlayerControlSchema,
  }),
  z.object({
    view: z.literal("controls"),
    period: ReportingPeriodSchema,
    rank: RankIdSchema,
  }),
  z.object({
    view: z.literal("ranks"),
    period: ReportingPeriodSchema,
  }),
  z.object({
    view: z.literal("time"),
    rank: RankIdSchema,
  }),
])
const LandscapeSummarySchema = z.object({
  averageWinRateSpread: z.number().min(0).max(100).nullable(),
  topFiveShare: z.number().min(0).max(100),
  usageCoverage: z.number().min(0).max(1).nullable(),
})
const SnapshotOutputSchema = z.object({
  view: z.literal("snapshot"),
  rows: CharacterMetricRowSchema.array(),
  summary: LandscapeSummarySchema,
})
const ControlsOutputSchema = z.object({
  view: z.literal("controls"),
  supported: z.boolean(),
  rows: ControlComparisonResultSchema.array(),
})
const TimePointSchema = z.object({
  period: ReportingPeriodSchema,
  averageWinRateSpread: z.number().min(0).max(100).nullable(),
  topFiveShare: z.number().min(0).max(100),
})
const RankPointSchema = z.object({
  rankId: RankIdSchema,
  label: z.string(),
  averageWinRateSpread: z.number().min(0).max(100).nullable(),
  topFiveShare: z.number().min(0).max(100),
})
const RanksOutputSchema = z.object({
  view: z.literal("ranks"),
  rankLandscape: RankPointSchema.array(),
  characterConsistency: z
    .object({
      characterId: CharacterIdSchema,
      winRateRange: z.number().min(0).max(100).nullable(),
      peakRankId: RankIdSchema.nullable(),
      troughRankId: RankIdSchema.nullable(),
    })
    .array(),
})
const TimeOutputSchema = z.object({
  view: z.literal("time"),
  time: TimePointSchema.array(),
  characterConsistency: z
    .object({
      characterId: CharacterIdSchema,
      firstPeriod: ReportingPeriodSchema.nullable(),
      lastPeriod: ReportingPeriodSchema.nullable(),
      peakPeriod: ReportingPeriodSchema.nullable(),
      troughPeriod: ReportingPeriodSchema.nullable(),
      winRateRange: z.number().min(0).max(100).nullable(),
      winRateStandardDeviation: z.number().min(0).nullable(),
      largestAdjacentChange: z.number().min(0).max(100).nullable(),
    })
    .array(),
})
const RosterOverviewOutputSchema = z.discriminatedUnion("view", [
  SnapshotOutputSchema,
  ControlsOutputSchema,
  RanksOutputSchema,
  TimeOutputSchema,
])

const rosterOverviewProcedure = os
  .input(RosterOverviewInputSchema)
  .output(RosterOverviewOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const availability = await getSnapshotPeriodAvailability()

      if (input.view === "snapshot") {
        const periods = getPeriodsForRank(
          input.rank,
          availability.regularPeriods,
          availability.subdivisionPeriods,
        )
        const previousPeriod = periods[periods.indexOf(input.period) - 1] ?? null
        const [current, previous] = await Promise.all([
          getMetricEntry(input.period, input.rank, input.playerControl),
          previousPeriod === null
            ? Promise.resolve(null)
            : getMetricEntry(previousPeriod, input.rank, input.playerControl),
        ])
        const rows = getRosterMetrics(current, previous, input.playerControl)
        const averageWinRates = rows.flatMap((row) =>
          row.averageWinRate === null ? [] : [row.averageWinRate],
        )
        const weightCoverages = rows.flatMap((row) =>
          row.weightCoverage === null ? [] : [row.weightCoverage],
        )
        const usageStats = getUsageStats(current.usage)
        return {
          view: "snapshot" as const,
          rows,
          summary: {
            averageWinRateSpread:
              averageWinRates.length === 0
                ? null
                : Math.max(...averageWinRates) - Math.min(...averageWinRates),
            topFiveShare: usageStats.topFiveShare,
            usageCoverage:
              weightCoverages.length === 0
                ? null
                : weightCoverages.reduce((sum, value) => sum + value, 0) / weightCoverages.length,
          },
        }
      }

      if (input.view === "controls") {
        if (isMasterSubdivisionRank(input.rank)) {
          return { view: "controls" as const, supported: false, rows: [] }
        }
        const entry = await getMetricEntry(input.period, input.rank, "classic")
        const combined = await getUsageBlock(input.period, input.rank, "combined")
        const modernUsage = entry.usageControls?.modern
        if (entry.controlBlocks === null || modernUsage === undefined) {
          return { view: "controls" as const, supported: false, rows: [] }
        }
        const characterIds = entry.block.p.flatMap((player) => {
          const parsed = CharacterIdSchema.safeParse(
            typeof player === "string" ? player : player[0],
          )
          return parsed.success ? [parsed.data] : []
        })
        return {
          view: "controls" as const,
          supported: true,
          rows: getControlComparison(entry.controlBlocks, characterIds, {
            combined,
            classic: entry.usage,
            modern: modernUsage,
          }),
        }
      }

      if (input.view === "ranks") {
        const rankList = RANKS.filter(
          (rank) =>
            !isMasterSubdivisionRank(rank.id) ||
            availability.subdivisionPeriods.includes(input.period),
        )
        const rankEntries = await getRankEntries(input.period, rankList)
        return {
          view: "ranks" as const,
          rankLandscape: getRankLandscapeSeries(rankEntries, "combined"),
          characterConsistency: getRosterRankConsistency(rankEntries, "combined"),
        }
      }

      if (input.view === "time") {
        const periods = getPeriodsForRank(
          input.rank,
          availability.regularPeriods,
          availability.subdivisionPeriods,
        )
        const timeEntries = await getPeriodEntries(periods, input.rank, "combined")
        return {
          view: "time" as const,
          time: getLandscapeSeries(timeEntries, "combined"),
          characterConsistency: getRosterTimeConsistency(timeEntries, "combined"),
        }
      }

      throw new Error("Unknown roster view")
    }),
  )

export { rosterOverviewProcedure }
