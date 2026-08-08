import { Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import type { CharacterId, PlayerControl, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { PerformancePopularityChart } from "@/components/sf6/charts/performance-popularity-chart"
import { MetricSummary } from "@/components/sf6/metric-summary"
import { DeltaMetric, MetricValue } from "@/components/sf6/metric-value"
import { SortableTableHead } from "@/components/sf6/sortable-table-head"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { getRank } from "@/lib/sf6/ranks"

type SnapshotData = Extract<RosterOverviewData, { mode: "snapshot" }>
type SnapshotSortKey =
  | "character"
  | "performance"
  | "weightedPerformance"
  | "weightCoverage"
  | "usage"
  | "performanceDelta"
  | "usageDelta"
  | "floor"
  | "favorable"
  | "coverage"

const CharacterMatchupLink = ({
  period,
  rank,
  characterId,
}: {
  period: ReportingPeriod
  rank: RankId
  characterId: SnapshotData["rows"][number]["characterId"]
}) => {
  const search = useMemo(() => {
    const opponent: CharacterId = characterId === "ryu" ? "ken" : "ryu"
    return {
      period,
      rank,
      character: characterId,
      opponent,
      controls: "combined" as const,
    }
  }, [characterId, period, rank])
  return (
    <Link
      to="/matchups"
      search={search}
      className="inline-flex items-center gap-2 font-medium hover:underline"
    >
      <CharacterBadge characterId={characterId} size="small" />
      <CharacterName characterId={characterId} />
    </Link>
  )
}

const SnapshotResults = ({
  data,
  meta,
  period,
  rank,
  playerControl,
}: {
  data: SnapshotData
  meta: MetaData
  period: ReportingPeriod
  rank: RankId
  playerControl: PlayerControl
}) => {
  const [sort, setSort] = useState<{ key: SnapshotSortKey; direction: "asc" | "desc" }>({
    key: "performance",
    direction: "desc",
  })
  const availableUsage = data.rows.filter((row) => row.usage !== null)
  const usageReference = availableUsage.length === 0 ? null : 100 / availableUsage.length
  const pointData = data.rows.flatMap((row) => {
    const character = meta.characters.find((item) => item.id === row.characterId)
    return row.performance === null || row.usage === null
      ? []
      : [
          {
            characterId: row.characterId,
            name: character?.name ?? row.characterId,
            performance: row.performance,
            usage: row.usage,
            weightedPerformance: row.weightedPerformance,
            floor: row.floor,
          },
        ]
  })
  const rankLabel = getRank(rank)?.label ?? rank
  const controlLabel = meta.playerControls.find((control) => control.id === playerControl)?.label
  const sortedRows = useMemo(
    () =>
      data.rows.toSorted((left, right) => {
        if (sort.key === "character") {
          const result = left.characterId.localeCompare(right.characterId)
          return sort.direction === "asc" ? result : -result
        }
        const values = {
          performance: [left.performance, right.performance],
          weightedPerformance: [left.weightedPerformance, right.weightedPerformance],
          weightCoverage: [left.weightCoverage, right.weightCoverage],
          usage: [left.usage, right.usage],
          performanceDelta: [left.performanceDelta, right.performanceDelta],
          usageDelta: [left.usageDelta, right.usageDelta],
          floor: [left.floor, right.floor],
          favorable: [left.favorableCount, right.favorableCount],
          coverage: [left.coverage, right.coverage],
        }[sort.key]
        if (values === undefined) {
          return 0
        }
        const leftValue = values[0] ?? null
        const rightValue = values[1] ?? null
        if (leftValue === null && rightValue === null) {
          return 0
        }
        if (leftValue === null) {
          return 1
        }
        if (rightValue === null) {
          return -1
        }
        const result = leftValue - rightValue
        return sort.direction === "asc" ? result : -result
      }),
    [data.rows, sort],
  )
  const changeSort = (key: SnapshotSortKey) => {
    setSort((current) => {
      return {
        key,
        direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
      }
    })
  }
  const head = (label: string, key: SnapshotSortKey) => (
    <SortableTableHead
      label={label}
      active={sort.key === key}
      direction={sort.direction}
      onClick={() => {
        changeSort(key)
      }}
      className={
        key === "character" ? undefined : "text-right [&>button]:w-full [&>button]:justify-end"
      }
    />
  )
  return (
    <div className="flex flex-col gap-4">
      <MetricSummary
        title="Ranked environment snapshot"
        description={`${rankLabel} · ${controlLabel ?? playerControl} · ${formatReportingPeriod(period)}`}
        items={[
          {
            label: "Performance spread",
            value: <MetricValue value={data.summary.performanceSpread} kind="delta" />,
          },
          {
            label: "Effective roster size",
            value: <MetricValue value={data.summary.effectiveRosterSize} kind="number" />,
          },
          {
            label: "Top-five usage",
            value: <MetricValue value={data.summary.topFiveShare} kind="usage" />,
          },
          {
            label: "Usage weight coverage",
            value: <MetricValue value={data.summary.usageCoverage} kind="coverage" />,
          },
        ]}
      />
      <AnalyticsPanel
        title="Performance and popularity"
        description="Characters to the right perform better; characters higher on the chart have a larger usage share. Dashed lines mark 50% performance and equal-share popularity."
      >
        <PerformancePopularityChart data={pointData} usageReference={usageReference} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character snapshot"
        description="Weighted performance uses opponent popularity where both the matchup and opponent usage are available. Coverage describes reported matchup cells."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              {head("Character", "character")}
              {head("Performance", "performance")}
              {head("Weighted performance", "weightedPerformance")}
              {head("Weight coverage", "weightCoverage")}
              {head("Usage", "usage")}
              {head("Performance change", "performanceDelta")}
              {head("Usage change", "usageDelta")}
              {head("Worst matchup", "floor")}
              {head("Favorable", "favorable")}
              {head("Coverage", "coverage")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <CharacterMatchupLink period={period} rank={rank} characterId={row.characterId} />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.performance} kind="winRate" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.weightedPerformance} kind="winRate" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.weightCoverage} kind="coverage" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.usage} kind="usage" />
                </TableCell>
                <TableCell className="text-right">
                  <DeltaMetric value={row.performanceDelta} />
                </TableCell>
                <TableCell className="text-right">
                  <DeltaMetric value={row.usageDelta} />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.floor} kind="winRate" />
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.favorableCount} / {row.availableCount}
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.coverage} kind="coverage" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { SnapshotResults }
