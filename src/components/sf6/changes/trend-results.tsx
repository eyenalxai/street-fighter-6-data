import type { ChangeExplorerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { formatReportingPeriod } from "@/lib/sf6/model"

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
  const performanceData =
    data.focusSeries[0]?.points.map((point, index) => {
      const row: { label: string; [key: string]: number | string | null } = {
        label: formatReportingPeriod(point.period),
      }
      for (const item of data.focusSeries) {
        row[item.characterId] = item.points[index]?.performance ?? null
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
        title="Focused performance persistence"
        description={`Average win rate from ${formatReportingPeriod(data.fromPeriod)} through ${formatReportingPeriod(data.toPeriod)}.`}
      >
        <MetricTrendChart
          data={performanceData}
          series={series}
          xAxisLabel="Reporting period"
          valueFormat="percent"
          valueLabel="Average win rate"
          referenceValue={50}
          referenceLabel="50%"
        />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Focused popularity persistence"
        description={`Usage share from ${formatReportingPeriod(data.fromPeriod)} through ${formatReportingPeriod(data.toPeriod)}.`}
      >
        <MetricTrendChart
          data={usageData}
          series={series}
          xAxisLabel="Reporting period"
          valueFormat="percent"
          valueLabel="Usage share"
        />
      </AnalyticsPanel>
    </div>
  )
}

export { ChangeTrendResults }
