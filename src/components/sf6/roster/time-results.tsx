import type { RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { TimeConsistencyTable } from "@/components/sf6/roster/consistency-tables"
import { formatReportingPeriod } from "@/lib/sf6/model"

type TimeData = Extract<RosterOverviewData, { view: "time" }>

const RosterTimeResults = ({ data }: { data: TimeData }) => {
  const chartData = data.time.map((point) => {
    return {
      label: formatReportingPeriod(point.period),
      spread: point.averageWinRateSpread,
      diversity: point.effectiveRosterSize,
    }
  })
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Win rate spread over time"
          description="Highest character average minus lowest character average for each reporting period."
        >
          <MetricTrendChart
            data={chartData}
            series={[{ key: "spread", label: "Win rate spread", color: "var(--chart-1)" }]}
            xAxisLabel="Reporting period"
            valueFormat="percentagePoints"
            valueLabel="Win rate spread (percentage points)"
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
      <AnalyticsPanel
        title="Character consistency over time"
        description="Lower win rate range and standard deviation indicate a steadier win rate across the selected rank's reporting periods."
        contentClassName="p-0"
      >
        <TimeConsistencyTable data={data.characterConsistency} />
      </AnalyticsPanel>
    </div>
  )
}

export { RosterTimeResults }
