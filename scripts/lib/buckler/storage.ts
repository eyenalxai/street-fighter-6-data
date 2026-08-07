import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { DatasetId, ReportingPeriod } from "./datasets.ts"

export const DATA_DIR = path.resolve(import.meta.dirname, "../../../data")
export const RAW_DIR = path.join(DATA_DIR, "raw")
export const PROCESSED_DIR = path.join(DATA_DIR, "processed")

export function snapshotPath(dataset: DatasetId, period: ReportingPeriod): string {
  return path.join(RAW_DIR, dataset, `${period}.json`)
}

export function snapshotRelPath(dataset: DatasetId, period: ReportingPeriod): string {
  return path.join("data", "raw", dataset, `${period}.json`)
}

export function processedPath(dataset: DatasetId, period: ReportingPeriod): string {
  return path.join(PROCESSED_DIR, dataset, `${period}.json`)
}

export function processedRelPath(dataset: DatasetId, period: ReportingPeriod): string {
  return path.join("data", "processed", dataset, `${period}.json`)
}

export async function snapshotExists(
  dataset: DatasetId,
  period: ReportingPeriod,
): Promise<boolean> {
  try {
    await access(snapshotPath(dataset, period))
    return true
  } catch {
    return false
  }
}

export async function listRawSnapshots(dataset: DatasetId): Promise<ReportingPeriod[]> {
  const dir = path.join(RAW_DIR, dataset)
  try {
    const entries = await readdir(dir)
    return entries
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.slice(0, -".json".length) as ReportingPeriod)
      .sort()
  } catch {
    return []
  }
}

export async function readSnapshot(dataset: DatasetId, period: ReportingPeriod): Promise<unknown> {
  const content = await readFile(snapshotPath(dataset, period), "utf8")
  return JSON.parse(content) as unknown
}

export async function writeSnapshot(
  dataset: DatasetId,
  period: ReportingPeriod,
  content: string,
): Promise<number> {
  const filePath = snapshotPath(dataset, period)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content)
  return Buffer.byteLength(content, "utf8")
}

export async function writeProcessed(
  dataset: DatasetId,
  period: ReportingPeriod,
  data: unknown,
): Promise<number> {
  const filePath = processedPath(dataset, period)
  const content = `${JSON.stringify(data)}\n`
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content)
  return Buffer.byteLength(content, "utf8")
}
