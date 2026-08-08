import type { ChangeExplorerData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { ChangeCharacterTable } from "@/components/sf6/changes/character-table"
import { CharacterDeltaChart } from "@/components/sf6/charts/character-delta-chart"
import { MetricComparison } from "@/components/sf6/metric-comparison"
import { formatReportingPeriod, getCharacterName } from "@/lib/sf6/model"
import { formatLaterMinusEarlier, formatPeriodArrow, METRIC_LABELS } from "@/lib/sf6/presentation"

type OverviewData = Extract<ChangeExplorerData, { view: "overview" }>

const ChangeOverviewResults = ({ data }: { data: OverviewData }) => {
  const scatterData = data.rows.flatMap((row) =>
    row.averageWinRateDelta === null || row.usageDelta === null
      ? []
      : [
          {
            characterId: row.characterId,
            name: getCharacterName(row.characterId),
            usageDelta: row.usageDelta,
            averageWinRateDelta: row.averageWinRateDelta,
          },
        ],
  )
  return (
    <div className="flex flex-col gap-4">
      <MetricComparison
        fromLabel={`Start · ${formatReportingPeriod(data.fromPeriod)}`}
        toLabel={`End · ${formatReportingPeriod(data.toPeriod)}`}
        rows={[
          {
            label: METRIC_LABELS.winRateSpread,
            format: "percentagePoints",
            before: data.before.averageWinRateSpread,
            after: data.after.averageWinRateSpread,
          },
          {
            label: METRIC_LABELS.topFiveUsage,
            format: "percent",
            before: data.before.topFiveShare,
            after: data.after.topFiveShare,
          },
          {
            label: METRIC_LABELS.matchupImbalance,
            format: "percentagePoints",
            before: data.before.matchupImbalance,
            after: data.after.matchupImbalance,
          },
        ]}
      />
      <AnalyticsPanel
        title="Average win rate and usage share changes"
        description="Right shows increased usage share. Up shows increased average win rate. Both axes use percentage points; reference lines mark zero."
        contentInset="none"
      >
        <CharacterDeltaChart data={scatterData} scatterName="Character changes" />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character changes"
        description={`${formatPeriodArrow(data.fromPeriod, data.toPeriod)} · ${formatLaterMinusEarlier()}`}
        contentInset="none"
      >
        <div className="overflow-x-auto">
          <ChangeCharacterTable rows={data.rows} />
        </div>
      </AnalyticsPanel>
    </div>
  )
}

export { ChangeOverviewResults }
