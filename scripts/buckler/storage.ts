import { access, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import type { DatasetId, ReportingPeriod } from "./types.ts"

export const DATA_DIR = path.resolve(import.meta.dirname, "../../data")
export const RAW_DIR = path.join(DATA_DIR, "raw")

export function snapshotPath(dataset: DatasetId, period: ReportingPeriod): string {
  return path.join(RAW_DIR, dataset, `${period}.json`)
}

export function snapshotRelPath(dataset: DatasetId, period: ReportingPeriod): string {
  return path.join("data", "raw", dataset, `${period}.json`)
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
