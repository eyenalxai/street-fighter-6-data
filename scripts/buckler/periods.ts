import type { DatasetConfig } from "./datasets.ts"
import type { ReportingPeriod } from "./types.ts"

function padMonth(month: number): string {
  return String(month).padStart(2, "0")
}

function toReportingPeriod(year: number, month: number): ReportingPeriod {
  return `${year}${padMonth(month)}` as ReportingPeriod
}

/** Mirrors Buckler site timezone adjustment: UTC offset, then -1h30m. */
function getAdjustedNow(now = new Date()): Date {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000
  const adjusted = new Date(utcMs)
  adjusted.setHours(adjusted.getHours() - 1, adjusted.getMinutes() - 30, 0, 0)
  return adjusted
}

function getTrailingExclusionCount(now = new Date()): number {
  const adjusted = getAdjustedNow(now)
  const switchDay = Number(process.env.NEXT_PUBLIC_STATS_SWITCH_DATE ?? adjusted.getDate())
  return adjusted.getDate() >= switchDay ? 1 : 2
}

export function formatReportingPeriod(date: Date): ReportingPeriod {
  return toReportingPeriod(date.getFullYear(), date.getMonth() + 1)
}

export function generatePeriods(dataset: DatasetConfig, now = new Date()): ReportingPeriod[] {
  const adjusted = getAdjustedNow(now)
  const trailingExclusion = getTrailingExclusionCount(now)
  const periods: ReportingPeriod[] = []

  const cursor = new Date(dataset.startYear, dataset.startMonth - 1, 1)
  const end = new Date(adjusted.getFullYear(), adjusted.getMonth(), 1)

  while (cursor <= end) {
    periods.push(formatReportingPeriod(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return periods.slice(0, Math.max(0, periods.length - trailingExclusion))
}

export function comparePeriods(a: ReportingPeriod, b: ReportingPeriod): number {
  return a.localeCompare(b)
}

export function filterFromPeriod(
  periods: ReportingPeriod[],
  from?: ReportingPeriod,
): ReportingPeriod[] {
  if (!from) {
    return periods
  }
  return periods.filter((period) => comparePeriods(period, from) >= 0)
}
