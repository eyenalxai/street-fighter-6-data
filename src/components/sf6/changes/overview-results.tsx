import type { ChangeExplorerData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { ChangeCharacterTable } from "@/components/sf6/changes/character-table"
import { ChangeDeltaChart } from "@/components/sf6/charts/change-delta-chart"
import { MetricSummary } from "@/components/sf6/metric-summary"
import { MetricValue } from "@/components/sf6/metric-value"
import { formatReportingPeriod, getCharacterName } from "@/lib/sf6/model"

type OverviewData = Extract<ChangeExplorerData, { view: "overview" }>

const ChangeOverviewResults = ({ data }: { data: OverviewData }) => {
  const scatterData = data.rows.flatMap((row) =>
    row.performanceDelta === null || row.usageDelta === null
      ? []
      : [
          {
            name: getCharacterName(row.characterId),
            usageDelta: row.usageDelta,
            performanceDelta: row.performanceDelta,
            weightedPerformanceDelta: row.weightedPerformanceDelta,
            debut: row.debut,
          },
        ],
  )
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <MetricSummary
          title={`Before · ${formatReportingPeriod(data.fromPeriod)}`}
          items={[
            {
              label: "Performance spread",
              value: (
                <MetricValue value={data.before.performanceSpread} format="percentagePoints" />
              ),
            },
            {
              label: "Effective roster size",
              value: <MetricValue value={data.before.effectiveRosterSize} format="number" />,
            },
            {
              label: "Top-five usage",
              value: <MetricValue value={data.before.topFiveShare} format="percent" />,
            },
            {
              label: "Matchup imbalance",
              value: <MetricValue value={data.before.matchupImbalance} format="percentagePoints" />,
            },
          ]}
        />
        <MetricSummary
          title={`After · ${formatReportingPeriod(data.toPeriod)}`}
          items={[
            {
              label: "Performance spread",
              value: <MetricValue value={data.after.performanceSpread} format="percentagePoints" />,
            },
            {
              label: "Effective roster size",
              value: <MetricValue value={data.after.effectiveRosterSize} format="number" />,
            },
            {
              label: "Top-five usage",
              value: <MetricValue value={data.after.topFiveShare} format="percent" />,
            },
            {
              label: "Matchup imbalance",
              value: <MetricValue value={data.after.matchupImbalance} format="percentagePoints" />,
            },
          ]}
        />
      </div>
      <AnalyticsPanel
        title="Performance and popularity movers"
        description="Characters to the right gained usage; characters higher on the chart gained performance. This visualizes change around the selected periods without making a causal claim."
      >
        <ChangeDeltaChart data={scatterData} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character changes"
        description={`${formatReportingPeriod(data.fromPeriod)} → ${formatReportingPeriod(data.toPeriod)} · deltas are later minus earlier`}
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
