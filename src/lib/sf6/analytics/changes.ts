import type { CharacterId, ControlMatchup, PlayerControl } from "@/lib/sf6/model"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import { CHARACTERS } from "@/lib/sf6/model"

import type { MetricEntry } from "./comparisons"
import type { UsagePoint } from "./usage"

import { getCharacterAverageWinRate } from "./average-win-rate"
import { getRosterMetrics } from "./comparisons"
import { getMatchupCell, getPlayerControlMatchups } from "./matchup-cells"
import { getUsageRate, getUsageStats } from "./usage"

type ChangeSummary = {
  averageWinRateSpread: number | null
  effectiveRosterSize: number | null
  topFiveShare: number
  matchupImbalance: number | null
}
type MatchupChangeRow = {
  controlMatchup: ControlMatchup
  characterId: CharacterId
  opponentId: CharacterId
  before: number
  after: number
  delta: number
  flip: boolean
}

const getMatchupChanges = (
  before: ProcessedDiaLeague,
  after: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
): MatchupChangeRow[] =>
  CHARACTERS.flatMap((character) =>
    CHARACTERS.flatMap((opponent) => {
      if (character.id === opponent.id && controlMatchup === "combined") {
        return []
      }
      const beforeCell = getMatchupCell(before, controlMatchup, character.id, opponent.id)
      const afterCell = getMatchupCell(after, controlMatchup, character.id, opponent.id)
      if (
        beforeCell.status !== "numeric" ||
        beforeCell.winRate === null ||
        afterCell.status !== "numeric" ||
        afterCell.winRate === null
      ) {
        return []
      }
      return [
        {
          controlMatchup,
          characterId: character.id,
          opponentId: opponent.id,
          before: beforeCell.winRate,
          after: afterCell.winRate,
          delta: afterCell.winRate - beforeCell.winRate,
          flip:
            (beforeCell.winRate < 50 && afterCell.winRate > 50) ||
            (beforeCell.winRate > 50 && afterCell.winRate < 50),
        },
      ]
    }),
  ).toSorted((left, right) => Math.abs(right.delta) - Math.abs(left.delta))

const getChangeSummary = (entry: MetricEntry, playerControl: PlayerControl): ChangeSummary => {
  const rows = getRosterMetrics(entry, null, playerControl)
  const averageWinRates = rows.flatMap((row) =>
    row.averageWinRate === null ? [] : [row.averageWinRate],
  )
  const matchupValues = rows.flatMap((row) => {
    const averageWinRate = getCharacterAverageWinRate(
      { combined: entry.block, controls: entry.controlBlocks },
      { selected: entry.usage, controls: entry.usageControls },
      row.characterId,
      playerControl,
    )
    const imbalance = averageWinRate.summary?.matchupImbalance
    return imbalance === null || imbalance === undefined ? [] : [imbalance]
  })
  const usageStats = getUsageStats(entry.usage)
  return {
    averageWinRateSpread:
      averageWinRates.length === 0
        ? null
        : Math.max(...averageWinRates) - Math.min(...averageWinRates),
    effectiveRosterSize: usageStats.effectiveRosterSize,
    topFiveShare: usageStats.topFiveShare,
    matchupImbalance:
      matchupValues.length === 0
        ? null
        : matchupValues.reduce((sum, value) => sum + value, 0) / matchupValues.length,
  }
}

const getMatchupChangesForPlayerControl = (
  before: MetricEntry,
  after: MetricEntry,
  playerControl: PlayerControl,
): MatchupChangeRow[] =>
  getPlayerControlMatchups(playerControl)
    .flatMap((controlMatchup) => {
      if (controlMatchup === "combined") {
        return getMatchupChanges(before.block, after.block, controlMatchup)
      }
      const beforeControls = before.controlBlocks
      const afterControls = after.controlBlocks
      return beforeControls === null || afterControls === null
        ? []
        : getMatchupChanges(
            beforeControls[controlMatchup],
            afterControls[controlMatchup],
            controlMatchup,
          )
    })
    .toSorted(
      (left, right) =>
        Math.abs(right.delta) - Math.abs(left.delta) ||
        left.controlMatchup.localeCompare(right.controlMatchup) ||
        left.characterId.localeCompare(right.characterId) ||
        left.opponentId.localeCompare(right.opponentId),
    )

const getUsagePoints = (entries: readonly MetricEntry[], characterId: CharacterId): UsagePoint[] =>
  entries.map((entry) => {
    return {
      period: entry.period,
      playRate: getUsageRate(entry.usage, characterId),
    }
  })

export {
  getChangeSummary,
  getMatchupChanges,
  getMatchupChangesForPlayerControl,
  getUsagePoints,
  type ChangeSummary,
  type MatchupChangeRow,
}
