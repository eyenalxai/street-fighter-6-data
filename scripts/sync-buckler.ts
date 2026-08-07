#!/usr/bin/env bun

import type { DatasetId, ReportingPeriod, SyncOptions } from "./buckler/types.ts"

import { API_BASE, DATASETS, DATASET_MAP, LANG } from "./buckler/datasets.ts"
import { fetchDatasetPeriod, serializeSnapshot } from "./buckler/fetch.ts"
import { filterFromPeriod, generatePeriods } from "./buckler/periods.ts"
import { snapshotExists, snapshotRelPath, writeSnapshot } from "./buckler/storage.ts"

type SyncStats = {
  downloaded: number
  skipped: number
  unavailable: number
  errors: number
}

type LogAction = "download" | "skip" | "unavailable" | "error" | "dry-run"

const formatBytes = (bytes: number): string => bytes.toLocaleString("en-US")

const logLine = (
  action: LogAction,
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

function parseArgs(argv: string[]): SyncOptions {
  const options: SyncOptions = {
    dryRun: false,
    force: false,
    verbose: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    switch (arg) {
      case "--dry-run": {
        options.dryRun = true
        break
      }
      case "--force": {
        options.force = true
        break
      }
      case "--verbose": {
        options.verbose = true
        break
      }
      case "--dataset": {
        const value = argv[index + 1]
        index += 1
        if (value === undefined || value === "" || !(value in DATASET_MAP)) {
          throw new Error(`Unknown dataset: ${value ?? "(missing)"}`)
        }
        options.dataset = value as DatasetId
        break
      }
      case "--from": {
        const value = argv[index + 1]
        index += 1
        if (value === undefined || value === "" || !/^\d{6}$/u.test(value)) {
          throw new Error(`Invalid --from period: ${value ?? "(missing)"}`)
        }
        options.from = value as ReportingPeriod
        break
      }
      default: {
        throw new Error(`Unknown argument: ${arg}`)
      }
    }
  }

  return options
}

async function syncDataset(
  datasetId: DatasetId,
  options: SyncOptions,
  stats: SyncStats,
): Promise<void> {
  const dataset = DATASET_MAP[datasetId]
  const periods = filterFromPeriod(generatePeriods(dataset), options.from)

  console.log(`\n[${datasetId}] ${dataset.label} — ${periods.length} reporting period(s)`)

  for (const period of periods) {
    const exists = await snapshotExists(datasetId, period)

    if (exists && !options.force) {
      stats.skipped += 1
      if (options.verbose) {
        logLine("skip", datasetId, period, "already on disk")
      }
      continue
    }

    if (options.dryRun) {
      logLine("dry-run", datasetId, period, "would download")
      stats.downloaded += 1
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
  const options = parseArgs(process.argv.slice(2))
  const datasets = options.dataset ? [options.dataset] : DATASETS.map((d) => d.id)
  const stats: SyncStats = {
    downloaded: 0,
    skipped: 0,
    unavailable: 0,
    errors: 0,
  }

  console.log(options.dryRun ? "SF6 Buckler sync (dry run)" : "SF6 Buckler sync")

  for (const datasetId of datasets) {
    await syncDataset(datasetId, options, stats)
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
