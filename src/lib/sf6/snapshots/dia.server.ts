import type { ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { RankId } from "@/lib/sf6/ranks"
import type {
  ProcessedDiaLeague,
  ProcessedMasterSnapshot,
  ProcessedRankedSnapshot,
} from "@/lib/sf6/snapshot-schema"

import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"
import {
  ProcessedMasterSnapshotSchema,
  ProcessedRankedSnapshotSchema,
} from "@/lib/sf6/snapshot-schema"

import { createSnapshotStore, SnapshotValidationError } from "./store.server"

type ControlSpecific = Exclude<ControlMatchup, "combined">
type ControlBlocks = Record<ControlSpecific, ProcessedDiaLeague>

const regularStore = createSnapshotStore<ProcessedRankedSnapshot>(
  "dia",
  "ranked battle-diagram",
  ProcessedRankedSnapshotSchema,
)
const subdivisionStore = createSnapshotStore<ProcessedMasterSnapshot>(
  "dia_master",
  "Master subdivision battle-diagram",
  ProcessedMasterSnapshotSchema,
)

const REGULAR_KEYS: Partial<Record<RankId, keyof ProcessedRankedSnapshot["c"]>> = {
  rookie: "1",
  iron: "2",
  bronze: "3",
  silver: "4",
  gold: "5",
  platinum: "6",
  diamond: "7",
  "all-master": "8",
}
const SUBDIVISION_KEYS: Partial<Record<RankId, keyof ProcessedMasterSnapshot["c"]>> = {
  master: "36",
  "high-master": "40",
  "grand-master": "41",
  "ultimate-master": "42",
}

const getRankBlock = async (
  period: ReportingPeriod,
  rank: RankId,
  controls: ControlMatchup,
): Promise<ProcessedDiaLeague> => {
  if (isMasterSubdivisionRank(rank)) {
    const snapshot = await subdivisionStore.getSnapshot(period)
    const key = SUBDIVISION_KEYS[rank]
    const block = key === undefined ? undefined : snapshot.c[key]
    if (block === undefined) {
      throw new SnapshotValidationError(period, "Master subdivision battle-diagram")
    }
    return block
  }

  const snapshot = await regularStore.getSnapshot(period)
  const key = REGULAR_KEYS[rank]
  const block =
    key === undefined ? undefined : controls === "combined" ? snapshot.c[key] : snapshot.ci[key]
  if (block === undefined) {
    throw new SnapshotValidationError(period, "ranked battle-diagram")
  }
  return block
}

const getRankControlBlocks = async (
  period: ReportingPeriod,
  rank: RankId,
): Promise<ControlBlocks | null> => {
  if (isMasterSubdivisionRank(rank)) {
    return null
  }

  const snapshot = await regularStore.getSnapshot(period)
  const key = REGULAR_KEYS[rank]
  const block = key === undefined ? undefined : snapshot.ci[key]
  if (block === undefined) {
    throw new SnapshotValidationError(period, "ranked battle-diagram")
  }

  return {
    "classic-classic": block,
    "classic-modern": block,
    "modern-classic": block,
    "modern-modern": block,
  }
}

export { getRankBlock, getRankControlBlocks, type ControlBlocks }
