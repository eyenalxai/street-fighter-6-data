import type { PlayerControl, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { AverageWinRatePopularityChart } from "@/components/sf6/charts/average-win-rate-popularity-chart"
import { MetricSummary } from "@/components/sf6/metric-summary"
import { MetricValue } from "@/components/sf6/metric-value"
import { SnapshotTable } from "@/components/sf6/roster/snapshot-table"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { getRank } from "@/lib/sf6/ranks"

type SnapshotData = Extract<RosterOverviewData, { view: "snapshot" }>

const SnapshotResults = ({
  data,
  meta,
  period,
  rank,
  playerControl,
}: {
  data: SnapshotData
  meta: MetaData
  period: ReportingPeriod
  rank: RankId
  playerControl: PlayerControl
}) => {
  const availableUsage = data.rows.filter((row) => row.usage !== null)
  const usageReference = availableUsage.length === 0 ? null : 100 / availableUsage.length
  const pointData = data.rows.flatMap((row) => {
    const character = meta.characters.find((item) => item.id === row.characterId)
    return row.averageWinRate === null || row.usage === null
      ? []
      : [
          {
            characterId: row.characterId,
            name: character?.name ?? row.characterId,
            averageWinRate: row.averageWinRate,
            usage: row.usage,
            weightedAverageWinRate: row.weightedAverageWinRate,
            floor: row.floor,
          },
        ]
  })
  const rankLabel = getRank(rank)?.label ?? rank
  const controlLabel = meta.playerControls.find((control) => control.id === playerControl)?.label
  return (
    <div className="flex flex-col gap-4">
      <MetricSummary
        title="Ranked environment snapshot"
        description={`${rankLabel} · ${controlLabel ?? playerControl} · ${formatReportingPeriod(period)}`}
        items={[
          {
            label: "Win rate spread",
            value: (
              <MetricValue value={data.summary.averageWinRateSpread} format="percentagePoints" />
            ),
          },
          {
            label: "Effective roster size",
            value: <MetricValue value={data.summary.effectiveRosterSize} format="number" />,
          },
          {
            label: "Top-five usage",
            value: <MetricValue value={data.summary.topFiveShare} format="percent" />,
          },
          {
            label: "Usage weight coverage",
            value: <MetricValue value={data.summary.usageCoverage} format="coverage" />,
          },
        ]}
      />
      <AnalyticsPanel
        title="Average win rate and popularity"
        description="Characters to the right have a higher average win rate; characters higher on the chart have a larger usage share. Dashed lines mark 50% average win rate and equal-share popularity."
      >
        <AverageWinRatePopularityChart data={pointData} usageReference={usageReference} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character snapshot"
        description="Weighted average win rate uses opponent popularity where both the matchup and opponent usage are available."
        contentClassName="p-0"
      >
        <SnapshotTable rows={data.rows} period={period} rank={rank} />
      </AnalyticsPanel>
    </div>
  )
}

export { SnapshotResults }
