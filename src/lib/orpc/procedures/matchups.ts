import { os } from "@orpc/server"
import * as z from "zod"

import {
  getControlMatchupResults,
  getMatchupCell,
  getOpponentWinRates,
} from "@/lib/sf6/analytics/matchups"
import { CharacterIdSchema, ControlMatchupSchema, ReportingPeriodSchema } from "@/lib/sf6/model"
import { getEffectiveControls } from "@/lib/sf6/rank-selection"
import { RankIdSchema } from "@/lib/sf6/ranks"
import { getRankBlock, getRankControlBlocks } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { ControlMatchupResultSchema, MatchupRowSchema } from "./shared"

const MatchupsInputSchema = z.object({
  period: ReportingPeriodSchema,
  rank: RankIdSchema,
  character: CharacterIdSchema,
  opponent: CharacterIdSchema,
  opponentListControls: ControlMatchupSchema,
})
const MatchupCellSchema = z.object({
  playerId: CharacterIdSchema,
  opponentId: CharacterIdSchema,
  status: z.enum(["numeric", "unavailable", "mirror"]),
  winRate: z.number().min(0).max(100).nullable(),
})
const MatchupsOutputSchema = z.object({
  headToHead: MatchupCellSchema,
  controlMatchups: ControlMatchupResultSchema.array(),
  best: MatchupRowSchema.array(),
  worst: MatchupRowSchema.array(),
})

const matchupsProcedure = os
  .input(MatchupsInputSchema)
  .output(MatchupsOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const controls = getEffectiveControls(input.rank, input.opponentListControls)
      const combinedBlock = await getRankBlock(input.period, input.rank, "combined")
      const opponentBlock =
        controls === "combined"
          ? combinedBlock
          : await getRankBlock(input.period, input.rank, controls)
      const controlBlocks = await getRankControlBlocks(input.period, input.rank)
      const opponentResults = getOpponentWinRates(opponentBlock, controls, input.character)
      return {
        headToHead: getMatchupCell(combinedBlock, "combined", input.character, input.opponent),
        controlMatchups: getControlMatchupResults(controlBlocks, input.character, input.opponent),
        best: opponentResults.slice(0, 6).map(({ opponentId, winRate }) => {
          return { opponentId, winRate }
        }),
        worst: opponentResults
          .toReversed()
          .slice(0, 6)
          .map(({ opponentId, winRate }) => {
            return { opponentId, winRate }
          }),
      }
    }),
  )

export { matchupsProcedure }
