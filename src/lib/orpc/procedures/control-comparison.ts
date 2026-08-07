import { os } from "@orpc/server"
import * as z from "zod"

import { getControlComparison } from "@/lib/sf6/analytics/aggregates"
import { CharacterIdSchema, LeagueIdSchema, ReportingPeriodSchema } from "@/lib/sf6/model"
import { getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"

const ControlComparisonInputSchema = z.object({
  period: ReportingPeriodSchema,
  league: LeagueIdSchema,
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
      const snapshot = await getSnapshot(input.period)
      return {
        rows: getControlComparison(snapshot, input.league),
      }
    }),
  )

export { controlComparisonProcedure }
