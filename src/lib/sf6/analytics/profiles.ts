import type { CharacterId, ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { Rank } from "@/lib/sf6/ranks"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"
import type { UsageBlock } from "@/lib/sf6/snapshots/usage.server"

import { formatReportingPeriod, CHARACTERS } from "@/lib/sf6/model"
import { getUsageCharacter } from "@/lib/sf6/snapshots/usage.server"

import type { AverageWinRateSummary } from "./average-win-rate"

import { getAverageWinRateSummary } from "./average-win-rate"
import { getAvailablePlayerCharacterIds, getMatchupCell } from "./matchup-cells"
import { boundedRatio, pearsonCorrelation } from "./math"

type MatchupProfileRow = {
  opponentId: CharacterId
  status: "numeric" | "unavailable" | "mirror"
  winRate: number | null
  opponentUsage: number | null
  weightedDisadvantageContribution: number | null
}
type SimilarProfile = {
  characterId: CharacterId
  correlation: number
  overlap: number
}
type ProgressionPoint = {
  label: string
  id: string
  winRate: number | null
}

const getMatchupProfile = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
  usageBlock?: UsageBlock,
): { rows: MatchupProfileRow[]; summary: AverageWinRateSummary } => {
  const baseRows = CHARACTERS.map(({ id: opponentId }) => {
    const cell = getMatchupCell(block, controlMatchup, characterId, opponentId)
    const usage = usageBlock === undefined ? null : getUsageCharacter(usageBlock, opponentId)
    return {
      opponentId,
      status: cell.status,
      winRate: cell.winRate,
      opponentUsage: usage?.playRate ?? null,
    }
  })
  let totalReportedUsage = 0
  for (const row of baseRows) {
    if (row.status === "numeric" && row.winRate !== null && row.opponentUsage !== null) {
      totalReportedUsage += Math.max(0, row.opponentUsage)
    }
  }
  const rows = baseRows.map((row) => {
    const usageShare =
      row.status !== "numeric" || row.winRate === null || row.opponentUsage === null
        ? null
        : boundedRatio(Math.max(0, row.opponentUsage), totalReportedUsage)
    return {
      ...row,
      weightedDisadvantageContribution:
        usageShare === null || row.winRate === null
          ? null
          : Math.max(0, 50 - row.winRate) * usageShare,
    }
  })
  return {
    rows: rows.toSorted((left, right) => {
      if (left.winRate === null && right.winRate === null) {
        return left.opponentId.localeCompare(right.opponentId)
      }
      if (left.winRate === null) {
        return 1
      }
      if (right.winRate === null) {
        return -1
      }
      return left.winRate - right.winRate || left.opponentId.localeCompare(right.opponentId)
    }),
    summary: getAverageWinRateSummary(block, controlMatchup, characterId, usageBlock),
  }
}

const profileValues = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
) =>
  new Map(
    getMatchupProfile(block, controlMatchup, characterId).rows.flatMap((row) =>
      row.status === "numeric" && row.winRate !== null
        ? [[row.opponentId, row.winRate] as const]
        : [],
    ),
  )

const getSimilarProfiles = (
  block: ProcessedDiaLeague,
  controlMatchup: ControlMatchup,
  characterId: CharacterId,
): SimilarProfile[] => {
  const selected = profileValues(block, controlMatchup, characterId)
  return getAvailablePlayerCharacterIds(block, controlMatchup)
    .filter((candidate) => candidate !== characterId)
    .flatMap((candidate) => {
      const other = profileValues(block, controlMatchup, candidate)
      const pairs = [...selected.entries()].flatMap(([opponentId, value]) => {
        const otherValue = other.get(opponentId)
        return otherValue === undefined ? [] : [[value, otherValue] as const]
      })
      if (pairs.length < 5) {
        return []
      }
      const correlation = pearsonCorrelation(
        pairs.map(([value]) => value),
        pairs.map(([, value]) => value),
      )
      return correlation === null
        ? []
        : [{ characterId: candidate, correlation, overlap: pairs.length }]
    })
    .toSorted((left, right) => right.correlation - left.correlation || right.overlap - left.overlap)
}

const getPairProgression = (
  entries: readonly { rank: Rank; block: ProcessedDiaLeague }[],
  characterId: CharacterId,
  opponentId: CharacterId,
): ProgressionPoint[] =>
  entries.map(({ rank, block }) => {
    return {
      label: rank.label,
      id: rank.id,
      winRate: getMatchupCell(block, "combined", characterId, opponentId).winRate,
    }
  })

const getPairTrend = (
  entries: readonly { period: ReportingPeriod; block: ProcessedDiaLeague }[],
  characterId: CharacterId,
  opponentId: CharacterId,
  controlMatchup: ControlMatchup,
): (ProgressionPoint & { period: ReportingPeriod })[] =>
  entries
    .toSorted((left, right) => left.period.localeCompare(right.period))
    .map(({ period, block }) => {
      return {
        period,
        label: formatReportingPeriod(period),
        id: period,
        winRate: getMatchupCell(block, controlMatchup, characterId, opponentId).winRate,
      }
    })

export {
  getMatchupProfile,
  getPairProgression,
  getPairTrend,
  getSimilarProfiles,
  type MatchupProfileRow,
  type ProgressionPoint,
  type SimilarProfile,
}
