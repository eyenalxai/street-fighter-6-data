import type { CharacterId, ControlMatchup, PlayerControl, ReportingPeriod } from "./model"
import type { RankId } from "./ranks"
import type { CharacterExplorerSearch, ChangeSearch, MatchupSearch, RosterSearch } from "./search"

import {
  getControlComparisonRank,
  getPeriodsForRank,
  getRankComparisonPeriods,
} from "./rank-selection"
import { isMasterSubdivisionRank } from "./ranks"

type RosterView = RosterSearch["view"]
type CharacterView = CharacterExplorerSearch["view"]
type MatchupView = MatchupSearch["view"]
type ChangeView = ChangeSearch["view"]

const hasSelectedCharacters = (characters: readonly CharacterId[] | undefined): boolean =>
  (characters?.length ?? 0) > 0

type RosterSearchValue = {
  view: RosterView
  period?: ReportingPeriod
  rank?: RankId
  playerControl?: PlayerControl
}

type CharacterSearchValue = {
  view: CharacterView
  period?: ReportingPeriod
  rank?: RankId
  playerControl?: PlayerControl
  characters: CharacterId[]
}

type MatchupSearchValue = {
  view: MatchupView
  period?: ReportingPeriod
  rank?: RankId
  controls?: ControlMatchup
  character?: CharacterId
  opponent?: CharacterId
  opponents?: CharacterId[]
}

type ChangeSearchValue = {
  view: ChangeView
  fromPeriod?: ReportingPeriod
  toPeriod?: ReportingPeriod
  rank: RankId
  playerControl?: PlayerControl
  focusCharacters?: CharacterId[]
}

const getRosterPeriodOptions = (
  view: RosterView,
  rank: RankId,
  regularPeriods: readonly ReportingPeriod[],
  subdivisionPeriods: readonly ReportingPeriod[],
): readonly ReportingPeriod[] => {
  if (view === "time") {
    return []
  }
  return view === "ranks" || view === "stability"
    ? getRankComparisonPeriods(regularPeriods, subdivisionPeriods)
    : getPeriodsForRank(
        view === "controls" ? getControlComparisonRank(rank) : rank,
        regularPeriods,
        subdivisionPeriods,
      )
}

const getCharacterPeriodOptions = (
  view: CharacterView,
  rank: RankId,
  regularPeriods: readonly ReportingPeriod[],
  subdivisionPeriods: readonly ReportingPeriod[],
): readonly ReportingPeriod[] => {
  if (view === "time") {
    return []
  }
  return view === "ranks"
    ? getRankComparisonPeriods(regularPeriods, subdivisionPeriods)
    : getPeriodsForRank(
        view === "controls" ? getControlComparisonRank(rank) : rank,
        regularPeriods,
        subdivisionPeriods,
      )
}

const getMatchupPeriodOptions = (
  view: MatchupView,
  rank: RankId,
  regularPeriods: readonly ReportingPeriod[],
  subdivisionPeriods: readonly ReportingPeriod[],
): readonly ReportingPeriod[] => {
  if (view === "time") {
    return []
  }
  return view === "ranks"
    ? getRankComparisonPeriods(regularPeriods, subdivisionPeriods)
    : getPeriodsForRank(rank, regularPeriods, subdivisionPeriods)
}

const getControlComparisonRanks = <T extends { id: RankId }>(ranks: readonly T[]): T[] =>
  ranks.filter((rank) => !isMasterSubdivisionRank(rank.id))

const getRosterLoaderDeps = (search: RosterSearch): RosterSearchValue => {
  switch (search.view) {
    case "snapshot": {
      return {
        view: search.view,
        period: search.period,
        rank: search.rank,
        playerControl: search.playerControl,
      }
    }
    case "controls": {
      return { view: search.view, period: search.period, rank: search.rank }
    }
    case "ranks": {
      return { view: search.view, period: search.period }
    }
    case "time": {
      return { view: search.view, rank: search.rank }
    }
    case "stability": {
      return { view: search.view, period: search.period, rank: search.rank }
    }
    default: {
      throw new Error("Unknown roster view")
    }
  }
}

const getCharacterLoaderDeps = (search: CharacterExplorerSearch): CharacterSearchValue => {
  switch (search.view) {
    case "time": {
      return {
        view: search.view,
        rank: search.rank,
        playerControl: search.playerControl,
        characters: search.characters,
      }
    }
    case "ranks": {
      return { view: search.view, period: search.period, characters: search.characters }
    }
    case "controls": {
      return {
        view: search.view,
        period: search.period,
        rank: search.rank,
        characters: search.characters,
      }
    }
    default: {
      throw new Error("Unknown character view")
    }
  }
}

const getMatchupLoaderDeps = (search: MatchupSearch): MatchupSearchValue => {
  switch (search.view) {
    case "head-to-head": {
      return {
        view: search.view,
        period: search.period,
        rank: search.rank,
        controls: search.controls,
        character: search.character,
        opponent: search.opponent,
      }
    }
    case "profile": {
      return {
        view: search.view,
        period: search.period,
        rank: search.rank,
        controls: search.controls,
        character: search.character,
      }
    }
    case "ranks": {
      return {
        view: search.view,
        period: search.period,
        character: search.character,
        opponent: search.opponent,
      }
    }
    case "time": {
      return {
        view: search.view,
        rank: search.rank,
        controls: search.controls,
        character: search.character,
        opponent: search.opponent,
      }
    }
    case "counterpicks": {
      return {
        view: search.view,
        period: search.period,
        rank: search.rank,
        controls: search.controls,
        opponents: search.opponents,
      }
    }
    default: {
      throw new Error("Unknown matchup view")
    }
  }
}

const getChangeLoaderDeps = (search: ChangeSearch): ChangeSearchValue => {
  const shared = {
    fromPeriod: search.fromPeriod,
    toPeriod: search.toPeriod,
    rank: search.rank,
    playerControl: search.playerControl,
  }
  return search.view === "trends"
    ? { view: search.view, ...shared, focusCharacters: search.focusCharacters }
    : { view: search.view, ...shared }
}

export {
  hasSelectedCharacters,
  getCharacterLoaderDeps,
  getCharacterPeriodOptions,
  getChangeLoaderDeps,
  getControlComparisonRanks,
  getMatchupLoaderDeps,
  getMatchupPeriodOptions,
  getRosterLoaderDeps,
  getRosterPeriodOptions,
  type ChangeSearchValue,
  type CharacterSearchValue,
  type MatchupSearchValue,
  type RosterSearchValue,
}
