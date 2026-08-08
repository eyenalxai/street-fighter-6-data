import { controlComparisonProcedure } from "./procedures/control-comparison"
import { counterpicksProcedure } from "./procedures/counterpicks"
import { leaderboardProcedure } from "./procedures/leaderboard"
import { matchupsProcedure } from "./procedures/matchups"
import { metaProcedure } from "./procedures/meta"
import { periodComparisonProcedure } from "./procedures/period-comparison"
import { rankProgressionProcedure } from "./procedures/rank-progression"
import { trendsProcedure } from "./procedures/trends"

const router = {
  meta: metaProcedure,
  leaderboard: leaderboardProcedure,
  trends: trendsProcedure,
  rankProgression: rankProgressionProcedure,
  controlComparison: controlComparisonProcedure,
  matchups: matchupsProcedure,
  counterpicks: counterpicksProcedure,
  periodComparison: periodComparisonProcedure,
}

export { router }
