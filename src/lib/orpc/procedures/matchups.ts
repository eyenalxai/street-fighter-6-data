import { os } from "@orpc/server"
import * as z from "zod"

import {
  getControlMatchupResults,
  getMatchupCell,
  getOpponentWinRates,
} from "@/lib/sf6/analytics/matchups"
import {
  CharacterIdSchema,
  ControlMatchupSchema,
  LeagueIdSchema,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"
import { getSnapshot } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { ControlMatchupResultSchema, MatchupRowSchema } from "./shared"

const MatchupsInputSchema = z.object({
  period: ReportingPeriodSchema,
  league: LeagueIdSchema,
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
      const snapshot = await getSnapshot(input.period)
      const opponentResults = getOpponentWinRates(
        snapshot,
        input.league,
        input.opponentListControls,
        input.character,
      )
      return {
        headToHead: getMatchupCell(
          snapshot,
          input.league,
          "combined",
          input.character,
          input.opponent,
        ),
        controlMatchups: getControlMatchupResults(
          snapshot,
          input.league,
          input.character,
          input.opponent,
        ),
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
