import { useState } from "react"

import type { ChangeExplorerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { ChangeCharacterTable } from "@/components/sf6/changes/character-table"
import { ChangeDeltaChart } from "@/components/sf6/charts/change-delta-chart"
import { MetricTrendChart } from "@/components/sf6/charts/metric-trend-chart"
import { MetricSummary } from "@/components/sf6/metric-summary"
import { DeltaMetric, MetricValue } from "@/components/sf6/metric-value"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatReportingPeriod, getCharacterName } from "@/lib/sf6/model"

const ChangeResults = ({ data, meta }: { data: ChangeExplorerData; meta: MetaData }) => {
  const [onlyFlips, setOnlyFlips] = useState(false)
  const scatterData = data.rows.flatMap((row) =>
    row.performanceDelta === null || row.usageDelta === null
      ? []
      : [
          {
            name: getCharacterName(row.characterId),
            usageDelta: row.usageDelta,
            performanceDelta: row.performanceDelta,
            weightedPerformanceDelta: row.weightedPerformanceDelta,
            debut: row.debut,
          },
        ],
  )
  const focusSeries = data.focusSeries.map((series, index) => {
    return {
      key: series.characterId,
      label:
        meta.characters.find((character) => character.id === series.characterId)?.name ??
        series.characterId,
      color: `var(--chart-${(index % 5) + 1})`,
    }
  })
  const performanceData =
    data.focusSeries[0]?.points.map((point, index) => {
      const row: { label: string; [key: string]: number | string | null } = {
        label: formatReportingPeriod(point.period),
      }
      for (const series of data.focusSeries) {
        row[series.characterId] = series.points[index]?.performance ?? null
      }
      return row
    }) ?? []
  const usageData =
    data.focusSeries[0]?.points.map((point, index) => {
      const row: { label: string; [key: string]: number | string | null } = {
        label: formatReportingPeriod(point.period),
      }
      for (const series of data.focusSeries) {
        row[series.characterId] = series.points[index]?.usage ?? null
      }
      return row
    }) ?? []
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <MetricSummary
          title={`Before · ${formatReportingPeriod(data.fromPeriod)}`}
          items={[
            {
              label: "Performance spread",
              value: <DeltaMetric value={data.before.performanceSpread} />,
            },
            {
              label: "Effective roster size",
              value: <MetricValue value={data.before.effectiveRosterSize} kind="number" />,
            },
            {
              label: "Top-five usage",
              value: <MetricValue value={data.before.topFiveShare} kind="usage" />,
            },
            {
              label: "Matchup imbalance",
              value: <DeltaMetric value={data.before.matchupImbalance} />,
            },
          ]}
        />
        <MetricSummary
          title={`After · ${formatReportingPeriod(data.toPeriod)}`}
          items={[
            {
              label: "Performance spread",
              value: <DeltaMetric value={data.after.performanceSpread} />,
            },
            {
              label: "Effective roster size",
              value: <MetricValue value={data.after.effectiveRosterSize} kind="number" />,
            },
            {
              label: "Top-five usage",
              value: <MetricValue value={data.after.topFiveShare} kind="usage" />,
            },
            {
              label: "Matchup imbalance",
              value: <DeltaMetric value={data.after.matchupImbalance} />,
            },
          ]}
        />
      </div>
      <AnalyticsPanel
        title="Performance and popularity movers"
        description="Characters to the right gained usage; characters higher on the chart gained performance. This visualizes change around the selected periods without making a causal claim."
      >
        <ChangeDeltaChart data={scatterData} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character changes"
        description={`${formatReportingPeriod(data.fromPeriod)} → ${formatReportingPeriod(data.toPeriod)} · deltas are later minus earlier`}
        contentClassName="p-0"
      >
        <ChangeCharacterTable rows={data.rows} />
      </AnalyticsPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsPanel
          title="Focused performance persistence"
          description="The selected endpoints are marked by their surrounding monthly series."
        >
          <MetricTrendChart
            data={performanceData}
            series={focusSeries}
            valueLabel="Average win rate"
            formatter={(value) => (value === null ? "—" : `${value.toFixed(1)}%`)}
            referenceValue={50}
            referenceLabel="50%"
            referencePeriods={[
              formatReportingPeriod(data.fromPeriod),
              formatReportingPeriod(data.toPeriod),
            ]}
          />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Focused popularity persistence"
          description="Inspect reversion or sustained movement after the selected change."
        >
          <MetricTrendChart
            data={usageData}
            series={focusSeries}
            valueLabel="Usage share"
            formatter={(value) => (value === null ? "—" : `${value.toFixed(1)}%`)}
            referencePeriods={[
              formatReportingPeriod(data.fromPeriod),
              formatReportingPeriod(data.toPeriod),
            ]}
          />
        </AnalyticsPanel>
      </div>
      <AnalyticsPanel
        title="Largest matchup changes"
        description="Only cells with numeric results in both periods are included. A flip crosses 50% between the selected periods."
        contentClassName="p-0"
      >
        <ToggleGroup
          value={[onlyFlips ? "flips" : "all"]}
          onValueChange={(value) => {
            setOnlyFlips(value[0] === "flips")
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Matchup change filter"
          className="mb-3"
        >
          <ToggleGroupItem value="all">All changes</ToggleGroupItem>
          <ToggleGroupItem value="flips">Favored-side flips</ToggleGroupItem>
        </ToggleGroup>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Character</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead className="text-right">Before</TableHead>
              <TableHead className="text-right">After</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead>Favored side flip</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.matchupChanges
              .filter((row) => !onlyFlips || row.flip)
              .slice(0, 40)
              .map((row) => (
                <TableRow key={`${row.characterId}-${row.opponentId}`}>
                  <TableCell>{getCharacterName(row.characterId)}</TableCell>
                  <TableCell>{getCharacterName(row.opponentId)}</TableCell>
                  <TableCell className="text-right">
                    <MetricValue value={row.before} kind="winRate" />
                  </TableCell>
                  <TableCell className="text-right">
                    <MetricValue value={row.after} kind="winRate" />
                  </TableCell>
                  <TableCell className="text-right">
                    <DeltaMetric value={row.delta} />
                  </TableCell>
                  <TableCell>{row.flip ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { ChangeResults }
