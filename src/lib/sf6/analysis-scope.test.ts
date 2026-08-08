import { expect, test } from "bun:test"

import { getControlComparisonRanks } from "./analysis-dependencies"
import {
  buildChangeInput,
  buildCharacterInput,
  buildMatchupInput,
  buildRosterInput,
} from "./analysis-scope"
import { RANKS } from "./ranks"
import { ChangeSearchSchema, MatchupSearchSchema } from "./search"

test("focused inputs omit controls that do not affect the view", () => {
  expect(
    buildCharacterInput({
      view: "time",
      period: "202601",
      rank: "all-master",
      playerControl: "classic",
      characters: ["ryu"],
    }),
  ).toEqual({
    view: "time",
    rank: "all-master",
    playerControl: "classic",
    characters: ["ryu"],
  })
  expect(
    buildCharacterInput({
      view: "ranks",
      period: "202601",
      rank: "all-master",
      playerControl: "modern",
      characters: ["ryu"],
    }),
  ).toEqual({
    view: "ranks",
    period: "202601",
    characters: ["ryu"],
  })
  expect(
    buildRosterInput({
      view: "ranks",
      period: "202601",
      rank: "all-master",
      playerControl: "modern",
    }),
  ).toEqual({ view: "ranks", period: "202601" })
  expect(
    buildRosterInput({
      view: "time",
      period: "202601",
      rank: "all-master",
      playerControl: "modern",
    }),
  ).toEqual({ view: "time", rank: "all-master" })
})

test("matchup time omits period and matchup ranks omit rank and controls", () => {
  const timeSearch = MatchupSearchSchema.parse({
    view: "time",
    period: "202601",
    rank: "all-master",
    controls: "classic-modern",
  })
  expect(buildMatchupInput(timeSearch)).toEqual({
    view: "time",
    rank: "all-master",
    controls: "classic-modern",
    character: "ryu",
    opponent: "ken",
  })

  const rankSearch = MatchupSearchSchema.parse({
    view: "ranks",
    period: "202601",
    rank: "gold",
    controls: "modern-modern",
  })
  expect(buildMatchupInput(rankSearch)).toEqual({
    view: "ranks",
    period: "202601",
    character: "ryu",
    opponent: "ken",
  })
})

test("change views keep focus characters only for trends", () => {
  const overview = ChangeSearchSchema.parse({ view: "overview" })
  expect(buildChangeInput(overview, "202601", "202602")).toEqual({
    view: "overview",
    fromPeriod: "202601",
    toPeriod: "202602",
    rank: "all-master",
    playerControl: "combined",
  })

  const trends = ChangeSearchSchema.parse({ view: "trends", focusCharacters: ["chunli"] })
  expect(buildChangeInput(trends, "202601", "202602")).toEqual({
    view: "trends",
    fromPeriod: "202601",
    toPeriod: "202602",
    rank: "all-master",
    playerControl: "combined",
    focusCharacters: ["chunli"],
  })
})

test("master subdivisions force combined controls and are excluded from control choices", () => {
  expect(
    buildRosterInput({
      view: "snapshot",
      period: "202601",
      rank: "master",
      playerControl: "modern",
    }),
  ).toMatchObject({ playerControl: "combined" })

  const matchup = MatchupSearchSchema.parse({
    view: "time",
    rank: "master",
    controls: "classic-modern",
  })
  expect(buildMatchupInput(matchup)).toMatchObject({ controls: "combined" })
  expect(getControlComparisonRanks(RANKS).some((rank) => rank.id === "master")).toBe(false)
})
