import { os } from "@orpc/server"
import * as z from "zod"

import { getChangeSummary, getMatchupChangesForPlayerControl } from "@/lib/sf6/analytics/changes"
import { getRosterMetrics } from "@/lib/sf6/analytics/comparisons"
import { getMetricEntry, getPeriodEntries } from "@/lib/sf6/analytics/loaders.server"
import {
  CharacterIdSchema,
  ControlMatchupSchema,
  PlayerControlSchema,
  ReportingPeriodSchema,
  UniqueCharacterIdsSchema,
} from "@/lib/sf6/model"
import { filterPeriodsInRange, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { RankIdSchema } from "@/lib/sf6/ranks"
import { getSnapshotPeriodAvailability } from "@/lib/sf6/snapshot-periods.server"

import { withSnapshotErrors } from "./execute.server"
import { CharacterMetricRowSchema } from "./shared"

const ChangeExplorerInputSchema = z.object({
  fromPeriod: ReportingPeriodSchema,
  toPeriod: ReportingPeriodSchema,
  rank: RankIdSchema,
  playerControl: PlayerControlSchema,
  focusCharacters: UniqueCharacterIdsSchema.min(1).max(5),
})
const ChangeRowSchema = CharacterMetricRowSchema.extend({
  beforePerformance: z.number().min(0).max(100).nullable(),
  beforeWeightedPerformance: z.number().min(0).max(100).nullable(),
  beforeUsage: z.number().min(0).max(100).nullable(),
})
const SummarySchema = z.object({
  performanceSpread: z.number().min(0).max(100).nullable(),
  effectiveRosterSize: z.number().positive().nullable(),
  topFiveShare: z.number().min(0).max(100),
  matchupImbalance: z.number().min(0).max(50).nullable(),
})
const ChangeExplorerOutputSchema = z.object({
  fromPeriod: ReportingPeriodSchema,
  toPeriod: ReportingPeriodSchema,
  rows: ChangeRowSchema.array(),
  before: SummarySchema,
  after: SummarySchema,
  matchupChanges: z
    .object({
      controlMatchup: ControlMatchupSchema,
      characterId: CharacterIdSchema,
      opponentId: CharacterIdSchema,
      before: z.number().min(0).max(100),
      after: z.number().min(0).max(100),
      delta: z.number().min(-100).max(100),
      flip: z.boolean(),
    })
    .array(),
  focusSeries: z
    .object({
      characterId: CharacterIdSchema,
      points: z
        .object({
          period: ReportingPeriodSchema,
          performance: z.number().min(0).max(100).nullable(),
          weightedPerformance: z.number().min(0).max(100).nullable(),
          usage: z.number().min(0).max(100).nullable(),
        })
        .array(),
    })
    .array(),
})

const changeExplorerProcedure = os
  .input(ChangeExplorerInputSchema)
  .output(ChangeExplorerOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const availability = await getSnapshotPeriodAvailability()
      const fromPeriod = input.fromPeriod <= input.toPeriod ? input.fromPeriod : input.toPeriod
      const toPeriod = input.fromPeriod <= input.toPeriod ? input.toPeriod : input.fromPeriod
      const periods = getPeriodsForRank(
        input.rank,
        availability.regularPeriods,
        availability.subdivisionPeriods,
      )
      const [beforeEntry, afterEntry] = await Promise.all([
        getMetricEntry(fromPeriod, input.rank, input.playerControl),
        getMetricEntry(toPeriod, input.rank, input.playerControl),
      ])
      const beforeRows = getRosterMetrics(beforeEntry, null, input.playerControl)
      const rows = getRosterMetrics(afterEntry, beforeEntry, input.playerControl).map((row) => {
        const before = beforeRows.find((candidate) => candidate.characterId === row.characterId)
        return {
          ...row,
          beforePerformance: before?.performance ?? null,
          beforeWeightedPerformance: before?.weightedPerformance ?? null,
          beforeUsage: before?.usage ?? null,
        }
      })
      const focusPeriods = filterPeriodsInRange(periods, fromPeriod, toPeriod)
      const focusEntries = await getPeriodEntries(focusPeriods, input.rank, input.playerControl)
      return {
        fromPeriod,
        toPeriod,
        rows,
        before: getChangeSummary(beforeEntry, input.playerControl),
        after: getChangeSummary(afterEntry, input.playerControl),
        matchupChanges: getMatchupChangesForPlayerControl(
          beforeEntry,
          afterEntry,
          input.playerControl,
        ),
        focusSeries: input.focusCharacters.map((characterId) => {
          return {
            characterId,
            points: focusEntries.map((entry) => {
              const row = getRosterMetrics(entry, null, input.playerControl).find(
                (candidate) => candidate.characterId === characterId,
              )
              return {
                period: entry.period,
                performance: row?.performance ?? null,
                weightedPerformance: row?.weightedPerformance ?? null,
                usage: row?.usage ?? null,
              }
            }),
          }
        }),
      }
    }),
  )

export { changeExplorerProcedure }
