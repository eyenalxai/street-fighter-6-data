import { os } from "@orpc/server"
import * as z from "zod"

import { getRankHeatmap, getRankProgression } from "@/lib/sf6/analytics/aggregates"
import {
  CharacterIdSchema,
  ControlMatchupSchema,
  LeagueIdSchema,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import { getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"

const RankProgressionInputSchema = z.object({
  period: ReportingPeriodSchema,
  controls: ControlMatchupSchema,
  character: CharacterIdSchema,
})
const RankPointSchema = z.object({
  leagueId: LeagueIdSchema,
  label: z.string(),
  winRate: z.number().min(0).max(100).nullable(),
})
const RankProgressionOutputSchema = z.object({
  characterId: CharacterIdSchema,
  points: RankPointSchema.array(),
  heatmap: z
    .object({
      characterId: CharacterIdSchema,
      points: RankPointSchema.array(),
      range: z.number().min(0).max(100).nullable(),
    })
    .array(),
})

const rankProgressionProcedure = os
  .input(RankProgressionInputSchema)
  .output(RankProgressionOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const snapshot = await getSnapshot(input.period)
      return {
        characterId: input.character,
        points: getRankProgression(snapshot, input.character, input.controls),
        heatmap: getRankHeatmap(snapshot, input.controls),
      }
    }),
  )

export { rankProgressionProcedure }
