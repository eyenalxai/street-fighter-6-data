import type { DatasetId } from "./types.ts"

export type DatasetConfig = {
  id: DatasetId
  label: string
  startYear: number
  startMonth: number
  refererPath: string
}

export const DATASETS: DatasetConfig[] = [
  {
    id: "usagerate",
    label: "character usage (ranked)",
    startYear: 2023,
    startMonth: 6,
    refererPath: "stats/usagerate",
  },
  {
    id: "dia",
    label: "battle diagrams (ranked)",
    startYear: 2023,
    startMonth: 6,
    refererPath: "stats/dia",
  },
  {
    id: "usagerate_master",
    label: "character usage (master)",
    startYear: 2025,
    startMonth: 2,
    refererPath: "stats/usagerate_master",
  },
  {
    id: "dia_master",
    label: "battle diagrams (master)",
    startYear: 2025,
    startMonth: 2,
    refererPath: "stats/dia_master",
  },
]

export const DATASET_MAP = Object.fromEntries(
  DATASETS.map((dataset) => [dataset.id, dataset]),
) as Record<DatasetId, DatasetConfig>

export const LANG = "en"
export const API_BASE = "https://www.streetfighter.com/6/buckler/api"
export const SITE_BASE = "https://www.streetfighter.com/6/buckler"
