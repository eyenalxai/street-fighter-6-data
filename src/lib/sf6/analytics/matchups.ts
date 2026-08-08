import type { CharacterId, ControlMatchup, ControlType } from "@/lib/sf6/model"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import { CHARACTERS, CONTROL_MATCHUPS } from "@/lib/sf6/model"
import { getPlayerCharacterId, getPlayerControl } from "@/lib/sf6/snapshot-schema"

import { mean } from "./math"

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
  averageWinRate: number
  worstWinRate: number
  atOrAbove50Count: number
  matchups: { opponentId: CharacterId; winRate: number }[]
}
type CounterpickCandidatesResult = {
  rows: CounterpickCandidateRow[]
  excludedCandidateCount: number
}
type ControlMatchupResult = {
  controlMatchup: Exclude<ControlMatchup, "combined">
  label: string
  winRate: number | null
}

type ControlMatchupBlocks = Record<Exclude<ControlMatchup, "combined">, ProcessedDiaLeague>
type AvailabilityRole = "player" | "opponent"

const getControlPair = (controlMatchup: ControlMatchup): (typeof CONTROL_MATCHUPS)[number] => {
  const option = CONTROL_MATCHUPS.find((candidate) => candidate.id === controlMatchup)
  if (option === undefined) {
    throw new Error(`Unknown control matchup: ${controlMatchup}`)
  }
  return option
}

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
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  playerId: CharacterId,
  opponentId: CharacterId,
): MatchupCell => {
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
    winRate: value * 100,
  }
}

const getAvailableCharacterIds = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  role: AvailabilityRole,
): CharacterId[] => {
  const controls = getControlPair(controlMatchup)
  const control = role === "player" ? controls.player : controls.opponent
  const availableIds = new Set(
    block.p
      .filter((player) => control === null || getPlayerControl(player) === control)
      .map((player) => getPlayerCharacterId(player)),
  )
  return CHARACTERS.filter((character) => availableIds.has(character.id)).map(
    (character) => character.id,
  )
}

const getAvailablePlayerCharacterIds = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
): CharacterId[] => getAvailableCharacterIds(block, controlMatchup, "player")

const getAvailableOpponentCharacterIds = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
): CharacterId[] => getAvailableCharacterIds(block, controlMatchup, "opponent")

const getMatchupAverage = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
): MatchupAverageRow | null => {
  // This is the mean of reported, non-mirror win rates against available opponents.
  const values: number[] = []
  for (const opponentId of getAvailableOpponentCharacterIds(block, controlMatchup)) {
    const cell = getMatchupCell(block, controlMatchup, characterId, opponentId)
    if (cell.status === "numeric" && cell.winRate !== null) {
      values.push(cell.winRate)
    }
  }

  const average = mean(values)
  return average === null ? null : { characterId, winRate: average }
}

const getLeaderboard = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
): MatchupAverageRow[] =>
  getAvailablePlayerCharacterIds(block, controlMatchup)
    .map((characterId) => getMatchupAverage(block, controlMatchup, characterId))
    .filter((row): row is MatchupAverageRow => row !== null)
    .toSorted((left, right) => right.winRate - left.winRate)

const getOpponentWinRates = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
): OpponentWinRateRow[] =>
  getAvailableOpponentCharacterIds(block, controlMatchup)
    .map((opponentId) => {
      const cell = getMatchupCell(block, controlMatchup, characterId, opponentId)
      return cell.status === "numeric" && cell.winRate !== null
        ? { opponentId, winRate: cell.winRate }
        : null
    })
    .filter((row): row is OpponentWinRateRow => row !== null)
    .toSorted((left, right) => right.winRate - left.winRate)

const getCounterpickCandidates = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  opponents: readonly CharacterId[],
): CounterpickCandidatesResult => {
  let excludedCandidateCount = 0
  const rows = getAvailablePlayerCharacterIds(block, controlMatchup).flatMap((characterId) => {
    const matchups = opponents.map((opponentId) => {
      const cell = getMatchupCell(block, controlMatchup, characterId, opponentId)
      return {
        opponentId,
        winRate: cell.status === "numeric" ? cell.winRate : null,
      }
    })
    if (matchups.some((matchup) => matchup.winRate === null)) {
      excludedCandidateCount += 1
      return []
    }

    const completeMatchups = matchups.flatMap((matchup) =>
      matchup.winRate === null
        ? []
        : [{ opponentId: matchup.opponentId, winRate: matchup.winRate }],
    )
    const values = completeMatchups.map((matchup) => matchup.winRate)
    const average = mean(values)
    if (average === null) {
      excludedCandidateCount += 1
      return []
    }

    return [
      {
        characterId,
        averageWinRate: average,
        worstWinRate: Math.min(...values),
        atOrAbove50Count: values.filter((value) => value >= 50).length,
        matchups: completeMatchups,
      },
    ]
  })

  return {
    rows: rows.toSorted((left, right) => right.averageWinRate - left.averageWinRate),
    excludedCandidateCount,
  }
}

const getControlMatchupResults = (
  controlBlocks: ControlMatchupBlocks | null,
  playerId: CharacterId,
  opponentId: CharacterId,
): ControlMatchupResult[] => {
  if (controlBlocks === null) {
    return []
  }
  return CONTROL_MATCHUPS.flatMap((controlMatchup) =>
    controlMatchup.id === "combined"
      ? []
      : [
          {
            controlMatchup: controlMatchup.id,
            label: controlMatchup.label,
            winRate: getMatchupCell(
              controlBlocks[controlMatchup.id],
              controlMatchup.id,
              playerId,
              opponentId,
            ).winRate,
          },
        ],
  )
}

export {
  getAvailableOpponentCharacterIds,
  getAvailablePlayerCharacterIds,
  getControlMatchupResults,
  getLeaderboard,
  getMatchupAverage,
  getMatchupCell,
  getOpponentWinRates,
  type ControlMatchupResult,
  type ControlMatchupBlocks,
  type MatchupAverageRow,
  type MatchupCell,
  type OpponentWinRateRow,
  getCounterpickCandidates,
  type CounterpickCandidateRow,
  type CounterpickCandidatesResult,
  type MatchupStatus,
}
