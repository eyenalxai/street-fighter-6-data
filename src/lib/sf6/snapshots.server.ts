import { readdir } from "node:fs/promises"
import path from "node:path"

import type { ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { RankId } from "@/lib/sf6/ranks"
import type {
  ProcessedDiaLeague,
  ProcessedMasterSnapshot,
  ProcessedRankedSnapshot,
} from "@/lib/sf6/snapshot-schema"

import { ReportingPeriodSchema } from "@/lib/sf6/model"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"
import {
  ProcessedMasterSnapshotSchema,
  ProcessedRankedSnapshotSchema,
} from "@/lib/sf6/snapshot-schema"

type ControlSpecific = Exclude<ControlMatchup, "combined">
type ControlBlocks = Record<ControlSpecific, ProcessedDiaLeague>

class SnapshotNotFoundError extends Error {
  constructor(period: string, source: string) {
    super(`No ${source} snapshot is available for reporting period ${period}`)
    this.name = "SnapshotNotFoundError"
  }
}

class SnapshotReadError extends Error {
  constructor(period: ReportingPeriod | undefined, source: string) {
    super(
      period === undefined
        ? `No processed ${source} snapshots are available`
        : `The processed ${source} snapshot for reporting period ${period} could not be read`,
    )
    this.name = "SnapshotReadError"
  }
}

class SnapshotValidationError extends Error {
  constructor(period: ReportingPeriod, source: string) {
    super(`The processed ${source} snapshot for reporting period ${period} failed validation`)
    this.name = "SnapshotValidationError"
  }
}

const parsePeriods = (entries: string[]): ReportingPeriod[] =>
  entries
    .filter((entry) => entry.endsWith(".json"))
    .map((entry) => entry.slice(0, -".json".length))
    .flatMap((candidate) => {
      const parsed = ReportingPeriodSchema.safeParse(candidate)
      return parsed.success ? [parsed.data] : []
    })
    .toSorted()

const createSnapshotStore = <TSnapshot>(
  directory: string,
  source: string,
  schema: {
    safeParse: (
      value: unknown,
    ) => { success: true; data: TSnapshot } | { success: false; error: unknown }
  },
) => {
  const snapshotCache = new Map<ReportingPeriod, Promise<TSnapshot>>()

  const getAvailablePeriods = async (): Promise<ReportingPeriod[]> => {
    try {
      const entries = await readdir(directory)
      return parsePeriods(entries)
    } catch (error: unknown) {
      console.error(`Failed to discover processed ${source} snapshots`, error)
      return []
    }
  }

  const readValidatedSnapshot = async (period: ReportingPeriod): Promise<TSnapshot> => {
    const filePath = path.join(directory, `${period}.json`)
    let raw: unknown = null
    try {
      raw = await Bun.file(filePath).json()
    } catch (error: unknown) {
      console.error(`Failed to read processed ${source} snapshot ${period}`, error)
      throw new SnapshotReadError(period, source)
    }

    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      console.error(`Invalid processed ${source} snapshot ${period}`, parsed.error)
      throw new SnapshotValidationError(period, source)
    }
    return parsed.data
  }

  const getSnapshot = async (period: string): Promise<TSnapshot> => {
    const parsedPeriod = ReportingPeriodSchema.safeParse(period)
    if (!parsedPeriod.success) {
      throw new SnapshotNotFoundError(period, source)
    }

    const availablePeriods = await getAvailablePeriods()
    if (!availablePeriods.includes(parsedPeriod.data)) {
      throw new SnapshotNotFoundError(parsedPeriod.data, source)
    }

    const cached = snapshotCache.get(parsedPeriod.data)
    if (cached !== undefined) {
      return cached
    }

    const promise = readValidatedSnapshot(parsedPeriod.data)
    snapshotCache.set(parsedPeriod.data, promise)
    try {
      return await promise
    } catch (error: unknown) {
      if (snapshotCache.get(parsedPeriod.data) === promise) {
        snapshotCache.delete(parsedPeriod.data)
      }
      throw error
    }
  }

  return { getAvailablePeriods, getSnapshot }
}

const regularStore = createSnapshotStore<ProcessedRankedSnapshot>(
  path.resolve(process.cwd(), "data/processed/dia"),
  "ranked",
  ProcessedRankedSnapshotSchema,
)
const subdivisionStore = createSnapshotStore<ProcessedMasterSnapshot>(
  path.resolve(process.cwd(), "data/processed/dia_master"),
  "Master subdivision",
  ProcessedMasterSnapshotSchema,
)

const getRegularPeriods = async (): Promise<ReportingPeriod[]> => regularStore.getAvailablePeriods()
const getSubdivisionPeriods = async (): Promise<ReportingPeriod[]> => {
  const [regularPeriods, subdivisionPeriods] = await Promise.all([
    regularStore.getAvailablePeriods(),
    subdivisionStore.getAvailablePeriods(),
  ])
  const regularSet = new Set(regularPeriods)
  return subdivisionPeriods.filter((period) => regularSet.has(period))
}
const getAvailablePeriods = getRegularPeriods

const getLatestPeriod = async (): Promise<ReportingPeriod> => {
  const periods = await getRegularPeriods()
  const latest = periods.at(-1)
  if (latest === undefined) {
    throw new SnapshotReadError(undefined, "ranked")
  }
  return latest
}

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
      throw new SnapshotValidationError(period, "Master subdivision")
    }
    return block
  }

  const snapshot = await regularStore.getSnapshot(period)
  const key = REGULAR_KEYS[rank]
  const block =
    key === undefined ? undefined : controls === "combined" ? snapshot.c[key] : snapshot.ci[key]
  if (block === undefined) {
    throw new SnapshotValidationError(period, "ranked")
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
    throw new SnapshotValidationError(period, "ranked")
  }

  return {
    "classic-classic": block,
    "classic-modern": block,
    "modern-classic": block,
    "modern-modern": block,
  }
}

export {
  getAvailablePeriods,
  getLatestPeriod,
  getRankBlock,
  getRankControlBlocks,
  getRegularPeriods,
  getSubdivisionPeriods,
  SnapshotNotFoundError,
  SnapshotReadError,
  SnapshotValidationError,
  type ControlBlocks,
}
