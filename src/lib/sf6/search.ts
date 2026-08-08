import * as z from "zod"

import {
  CharacterIdSchema,
  ControlMatchupSchema,
  ReportingPeriodSchema,
  UniqueCharacterIdsSchema,
} from "./model"
import { ControlComparisonRankIdSchema, RankIdSchema } from "./ranks"

const RosterSearchSchema = z.object({
  period: ReportingPeriodSchema.optional(),
  rank: RankIdSchema.default("all-master"),
  controls: ControlMatchupSchema.default("combined"),
})

const ControlComparisonSearchSchema = z.object({
  period: ReportingPeriodSchema.optional(),
  rank: ControlComparisonRankIdSchema.default("all-master"),
})

const MatchupSearchSchema = z.object({
  period: ReportingPeriodSchema.optional(),
  rank: RankIdSchema.default("all-master"),
  character: CharacterIdSchema.default("ryu"),
  opponent: CharacterIdSchema.default("ken"),
  opponentListControls: ControlMatchupSchema.default("combined"),
})

const CounterpickSearchSchema = z.object({
  period: ReportingPeriodSchema.optional(),
  rank: RankIdSchema.default("all-master"),
  controls: ControlMatchupSchema.default("combined"),
  opponents: UniqueCharacterIdsSchema.default([]),
})

const TrendSearchSchema = z.object({
  rank: RankIdSchema.default("all-master"),
  controls: ControlMatchupSchema.default("combined"),
  characters: CharacterIdSchema.array().default([]),
})

const RankComparisonSearchSchema = z.object({
  period: ReportingPeriodSchema.optional(),
  controls: ControlMatchupSchema.default("combined"),
  character: CharacterIdSchema.default("ryu"),
})

const PeriodComparisonSearchSchema = z.object({
  fromPeriod: ReportingPeriodSchema.optional(),
  toPeriod: ReportingPeriodSchema.optional(),
  rank: RankIdSchema.default("all-master"),
  controls: ControlMatchupSchema.default("combined"),
})

type RosterSearch = z.infer<typeof RosterSearchSchema>
type ControlComparisonSearch = z.infer<typeof ControlComparisonSearchSchema>
type MatchupSearch = z.infer<typeof MatchupSearchSchema>
type CounterpickSearch = z.infer<typeof CounterpickSearchSchema>
type TrendSearch = z.infer<typeof TrendSearchSchema>
type RankComparisonSearch = z.infer<typeof RankComparisonSearchSchema>
type PeriodComparisonSearch = z.infer<typeof PeriodComparisonSearchSchema>

export {
  ControlComparisonSearchSchema,
  CounterpickSearchSchema,
  MatchupSearchSchema,
  PeriodComparisonSearchSchema,
  RankComparisonSearchSchema,
  RosterSearchSchema,
  TrendSearchSchema,
  type ControlComparisonSearch,
  type CounterpickSearch,
  type MatchupSearch,
  type PeriodComparisonSearch,
  type RankComparisonSearch,
  type RosterSearch,
  type TrendSearch,
}
