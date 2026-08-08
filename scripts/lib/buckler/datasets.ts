export type DatasetId = "dia"

export type ReportingPeriod = `${number}${number}${number}${number}${number}${number}`

export type DatasetConfig = {
  id: DatasetId
  label: string
  startYear: number
  startMonth: number
  refererPath: string
}

export const DATASETS: DatasetConfig[] = [
  {
    id: "dia",
    label: "battle diagrams (ranked)",
    startYear: 2023,
    startMonth: 6,
    refererPath: "stats/dia",
  },
]

export const DATASET_MAP = Object.fromEntries(
  DATASETS.map((dataset) => [dataset.id, dataset]),
) as Record<DatasetId, DatasetConfig>

export const LANG = "en"
export const API_BASE = "https://www.streetfighter.com/6/buckler/api"
export const SITE_BASE = "https://www.streetfighter.com/6/buckler"
