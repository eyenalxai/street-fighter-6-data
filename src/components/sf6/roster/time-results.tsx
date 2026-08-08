import type { RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { formatReportingPeriod } from "@/lib/sf6/model"

type TimeData = Extract<RosterOverviewData, { view: "time" }>

const RosterTimeResults = ({ data }: { data: TimeData }) => {
  const chartData = data.time.map((point) => {
    return {
      label: formatReportingPeriod(point.period),
      spread: point.performanceSpread,
      diversity: point.effectiveRosterSize,
    }
  })
  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <AnalyticsPanel
        title="Performance spread over time"
        description="Highest character average minus lowest character average for each reporting period."
      >
        <MetricTrendChart
          data={chartData}
          series={[{ key: "spread", label: "Performance spread", color: "var(--chart-1)" }]}
          xAxisLabel="Reporting period"
          valueFormat="percentagePoints"
          valueLabel="Performance spread (percentage points)"
        />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Effective roster size over time"
        description="Exponential Shannon entropy of usage shares; higher values indicate a more diverse environment."
      >
        <MetricTrendChart
          data={chartData}
          series={[{ key: "diversity", label: "Effective roster size", color: "var(--chart-2)" }]}
          xAxisLabel="Reporting period"
          valueFormat="number"
          valueLabel="Effective roster size (characters)"
        />
      </AnalyticsPanel>
    </div>
  )
}

export { RosterTimeResults }
