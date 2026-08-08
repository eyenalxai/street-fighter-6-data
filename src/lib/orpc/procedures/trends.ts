import { os } from "@orpc/server"
import * as z from "zod"

import { getTrend } from "@/lib/sf6/analytics/aggregates"
import { CharacterIdSchema, ControlMatchupSchema, ReportingPeriodSchema } from "@/lib/sf6/model"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { RankIdSchema } from "@/lib/sf6/ranks"
import { getSnapshotPeriodAvailability } from "@/lib/sf6/snapshot-periods.server"
import { getRankBlock } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"

const TrendsInputSchema = z.object({
  rank: RankIdSchema,
  controls: ControlMatchupSchema,
  characters: CharacterIdSchema.array().min(1),
})
const TrendsPointSchema = z.object({
  period: ReportingPeriodSchema,
  winRate: z.number().min(0).max(100).nullable(),
})
const TrendsOutputSchema = z.object({
  series: z
    .object({
      characterId: CharacterIdSchema,
      points: TrendsPointSchema.array(),
    })
    .array(),
})

const trendsProcedure = os
  .input(TrendsInputSchema)
  .output(TrendsOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const { regularPeriods, subdivisionPeriods } = await getSnapshotPeriodAvailability()
      const periods = getPeriodsForRank(input.rank, regularPeriods, subdivisionPeriods)
      const controls = getEffectiveControls(input.rank, input.controls)
      const entries = await Promise.all(
        periods.map(async (period) => {
          return { period, block: await getRankBlock(period, input.rank, controls) }
        }),
      )
      return {
        series: input.characters.map((characterId) => {
          return {
            characterId,
            points: getTrend(entries, characterId, controls),
          }
        }),
      }
    }),
  )

export { trendsProcedure }
