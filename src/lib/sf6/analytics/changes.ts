import type { CharacterId, ControlMatchup } from "@/lib/sf6/model"
import type { ProcessedDiaLeague } from "@/lib/sf6/snapshot-schema"

import { CHARACTERS } from "@/lib/sf6/model"

import type { MetricEntry, MatchupChangeRow } from "./comparisons"
import type { UsagePoint } from "./usage"

import { getMatchupCell } from "./matchup-cells"
import { getUsageRate } from "./usage"

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

const getUsagePoints = (entries: readonly MetricEntry[], characterId: CharacterId): UsagePoint[] =>
  entries.map((entry) => {
    return {
      period: entry.period,
      playRate: getUsageRate(entry.usage, characterId),
    }
  })

export { getMatchupChanges, getUsagePoints }
