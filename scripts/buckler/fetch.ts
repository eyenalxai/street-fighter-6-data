import type { DatasetConfig } from "./datasets.ts"
import type { FetchResult, ReportingPeriod } from "./types.ts"

import { API_BASE, LANG, SITE_BASE } from "./datasets.ts"

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000
const REQUEST_DELAY_MS = 500

let lastRequestAt = 0

function apiUrl(dataset: DatasetConfig, period: ReportingPeriod): string {
  return `${API_BASE}/${LANG}/stats/${dataset.id}/${period}`
}

function refererUrl(dataset: DatasetConfig, period: ReportingPeriod): string {
  return `${SITE_BASE}/${LANG}/${dataset.refererPath}/${period}`
}

async function waitForRateLimit(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt
  if (elapsed < REQUEST_DELAY_MS) {
    await Bun.sleep(REQUEST_DELAY_MS - elapsed)
  }
  lastRequestAt = Date.now()
}

const sleep = (ms: number): Promise<void> => Bun.sleep(ms)

export async function fetchDatasetPeriod(
  dataset: DatasetConfig,
  period: ReportingPeriod,
): Promise<FetchResult> {
  const url = apiUrl(dataset, period)

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await waitForRateLimit()

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
          Referer: refererUrl(dataset, period),
        },
      })

      if (response.status === 403) {
        return { ok: false, status: 403, error: "Request blocked or period unavailable" }
      }

      if (!response.ok) {
        if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1))
          continue
        }
        return {
          ok: false,
          status: response.status,
          error: `HTTP ${response.status}`,
        }
      }

      const data: unknown = await response.json()
      return { ok: true, data, status: response.status }
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1))
        continue
      }
      const message = error instanceof Error ? error.message : String(error)
      return { ok: false, status: 0, error: message }
    }
  }

  return { ok: false, status: 0, error: "Max retries exceeded" }
}

export function serializeSnapshot(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`
}
