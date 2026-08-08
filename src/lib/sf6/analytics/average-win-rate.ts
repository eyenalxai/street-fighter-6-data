import type { CharacterId, ControlMatchup, PlayerControl } from "@/lib/sf6/model"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"
import type { ControlBlocks } from "@/lib/sf6/snapshots/dia.server"
import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { getUsageCharacter } from "@/lib/sf6/snapshots/usage.server"

import {
  getAvailableOpponentCharacterIds,
  getControlPair,
  getMatchupCell,
  getPlayerControlMatchups,
} from "./matchup-cells"
import { boundedRatio, completeMean, mean, weightedMean } from "./math"

type AverageWinRateSummary = {
  unweightedAverage: number | null
  weightedAverage: number | null
  weightCoverage: number | null
  floor: number | null
  favorableCount: number
  availableCount: number
  possibleCount: number
  topThreeLift: number | null
  matchupImbalance: number | null
}

type PlayerControlSummary = {
  playerControl: PlayerControl
  averageWinRate: number | null
  weightedAverageWinRate: number | null
  weightCoverage: number | null
  usage: number | null
  delta: number | null
  summary: AverageWinRateSummary
}
type CharacterAverageWinRate = {
  averageWinRate: number | null
  weightedAverageWinRate: number | null
  summary: AverageWinRateSummary | null
}

const emptySummary = (): AverageWinRateSummary => {
  return {
    unweightedAverage: null,
    weightedAverage: null,
    weightCoverage: null,
    floor: null,
    favorableCount: 0,
    availableCount: 0,
    possibleCount: 0,
    topThreeLift: null,
    matchupImbalance: null,
  }
}

const getAverageWinRateSummary = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
  usageBlock?: UsageBlock,
): AverageWinRateSummary => {
  const controls = getControlPair(controlMatchup)
  const opponents = getAvailableOpponentCharacterIds(block, controlMatchup).filter(
    (opponentId) => opponentId !== characterId || controls.player !== controls.opponent,
  )
  const rows = opponents.flatMap((opponentId) => {
    const cell = getMatchupCell(block, controlMatchup, characterId, opponentId)
    return cell.status === "numeric" && cell.winRate !== null
      ? [{ opponentId, winRate: cell.winRate }]
      : []
  })
  const values = rows.map((row) => row.winRate)
  if (values.length === 0) {
    return emptySummary()
  }

  const weightedRows = rows.flatMap((row) => {
    const usage = usageBlock === undefined ? null : getUsageCharacter(usageBlock, row.opponentId)
    return usage === null ? [] : [{ value: row.winRate, weight: usage.playRate }]
  })
  const weighted = weightedMean(weightedRows)
  const allUsage = usageBlock?.rows.reduce((sum, row) => sum + row.playRate, 0) ?? 0
  const usedUsage = weighted?.weight ?? 0
  const sorted = values.toSorted((left, right) => right - left)
  const trimmed = sorted.length >= 6 ? sorted.slice(3) : []
  const average = mean(values)
  const trimmedAverage = mean(trimmed)
  return {
    unweightedAverage: average,
    weightedAverage: weighted?.value ?? null,
    weightCoverage: usageBlock === undefined ? null : boundedRatio(usedUsage, allUsage),
    floor: Math.min(...values),
    favorableCount: values.filter((value) => value >= 50).length,
    availableCount: values.length,
    possibleCount: opponents.length,
    topThreeLift: average === null || trimmedAverage === null ? null : average - trimmedAverage,
    matchupImbalance: mean(values.map((value) => Math.abs(value - 50))),
  }
}

