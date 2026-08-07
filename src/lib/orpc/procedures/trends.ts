import { os } from "@orpc/server"
import * as z from "zod"

import { getTrend } from "@/lib/sf6/analytics/aggregates"
import {
  CharacterIdSchema,
  ControlMatchupSchema,
  LeagueIdSchema,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import { getAvailablePeriods, getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"

const TrendsInputSchema = z.object({
  league: LeagueIdSchema,
  controls: ControlMatchupSchema,
  characters: CharacterIdSchema.array().min(1).max(5),
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
      const periods = await getAvailablePeriods()
      const entries = await Promise.all(
        periods.map(async (period) => {
          return { period, snapshot: await getSnapshot(period) }
        }),
      )
      return {
        series: input.characters.map((characterId) => {
          return {
            characterId,
            points: getTrend(entries, input.league, characterId, input.controls),
          }
        }),
      }
    }),
  )

export { trendsProcedure }
