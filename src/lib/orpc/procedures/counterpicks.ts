import { os } from "@orpc/server"
import * as z from "zod"

import { getCounterpickCandidates } from "@/lib/sf6/analytics/matchups"
import { CharacterIdSchema } from "@/lib/sf6/model"
import { getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { AnalyticsInputSchema } from "./shared"

const CounterpicksInputSchema = AnalyticsInputSchema.extend({
  opponents: CharacterIdSchema.array().min(1),
})
const CounterpicksOutputSchema = z.object({
  opponents: CharacterIdSchema.array(),
  rows: z
    .object({
      characterId: CharacterIdSchema,
      averageWinRate: z.number().min(0).max(100).nullable(),
      worstWinRate: z.number().min(0).max(100).nullable(),
      atOrAbove50Count: z.number().int().nonnegative(),
      matchups: z
        .object({
          opponentId: CharacterIdSchema,
          winRate: z.number().min(0).max(100).nullable(),
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
      const snapshot = await getSnapshot(input.period)
      return {
        opponents: input.opponents,
        rows: getCounterpickCandidates(snapshot, input.league, input.controls, input.opponents),
      }
    }),
  )

export { counterpicksProcedure }
