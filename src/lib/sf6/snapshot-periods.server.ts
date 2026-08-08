import { readdir } from "node:fs/promises"
import path from "node:path"

import type { ReportingPeriod } from "./model"
import type { SnapshotFamilyId } from "./snapshot-families"

import { ReportingPeriodSchema } from "./model"
import { SNAPSHOT_FAMILIES } from "./snapshot-families"

type SnapshotPeriodCatalog = Record<SnapshotFamilyId, readonly ReportingPeriod[]>
type SnapshotPeriodAvailability = {
  latestCompletePeriod: ReportingPeriod
  regularPeriods: ReportingPeriod[]
  subdivisionPeriods: ReportingPeriod[]
}

const processedDirectory = (familyId: SnapshotFamilyId): string =>
  path.resolve(process.cwd(), "data/processed", familyId)

const listProcessedPeriods = async (familyId: SnapshotFamilyId): Promise<ReportingPeriod[]> => {
  try {
    const entries = await readdir(processedDirectory(familyId))
    return entries
      .filter((entry) => entry.endsWith(".json"))
      .map((entry) => entry.slice(0, -".json".length))
      .flatMap((candidate) => {
        const parsed = ReportingPeriodSchema.safeParse(candidate)
        return parsed.success ? [parsed.data] : []
      })
      .toSorted()
  } catch (error: unknown) {
    console.error(`Failed to discover processed ${familyId} snapshots`, error)
    return []
  }
}

const intersectPeriods = (
  left: readonly ReportingPeriod[],
  right: readonly ReportingPeriod[],
): ReportingPeriod[] => {
  const rightSet = new Set(right)
  return left.filter((period) => rightSet.has(period))
}

const buildSnapshotPeriodAvailability = (
  catalog: SnapshotPeriodCatalog,
): SnapshotPeriodAvailability => {
  const familySets = SNAPSHOT_FAMILIES.map((family) => new Set(catalog[family.id]))
  const firstFamilyPeriods = catalog[SNAPSHOT_FAMILIES[0].id]
  const completePeriods = firstFamilyPeriods.filter((period) =>
    familySets.every((periods) => periods.has(period)),
  )
  const latestCompletePeriod = completePeriods.at(-1)
  if (latestCompletePeriod === undefined) {
    throw new Error("No reporting period is available in every processed snapshot family")
  }

  const regularPeriods = catalog.dia.filter((period) => period <= latestCompletePeriod)
  const subdivisionPeriods = intersectPeriods(catalog.dia, catalog.dia_master).filter(
    (period) => period <= latestCompletePeriod,
  )

  return {
    latestCompletePeriod,
    regularPeriods,
    subdivisionPeriods,
  }
}

const getSnapshotPeriodAvailability = async (): Promise<SnapshotPeriodAvailability> => {
  const entries = await Promise.all(
    SNAPSHOT_FAMILIES.map(
      async (family) => [family.id, await listProcessedPeriods(family.id)] as const,
    ),
  )
  const catalog: SnapshotPeriodCatalog = {
    dia: [],
    dia_master: [],
    usagerate: [],
    usagerate_master: [],
  }
  for (const [familyId, periods] of entries) {
    catalog[familyId] = periods
  }
  return buildSnapshotPeriodAvailability(catalog)
}

export {
  buildSnapshotPeriodAvailability,
  getSnapshotPeriodAvailability,
  listProcessedPeriods,
  type SnapshotPeriodAvailability,
  type SnapshotPeriodCatalog,
}
