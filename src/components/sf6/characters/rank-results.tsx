import type { CharacterExplorerData, MetaData } from "@/lib/sf6/query-options"

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

type RankData = Extract<CharacterExplorerData, { view: "ranks" }>
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const CharacterRankResults = ({ data, meta }: { data: RankData; meta: MetaData }) => {
  const points = data.series[0]?.points ?? []
  const averageWinRateData = points.map((point, index) => {
    const row: { label: string; [key: string]: number | string | null } = { label: point.label }
    for (const series of data.series) {
      row[series.characterId] = series.points[index]?.averageWinRate ?? null
    }
    return row
  })
  const usageData = points.map((point, index) => {
    const row: { label: string; [key: string]: number | string | null } = { label: point.label }
    for (const series of data.series) {
      row[series.characterId] = series.points[index]?.usage ?? null
    }
    return row
  })
  const chartSeries = data.series.map((item, index) => {
    return {
      key: item.characterId,
      label:
        meta.characters.find((character) => character.id === item.characterId)?.name ??
        item.characterId,
      color: COLORS[index % COLORS.length] ?? "var(--chart-1)",
    }
  })
  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Average win rate across ranks"
          description="Combined-control average win rate from Rookie through the available Master subdivisions."
        >
          <MetricTrendChart
            data={averageWinRateData}
            series={chartSeries}
            xAxisLabel="Rank"
            valueFormat="percent"
            valueLabel="Average win rate"
            referenceValue={50}
            referenceLabel="50%"
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Popularity across ranks"
          description="Combined-control usage share for the same character and rank sequence."
        >
          <MetricTrendChart
            data={usageData}
            series={chartSeries}
            xAxisLabel="Rank"
            valueFormat="percent"
            valueLabel="Usage share"
          />
        </AnalyticsPanel>
      </div>
      <AnalyticsPanel
        title="Rank progression summary"
        description="Ranges are maximum minus minimum across the displayed rank points."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Character</TableHead>
              <TableHead className="text-right">Win rate range</TableHead>
              <TableHead className="text-right">Popularity range</TableHead>
              <TableHead>Peak win rate</TableHead>
              <TableHead>Trough win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.series.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.averageWinRateRange} format="percentagePoints" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.usageRange} format="percentagePoints" />
                </TableCell>
                <TableCell>{row.peakRankId ?? "—"}</TableCell>
                <TableCell>{row.troughRankId ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { CharacterRankResults }
