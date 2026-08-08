import type { RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { MetricValue } from "@/components/sf6/metric-value"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type RankData = Extract<RosterOverviewData, { view: "ranks" }>

const RosterRankResults = ({ data }: { data: RankData }) => {
  const chartData = data.rankLandscape.map((point) => {
    return {
      label: point.label,
      spread: point.averageWinRateSpread,
      diversity: point.effectiveRosterSize,
    }
  })
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Win rate spread across ranks"
          description="Each point is the highest character average minus the lowest character average at that rank."
        >
          <MetricTrendChart
            data={chartData}
            series={[{ key: "spread", label: "Win rate spread", color: "var(--chart-1)" }]}
            xAxisLabel="Rank"
            valueFormat="percentagePoints"
            valueLabel="Win rate spread (percentage points)"
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Effective roster size across ranks"
          description="Higher values indicate a more diverse usage environment at that rank."
        >
          <MetricTrendChart
            data={chartData}
            series={[{ key: "diversity", label: "Effective roster size", color: "var(--chart-2)" }]}
            xAxisLabel="Rank"
            valueFormat="number"
            valueLabel="Effective roster size (characters)"
          />
        </AnalyticsPanel>
      </div>
      <AnalyticsPanel
        title="Rank landscape"
        description="The selected period's spread and usage concentration at each rank."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead className="text-right">Win rate spread</TableHead>
              <TableHead className="text-right">Effective roster size</TableHead>
              <TableHead className="text-right">Top-five usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rankLandscape.map((point) => (
              <TableRow key={point.rankId}>
                <TableCell>{point.label}</TableCell>
                <TableCell className="text-right">
                  <MetricValue value={point.averageWinRateSpread} format="percentagePoints" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={point.effectiveRosterSize} format="number" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={point.topFiveShare} format="percent" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { RosterRankResults }
