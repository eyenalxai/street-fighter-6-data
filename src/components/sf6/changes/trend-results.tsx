import type { ChangeExplorerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { formatCompactReportingPeriodTick } from "@/lib/sf6/charts/format"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { AXIS_LABELS, formatPeriodRange } from "@/lib/sf6/presentation"

type TrendsData = Extract<ChangeExplorerData, { view: "trends" }>

const ChangeTrendResults = ({ data, meta }: { data: TrendsData; meta: MetaData }) => {
  const series = data.focusSeries.map((item, index) => {
    return {
      key: item.characterId,
      label:
        meta.characters.find((character) => character.id === item.characterId)?.name ??
        item.characterId,
      color: `var(--chart-${(index % 5) + 1})`,
    }
  })
  const averageWinRateData =
    data.focusSeries[0]?.points.map((point, index) => {
      const row: { label: string; [key: string]: number | string | null } = {
        label: formatReportingPeriod(point.period),
      }
      for (const item of data.focusSeries) {
        row[item.characterId] = item.points[index]?.averageWinRate ?? null
      }
      return row
    }) ?? []
  const usageData =
    data.focusSeries[0]?.points.map((point, index) => {
      const row: { label: string; [key: string]: number | string | null } = {
        label: formatReportingPeriod(point.period),
      }
      for (const item of data.focusSeries) {
        row[item.characterId] = item.points[index]?.usage ?? null
      }
      return row
    }) ?? []
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <AnalyticsPanel
        title="Focused average win rate trend"
        description={formatPeriodRange(data.fromPeriod, data.toPeriod)}
      >
        <MetricTrendChart
          data={averageWinRateData}
          series={series}
          xAxisLabel={AXIS_LABELS.reportingPeriod}
          valueFormat="percent"
          valueLabel={AXIS_LABELS.averageWinRate}
          referenceValue={50}
          referenceLabel="50%"
          xTickFormatter={formatCompactReportingPeriodTick}
        />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Focused usage share trend"
        description={formatPeriodRange(data.fromPeriod, data.toPeriod)}
      >
        <MetricTrendChart
          data={usageData}
          series={series}
          xAxisLabel={AXIS_LABELS.reportingPeriod}
          valueFormat="percent"
          valueLabel={AXIS_LABELS.usageShare}
          xTickFormatter={formatCompactReportingPeriodTick}
        />
      </AnalyticsPanel>
    </div>
  )
}

export { ChangeTrendResults }
