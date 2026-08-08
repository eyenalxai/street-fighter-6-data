import { os } from "@orpc/server"
import * as z from "zod"

import { getChangeSummary, getMatchupChangesForPlayerControl } from "@/lib/sf6/analytics/changes"
import { getRosterMetrics } from "@/lib/sf6/analytics/comparisons"
import { getMetricEntry, getPeriodEntries } from "@/lib/sf6/analytics/loaders.server"
import {
  CharacterIdSchema,
  ControlMatchupSchema,
  NonEmptyCharacterSelectionSchema,
  PlayerControlSchema,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import {
  filterPeriodsInRange,
  getPeriodsForRank,
  getEffectivePlayerControl,
} from "@/lib/sf6/rank-selection"
import { RankIdSchema } from "@/lib/sf6/ranks"
import { getSnapshotPeriodAvailability } from "@/lib/sf6/snapshot-periods.server"

import { withSnapshotErrors } from "./execute.server"
import { CharacterMetricRowSchema } from "./shared"

const ChangeExplorerInputSchema = z.discriminatedUnion("view", [
  z.object({
    view: z.literal("overview"),
    fromPeriod: ReportingPeriodSchema,
    toPeriod: ReportingPeriodSchema,
    rank: RankIdSchema,
    playerControl: PlayerControlSchema,
  }),
  z.object({
    view: z.literal("trends"),
    fromPeriod: ReportingPeriodSchema,
    toPeriod: ReportingPeriodSchema,
    rank: RankIdSchema,
    playerControl: PlayerControlSchema,
    focusCharacters: NonEmptyCharacterSelectionSchema,
  }),
  z.object({
    view: z.literal("matchups"),
    fromPeriod: ReportingPeriodSchema,
    toPeriod: ReportingPeriodSchema,
    rank: RankIdSchema,
    playerControl: PlayerControlSchema,
  }),
])
const ChangeRowSchema = CharacterMetricRowSchema.extend({
  beforeAverageWinRate: z.number().min(0).max(100).nullable(),
  beforeWeightedAverageWinRate: z.number().min(0).max(100).nullable(),
  beforeUsage: z.number().min(0).max(100).nullable(),
})
const SummarySchema = z.object({
  averageWinRateSpread: z.number().min(0).max(100).nullable(),
  topFiveShare: z.number().min(0).max(100),
  matchupImbalance: z.number().min(0).max(50).nullable(),
})
const MatchupChangeSchema = z
  .object({
    controlMatchup: ControlMatchupSchema,
    characterId: CharacterIdSchema,
    opponentId: CharacterIdSchema,
    before: z.number().min(0).max(100),
    after: z.number().min(0).max(100),
    delta: z.number().min(-100).max(100),
    flip: z.boolean(),
  })
  .array()
const OverviewOutputSchema = z.object({
  view: z.literal("overview"),
  fromPeriod: ReportingPeriodSchema,
  toPeriod: ReportingPeriodSchema,
  rows: ChangeRowSchema.array(),
  before: SummarySchema,
  after: SummarySchema,
})
const TrendsOutputSchema = z.object({
  view: z.literal("trends"),
  fromPeriod: ReportingPeriodSchema,
  toPeriod: ReportingPeriodSchema,
  focusSeries: z
    .object({
      characterId: CharacterIdSchema,
      points: z
        .object({
          period: ReportingPeriodSchema,
          averageWinRate: z.number().min(0).max(100).nullable(),
          weightedAverageWinRate: z.number().min(0).max(100).nullable(),
          usage: z.number().min(0).max(100).nullable(),
        })
        .array(),
    })
    .array(),
})
const MatchupsOutputSchema = z.object({
  view: z.literal("matchups"),
  fromPeriod: ReportingPeriodSchema,
  toPeriod: ReportingPeriodSchema,
  matchupChanges: MatchupChangeSchema,
})
const ChangeExplorerOutputSchema = z.discriminatedUnion("view", [
  OverviewOutputSchema,
  TrendsOutputSchema,
  MatchupsOutputSchema,
])

const normalizePeriods = (
  fromPeriod: z.infer<typeof ReportingPeriodSchema>,
  toPeriod: z.infer<typeof ReportingPeriodSchema>,
) =>
  fromPeriod <= toPeriod ? { fromPeriod, toPeriod } : { fromPeriod: toPeriod, toPeriod: fromPeriod }

const changeExplorerProcedure = os
  .input(ChangeExplorerInputSchema)
  .output(ChangeExplorerOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const { fromPeriod, toPeriod } = normalizePeriods(input.fromPeriod, input.toPeriod)
      const playerControl = getEffectivePlayerControl(input.rank, input.playerControl)

      if (input.view === "overview") {
        const [beforeEntry, afterEntry] = await Promise.all([
          getMetricEntry(fromPeriod, input.rank, playerControl),
          getMetricEntry(toPeriod, input.rank, playerControl),
        ])
        const beforeRows = getRosterMetrics(beforeEntry, null, playerControl)
        const rows = getRosterMetrics(afterEntry, beforeEntry, playerControl).map((row) => {
          const before = beforeRows.find((candidate) => candidate.characterId === row.characterId)
          return {
            ...row,
            beforeAverageWinRate: before?.averageWinRate ?? null,
            beforeWeightedAverageWinRate: before?.weightedAverageWinRate ?? null,
            beforeUsage: before?.usage ?? null,
          }
        })
        return {
          view: "overview" as const,
          fromPeriod,
          toPeriod,
          rows,
          before: getChangeSummary(beforeEntry, playerControl),
          after: getChangeSummary(afterEntry, playerControl),
        }
      }

      if (input.view === "trends") {
        const availability = await getSnapshotPeriodAvailability()
        const periods = getPeriodsForRank(
          input.rank,
          availability.regularPeriods,
          availability.subdivisionPeriods,
        )
        const focusPeriods = filterPeriodsInRange(periods, fromPeriod, toPeriod)
        const focusEntries = await getPeriodEntries(focusPeriods, input.rank, playerControl)
        return {
          view: "trends" as const,
          fromPeriod,
          toPeriod,
          focusSeries: input.focusCharacters.map((characterId) => {
            return {
              characterId,
              points: focusEntries.map((entry) => {
                const row = getRosterMetrics(entry, null, playerControl).find(
                  (candidate) => candidate.characterId === characterId,
                )
                return {
                  period: entry.period,
                  averageWinRate: row?.averageWinRate ?? null,
                  weightedAverageWinRate: row?.weightedAverageWinRate ?? null,
                  usage: row?.usage ?? null,
                }
              }),
            }
          }),
        }
      }

      const [beforeEntry, afterEntry] = await Promise.all([
        getMetricEntry(fromPeriod, input.rank, playerControl),
        getMetricEntry(toPeriod, input.rank, playerControl),
      ])
      return {
        view: "matchups" as const,
        fromPeriod,
        toPeriod,
        matchupChanges: getMatchupChangesForPlayerControl(beforeEntry, afterEntry, playerControl),
      }
    }),
  )

export { changeExplorerProcedure }
