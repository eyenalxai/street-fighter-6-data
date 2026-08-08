import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
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

type StabilityData = Extract<RosterOverviewData, { view: "stability" }>

const RosterStabilityResults = ({ data, meta }: { data: StabilityData; meta: MetaData }) => (
  <AnalyticsPanel
    title="Character consistency"
    description="Lower time standard deviation and rank range indicate more stable win rate. These are separate measures, not a combined score."
    contentClassName="p-0"
  >
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Character</TableHead>
          <TableHead className="text-right">Time range</TableHead>
          <TableHead className="text-right">Time standard deviation</TableHead>
          <TableHead className="text-right">Largest adjacent change</TableHead>
          <TableHead className="text-right">Rank range</TableHead>
          <TableHead>Peak period</TableHead>
          <TableHead>Trough period</TableHead>
          <TableHead>Peak rank</TableHead>
          <TableHead>Trough rank</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.stability.map((row) => (
          <TableRow key={row.characterId}>
            <TableCell>
              <div className="flex items-center gap-2">
                <CharacterBadge characterId={row.characterId} size="small" />
                <CharacterName characterId={row.characterId} />
              </div>
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.timeRange} format="percentagePoints" />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.timeStandardDeviation} format="percentagePoints" />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.largestAdjacentChange} format="percentagePoints" />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.rankRange} format="percentagePoints" />
            </TableCell>
            <TableCell>
              {row.peakPeriod === null ? "—" : formatReportingPeriod(row.peakPeriod)}
            </TableCell>
            <TableCell>
              {row.troughPeriod === null ? "—" : formatReportingPeriod(row.troughPeriod)}
            </TableCell>
            <TableCell>
              {row.peakRankId === null
                ? "—"
                : (meta.ranks.find((rank) => rank.id === row.peakRankId)?.label ?? row.peakRankId)}
            </TableCell>
            <TableCell>
              {row.troughRankId === null
                ? "—"
                : (meta.ranks.find((rank) => rank.id === row.troughRankId)?.label ??
                  row.troughRankId)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </AnalyticsPanel>
)

export { RosterStabilityResults }
