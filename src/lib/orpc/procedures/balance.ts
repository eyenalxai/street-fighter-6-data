import { os } from "@orpc/server"
import * as z from "zod"

import { getBalanceMetrics, getBalanceSummary } from "@/lib/sf6/analytics/balance"
import { CharacterIdSchema } from "@/lib/sf6/model"
import { getAvailablePeriods, getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { AnalyticsInputSchema } from "./shared"

const BalanceRowSchema = z.object({
  characterId: CharacterIdSchema,
  mean: z.number().min(0).max(100),
  min: z.number().min(0).max(100),
  max: z.number().min(0).max(100),
  spread: z.number().min(0).max(100),
  standardDeviation: z.number().min(0).max(100),
  favorable: z.number().int().nonnegative(),
  even: z.number().int().nonnegative(),
  unfavorable: z.number().int().nonnegative(),
  volatility: z.number().min(0).max(100),
})
const BalanceOutputSchema = z.object({
  rows: BalanceRowSchema.array(),
  summary: z.object({
    count: z.number().int().nonnegative(),
    balancedShare: z.number().min(0).max(100),
    tierSpread: z.number().min(0).max(100),
    meanStandardDeviation: z.number().min(0).max(100),
    strongest: BalanceRowSchema.nullable(),
    weakest: BalanceRowSchema.nullable(),
    mostVolatile: BalanceRowSchema.nullable(),
  }),
})

const balanceProcedure = os
  .input(AnalyticsInputSchema)
  .output(BalanceOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const snapshot = await getSnapshot(input.period)
      const periods = await getAvailablePeriods()
      const entries = await Promise.all(
        periods.map(async (period) => {
          return { period, snapshot: await getSnapshot(period) }
        }),
      )
      const rows = getBalanceMetrics(snapshot, entries, input.league, input.controls)
      return {
        rows,
        summary: getBalanceSummary(rows),
      }
    }),
  )

export { balanceProcedure }
