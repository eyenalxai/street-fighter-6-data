import { changeExplorerProcedure } from "./procedures/change-explorer"
import { characterExplorerProcedure } from "./procedures/character-explorer"
import { counterpickPlannerProcedure } from "./procedures/counterpick-planner"
import { matchupExplorerProcedure } from "./procedures/matchup-explorer"
import { metaProcedure } from "./procedures/meta"
import { rosterOverviewProcedure } from "./procedures/roster-overview"

const router = {
  meta: metaProcedure,
  rosterOverview: rosterOverviewProcedure,
  characterExplorer: characterExplorerProcedure,
  matchupExplorer: matchupExplorerProcedure,
  counterpickPlanner: counterpickPlannerProcedure,
  changeExplorer: changeExplorerProcedure,
}

export { router }
