import type { CharacterId, ControlMatchup, PlayerControl } from "@/lib/sf6/model"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"
import type { ControlBlocks } from "@/lib/sf6/snapshots/dia.server"
import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { getUsageCharacter } from "@/lib/sf6/snapshots/usage.server"

import { getControlPair, getAvailableOpponentCharacterIds, getMatchupCell } from "./matchup-cells"
import { completeMean, mean, weightedMean } from "./math"

type PerformanceSummary = {
  unweightedAverage: number | null
  weightedAverage: number | null
  weightCoverage: number | null
  floor: number | null
  favorableCount: number
  availableCount: number
  possibleCount: number
  coverage: number | null
  topThreeLift: number | null
  matchupImbalance: number | null
}

type PlayerControlSummary = {
  playerControl: PlayerControl
  performance: number | null
  weightedPerformance: number | null
  weightCoverage: number | null
  usage: number | null
  delta: number | null
  summary: PerformanceSummary
}
type CharacterPerformance = {
  performance: number | null
  weightedPerformance: number | null
  summary: PerformanceSummary | null
}

const emptySummary = (): PerformanceSummary => {
  return {
    unweightedAverage: null,
    weightedAverage: null,
    weightCoverage: null,
    floor: null,
    favorableCount: 0,
    availableCount: 0,
    possibleCount: 0,
    coverage: null,
    topThreeLift: null,
    matchupImbalance: null,
  }
}

const getPerformanceSummary = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
  usageBlock?: UsageBlock,
): PerformanceSummary => {
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
  const usedUsage = weightedRows.reduce((sum, row) => sum + row.weight, 0)
  const sorted = values.toSorted((left, right) => right - left)
  const trimmed = sorted.length >= 6 ? sorted.slice(3) : []
  const average = mean(values)
  const trimmedAverage = mean(trimmed)
  return {
    unweightedAverage: average,
    weightedAverage: weighted?.value ?? null,
    weightCoverage: usageBlock === undefined || allUsage === 0 ? null : usedUsage / allUsage,
    floor: Math.min(...values),
    favorableCount: values.filter((value) => value >= 50).length,
    availableCount: values.length,
    possibleCount: opponents.length,
    coverage: opponents.length === 0 ? null : values.length / opponents.length,
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
  const matchupIds: Exclude<ControlMatchup, "combined">[] =
    playerControl === "classic"
      ? ["classic-classic", "classic-modern"]
      : ["modern-classic", "modern-modern"]
  const opponentControls: Exclude<PlayerControl, "combined">[] =
    playerControl === "classic" ? ["classic", "modern"] : ["classic", "modern"]
  const summaries = matchupIds.map((controlMatchup, index) => {
    const opponentControl = opponentControls[index]
    return getPerformanceSummary(
      controlBlocks[controlMatchup],
      controlMatchup,
      characterId,
      opponentControl === undefined ? undefined : usageBlocks?.[opponentControl],
    )
  })
  const performance = completeMean(summaries.map((summary) => summary.unweightedAverage))
  const weighted = completeMean(summaries.map((summary) => summary.weightedAverage))
  const weightCoverage = completeMean(summaries.map((summary) => summary.weightCoverage))
  const floors = summaries.flatMap((summary) => (summary.floor === null ? [] : [summary.floor]))
  const favorableCount = summaries.reduce((sum, summary) => sum + summary.favorableCount, 0)
  const availableCount = summaries.reduce((sum, summary) => sum + summary.availableCount, 0)
  const possibleCount = summaries.reduce((sum, summary) => sum + summary.possibleCount, 0)
  const summary: PerformanceSummary = {
    unweightedAverage: performance,
    weightedAverage: weighted,
    weightCoverage,
    floor: floors.length === 0 ? null : Math.min(...floors),
    favorableCount,
    availableCount,
    possibleCount,
    coverage: possibleCount === 0 ? null : availableCount / possibleCount,
    topThreeLift: completeMean(summaries.map((item) => item.topThreeLift)),
    matchupImbalance: completeMean(summaries.map((item) => item.matchupImbalance)),
  }
  const usage = usageBlocks?.[playerControl].rows.find(
    (row) => row.characterId === characterId,
  )?.playRate
  return {
    playerControl,
    performance,
    weightedPerformance: weighted,
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
      classic: classic.performance,
      modern: modern.performance,
      performanceDelta:
        classic.performance === null || modern.performance === null
          ? null
          : modern.performance - classic.performance,
      classicUsage: classic.usage,
      modernUsage: modern.usage,
      usageDelta:
        classic.usage === null || modern.usage === null ? null : modern.usage - classic.usage,
      weightedClassic: classic.weightedPerformance,
      weightedModern: modern.weightedPerformance,
      classicWeightCoverage: classic.weightCoverage,
      modernWeightCoverage: modern.weightCoverage,
      weightedPerformanceDelta:
        classic.weightedPerformance === null || modern.weightedPerformance === null
          ? null
          : modern.weightedPerformance - classic.weightedPerformance,
    }
  })

const getCharacterPerformance = (
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
): CharacterPerformance => {
  if (playerControl === "combined" || blocks.controls === null) {
    const summary = getPerformanceSummary(blocks.combined, "combined", characterId, usage.selected)
    return {
      performance: summary.unweightedAverage,
      weightedPerformance: summary.weightedAverage,
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
    performance: playerSummary.performance,
    weightedPerformance: playerSummary.weightedPerformance,
    summary: playerSummary.summary,
  }
}

export {
  getControlComparison,
  getCharacterPerformance,
  getPerformanceSummary,
  getPlayerControlSummary,
  type PerformanceSummary,
  type CharacterPerformance,
  type PlayerControlSummary,
}
