import type { ChangeExplorerData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { ChangeCharacterTable } from "@/components/sf6/changes/character-table"
import { ChangeDeltaChart } from "@/components/sf6/charts/change-delta-chart"
import { MetricSummary } from "@/components/sf6/metric-summary"
import { MetricValue } from "@/components/sf6/metric-value"
import { formatReportingPeriod, getCharacterName } from "@/lib/sf6/model"
import { formatLaterMinusEarlier, formatPeriodArrow, METRIC_LABELS } from "@/lib/sf6/presentation"

type OverviewData = Extract<ChangeExplorerData, { view: "overview" }>

const ChangeOverviewResults = ({ data }: { data: OverviewData }) => {
  const scatterData = data.rows.flatMap((row) =>
    row.averageWinRateDelta === null || row.usageDelta === null
      ? []
      : [
          {
            name: getCharacterName(row.characterId),
            usageDelta: row.usageDelta,
            averageWinRateDelta: row.averageWinRateDelta,
            weightedAverageWinRateDelta: row.weightedAverageWinRateDelta,
            debut: row.debut,
          },
        ],
  )
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <MetricSummary
          title={`Start · ${formatReportingPeriod(data.fromPeriod)}`}
          items={[
            {
              label: METRIC_LABELS.winRateSpread,
              value: (
                <MetricValue value={data.before.averageWinRateSpread} format="percentagePoints" />
              ),
            },
            {
              label: METRIC_LABELS.effectiveRosterSize,
              value: <MetricValue value={data.before.effectiveRosterSize} format="number" />,
            },
            {
              label: METRIC_LABELS.topFiveUsage,
              value: <MetricValue value={data.before.topFiveShare} format="percent" />,
            },
            {
              label: METRIC_LABELS.matchupImbalance,
              value: <MetricValue value={data.before.matchupImbalance} format="percentagePoints" />,
            },
          ]}
        />
        <MetricSummary
          title={`End · ${formatReportingPeriod(data.toPeriod)}`}
          items={[
            {
              label: "Win rate spread",
              value: (
                <MetricValue value={data.after.averageWinRateSpread} format="percentagePoints" />
              ),
            },
            {
              label: METRIC_LABELS.effectiveRosterSize,
              value: <MetricValue value={data.after.effectiveRosterSize} format="number" />,
            },
            {
              label: METRIC_LABELS.topFiveUsage,
              value: <MetricValue value={data.after.topFiveShare} format="percent" />,
            },
            {
              label: METRIC_LABELS.matchupImbalance,
              value: <MetricValue value={data.after.matchupImbalance} format="percentagePoints" />,
            },
          ]}
        />
      </div>
      <AnalyticsPanel
        title="Average win rate and usage share changes"
        description="Right shows a positive usage share change. Up shows a positive average win rate change. Reference lines mark zero change."
      >
        <ChangeDeltaChart data={scatterData} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character changes"
        description={`${formatPeriodArrow(data.fromPeriod, data.toPeriod)} · ${formatLaterMinusEarlier()}`}
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <ChangeCharacterTable rows={data.rows} />
        </div>
      </AnalyticsPanel>
    </div>
  )
}

export { ChangeOverviewResults }
