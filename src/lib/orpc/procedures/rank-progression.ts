import { os } from "@orpc/server"
import * as z from "zod"

import { getRankHeatmap, getRankProgression } from "@/lib/sf6/analytics/aggregates"
import { CharacterIdSchema, ControlMatchupSchema, ReportingPeriodSchema } from "@/lib/sf6/model"
import { RankIdSchema, RANKS } from "@/lib/sf6/ranks"
import { getRankBlock } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"

const RankProgressionInputSchema = z.object({
  period: ReportingPeriodSchema,
  controls: ControlMatchupSchema,
  character: CharacterIdSchema,
})
const RankPointSchema = z.object({
  rankId: RankIdSchema,
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
      const entries = await Promise.all(
        RANKS.map(async (rank) => {
          return {
            rank,
            block: await getRankBlock(input.period, rank.id, "combined"),
          }
        }),
      )
      return {
        characterId: input.character,
        points: getRankProgression(entries, input.character, "combined"),
        heatmap: getRankHeatmap(entries, "combined"),
      }
    }),
  )

export { rankProgressionProcedure }
