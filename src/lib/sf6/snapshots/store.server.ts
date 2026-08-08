import path from "node:path"

import type { ReportingPeriod } from "@/lib/sf6/model"
import type { SnapshotFamilyId } from "@/lib/sf6/snapshot-families"

import { ReportingPeriodSchema } from "@/lib/sf6/model"
import { listProcessedPeriods } from "@/lib/sf6/snapshot-periods.server"

type SnapshotSchema<TSnapshot> = {
  safeParse: (
    value: unknown,
  ) => { success: true; data: TSnapshot } | { success: false; error: unknown }
}

class SnapshotNotFoundError extends Error {
  constructor(period: string, source: string) {
    super(`No ${source} snapshot exists for reporting period ${period}.`)
    this.name = "SnapshotNotFoundError"
  }
}

class SnapshotReadError extends Error {
  constructor(period: ReportingPeriod | undefined, source: string) {
    super(
      period === undefined
        ? `No processed ${source} snapshots exist.`
        : `The system cannot read the processed ${source} snapshot for reporting period ${period}.`,
    )
    this.name = "SnapshotReadError"
  }
}

class SnapshotValidationError extends Error {
  constructor(period: ReportingPeriod, source: string) {
    super(`The processed ${source} snapshot for reporting period ${period} is invalid.`)
    this.name = "SnapshotValidationError"
  }
}

const createSnapshotStore = <TSnapshot>(
  familyId: SnapshotFamilyId,
  source: string,
  schema: SnapshotSchema<TSnapshot>,
) => {
  const directory = path.resolve(process.cwd(), "data/processed", familyId)
  const snapshotCache = new Map<ReportingPeriod, Promise<TSnapshot>>()
  let availablePeriodsPromise: Promise<ReportingPeriod[]> | null = null

  const getAvailablePeriods = async (): Promise<ReportingPeriod[]> => {
    availablePeriodsPromise ??= listProcessedPeriods(familyId)
    return availablePeriodsPromise
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

export { createSnapshotStore, SnapshotNotFoundError, SnapshotReadError, SnapshotValidationError }
