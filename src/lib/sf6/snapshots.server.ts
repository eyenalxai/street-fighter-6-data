import { readdir } from "node:fs/promises"
import path from "node:path"

import type { ReportingPeriod } from "@/lib/sf6/model"
import type { ProcessedDiaSnapshot } from "@/lib/sf6/snapshot-schema"

import { ReportingPeriodSchema } from "@/lib/sf6/model"
import { ProcessedDiaSnapshotSchema } from "@/lib/sf6/snapshot-schema"

const PROCESSED_DIA_DIRECTORY = path.resolve(process.cwd(), "data/processed/dia")
const snapshotCache = new Map<ReportingPeriod, Promise<ProcessedDiaSnapshot>>()

class SnapshotNotFoundError extends Error {
  constructor(period: string) {
    super(`No ranked snapshot is available for reporting period ${period}`)
    this.name = "SnapshotNotFoundError"
  }
}

class SnapshotReadError extends Error {
  constructor(period: ReportingPeriod | undefined) {
    super(
      period === undefined
        ? "No processed ranked snapshots are available"
        : `The processed dia snapshot for reporting period ${period} could not be read`,
    )
    this.name = "SnapshotReadError"
  }
}

class SnapshotValidationError extends Error {
  constructor(period: ReportingPeriod) {
    super(`The processed dia snapshot for reporting period ${period} failed validation`)
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

const getAvailablePeriods = async (): Promise<ReportingPeriod[]> => {
  try {
    const entries = await readdir(PROCESSED_DIA_DIRECTORY)
    return parsePeriods(entries)
  } catch (error: unknown) {
    console.error("Failed to discover processed ranked snapshots", error)
    return []
  }
}

const getLatestPeriod = async (): Promise<ReportingPeriod> => {
  const periods = await getAvailablePeriods()
  const latest = periods.at(-1)
  if (latest === undefined) {
    throw new SnapshotReadError(undefined)
  }
  return latest
}

const readValidatedSnapshot = async (period: ReportingPeriod): Promise<ProcessedDiaSnapshot> => {
  const filePath = path.join(PROCESSED_DIA_DIRECTORY, `${period}.json`)
  let raw: unknown = null
  try {
    raw = await Bun.file(filePath).json()
  } catch (error: unknown) {
    console.error(`Failed to read processed dia snapshot ${period}`, error)
    throw new SnapshotReadError(period)
  }

  const parsed = ProcessedDiaSnapshotSchema.safeParse(raw)
  if (!parsed.success) {
    console.error(`Invalid processed dia snapshot ${period}`, parsed.error.issues)
    throw new SnapshotValidationError(period)
  }
  return parsed.data
}

const getSnapshot = async (period: string): Promise<ProcessedDiaSnapshot> => {
  const parsedPeriod = ReportingPeriodSchema.safeParse(period)
  if (!parsedPeriod.success) {
    throw new SnapshotNotFoundError(period)
  }

  const availablePeriods = await getAvailablePeriods()
  if (!availablePeriods.includes(parsedPeriod.data)) {
    throw new SnapshotNotFoundError(parsedPeriod.data)
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

export {
  getAvailablePeriods,
  getLatestPeriod,
  getSnapshot,
  SnapshotNotFoundError,
  SnapshotReadError,
  SnapshotValidationError,
}
