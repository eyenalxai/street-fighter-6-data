type ReportingPeriod = `${number}${number}${number}${number}${number}${number}`

const SNAPSHOT_FAMILIES = [
  {
    id: "dia",
    label: "battle diagrams (ranked)",
    startYear: 2023,
    startMonth: 6,
    refererPath: "stats/dia",
    format: "dia",
  },
  {
    id: "dia_master",
    label: "battle diagrams (Master subdivisions)",
    startYear: 2025,
    startMonth: 2,
    refererPath: "stats/dia/master",
    format: "dia",
  },
  {
    id: "usagerate",
    label: "usage rates (ranked)",
    startYear: 2023,
    startMonth: 6,
    refererPath: "stats/usagerate",
    format: "usagerate",
  },
  {
    id: "usagerate_master",
    label: "usage rates (Master subdivisions)",
    startYear: 2025,
    startMonth: 2,
    refererPath: "stats/usagerate/master",
    format: "usagerate",
  },
] as const

type SnapshotFamily = (typeof SNAPSHOT_FAMILIES)[number]
type SnapshotFamilyId = SnapshotFamily["id"]
type SnapshotFormat = SnapshotFamily["format"]

const API_BASE = "https://www.streetfighter.com/6/buckler/api"
const SITE_BASE = "https://www.streetfighter.com/6/buckler"
const LANG = "en"

export {
  API_BASE,
  LANG,
  SITE_BASE,
  SNAPSHOT_FAMILIES,
  type ReportingPeriod,
  type SnapshotFamily,
  type SnapshotFamilyId,
  type SnapshotFormat,
}
