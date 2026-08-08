import type { CharacterId, ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { MatchupExplorerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MatchupProfileChart } from "@/components/sf6/charts/matchup-profile-chart"
import { MatchupProfileTable, SimilarProfilesTable } from "@/components/sf6/matchups/profile-tables"
import { MetricSummary } from "@/components/sf6/metric-summary"
import { MetricValue } from "@/components/sf6/metric-value"
import { formatReportingPeriod, getCharacterName } from "@/lib/sf6/model"
import { getControlLabel, METRIC_LABELS } from "@/lib/sf6/presentation"

type ProfileData = Extract<MatchupExplorerData, { view: "profile" }>

const MatchupProfileResults = ({
  data,
  meta,
  period,
  controls,
  character,
}: {
  data: ProfileData
  meta: MetaData
  period: ReportingPeriod
  controls: ControlMatchup
  character: CharacterId
}) => {
  const profileChartData = data.profile.flatMap((row) =>
    row.status !== "numeric" || row.winRate === null || row.opponentUsage === null
      ? []
      : [
          {
            name: getCharacterName(row.opponentId),
            usage: row.opponentUsage,
            winRate: row.winRate,
          },
        ],
  )
  return (
    <div className="flex flex-col gap-4">
      <MetricSummary
        title={`${getCharacterName(character)} profile`}
        description={`${formatReportingPeriod(period)} · ${getControlLabel(meta.controls, controls)}`}
        items={[
          {
            label: "Unweighted average",
            value: (
              <MetricValue value={data.summary.unweightedAverage} format="percent" tone="winRate" />
            ),
          },
          {
            label: "Usage-weighted average",
            value: (
              <MetricValue value={data.summary.weightedAverage} format="percent" tone="winRate" />
            ),
          },
          {
            label: "Worst matchup",
            value: <MetricValue value={data.summary.floor} format="percent" tone="winRate" />,
          },
          {
            label: METRIC_LABELS.favorableMatchups,
            value: `${data.summary.favorableCount} / ${data.summary.possibleCount}`,
          },
          {
            label: METRIC_LABELS.usageWeightCoverage,
            value: <MetricValue value={data.summary.weightCoverage} format="coverage" />,
          },
          {
            label: "Top-three lift",
            value: (
              <MetricValue
                value={data.summary.topThreeLift}
                format="percentagePoints"
                tone="directional"
                signed
              />
            ),
          },
          {
            label: "Matchup imbalance",
            value: <MetricValue value={data.summary.matchupImbalance} format="percentagePoints" />,
            description: "Mean distance from 50%.",
          },
        ]}
      />
      <AnalyticsPanel
        title="Opponent usage share and matchup result"
        description="The chart shows which matchup results matter more in the current usage share environment."
      >
        <MatchupProfileChart data={profileChartData} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Full matchup profile"
        description="Unavailable and mirror matchups stay visible. This separates missing data from a poor result."
        contentClassName="p-0"
      >
        <MatchupProfileTable rows={data.profile} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Similar matchup profiles"
        description="Correlation compares shared numeric opponents. The table needs at least five shared opponents."
        contentClassName="p-0"
      >
        <SimilarProfilesTable rows={data.similarProfiles} />
      </AnalyticsPanel>
    </div>
  )
}

export { MatchupProfileResults }
