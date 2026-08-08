import type { CharacterId, ControlMatchup } from "@/lib/sf6/model"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"
import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { getUsageCharacter } from "@/lib/sf6/snapshots/usage.server"

import { getAvailablePlayerCharacterIds, getMatchupCell } from "./matchup-cells"
import { boundedRatio, mean, weightedMean } from "./math"

type CounterpickOrder = "weighted" | "average" | "floor"
type CounterpickRow = {
  characterId: CharacterId
  weightedAverage: number | null
  unweightedAverage: number
  floor: number
  favorableCount: number
  opponentUsage: { opponentId: CharacterId; playRate: number | null }[]
  matchups: { opponentId: CharacterId; winRate: number }[]
}
type CounterpickResult = {
  rows: CounterpickRow[]
  excludedCandidateCount: number
  selectedUsageShare: number | null
  weightCoverage: number | null
}

const getCounterpickCandidates = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  opponents: readonly CharacterId[],
  usageBlock: UsageBlock | undefined,
  order: CounterpickOrder,
): CounterpickResult => {
  let excludedCandidateCount = 0
  const opponentUsage = opponents.map((opponentId) => {
    return {
      opponentId,
      playRate:
        usageBlock === undefined
          ? null
          : (getUsageCharacter(usageBlock, opponentId)?.playRate ?? null),
    }
  })
  const selectedUsageShare =
    usageBlock === undefined
      ? null
      : opponentUsage.reduce((sum, opponent) => sum + (opponent.playRate ?? 0), 0)
  const totalUsageShare = usageBlock?.rows.reduce((sum, row) => sum + row.playRate, 0) ?? 0

  const rows = getAvailablePlayerCharacterIds(block, controlMatchup).flatMap((characterId) => {
    const matchups = opponents.map((opponentId) => {
      const cell = getMatchupCell(block, controlMatchup, characterId, opponentId)
      return cell.status === "numeric" && cell.winRate !== null
        ? { opponentId, winRate: cell.winRate }
        : null
    })
    if (matchups.some((matchup) => matchup === null)) {
      excludedCandidateCount += 1
      return []
    }
    const completeMatchups = matchups.flatMap((matchup) => (matchup === null ? [] : [matchup]))
    const values = completeMatchups.map((matchup) => matchup.winRate)
    const unweightedAverage = mean(values)
    if (unweightedAverage === null) {
      excludedCandidateCount += 1
      return []
    }
    const weighted = weightedMean(
      completeMatchups.flatMap((matchup) => {
        const weight = opponentUsage.find(
          (opponent) => opponent.opponentId === matchup.opponentId,
        )?.playRate
        return weight === null || weight === undefined ? [] : [{ value: matchup.winRate, weight }]
      }),
    )
    return [
      {
        characterId,
        weightedAverage: weighted?.value ?? null,
        unweightedAverage,
        floor: Math.min(...values),
        favorableCount: values.filter((value) => value >= 50).length,
        opponentUsage,
        matchups: completeMatchups,
      },
    ]
  })
  const sortValue = (row: CounterpickRow): number =>
    order === "floor"
      ? row.floor
      : order === "average"
        ? row.unweightedAverage
        : (row.weightedAverage ?? -Infinity)
  const weightCoverage =
    usageBlock === undefined ? null : boundedRatio(selectedUsageShare ?? 0, totalUsageShare)
  return {
    rows: rows.toSorted(
      (left, right) =>
        sortValue(right) - sortValue(left) ||
        right.unweightedAverage - left.unweightedAverage ||
        left.characterId.localeCompare(right.characterId),
    ),
    excludedCandidateCount,
    selectedUsageShare: weightCoverage === null ? null : weightCoverage * 100,
    weightCoverage,
  }
}

export {
  getCounterpickCandidates,
  type CounterpickOrder,
  type CounterpickResult,
  type CounterpickRow,
}
