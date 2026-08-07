import * as z from "zod"

import {
  CharacterIdSchema,
  ControlMatchupSchema,
  DashboardViewSchema,
  LeagueIdSchema,
  ReportingPeriodSchema,
} from "./model"

const DashboardSearchSchema = z.object({
  view: DashboardViewSchema.default("leaderboard"),
  period: ReportingPeriodSchema.optional(),
  league: LeagueIdSchema.default("8"),
  character: CharacterIdSchema.default("ryu"),
  opponent: CharacterIdSchema.default("ken"),
  controls: ControlMatchupSchema.default("combined"),
})

type DashboardSearch = z.infer<typeof DashboardSearchSchema>

const DEFAULT_SEARCH = DashboardSearchSchema.parse({})

export { DashboardSearchSchema, DEFAULT_SEARCH, type DashboardSearch }
