#!/usr/bin/env bun

import {
  SNAPSHOT_FAMILIES,
  type ReportingPeriod,
  type SnapshotFamily,
  type SnapshotFormat,
} from "../src/lib/sf6/snapshot-families.ts"
import { normalizeDia } from "./lib/buckler/normalize-dia.ts"
import { normalizeUsageRate } from "./lib/buckler/normalize-usagerate.ts"
import {
  listRawSnapshots,
  processedRelPath,
  readSnapshot,
  writeProcessed,
} from "./lib/buckler/storage.ts"

type NormalizeStats = {
  normalized: number
  errors: number
}
type Normalizer = (raw: unknown) => unknown

const NORMALIZERS: Record<SnapshotFormat, Normalizer> = {
  dia: normalizeDia,
  usagerate: normalizeUsageRate,
}

const formatBytes = (bytes: number): string => bytes.toLocaleString("en-US")

const logLine = (
  action: string,
  familyId: SnapshotFamily["id"],
  period: ReportingPeriod,
  detail?: string,
): void => {
  const file = processedRelPath(familyId, period)
  const prefix = action.padEnd(11, " ")
  if (detail) {
    console.log(`${prefix} ${file}  (${detail})`)
    return
  }
  console.log(`${prefix} ${file}`)
}

async function normalizePeriod(
  family: SnapshotFamily,
  period: ReportingPeriod,
  stats: NormalizeStats,
): Promise<void> {
  try {
    const raw = await readSnapshot(family.id, period)
    const processed = NORMALIZERS[family.format](raw)

    const bytes = await writeProcessed(family.id, period, processed)
    stats.normalized += 1
    logLine("normalize", family.id, period, `${formatBytes(bytes)} bytes`)
  } catch (error) {
    stats.errors += 1
    const message = error instanceof Error ? error.message : String(error)
    logLine("error", family.id, period, message)
  }
}

async function normalizeFamily(family: SnapshotFamily, stats: NormalizeStats): Promise<void> {
  const periods = await listRawSnapshots(family.id)
  console.log(`\n[${family.id}] ${family.label} — ${periods.length} raw snapshot(s)`)

  for (const period of periods) {
    await normalizePeriod(family, period, stats)
  }
}

async function main(): Promise<void> {
  const stats: NormalizeStats = {
    normalized: 0,
    errors: 0,
  }

  console.log("SF6 Buckler normalize")

  for (const family of SNAPSHOT_FAMILIES) {
    await normalizeFamily(family, stats)
  }

  console.log("\nSummary:")
  console.log(`  normalized: ${stats.normalized}`)
  console.log(`  errors:     ${stats.errors}`)

  if (stats.errors > 0) {
    process.exitCode = 1
  }
}

try {
  await main()
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
}
