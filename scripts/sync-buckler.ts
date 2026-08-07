#!/usr/bin/env bun

import {
  API_BASE,
  DATASETS,
  DATASET_MAP,
  LANG,
  type DatasetId,
  type ReportingPeriod,
} from "./lib/buckler/datasets.ts"
import { fetchDatasetPeriod, serializeSnapshot } from "./lib/buckler/fetch.ts"
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
  datasetId: DatasetId,
  period: ReportingPeriod,
  detail?: string,
): void => {
  const file = snapshotRelPath(datasetId, period)
  const api = `${API_BASE}/${LANG}/stats/${datasetId}/${period}`
  const prefix = action.padEnd(11, " ")

  if (detail) {
    console.log(`${prefix} ${file}  (${detail})`)
    console.log(`${" ".repeat(12)} ${api}`)
    return
  }

  console.log(`${prefix} ${file}`)
  console.log(`${" ".repeat(12)} ${api}`)
}

async function syncDataset(datasetId: DatasetId, stats: SyncStats): Promise<void> {
  const dataset = DATASET_MAP[datasetId]
  const periods = generatePeriods(dataset)

  console.log(`\n[${datasetId}] ${dataset.label} — ${periods.length} reporting period(s)`)

  for (const period of periods) {
    const exists = await snapshotExists(datasetId, period)

    if (exists) {
      stats.skipped += 1
      continue
    }

    const result = await fetchDatasetPeriod(dataset, period)

    if (!result.ok) {
      if (result.status === 403) {
        stats.unavailable += 1
        logLine("unavailable", datasetId, period, result.error)
        continue
      }

      stats.errors += 1
      logLine("error", datasetId, period, result.error)
      continue
    }

    const content = serializeSnapshot(result.data)
    const bytes = await writeSnapshot(datasetId, period, content)
    stats.downloaded += 1
    logLine("download", datasetId, period, `${formatBytes(bytes)} bytes`)
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

  for (const dataset of DATASETS) {
    await syncDataset(dataset.id, stats)
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
