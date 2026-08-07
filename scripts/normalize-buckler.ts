#!/usr/bin/env bun

import {
  DATASETS,
  DIA_DATASETS,
  USAGE_DATASETS,
  type DatasetId,
  type ReportingPeriod,
} from "./lib/buckler/datasets.ts"
import { normalizeDia } from "./lib/buckler/normalize-dia.ts"
import { normalizeUsage } from "./lib/buckler/normalize-usage.ts"
import {
  listRawSnapshots,
  processedExists,
  processedRelPath,
  readSnapshot,
  writeProcessed,
} from "./lib/buckler/storage.ts"

type NormalizeStats = {
  normalized: number
  skipped: number
  errors: number
}

const formatBytes = (bytes: number): string => bytes.toLocaleString("en-US")

const isUsageDataset = (datasetId: DatasetId): boolean =>
  (USAGE_DATASETS as readonly DatasetId[]).includes(datasetId)

const isDiaDataset = (datasetId: DatasetId): boolean =>
  (DIA_DATASETS as readonly DatasetId[]).includes(datasetId)

const logLine = (
  action: string,
  datasetId: DatasetId,
  period: ReportingPeriod,
  detail?: string,
): void => {
  const file = processedRelPath(datasetId, period)
  const prefix = action.padEnd(11, " ")
  if (detail) {
    console.log(`${prefix} ${file}  (${detail})`)
    return
  }
  console.log(`${prefix} ${file}`)
}

async function normalizePeriod(
  datasetId: DatasetId,
  period: ReportingPeriod,
  stats: NormalizeStats,
): Promise<void> {
  if (await processedExists(datasetId, period)) {
    stats.skipped += 1
    return
  }

  try {
    const raw = await readSnapshot(datasetId, period)
    const processed = isUsageDataset(datasetId)
      ? normalizeUsage(raw)
      : isDiaDataset(datasetId)
        ? normalizeDia(raw)
        : (() => {
            throw new Error(`Unknown dataset: ${datasetId}`)
          })()

    const bytes = await writeProcessed(datasetId, period, processed)
    stats.normalized += 1
    logLine("normalize", datasetId, period, `${formatBytes(bytes)} bytes`)
  } catch (error) {
    stats.errors += 1
    const message = error instanceof Error ? error.message : String(error)
    logLine("error", datasetId, period, message)
  }
}

async function normalizeDataset(datasetId: DatasetId, stats: NormalizeStats): Promise<void> {
  const dataset = DATASETS.find((entry) => entry.id === datasetId)
  if (dataset === undefined) {
    return
  }

  const periods = await listRawSnapshots(datasetId)
  console.log(`\n[${datasetId}] ${dataset.label} — ${periods.length} raw snapshot(s)`)

  for (const period of periods) {
    await normalizePeriod(datasetId, period, stats)
  }
}

async function main(): Promise<void> {
  const stats: NormalizeStats = {
    normalized: 0,
    skipped: 0,
    errors: 0,
  }

  console.log("SF6 Buckler normalize")

  for (const dataset of DATASETS) {
    await normalizeDataset(dataset.id, stats)
  }

  console.log("\nSummary:")
  console.log(`  normalized: ${stats.normalized}`)
  console.log(`  skipped:    ${stats.skipped}`)
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
