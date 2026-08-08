#!/usr/bin/env bun

import {
  SNAPSHOT_FAMILIES,
  type ReportingPeriod,
  type SnapshotFamily,
} from "../src/lib/sf6/snapshot-families.ts"
import { apiUrl, fetchSnapshotPeriod, serializeSnapshot } from "./lib/buckler/fetch.ts"
import { generatePeriods } from "./lib/buckler/periods.ts"
import { snapshotExists, snapshotRelPath, writeSnapshot } from "./lib/buckler/storage.ts"

type SyncStats = {
  downloaded: number
  skipped: number
  unavailable: number
  errors: number
}

const formatBytes = (bytes: number): string => bytes.toLocaleString("en-US")

const logLine = (
  action: string,
  family: SnapshotFamily,
  period: ReportingPeriod,
  detail?: string,
): void => {
  const file = snapshotRelPath(family.id, period)
  const api = apiUrl(family, period)
  const prefix = action.padEnd(11, " ")

  if (detail) {
    console.log(`${prefix} ${file}  (${detail})`)
    console.log(`${" ".repeat(12)} ${api}`)
    return
  }

  console.log(`${prefix} ${file}`)
  console.log(`${" ".repeat(12)} ${api}`)
}

async function syncFamily(family: SnapshotFamily, stats: SyncStats): Promise<void> {
  const periods = generatePeriods(family)

  console.log(`\n[${family.id}] ${family.label} — ${periods.length} reporting period(s)`)

  for (const period of periods) {
    const exists = await snapshotExists(family.id, period)

    if (exists) {
      stats.skipped += 1
      continue
    }

    const result = await fetchSnapshotPeriod(family, period)

    if (!result.ok) {
      if (result.status === 403) {
        stats.unavailable += 1
        logLine("unavailable", family, period, result.error)
        continue
      }

      stats.errors += 1
      logLine("error", family, period, result.error)
      continue
    }

    const content = serializeSnapshot(result.data)
    const bytes = await writeSnapshot(family.id, period, content)
    stats.downloaded += 1
    logLine("download", family, period, `${formatBytes(bytes)} bytes`)
  }
}

async function main(): Promise<void> {
  const stats: SyncStats = {
    downloaded: 0,
    skipped: 0,
    unavailable: 0,
    errors: 0,
  }

  console.log("SF6 Buckler sync")

  for (const family of SNAPSHOT_FAMILIES) {
    await syncFamily(family, stats)
  }

  console.log("\nSummary:")
  console.log(`  downloaded:  ${stats.downloaded}`)
  console.log(`  skipped:     ${stats.skipped}`)
  console.log(`  unavailable: ${stats.unavailable}`)
  console.log(`  errors:      ${stats.errors}`)

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
