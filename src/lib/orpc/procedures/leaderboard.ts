import { os } from "@orpc/server"
import * as z from "zod"

import { getLeaderboard } from "@/lib/sf6/analytics/matchups"
import { getSnapshot } from "@/lib/sf6/snapshots.server"

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
      const snapshot = await getSnapshot(input.period)
      return {
        rows: getLeaderboard(snapshot, input.league, input.controls),
      }
    }),
  )

export { leaderboardProcedure }
