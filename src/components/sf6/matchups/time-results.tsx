import type { MatchupExplorerData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricValue } from "@/components/sf6/metric-value"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatReportingPeriod } from "@/lib/sf6/model"

type TimeData = Extract<MatchupExplorerData, { view: "time" }>

const MatchupTimeResults = ({ data }: { data: TimeData }) => (
  <AnalyticsPanel
    title="Matchup over time"
    description="Monthly points use the selected control context and preserve unavailable gaps."
    contentClassName="p-0"
  >
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.timeProgression.map((point) => (
          <TableRow key={point.period}>
            <TableCell>{formatReportingPeriod(point.period)}</TableCell>
            <TableCell className="text-right">
              <MetricValue value={point.winRate} format="percent" tone="winRate" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </AnalyticsPanel>
)

export { MatchupTimeResults }
