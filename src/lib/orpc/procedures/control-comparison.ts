import { os } from "@orpc/server"
import * as z from "zod"

import { getControlComparison } from "@/lib/sf6/analytics/aggregates"
import { CharacterIdSchema, ReportingPeriodSchema } from "@/lib/sf6/model"
import { getControlComparisonRank } from "@/lib/sf6/rank-selection"
import { RankIdSchema } from "@/lib/sf6/ranks"
import { getRankControlBlocks } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"

const ControlComparisonInputSchema = z.object({
  period: ReportingPeriodSchema,
  rank: RankIdSchema,
})
const ControlComparisonOutputSchema = z.object({
  rows: z
    .object({
      characterId: CharacterIdSchema,
      classic: z.number().min(0).max(100).nullable(),
      modern: z.number().min(0).max(100).nullable(),
      delta: z.number().min(-100).max(100).nullable(),
    })
    .array(),
})

const controlComparisonProcedure = os
  .input(ControlComparisonInputSchema)
  .output(ControlComparisonOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const rank = getControlComparisonRank(input.rank)
      const controlBlocks = await getRankControlBlocks(input.period, rank)
      if (controlBlocks === null) {
        throw new Error("Control comparison data is unavailable for this rank")
      }
      return {
        rows: getControlComparison(controlBlocks),
      }
    }),
  )

export { controlComparisonProcedure }
