import type { ChangeExplorerData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { formatCompactReportingPeriodTick } from "@/lib/sf6/charts/format"
import { buildCharacterMetricTrendData, buildCharacterTrendSeries } from "@/lib/sf6/charts/series"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { AXIS_LABELS, formatPeriodRange } from "@/lib/sf6/presentation"

type TrendsData = Extract<ChangeExplorerData, { view: "trends" }>

const ChangeTrendResults = ({ data }: { data: TrendsData }) => {
  const series = buildCharacterTrendSeries(data.focusSeries)
  const averageWinRateData = buildCharacterMetricTrendData(
    data.focusSeries,
    (point) => formatReportingPeriod(point.period),
    (point) => point?.averageWinRate ?? null,
  )
  const usageData = buildCharacterMetricTrendData(
    data.focusSeries,
    (point) => formatReportingPeriod(point.period),
    (point) => point?.usage ?? null,
  )
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AnalyticsPanel
        title="Focused average win rate trend"
        description={formatPeriodRange(data.fromPeriod, data.toPeriod)}
        contentInset="none"
      >
        <MetricTrendChart
          data={averageWinRateData}
          series={series}
          xAxisName={AXIS_LABELS.reportingPeriod}
          valueFormat="percent"
          yAxisName={AXIS_LABELS.averageWinRate}
          referenceValue={50}
          referenceLabel="50%"
          size="fill"
          xTickFormatter={formatCompactReportingPeriodTick}
        />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Focused usage share trend"
        description={formatPeriodRange(data.fromPeriod, data.toPeriod)}
        contentInset="none"
      >
        <MetricTrendChart
          data={usageData}
          series={series}
          xAxisName={AXIS_LABELS.reportingPeriod}
          valueFormat="percent"
          yAxisName={AXIS_LABELS.usageShare}
          size="fill"
          xTickFormatter={formatCompactReportingPeriodTick}
        />
      </AnalyticsPanel>
    </div>
  )
}

export { ChangeTrendResults }
