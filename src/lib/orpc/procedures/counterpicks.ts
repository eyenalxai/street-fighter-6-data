import { os } from "@orpc/server"
import * as z from "zod"

import { getCounterpickCandidates } from "@/lib/sf6/analytics/matchups"
import { NonEmptyUniqueCharacterIdsSchema, CharacterIdSchema } from "@/lib/sf6/model"
import { getEffectiveControls } from "@/lib/sf6/rank-selection"
import { getRankBlock } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { AnalyticsInputSchema } from "./shared"

const CounterpicksInputSchema = AnalyticsInputSchema.extend({
  opponents: NonEmptyUniqueCharacterIdsSchema,
})
const CounterpicksOutputSchema = z.object({
  opponents: CharacterIdSchema.array(),
  excludedCandidateCount: z.number().int().nonnegative(),
  rows: z
    .object({
      characterId: CharacterIdSchema,
      averageWinRate: z.number().min(0).max(100),
      worstWinRate: z.number().min(0).max(100),
      atOrAbove50Count: z.number().int().nonnegative(),
      matchups: z
        .object({
          opponentId: CharacterIdSchema,
          winRate: z.number().min(0).max(100),
        })
        .array(),
    })
    .array(),
})

const counterpicksProcedure = os
  .input(CounterpicksInputSchema)
  .output(CounterpicksOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const controls = getEffectiveControls(input.rank, input.controls)
      const block = await getRankBlock(input.period, input.rank, controls)
      const result = getCounterpickCandidates(block, controls, input.opponents)
      return {
        opponents: input.opponents,
        ...result,
      }
    }),
  )

export { counterpicksProcedure }
