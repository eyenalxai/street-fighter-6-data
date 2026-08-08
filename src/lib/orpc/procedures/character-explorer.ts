import { os } from "@orpc/server"
import * as z from "zod"

import { getControlComparison } from "@/lib/sf6/analytics/average-win-rate"
import { getUsagePoints } from "@/lib/sf6/analytics/changes"
import {
  getCharacterMetric,
  getCharacterStability,
  getRankMetric,
} from "@/lib/sf6/analytics/comparisons"
import {
  getMetricEntry,
  getPeriodEntries,
  getRankEntries,
} from "@/lib/sf6/analytics/loaders.server"
import {
  CharacterIdSchema,
  NonEmptyCharacterSelectionSchema,
  PlayerControlSchema,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import { getPeriodsForRank, getRankComparisonPeriods } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank, RankIdSchema, RANKS } from "@/lib/sf6/ranks"
import { getSnapshotPeriodAvailability } from "@/lib/sf6/snapshot-periods.server"
import { getUsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { withSnapshotErrors } from "./execute.server"
import { ControlComparisonResultSchema } from "./shared"

const CharacterExplorerInputSchema = z.discriminatedUnion("view", [
  z.object({
    view: z.literal("time"),
    rank: RankIdSchema,
    playerControl: PlayerControlSchema,
    characters: NonEmptyCharacterSelectionSchema,
  }),
  z.object({
    view: z.literal("ranks"),
    period: ReportingPeriodSchema,
    characters: NonEmptyCharacterSelectionSchema,
  }),
  z.object({
    view: z.literal("controls"),
    period: ReportingPeriodSchema,
    rank: RankIdSchema,
    characters: NonEmptyCharacterSelectionSchema,
  }),
])
const CharacterPointSchema = z.object({
  period: ReportingPeriodSchema,
  averageWinRate: z.number().min(0).max(100).nullable(),
  weightedAverageWinRate: z.number().min(0).max(100).nullable(),
  weightCoverage: z.number().min(0).max(1).nullable(),
  usage: z.number().min(0).max(100).nullable(),
  averageWinRateDelta: z.number().min(-100).max(100).nullable(),
  weightedAverageWinRateDelta: z.number().min(-100).max(100).nullable(),
  usageDelta: z.number().min(-100).max(100).nullable(),
})
const TimeOutputSchema = z.object({
  view: z.literal("time"),
  series: z
    .object({
      characterId: CharacterIdSchema,
      points: CharacterPointSchema.array(),
      stability: z.object({
        firstPeriod: ReportingPeriodSchema.nullable(),
        lastPeriod: ReportingPeriodSchema.nullable(),
        averageWinRateRange: z.number().min(0).max(100).nullable(),
        averageWinRateStandardDeviation: z.number().min(0).nullable(),
        usageRange: z.number().min(0).max(100).nullable(),
        usageStandardDeviation: z.number().min(0).nullable(),
      }),
    })
    .array(),
})
const RankOutputSchema = z.object({
  view: z.literal("ranks"),
  series: z
    .object({
      characterId: CharacterIdSchema,
      points: z
        .object({
          rankId: RankIdSchema,
          label: z.string(),
          averageWinRate: z.number().min(0).max(100).nullable(),
          weightedAverageWinRate: z.number().min(0).max(100).nullable(),
          weightCoverage: z.number().min(0).max(1).nullable(),
          usage: z.number().min(0).max(100).nullable(),
        })
        .array(),
      averageWinRateRange: z.number().min(0).max(100).nullable(),
      usageRange: z.number().min(0).max(100).nullable(),
      peakRankId: RankIdSchema.nullable(),
      troughRankId: RankIdSchema.nullable(),
    })
    .array(),
})
const ControlsOutputSchema = z.object({
  view: z.literal("controls"),
  supported: z.boolean(),
  rows: ControlComparisonResultSchema.array(),
})
const CharacterExplorerOutputSchema = z.discriminatedUnion("view", [
  TimeOutputSchema,
  RankOutputSchema,
  ControlsOutputSchema,
])

const getPeriodIndex = (periods: readonly string[], period: string): number => {
  const index = periods.indexOf(period)
  return index === -1 ? periods.length - 1 : index
}

const characterExplorerProcedure = os
  .input(CharacterExplorerInputSchema)
  .output(CharacterExplorerOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const availability = await getSnapshotPeriodAvailability()

      if (input.view === "time") {
        const periods = getPeriodsForRank(
          input.rank,
          availability.regularPeriods,
          availability.subdivisionPeriods,
        )
        const timeEntries = await getPeriodEntries(periods, input.rank, input.playerControl)
        const series = input.characters.map((characterId) => {
          const points = timeEntries.map((entry, index) => {
            const current = getCharacterMetric(entry, characterId, input.playerControl)
            const previous = timeEntries[index - 1]
            const before =
              previous === undefined
                ? null
                : getCharacterMetric(previous, characterId, input.playerControl)
            return {
              period: entry.period,
              averageWinRate: current.averageWinRate,
              weightedAverageWinRate: current.weightedAverageWinRate,
              weightCoverage: current.weightCoverage,
              usage: current.usage,
              averageWinRateDelta:
                before?.averageWinRate === null ||
                before?.averageWinRate === undefined ||
                current.averageWinRate === null
                  ? null
                  : current.averageWinRate - before.averageWinRate,
              weightedAverageWinRateDelta:
                before?.weightedAverageWinRate === null ||
                before?.weightedAverageWinRate === undefined ||
                current.weightedAverageWinRate === null
                  ? null
                  : current.weightedAverageWinRate - before.weightedAverageWinRate,
              usageDelta:
                before?.usage === null || before?.usage === undefined || current.usage === null
                  ? null
                  : current.usage - before.usage,
            }
          })
          const averageWinRateStability = getCharacterStability(
            points.map((point) => {
              return { period: point.period, value: point.averageWinRate }
            }),
            [],
          )
          const usageStability = getCharacterStability(
            getUsagePoints(timeEntries, characterId).map((point) => {
              return {
                period: point.period,
                value: point.playRate,
              }
            }),
            [],
          )
          return {
            characterId,
            points,
            stability: {
              firstPeriod: usageStability.firstPeriod,
              lastPeriod: usageStability.lastPeriod,
              averageWinRateRange: averageWinRateStability.timeRange,
              averageWinRateStandardDeviation: averageWinRateStability.timeStandardDeviation,
              usageRange: usageStability.timeRange,
              usageStandardDeviation: usageStability.timeStandardDeviation,
            },
          }
        })
        return { view: "time" as const, series }
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
        return {
          view: "controls" as const,
          supported: true,
          rows: getControlComparison(entry.controlBlocks, input.characters, {
            combined,
            classic: entry.usage,
            modern: modernUsage,
          }),
        }
      }

      const rankPeriods = getRankComparisonPeriods(
        availability.regularPeriods,
        availability.subdivisionPeriods,
      )
      const periodIndex = getPeriodIndex(rankPeriods, input.period)
      const selectedPeriod = rankPeriods[periodIndex] ?? input.period
      const ranks = RANKS.filter(
        (rank) =>
          !isMasterSubdivisionRank(rank.id) ||
          availability.subdivisionPeriods.includes(selectedPeriod),
      )
      const rankEntries = await getRankEntries(selectedPeriod, ranks)
      return {
        view: "ranks" as const,
        series: input.characters.map((characterId) => {
          const points = getRankMetric(rankEntries, characterId, "combined")
          const averageWinRateValues = points.flatMap((point) =>
            point.averageWinRate === null ? [] : [point.averageWinRate],
          )
          const usageValues = points.flatMap((point) => (point.usage === null ? [] : [point.usage]))
          const peak = points
            .filter((point) => point.averageWinRate !== null)
            .toSorted(
              (left, right) =>
                (right.averageWinRate ?? -Infinity) - (left.averageWinRate ?? -Infinity),
            )[0]
          const trough = points
            .filter((point) => point.averageWinRate !== null)
            .toSorted(
              (left, right) =>
                (left.averageWinRate ?? Infinity) - (right.averageWinRate ?? Infinity),
            )[0]
          return {
            characterId,
            points,
            averageWinRateRange:
              averageWinRateValues.length === 0
                ? null
                : Math.max(...averageWinRateValues) - Math.min(...averageWinRateValues),
            usageRange:
              usageValues.length === 0 ? null : Math.max(...usageValues) - Math.min(...usageValues),
            peakRankId: peak?.rankId ?? null,
            troughRankId: trough?.rankId ?? null,
          }
        }),
      }
    }),
  )

export { characterExplorerProcedure }
