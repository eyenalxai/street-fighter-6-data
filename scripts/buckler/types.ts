export type DatasetId = "usagerate" | "dia" | "usagerate_master" | "dia_master"

export type ReportingPeriod = `${number}${number}${number}${number}${number}${number}`

export type UsageRateResponse = {
  usagerateData: unknown[]
}

export type DiaResponse = {
  diaData: Record<string, unknown>
}

export type SyncOptions = {
  dryRun: boolean
  force: boolean
  verbose: boolean
  dataset?: DatasetId
  from?: ReportingPeriod
}

export type FetchResult =
  | { ok: true; data: unknown; status: number }
  | { ok: false; status: number; error: string }
