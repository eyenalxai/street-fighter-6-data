import type {
  ChangeSearchValue,
  CharacterSearchValue,
  MatchupSearchValue,
  RosterSearchValue,
} from "./analysis-dependencies"
import type { CharacterId, ControlMatchup, PlayerControl, ReportingPeriod } from "./model"
import type { RankId } from "./ranks"
import type { CharacterExplorerSearch, ChangeSearch, MatchupSearch, RosterSearch } from "./search"

import {
  getControlComparisonRank,
  getEffectiveControls,
  getEffectivePlayerControl,
} from "./rank-selection"

type RosterInput =
  | {
      view: "snapshot"
      period: ReportingPeriod
      rank: RankId
      playerControl: PlayerControl
    }
  | { view: "controls"; period: ReportingPeriod; rank: RankId }
  | { view: "ranks"; period: ReportingPeriod }
  | { view: "time"; rank: RankId }
  | { view: "stability"; period: ReportingPeriod; rank: RankId }

type CharacterInput =
  | {
      view: "time"
      rank: RankId
      playerControl: PlayerControl
      characters: CharacterId[]
    }
  | { view: "ranks"; period: ReportingPeriod; characters: CharacterId[] }
  | {
      view: "controls"
      period: ReportingPeriod
      rank: RankId
      characters: CharacterId[]
    }

type MatchupInput =
  | {
      view: "head-to-head"
      period: ReportingPeriod
      rank: RankId
      controls: ControlMatchup
      character: CharacterId
      opponent: CharacterId
    }
  | {
      view: "profile"
      period: ReportingPeriod
      rank: RankId
      controls: ControlMatchup
      character: CharacterId
    }
  | {
      view: "ranks"
      period: ReportingPeriod
      character: CharacterId
      opponent: CharacterId
    }
  | {
      view: "time"
      rank: RankId
      controls: ControlMatchup
      character: CharacterId
      opponent: CharacterId
    }

type CounterpickInput = {
  period: ReportingPeriod
  rank: RankId
  controls: ControlMatchup
  opponents: CharacterId[]
}

type ChangeInput =
  | {
      view: "overview"
      fromPeriod: ReportingPeriod
      toPeriod: ReportingPeriod
      rank: RankId
      playerControl: PlayerControl
    }
  | {
      view: "trends"
      fromPeriod: ReportingPeriod
      toPeriod: ReportingPeriod
      rank: RankId
      playerControl: PlayerControl
      focusCharacters: CharacterId[]
    }
  | {
      view: "matchups"
      fromPeriod: ReportingPeriod
      toPeriod: ReportingPeriod
      rank: RankId
      playerControl: PlayerControl
    }

const requiredPeriod = (
  requested: ReportingPeriod | undefined,
  resolved: ReportingPeriod | undefined,
): ReportingPeriod => {
  const period = resolved ?? requested
  if (period === undefined) {
    throw new Error("A reporting period is required for this view")
  }
  return period
}

const buildRosterInput = (
  search: RosterSearch | RosterSearchValue,
  period?: ReportingPeriod,
): RosterInput => {
  const rank = search.rank ?? "all-master"
  switch (search.view) {
    case "snapshot": {
      return {
        view: search.view,
        period: requiredPeriod(search.period, period),
        rank,
        playerControl: getEffectivePlayerControl(rank, search.playerControl ?? "combined"),
      }
    }
    case "controls": {
      return {
        view: search.view,
        period: requiredPeriod(search.period, period),
        rank: getControlComparisonRank(rank),
      }
    }
    case "ranks": {
      return { view: search.view, period: requiredPeriod(search.period, period) }
    }
    case "time": {
      return { view: search.view, rank }
    }
    case "stability": {
      return {
        view: search.view,
        period: requiredPeriod(search.period, period),
        rank,
      }
    }
    default: {
      throw new Error("Unknown roster view")
    }
  }
}

const buildCharacterInput = (
  search: CharacterExplorerSearch | CharacterSearchValue,
  period?: ReportingPeriod,
): CharacterInput => {
  const rank = search.rank ?? "all-master"
  switch (search.view) {
    case "time": {
      return {
        view: search.view,
        rank,
        playerControl: getEffectivePlayerControl(rank, search.playerControl ?? "combined"),
        characters: search.characters,
      }
    }
    case "ranks": {
      return {
        view: search.view,
        period: requiredPeriod(search.period, period),
        characters: search.characters,
      }
    }
    case "controls": {
      return {
        view: search.view,
        period: requiredPeriod(search.period, period),
        rank: getControlComparisonRank(rank),
        characters: search.characters,
      }
    }
    default: {
      throw new Error("Unknown character view")
    }
  }
}

const buildMatchupInput = (
  search: MatchupSearch | MatchupSearchValue,
  period?: ReportingPeriod,
): MatchupInput => {
  if (search.view === "counterpicks") {
    throw new Error("Counterpick views use the counterpick planner input")
  }
  const rank = search.rank ?? "all-master"
  const character = search.character ?? "ryu"
  const opponent = search.opponent ?? "ken"
  if (search.view === "head-to-head") {
    return {
      view: search.view,
      period: requiredPeriod(search.period, period),
      rank,
      controls: getEffectiveControls(rank, search.controls ?? "combined"),
      character,
      opponent,
    }
  }
  if (search.view === "profile") {
    return {
      view: search.view,
      period: requiredPeriod(search.period, period),
      rank,
      controls: getEffectiveControls(rank, search.controls ?? "combined"),
      character,
    }
  }
  if (search.view === "ranks") {
    return {
      view: search.view,
      period: requiredPeriod(search.period, period),
      character,
      opponent,
    }
  }
  return {
    view: search.view,
    rank,
    controls: getEffectiveControls(rank, search.controls ?? "combined"),
    character,
    opponent,
  }
}

const buildCounterpickInput = (
  search: MatchupSearch | MatchupSearchValue,
  period?: ReportingPeriod,
): CounterpickInput => {
  if (search.view !== "counterpicks") {
    throw new Error("Only counterpick views use the counterpick planner input")
  }
  const rank = search.rank ?? "all-master"
  return {
    period: requiredPeriod(search.period, period),
    rank,
    controls: getEffectiveControls(rank, search.controls ?? "combined"),
    opponents: search.opponents ?? [],
  }
}

const buildChangeInput = (
  search: ChangeSearch | ChangeSearchValue,
  fromPeriod: ReportingPeriod,
  toPeriod: ReportingPeriod,
): ChangeInput => {
  const playerControl = getEffectivePlayerControl(search.rank, search.playerControl ?? "combined")
  const base = {
    fromPeriod,
    toPeriod,
    rank: search.rank,
    playerControl,
  }
  return search.view === "trends"
    ? { view: search.view, ...base, focusCharacters: search.focusCharacters ?? ["ryu"] }
    : { view: search.view, ...base }
}

const getActiveInputKey = (input: object): string => JSON.stringify(input)

export {
  buildChangeInput,
  buildCharacterInput,
  buildCounterpickInput,
  buildMatchupInput,
  buildRosterInput,
  getActiveInputKey,
  type ChangeInput,
  type CharacterInput,
  type CounterpickInput,
  type MatchupInput,
  type RosterInput,
}
