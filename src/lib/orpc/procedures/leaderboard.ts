import { os } from "@orpc/server"
import * as z from "zod"

import { getLeaderboard } from "@/lib/sf6/analytics/matchups"
import { getEffectiveControls } from "@/lib/sf6/rank-selection"
import { getRankBlock } from "@/lib/sf6/snapshots.server"

import { withSnapshotErrors } from "./execute.server"
import { AnalyticsInputSchema, CharacterMetricSchema } from "./shared"

const LeaderboardOutputSchema = z.object({
  rows: CharacterMetricSchema.array(),
})

const leaderboardProcedure = os
  .input(AnalyticsInputSchema)
  .output(LeaderboardOutputSchema)
  .handler(async ({ input }) =>
    withSnapshotErrors(async () => {
      const controls = getEffectiveControls(input.rank, input.controls)
      const block = await getRankBlock(input.period, input.rank, controls)
      return {
        rows: getLeaderboard(block, controls),
      }
    }),
  )

export { leaderboardProcedure }
