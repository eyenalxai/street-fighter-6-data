import * as z from "zod"

import {
  CharacterIdSchema,
  CharacterSelectionSchema,
  ControlMatchupSchema,
  PlayerControlSchema,
  ReportingPeriodSchema,
  UniqueCharacterIdsSchema,
} from "./model"
import { RankIdSchema } from "./ranks"

const RosterSearchSchema = z.object({
  period: ReportingPeriodSchema.optional(),
  rank: RankIdSchema.default("all-master"),
  playerControl: PlayerControlSchema.default("combined"),
  view: z.enum(["snapshot", "controls", "ranks", "time", "stability"]).default("snapshot"),
})

const CharacterExplorerSearchSchema = z.object({
  period: ReportingPeriodSchema.optional(),
  rank: RankIdSchema.default("all-master"),
  playerControl: PlayerControlSchema.default("combined"),
  characters: CharacterSelectionSchema.default(["ryu"]),
  view: z.enum(["time", "ranks", "controls"]).default("time"),
})

const MatchupSearchSchema = z.object({
  period: ReportingPeriodSchema.optional(),
  rank: RankIdSchema.default("all-master"),
  character: CharacterIdSchema.default("ryu"),
  opponent: CharacterIdSchema.default("ken"),
  controls: ControlMatchupSchema.default("combined"),
  opponents: UniqueCharacterIdsSchema.default([]),
  view: z
    .enum(["head-to-head", "profile", "ranks", "time", "counterpicks"])
    .default("head-to-head"),
})

const ChangeSearchSchema = z.object({
  fromPeriod: ReportingPeriodSchema.optional(),
  toPeriod: ReportingPeriodSchema.optional(),
  rank: RankIdSchema.default("all-master"),
  playerControl: PlayerControlSchema.default("combined"),
  focusCharacters: CharacterSelectionSchema.default(["ryu"]),
  view: z.enum(["overview", "trends", "matchups"]).default("overview"),
})

type RosterSearch = z.infer<typeof RosterSearchSchema>
type CharacterExplorerSearch = z.infer<typeof CharacterExplorerSearchSchema>
type MatchupSearch = z.infer<typeof MatchupSearchSchema>
type ChangeSearch = z.infer<typeof ChangeSearchSchema>

export {
  CharacterExplorerSearchSchema,
  ChangeSearchSchema,
  MatchupSearchSchema,
  RosterSearchSchema,
  type CharacterExplorerSearch,
  type ChangeSearch,
  type MatchupSearch,
  type RosterSearch,
}
