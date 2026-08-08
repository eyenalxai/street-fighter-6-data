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

type RankData = Extract<MatchupExplorerData, { view: "ranks" }>

const MatchupRankResults = ({ data }: { data: RankData }) => (
  <AnalyticsPanel
    title="Matchup across ranks"
    description="Combined-control progression keeps standard ranks comparable with Master subdivisions."
    contentClassName="p-0"
  >
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead className="text-right">Win rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.rankProgression.map((point) => (
          <TableRow key={point.id}>
            <TableCell>{point.label}</TableCell>
            <TableCell className="text-right">
              <MetricValue value={point.winRate} format="percent" tone="winRate" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </AnalyticsPanel>
)

export { MatchupRankResults }
