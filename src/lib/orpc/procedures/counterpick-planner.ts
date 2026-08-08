import { os } from "@orpc/server"
import * as z from "zod"

import { getCounterpickCandidates } from "@/lib/sf6/analytics/counterpicks"
import {
  CharacterIdSchema,
  ControlMatchupSchema,
  CONTROL_MATCHUPS,
  NonEmptyUniqueCharacterIdsSchema,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import { getEffectiveControls } from "@/lib/sf6/rank-selection"
import { RankIdSchema } from "@/lib/sf6/ranks"
import { getRankBlock } from "@/lib/sf6/snapshots/dia.server"
import { getUsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { withSnapshotErrors } from "./execute.server"

const CounterpickPlannerInputSchema = z.object({
  period: ReportingPeriodSchema,
  rank: RankIdSchema,
  controls: ControlMatchupSchema,
  opponents: NonEmptyUniqueCharacterIdsSchema,
  order: z.enum(["weighted", "average", "floor"]),
})
const CounterpickPlannerOutputSchema = z.object({
  opponents: CharacterIdSchema.array(),
  excludedCandidateCount: z.number().int().nonnegative(),
  selectedUsageShare: z.number().min(0).max(100).nullable(),
  weightCoverage: z.number().min(0).max(1).nullable(),
  rows: z
    .object({
      characterId: CharacterIdSchema,
      weightedAverage: z.number().min(0).max(100).nullable(),
      unweightedAverage: z.number().min(0).max(100),
      floor: z.number().min(0).max(100),
      favorableCount: z.number().int().nonnegative(),
      opponentUsage: z
        .object({
          opponentId: CharacterIdSchema,
          playRate: z.number().min(0).max(100).nullable(),
        })
        .array(),
      matchups: z
        .object({
          opponentId: CharacterIdSchema,
          winRate: z.number().min(0).max(100),
        })
        .array(),
    })
    .array(),
})

const opponentControlForMatchup = (controls: z.infer<typeof ControlMatchupSchema>) => {
  const option = CONTROL_MATCHUPS.find((candidate) => candidate.id === controls)
  return option?.opponent === "C" ? "classic" : option?.opponent === "M" ? "modern" : "combined"
}

const counterpickPlannerProcedure = os
  .input(CounterpickPlannerInputSchema)
  .output(CounterpickPlannerOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const controls = getEffectiveControls(input.rank, input.controls)
      const [block, usage] = await Promise.all([
        getRankBlock(input.period, input.rank, controls),
        getUsageBlock(input.period, input.rank, opponentControlForMatchup(controls)),
      ])
      return {
        opponents: input.opponents,
        ...getCounterpickCandidates(block, controls, input.opponents, usage, input.order),
      }
    }),
  )

export { counterpickPlannerProcedure }
