import type { RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { TimeConsistencyTable } from "@/components/sf6/roster/consistency-tables"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { AXIS_LABELS, METRIC_LABELS } from "@/lib/sf6/presentation"

type TimeData = Extract<RosterOverviewData, { view: "time" }>

const RosterTimeResults = ({ data }: { data: TimeData }) => {
  const chartData = data.time.map((point) => {
    return {
      label: formatReportingPeriod(point.period),
      spread: point.averageWinRateSpread,
    }
  })
  return (
    <div className="flex flex-col gap-4">
      <AnalyticsPanel
        title="Win rate spread over time"
        description="Highest character average win rate minus lowest character average win rate for each reporting period."
      >
        <MetricTrendChart
          data={chartData}
          series={[{ key: "spread", label: METRIC_LABELS.winRateSpread, color: "var(--chart-1)" }]}
          xAxisLabel={AXIS_LABELS.reportingPeriod}
          valueFormat="percentagePoints"
          valueLabel="Win rate spread (percentage points)"
        />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character consistency over time"
        description="Lower win rate range and standard deviation show a steadier average win rate across reporting periods."
        contentClassName="p-0"
      >
        <TimeConsistencyTable data={data.characterConsistency} />
      </AnalyticsPanel>
    </div>
  )
}

export { RosterTimeResults }
