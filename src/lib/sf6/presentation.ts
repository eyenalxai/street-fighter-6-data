import type { Character, ControlMatchup, ReportingPeriod } from "./model"
import type { RankId } from "./ranks"

import { formatReportingPeriod } from "./model"
import { getRank } from "./ranks"

const CHARACTER_COLLATOR = new Intl.Collator("en-US", {
  sensitivity: "base",
})

const VIEW_LABELS = {
  snapshot: "Snapshot",
  controls: "Control styles",
  ranks: "Across ranks",
  time: "Over time",
  overview: "Overview",
  trends: "Character trends",
  matchups: "Matchup shifts",
  headToHead: "Head to head",
  profile: "Profile",
  counterpicks: "Counterpick planner",
} as const

const AXIS_LABELS = {
  reportingPeriod: "Reporting period",
  rank: "Rank",
  averageWinRate: "Average win rate",
  usageShare: "Usage share",
  winRateSpread: "Win rate spread",
} as const

const METRIC_LABELS = {
  winRateSpread: "Win rate spread",
  topFiveUsage: "Top-five usage",
  matchupImbalance: "Matchup imbalance",
  usageWeightCoverage: "Usage weight coverage",
  weightedAverageWinRate: "Weighted average win rate",
  favorableMatchups: "Favorable matchups",
  favorableAtOrAbove50: "Favorable at or above 50%",
} as const

const MASTER_SUBDIVISION_COMBINED_CONTROLS =
  "A Master subdivision includes all control styles. You cannot filter by player control."

const MASTER_SUBDIVISION_CONTROL_COMPARISON_UNSUPPORTED =
  "Select All Master or a standard rank. Master subdivisions do not separate Classic and Modern players."

const MASTER_SUBDIVISION_PAIRING_UNAVAILABLE =
  "A Master subdivision reports all control styles together. Separate pairings are not available."

const MATCHUP_STATUS_LABELS = {
  numeric: "Reported",
  mirror: "Mirror matchup",
  unavailable: "Unavailable",
} as const

const RESULTS_STATUS = {
  loading: "Loading results.",
  updating: "Updating results.",
  loaded: "Results loaded.",
} as const

const sortCharactersByName = <T extends Pick<Character, "name">>(characters: readonly T[]): T[] =>
  characters.toSorted((left, right) => CHARACTER_COLLATOR.compare(left.name, right.name))

const getControlLabel = (
  controls: readonly { id: ControlMatchup; label: string }[],
  controlId: ControlMatchup,
): string => controls.find((control) => control.id === controlId)?.label ?? controlId

const getRankLabel = (rankId: RankId): string => getRank(rankId)?.label ?? rankId

const formatPeriodArrow = (fromPeriod: ReportingPeriod, toPeriod: ReportingPeriod): string =>
  `${formatReportingPeriod(fromPeriod)} → ${formatReportingPeriod(toPeriod)}`

const formatPeriodRange = (fromPeriod: ReportingPeriod, toPeriod: ReportingPeriod): string =>
  `${formatReportingPeriod(fromPeriod)} through ${formatReportingPeriod(toPeriod)}`

const formatLaterMinusEarlier = (): string => "Later minus earlier."

const formatCounterpickCoverage = (
  selectedUsageShare: number | null,
  weightCoverage: number | null,
): string => {
  const usageText =
    selectedUsageShare === null
      ? "The selected opponents have an unknown usage share."
      : `The selected opponents have ${selectedUsageShare.toFixed(1)}% of opponent usage share.`
  const weightText =
    weightCoverage === null
      ? "The weight coverage is unknown."
      : `The weight coverage is ${(weightCoverage * 100).toFixed(0)}%.`
  return `${usageText} ${weightText} Weighted averages use only the selected opponents. They do not show match volume.`
}

export {
  AXIS_LABELS,
  formatCounterpickCoverage,
  formatLaterMinusEarlier,
  formatPeriodArrow,
  formatPeriodRange,
  getControlLabel,
  getRankLabel,
  MASTER_SUBDIVISION_COMBINED_CONTROLS,
  MASTER_SUBDIVISION_CONTROL_COMPARISON_UNSUPPORTED,
  MASTER_SUBDIVISION_PAIRING_UNAVAILABLE,
  MATCHUP_STATUS_LABELS,
  METRIC_LABELS,
  RESULTS_STATUS,
  sortCharactersByName,
  VIEW_LABELS,
}
