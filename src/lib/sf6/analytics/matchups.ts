import type { CharacterId, ControlMatchup, ControlType, LeagueId } from "@/lib/sf6/model"
import type { ProcessedDiaLeague, ProcessedDiaSnapshot } from "@/lib/sf6/snapshot-schema"

import { CHARACTERS, CONTROL_MATCHUPS } from "@/lib/sf6/model"
import { getPlayerCharacterId, getPlayerControl } from "@/lib/sf6/snapshot-schema"

import { mean, round } from "./math"

type MatchupStatus = "numeric" | "unavailable" | "mirror"
type MatchupCell = {
  playerId: CharacterId
  opponentId: CharacterId
  status: MatchupStatus
  winRate: number | null
}
type MatchupAverageRow = {
  characterId: CharacterId
  winRate: number
}
type OpponentWinRateRow = {
  opponentId: CharacterId
  winRate: number
}
type CounterpickCandidateRow = {
  characterId: CharacterId
  averageWinRate: number | null
  worstWinRate: number | null
  atOrAbove50Count: number
  matchups: { opponentId: CharacterId; winRate: number | null }[]
}
type ControlMatchupResult = {
  controlMatchup: Exclude<ControlMatchup, "combined">
  label: string
  winRate: number | null
}

type ControlPair = {
  player: ControlType | null
  opponent: ControlType | null
}

const getControlPair = (controlMatchup: ControlMatchup): ControlPair => {
  if (controlMatchup === "combined") {
    return { player: null, opponent: null }
  }
  if (controlMatchup === "classic-classic") {
    return { player: "C", opponent: "C" }
  }
  if (controlMatchup === "classic-modern") {
    return { player: "C", opponent: "M" }
  }
  if (controlMatchup === "modern-classic") {
    return { player: "M", opponent: "C" }
  }
  return { player: "M", opponent: "M" }
}

const getLeagueBlock = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
): ProcessedDiaLeague | undefined =>
  controlMatchup === "combined" ? snapshot.c[league] : snapshot.ci[league]

const getPlayerIndex = (
  block: ProcessedDiaLeague,
  characterId: string,
  control: ControlType | null,
): number =>
  block.p.findIndex(
    (player) =>
      getPlayerCharacterId(player) === characterId && getPlayerControl(player) === control,
  )

const unavailableCell = (playerId: CharacterId, opponentId: CharacterId): MatchupCell => {
  return {
    playerId,
    opponentId,
    status: "unavailable",
    winRate: null,
  }
}

const getMatchupCell = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
  playerId: CharacterId,
  opponentId: CharacterId,
): MatchupCell => {
  const block = getLeagueBlock(snapshot, league, controlMatchup)
  if (block === undefined) {
    return unavailableCell(playerId, opponentId)
  }

  const controls = getControlPair(controlMatchup)
  const playerIndex = getPlayerIndex(block, playerId, controls.player)
  const opponentIndex = getPlayerIndex(block, opponentId, controls.opponent)
  if (playerIndex < 0 || opponentIndex < 0) {
    return unavailableCell(playerId, opponentId)
  }

  const value = block.m[playerIndex]?.[opponentIndex]
  if (value === undefined) {
    return unavailableCell(playerId, opponentId)
  }
  if (value === null) {
    return {
      playerId,
      opponentId,
      status:
        playerId === opponentId && controls.player === controls.opponent ? "mirror" : "unavailable",
      winRate: null,
    }
  }

  return {
    playerId,
    opponentId,
    status: "numeric",
    winRate: round(value * 100),
  }
}

const getAvailableCharacterIds = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
): CharacterId[] => {
  const block = getLeagueBlock(snapshot, league, controlMatchup)
  if (block === undefined) {
    return []
  }

  const availableIds = new Set(block.p.map(getPlayerCharacterId))
  return CHARACTERS.filter((character) => availableIds.has(character.id)).map(
    (character) => character.id,
  )
}

const getMatchupAverage = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
): MatchupAverageRow | null => {
  // This is the mean of reported, non-mirror win rates against available opponents.
  const values: number[] = []
  for (const opponentId of getAvailableCharacterIds(snapshot, league, controlMatchup)) {
    if (opponentId !== characterId) {
      const cell = getMatchupCell(snapshot, league, controlMatchup, characterId, opponentId)
      if (cell.status === "numeric" && cell.winRate !== null) {
        values.push(cell.winRate)
      }
    }
  }

  const average = mean(values)
  return average === null ? null : { characterId, winRate: round(average) }
}

const getLeaderboard = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
): MatchupAverageRow[] =>
  getAvailableCharacterIds(snapshot, league, controlMatchup)
    .map((characterId) => getMatchupAverage(snapshot, league, controlMatchup, characterId))
    .filter((row): row is MatchupAverageRow => row !== null)
    .toSorted((left, right) => right.winRate - left.winRate)

const getOpponentWinRates = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
): OpponentWinRateRow[] =>
  getAvailableCharacterIds(snapshot, league, controlMatchup)
    .filter((opponentId) => opponentId !== characterId)
    .map((opponentId) => {
      const cell = getMatchupCell(snapshot, league, controlMatchup, characterId, opponentId)
      return cell.status === "numeric" && cell.winRate !== null
        ? { opponentId, winRate: cell.winRate }
        : null
    })
    .filter((row): row is OpponentWinRateRow => row !== null)
    .toSorted((left, right) => right.winRate - left.winRate)

const getCounterpickCandidates = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  controlMatchup: ControlMatchup,
  opponents: readonly CharacterId[],
): CounterpickCandidateRow[] => {
  const available = getAvailableCharacterIds(snapshot, league, controlMatchup)
  const validOpponents = opponents.filter((opponentId) => available.includes(opponentId))
  return available
    .filter((characterId) => !validOpponents.includes(characterId))
    .map((characterId) => {
      const matchups = validOpponents.map((opponentId) => {
        const cell = getMatchupCell(snapshot, league, controlMatchup, characterId, opponentId)
        return {
          opponentId,
          winRate: cell.status === "numeric" ? cell.winRate : null,
        }
      })
      const values = matchups
        .map((matchup) => matchup.winRate)
        .filter((value): value is number => value !== null)
      const average = mean(values)
      return {
        characterId,
        averageWinRate: average === null ? null : round(average),
        worstWinRate: values.length === 0 ? null : round(Math.min(...values)),
        atOrAbove50Count: values.filter((value) => value >= 50).length,
        matchups,
      }
    })
    .toSorted(
      (left, right) => (right.averageWinRate ?? -Infinity) - (left.averageWinRate ?? -Infinity),
    )
}

const getControlMatchupResults = (
  snapshot: ProcessedDiaSnapshot,
  league: LeagueId,
  playerId: CharacterId,
  opponentId: CharacterId,
): ControlMatchupResult[] =>
  CONTROL_MATCHUPS.flatMap((controlMatchup) =>
    controlMatchup.id === "combined"
      ? []
      : [
          {
            controlMatchup: controlMatchup.id,
            label: controlMatchup.label,
            winRate: getMatchupCell(snapshot, league, controlMatchup.id, playerId, opponentId)
              .winRate,
          },
        ],
  )

export {
  getAvailableCharacterIds,
  getControlMatchupResults,
  getLeaderboard,
  getMatchupAverage,
  getMatchupCell,
  getOpponentWinRates,
  type ControlMatchupResult,
  type MatchupAverageRow,
  type MatchupCell,
  type OpponentWinRateRow,
  getCounterpickCandidates,
  type CounterpickCandidateRow,
  type MatchupStatus,
}
