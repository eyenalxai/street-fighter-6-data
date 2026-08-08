import type { CharacterId, ControlMatchup, ControlType, PlayerControl } from "@/lib/sf6/model"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import { CHARACTERS, CONTROL_MATCHUPS } from "@/lib/sf6/model"
import { getPlayerCharacterId, getPlayerControl } from "@/lib/sf6/snapshot-schema"

type MatchupStatus = "numeric" | "unavailable" | "mirror"
type MatchupCell = {
  playerId: CharacterId
  opponentId: CharacterId
  status: MatchupStatus
  winRate: number | null
}
type MatchupRow = {
  opponentId: CharacterId
  winRate: number
}

const getControlPair = (controlMatchup: ControlMatchup) => {
  const option = CONTROL_MATCHUPS.find((candidate) => candidate.id === controlMatchup)
  if (option === undefined) {
    throw new Error(`Unknown control matchup: ${controlMatchup}`)
  }
  return option
}

const getPlayerControlMatchups = (playerControl: PlayerControl): readonly ControlMatchup[] =>
  playerControl === "combined"
    ? ["combined"]
    : playerControl === "classic"
      ? ["classic-classic", "classic-modern"]
      : ["modern-classic", "modern-modern"]

const getPlayerIndex = (
  block: ProcessedDiaLeague,
  characterId: CharacterId,
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
  role: "player" | "opponent",
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

const getNumericOpponentRows = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
): MatchupRow[] =>
  getAvailableOpponentCharacterIds(block, controlMatchup)
    .map((opponentId) => {
      const cell = getMatchupCell(block, controlMatchup, characterId, opponentId)
      return cell.status === "numeric" && cell.winRate !== null
        ? { opponentId, winRate: cell.winRate }
        : null
    })
    .filter((row): row is MatchupRow => row !== null)

export {
  getAvailableOpponentCharacterIds,
  getAvailablePlayerCharacterIds,
  getControlPair,
  getPlayerControlMatchups,
  getMatchupCell,
  getNumericOpponentRows,
  type MatchupCell,
  type MatchupRow,
  type MatchupStatus,
}
