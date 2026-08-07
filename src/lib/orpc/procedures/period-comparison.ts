import { os } from "@orpc/server"
import * as z from "zod"

import { getPeriodComparison } from "@/lib/sf6/analytics/aggregates"
import { CharacterIdSchema, ReportingPeriodSchema } from "@/lib/sf6/model"
import { getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { AnalyticsInputSchema } from "./shared"

const PeriodComparisonInputSchema = AnalyticsInputSchema.omit({ period: true }).extend({
  fromPeriod: ReportingPeriodSchema,
  toPeriod: ReportingPeriodSchema,
})
const PeriodComparisonOutputSchema = z.object({
  fromPeriod: ReportingPeriodSchema,
  toPeriod: ReportingPeriodSchema,
  rows: z
    .object({
      characterId: CharacterIdSchema,
      before: z.number().min(0).max(100).nullable(),
      after: z.number().min(0).max(100).nullable(),
      delta: z.number().min(-100).max(100).nullable(),
    })
    .array(),
})

const periodComparisonProcedure = os
  .input(PeriodComparisonInputSchema)
  .output(PeriodComparisonOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const [before, after] = await Promise.all([
        getSnapshot(input.fromPeriod),
        getSnapshot(input.toPeriod),
      ])
      return {
        fromPeriod: input.fromPeriod,
        toPeriod: input.toPeriod,
        rows: getPeriodComparison(
          { period: input.fromPeriod, snapshot: before },
          { period: input.toPeriod, snapshot: after },
          input.league,
          input.controls,
        ),
      }
    }),
  )

export { periodComparisonProcedure }
