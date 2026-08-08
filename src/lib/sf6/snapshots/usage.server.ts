import type { PlayerControl, ReportingPeriod, CharacterId } from "@/lib/sf6/model"
import type { RankId } from "@/lib/sf6/ranks"
import type { ProcessedUsageRank, ProcessedUsageSnapshot } from "@/lib/sf6/snapshot-schema"

import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"
import {
  getUsageCharacterId,
  getUsageCount,
  getUsagePlayRate,
  getUsagePreviousRate,
  ProcessedUsageSnapshotSchema,
} from "@/lib/sf6/snapshot-schema"

import { createSnapshotStore, SnapshotValidationError } from "./store.server"

type UsageCharacterRow = {
  characterId: CharacterId
  playRate: number
  previousRate: number
  count: number
}
type UsageBlock = {
  rank: RankId
  playerControl: PlayerControl
  rows: UsageCharacterRow[]
}

const rankedStore = createSnapshotStore<ProcessedUsageSnapshot>(
  "usagerate",
  "ranked usage-rate",
  ProcessedUsageSnapshotSchema,
)
const subdivisionStore = createSnapshotStore<ProcessedUsageSnapshot>(
  "usagerate_master",
  "Master subdivision usage-rate",
  ProcessedUsageSnapshotSchema,
)

const REGULAR_KEYS: Partial<Record<RankId, number>> = {
  rookie: 1,
  iron: 2,
  bronze: 3,
  silver: 4,
  gold: 5,
  platinum: 6,
  diamond: 7,
  "all-master": 8,
}
const SUBDIVISION_KEYS: Partial<Record<RankId, number>> = {
  master: 36,
  "high-master": 40,
  "grand-master": 41,
  "ultimate-master": 42,
}
const CONTROL_KEYS: Record<PlayerControl, 0 | 1 | 2> = {
  combined: 0,
  classic: 1,
  modern: 2,
}

const decodeUsageRank = (bucket: ProcessedUsageRank): UsageCharacterRow[] =>
  bucket.c.map((character) => {
    return {
      characterId: getUsageCharacterId(character),
      playRate: getUsagePlayRate(character),
      previousRate: getUsagePreviousRate(character),
      count: getUsageCount(character),
    }
  })

const findUsageBucket = (
  snapshot: ProcessedUsageSnapshot,
  leagueRank: number,
  playerControl: PlayerControl,
): ProcessedUsageRank | undefined =>
  snapshot.find((bucket) => bucket.lr === leagueRank && bucket.ot === CONTROL_KEYS[playerControl])

const getUsageBlock = async (
  period: ReportingPeriod,
  rank: RankId,
  requestedControl: PlayerControl,
): Promise<UsageBlock> => {
  const subdivision = isMasterSubdivisionRank(rank)
  const playerControl = subdivision ? "combined" : requestedControl
  const store = subdivision ? subdivisionStore : rankedStore
  const leagueRank = subdivision ? SUBDIVISION_KEYS[rank] : REGULAR_KEYS[rank]
  if (leagueRank === undefined) {
    throw new SnapshotValidationError(period, "usage-rate")
  }

  const snapshot = await store.getSnapshot(period)
  const bucket = findUsageBucket(snapshot, leagueRank, playerControl)
  if (bucket === undefined) {
    throw new SnapshotValidationError(period, "usage-rate")
  }

  return {
    rank,
    playerControl,
    rows: decodeUsageRank(bucket),
  }
}

const getUsageCharacter = (block: UsageBlock, characterId: CharacterId): UsageCharacterRow | null =>
  block.rows.find((row) => row.characterId === characterId) ?? null

export { getUsageBlock, getUsageCharacter, type UsageBlock, type UsageCharacterRow }