const getPlayerControlSummary = (
  controlBlocks: Record<Exclude<ControlMatchup, "combined">, ProcessedDiaLeague>,
  characterId: CharacterId,
  playerControl: Exclude<PlayerControl, "combined">,
  usageBlocks?: Record<Exclude<PlayerControl, "combined">, UsageBlock>,
): PlayerControlSummary => {
  const summaries = getPlayerControlMatchups(playerControl)
    .filter(
      (controlMatchup): controlMatchup is Exclude<ControlMatchup, "combined"> =>
        controlMatchup !== "combined",
    )
    .map((controlMatchup) => {
      const opponentControl = getControlPair(controlMatchup).opponent === "C" ? "classic" : "modern"
      return getAverageWinRateSummary(
        controlBlocks[controlMatchup],
        controlMatchup,
        characterId,
        usageBlocks?.[opponentControl],
      )
    })
  const averageWinRate = completeMean(summaries.map((summary) => summary.unweightedAverage))
  const weighted = completeMean(summaries.map((summary) => summary.weightedAverage))
  const weightCoverage = completeMean(summaries.map((summary) => summary.weightCoverage))
  const floors = summaries.flatMap((summary) => (summary.floor === null ? [] : [summary.floor]))
  const favorableCount = summaries.reduce((sum, summary) => sum + summary.favorableCount, 0)
  const availableCount = summaries.reduce((sum, summary) => sum + summary.availableCount, 0)
  const possibleCount = summaries.reduce((sum, summary) => sum + summary.possibleCount, 0)
  const summary: AverageWinRateSummary = {
    unweightedAverage: averageWinRate,
    weightedAverage: weighted,
    weightCoverage,
    floor: floors.length === 0 ? null : Math.min(...floors),
    favorableCount,
    availableCount,
    possibleCount,
    topThreeLift: completeMean(summaries.map((item) => item.topThreeLift)),
    matchupImbalance: completeMean(summaries.map((item) => item.matchupImbalance)),
  }
  const usage = usageBlocks?.[playerControl].rows.find(
    (row) => row.characterId === characterId,
  )?.playRate
  return {
    playerControl,
    averageWinRate,
    weightedAverageWinRate: weighted,
    weightCoverage,
    usage: usage ?? null,
    delta: null,
    summary,
  }
}

const getControlComparison = (
  controlBlocks: Record<Exclude<ControlMatchup, "combined">, ProcessedDiaLeague>,
  characterIds: readonly CharacterId[],
  usageBlocks?: Record<PlayerControl, UsageBlock>,
) =>
  characterIds.map((characterId) => {
    const classic = getPlayerControlSummary(
      controlBlocks,
      characterId,
      "classic",
      usageBlocks === undefined
        ? undefined
        : { classic: usageBlocks.classic, modern: usageBlocks.modern },
    )
    const modern = getPlayerControlSummary(
      controlBlocks,
      characterId,
      "modern",
      usageBlocks === undefined
        ? undefined
        : { classic: usageBlocks.classic, modern: usageBlocks.modern },
    )
    return {
      characterId,
      classic: classic.averageWinRate,
      modern: modern.averageWinRate,
      averageWinRateDelta:
        classic.averageWinRate === null || modern.averageWinRate === null
          ? null
          : modern.averageWinRate - classic.averageWinRate,
      classicUsage: classic.usage,
      modernUsage: modern.usage,
      usageDelta:
        classic.usage === null || modern.usage === null ? null : modern.usage - classic.usage,
      weightedClassic: classic.weightedAverageWinRate,
      weightedModern: modern.weightedAverageWinRate,
      classicWeightCoverage: classic.weightCoverage,
      modernWeightCoverage: modern.weightCoverage,
      weightedAverageWinRateDelta:
        classic.weightedAverageWinRate === null || modern.weightedAverageWinRate === null
          ? null
          : modern.weightedAverageWinRate - classic.weightedAverageWinRate,
    }
  })

const getCharacterAverageWinRate = (
  blocks: {
    combined: ProcessedDiaLeague
    controls: ControlBlocks | null
  },
  usage: {
    selected: UsageBlock
    controls?: Record<Exclude<PlayerControl, "combined">, UsageBlock>
  },
  characterId: CharacterId,
  playerControl: PlayerControl,
): CharacterAverageWinRate => {
  if (playerControl === "combined" || blocks.controls === null) {
    const summary = getAverageWinRateSummary(
      blocks.combined,
      "combined",
      characterId,
      usage.selected,
    )
    return {
      averageWinRate: summary.unweightedAverage,
      weightedAverageWinRate: summary.weightedAverage,
      summary,
    }
  }
  const playerSummary = getPlayerControlSummary(
    blocks.controls,
    characterId,
    playerControl,
    usage.controls,
  )
  return {
    averageWinRate: playerSummary.averageWinRate,
    weightedAverageWinRate: playerSummary.weightedAverageWinRate,
    summary: playerSummary.summary,
  }
}

export {
  getControlComparison,
  getCharacterAverageWinRate,
  getAverageWinRateSummary,
  getPlayerControlSummary,
  type AverageWinRateSummary,
  type CharacterAverageWinRate,
  type PlayerControlSummary,
}
