import { os } from "@orpc/server"
import * as z from "zod"

import {
  getControlCells,
  getCounterpicks,
  getMatchupCell,
  getMatchupSpread,
} from "@/lib/sf6/analytics/matchups"
import { CharacterIdSchema } from "@/lib/sf6/model"
import { getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { AnalyticsInputSchema, ControlCellSchema, MatchupRowSchema } from "./shared"

const MatchupsInputSchema = AnalyticsInputSchema.extend({
  character: CharacterIdSchema,
  opponent: CharacterIdSchema,
})
const MatchupCellSchema = z.object({
  playerId: CharacterIdSchema,
  opponentId: CharacterIdSchema,
  status: z.enum(["numeric", "unavailable", "mirror"]),
  winRate: z.number().min(0).max(100).nullable(),
})
const MatchupsOutputSchema = z.object({
  headToHead: MatchupCellSchema,
  controls: ControlCellSchema.array(),
  best: MatchupRowSchema.array(),
  worst: MatchupRowSchema.array(),
  counterpicks: z
    .object({
      counterId: CharacterIdSchema,
      counterWinRate: z.number().min(0).max(100),
    })
    .array(),
})

const matchupsProcedure = os
  .input(MatchupsInputSchema)
  .output(MatchupsOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const snapshot = await getSnapshot(input.period)
      const spread = getMatchupSpread(snapshot, input.league, input.controls, input.character)
      return {
        headToHead: getMatchupCell(
          snapshot,
          input.league,
          input.controls,
          input.character,
          input.opponent,
        ),
        controls: getControlCells(snapshot, input.league, input.character, input.opponent),
        best: spread.slice(0, 6).map(({ opponentId, winRate }) => {
          return { opponentId, winRate }
        }),
        worst: spread
          .toReversed()
          .slice(0, 6)
          .map(({ opponentId, winRate }) => {
            return { opponentId, winRate }
          }),
        counterpicks: getCounterpicks(snapshot, input.league, input.controls, input.character)
          .slice(0, 6)
          .map(({ counterId, counterWinRate }) => {
            return { counterId, counterWinRate }
          }),
      }
    }),
  )

export { matchupsProcedure }
