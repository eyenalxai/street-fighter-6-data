import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
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
import { formatReportingPeriod } from "@/lib/sf6/model"

type LandscapeData = Extract<RosterOverviewData, { mode: "landscape" }>

const LandscapeResults = ({ data, meta }: { data: LandscapeData; meta: MetaData }) => {
  const timeData = data.time.map((point) => {
    return {
      label: formatReportingPeriod(point.period),
      spread: point.performanceSpread,
      diversity: point.effectiveRosterSize,
    }
  })
  const rankData = data.rankLandscape.map((point) => {
    return {
      label: point.label,
      spread: point.performanceSpread,
      diversity: point.effectiveRosterSize,
    }
  })
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Performance spread over time"
          description="Highest character average minus lowest character average for each reporting period."
        >
          <MetricTrendChart
            data={timeData}
            series={[{ key: "spread", label: "Performance spread", color: "var(--chart-1)" }]}
            xAxisLabel="Reporting period"
            yDomain={[0, "auto"]}
            tickFormatter={(value) => `${value.toFixed(0)} pp`}
            valueLabel="Performance spread (percentage points)"
            formatter={(value) => (value === null ? "—" : `${value.toFixed(1)} pp`)}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Effective roster size over time"
          description="Exponential Shannon entropy of usage shares; higher values indicate a more diverse environment."
        >
          <MetricTrendChart
            data={timeData}
            series={[{ key: "diversity", label: "Effective roster size", color: "var(--chart-2)" }]}
            xAxisLabel="Reporting period"
            yDomain={[0, "auto"]}
            tickFormatter={(value) => value.toFixed(0)}
            valueLabel="Effective roster size (characters)"
            formatter={(value) => (value === null ? "—" : value.toFixed(1))}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Performance spread across ranks"
          description="The selected period's highest character average minus lowest character average at each rank."
        >
          <MetricTrendChart
            data={rankData}
            series={[{ key: "spread", label: "Performance spread", color: "var(--chart-3)" }]}
            xAxisLabel="Rank"
            yDomain={[0, "auto"]}
            tickFormatter={(value) => `${value.toFixed(0)} pp`}
            valueLabel="Performance spread (percentage points)"
            formatter={(value) => (value === null ? "—" : `${value.toFixed(1)} pp`)}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Effective roster size across ranks"
          description="The selected period's normalized usage diversity at each rank."
        >
          <MetricTrendChart
            data={rankData}
            series={[{ key: "diversity", label: "Effective roster size", color: "var(--chart-4)" }]}
            xAxisLabel="Rank"
            yDomain={[0, "auto"]}
            tickFormatter={(value) => value.toFixed(0)}
            valueLabel="Effective roster size (characters)"
            formatter={(value) => (value === null ? "—" : value.toFixed(1))}
          />
        </AnalyticsPanel>
      </div>
      <AnalyticsPanel
        title="Selected-period rank landscape"
        description="Each rank row summarizes the spread and usage concentration for the selected period."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead className="text-right">Performance spread</TableHead>
              <TableHead className="text-right">Effective roster size</TableHead>
              <TableHead className="text-right">Top-five usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rankLandscape.map((point) => (
              <TableRow key={point.rankId}>
                <TableCell>{point.label}</TableCell>
                <TableCell className="text-right">
                  <MetricValue value={point.performanceSpread} format="percentagePoints" />
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
      <AnalyticsPanel
        title="Character consistency"
        description="Lower time standard deviation and rank range indicate more stable performance. These are separate measures, not a combined score."
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
                    : (meta.ranks.find((rank) => rank.id === row.peakRankId)?.label ??
                      row.peakRankId)}
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
    </div>
  )
}

export { LandscapeResults }
