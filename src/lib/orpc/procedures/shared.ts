import * as z from "zod"

import {
  CharacterIdSchema,
  ControlMatchupSchema,
  LeagueIdSchema,
  ReportingPeriodSchema,
} from "@/lib/sf6/model"

const AnalyticsInputSchema = z.object({
  period: ReportingPeriodSchema,
  league: LeagueIdSchema,
  controls: ControlMatchupSchema,
})
const CharacterMetricSchema = z.object({
  characterId: CharacterIdSchema,
  winRate: z.number().min(0).max(100),
})
const MatchupRowSchema = z.object({
  opponentId: CharacterIdSchema,
  winRate: z.number().min(0).max(100),
})
const ControlMatchupResultSchema = z.object({
  controlMatchup: ControlMatchupSchema.exclude(["combined"]),
  label: z.string(),
  winRate: z.number().min(0).max(100).nullable(),
})

export { AnalyticsInputSchema, CharacterMetricSchema, ControlMatchupResultSchema, MatchupRowSchema }
