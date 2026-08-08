import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { ReportingPeriod, SnapshotFamilyId } from "../../../src/lib/sf6/snapshot-families.ts"

export const DATA_DIR = path.resolve(import.meta.dirname, "../../../data")
export const RAW_DIR = path.join(DATA_DIR, "raw")
export const PROCESSED_DIR = path.join(DATA_DIR, "processed")

export function snapshotPath(familyId: SnapshotFamilyId, period: ReportingPeriod): string {
  return path.join(RAW_DIR, familyId, `${period}.json`)
}

export function snapshotRelPath(familyId: SnapshotFamilyId, period: ReportingPeriod): string {
  return path.join("data", "raw", familyId, `${period}.json`)
}

export function processedPath(familyId: SnapshotFamilyId, period: ReportingPeriod): string {
  return path.join(PROCESSED_DIR, familyId, `${period}.json`)
}

export function processedRelPath(familyId: SnapshotFamilyId, period: ReportingPeriod): string {
  return path.join("data", "processed", familyId, `${period}.json`)
}

export async function snapshotExists(
  familyId: SnapshotFamilyId,
  period: ReportingPeriod,
): Promise<boolean> {
  try {
    await access(snapshotPath(familyId, period))
    return true
  } catch {
    return false
  }
}

export async function listRawSnapshots(familyId: SnapshotFamilyId): Promise<ReportingPeriod[]> {
  const dir = path.join(RAW_DIR, familyId)
  try {
    const entries = await readdir(dir)
    return entries
      .filter((name) => /^\d{6}\.json$/u.test(name))
      .map((name) => name.slice(0, -".json".length) as ReportingPeriod)
      .sort()
  } catch {
    return []
  }
}

export async function readSnapshot(
  familyId: SnapshotFamilyId,
  period: ReportingPeriod,
): Promise<unknown> {
  const content = await readFile(snapshotPath(familyId, period), "utf8")
  return JSON.parse(content) as unknown
}

export async function writeSnapshot(
  familyId: SnapshotFamilyId,
  period: ReportingPeriod,
  content: string,
): Promise<number> {
  const filePath = snapshotPath(familyId, period)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content)
  return Buffer.byteLength(content, "utf8")
}

export async function writeProcessed(
  familyId: SnapshotFamilyId,
  period: ReportingPeriod,
  data: unknown,
): Promise<number> {
  const filePath = processedPath(familyId, period)
  const content = `${JSON.stringify(data)}\n`
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, content)
  return Buffer.byteLength(content, "utf8")
}
