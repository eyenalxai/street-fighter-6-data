import { os } from "@orpc/server"
import * as z from "zod"

import { balanceProcedure } from "./procedures/balance"
import { controlComparisonProcedure } from "./procedures/control-comparison"
import { counterpicksProcedure } from "./procedures/counterpicks"
import { leaderboardProcedure } from "./procedures/leaderboard"
import { matchupsProcedure } from "./procedures/matchups"
import { metaProcedure } from "./procedures/meta"
import { periodComparisonProcedure } from "./procedures/period-comparison"
import { rankProgressionProcedure } from "./procedures/rank-progression"
import { similarityProcedure } from "./procedures/similarity"
import { trendsProcedure } from "./procedures/trends"

const HealthOutputSchema = z.object({
  status: z.literal("ok"),
})

const healthProcedure = os
  .input(z.void())
  .output(HealthOutputSchema)
  .handler(() => {
    return { status: "ok" }
  })

const router = {
  health: healthProcedure,
  meta: metaProcedure,
  leaderboard: leaderboardProcedure,
  trends: trendsProcedure,
  rankProgression: rankProgressionProcedure,
  controlComparison: controlComparisonProcedure,
  matchups: matchupsProcedure,
  counterpicks: counterpicksProcedure,
  periodComparison: periodComparisonProcedure,
  similarity: similarityProcedure,
  balance: balanceProcedure,
}

export { router }
