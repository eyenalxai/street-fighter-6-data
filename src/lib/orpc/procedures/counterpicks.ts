import { os } from "@orpc/server"
import * as z from "zod"

import { getCounterpickCoverage } from "@/lib/sf6/analytics/matchups"
import { CharacterIdSchema } from "@/lib/sf6/model"
import { getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { AnalyticsInputSchema } from "./shared"

const CounterpicksInputSchema = AnalyticsInputSchema.extend({
  target: CharacterIdSchema,
  threats: CharacterIdSchema.array().min(1).max(8),
})
const CounterpicksOutputSchema = z.object({
  target: CharacterIdSchema,
  threats: CharacterIdSchema.array(),
  rows: z
    .object({
      characterId: CharacterIdSchema,
      averageWinRate: z.number().min(0).max(100).nullable(),
      worstWinRate: z.number().min(0).max(100).nullable(),
      coveredCount: z.number().int().nonnegative(),
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
        target: input.target,
        threats: input.threats,
        rows: getCounterpickCoverage(snapshot, input.league, input.controls, input.threats),
      }
    }),
  )

export { counterpicksProcedure }
