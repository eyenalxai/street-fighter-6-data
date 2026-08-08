import { Link } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import type { CharacterId, PlayerControl, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { AverageWinRatePopularityChart } from "@/components/sf6/charts/average-win-rate-popularity-chart"
import { MetricSummary } from "@/components/sf6/metric-summary"
import { MetricValue } from "@/components/sf6/metric-value"
import { SortableTableHead } from "@/components/sf6/sortable-table-head"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { getRank } from "@/lib/sf6/ranks"

type SnapshotData = Extract<RosterOverviewData, { view: "snapshot" }>
type SnapshotSortKey =
  | "character"
  | "averageWinRate"
  | "weightedAverageWinRate"
  | "weightCoverage"
  | "usage"
  | "averageWinRateDelta"
  | "usageDelta"
  | "floor"
  | "favorable"

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
      view: "head-to-head" as const,
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
    key: "averageWinRate",
    direction: "desc",
  })
  const availableUsage = data.rows.filter((row) => row.usage !== null)
  const usageReference = availableUsage.length === 0 ? null : 100 / availableUsage.length
  const pointData = data.rows.flatMap((row) => {
    const character = meta.characters.find((item) => item.id === row.characterId)
    return row.averageWinRate === null || row.usage === null
      ? []
      : [
          {
            characterId: row.characterId,
            name: character?.name ?? row.characterId,
            averageWinRate: row.averageWinRate,
            usage: row.usage,
            weightedAverageWinRate: row.weightedAverageWinRate,
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
          averageWinRate: [left.averageWinRate, right.averageWinRate],
          weightedAverageWinRate: [left.weightedAverageWinRate, right.weightedAverageWinRate],
          weightCoverage: [left.weightCoverage, right.weightCoverage],
          usage: [left.usage, right.usage],
          averageWinRateDelta: [left.averageWinRateDelta, right.averageWinRateDelta],
          usageDelta: [left.usageDelta, right.usageDelta],
          floor: [left.floor, right.floor],
          favorable: [left.favorableCount, right.favorableCount],
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
            label: "Win rate spread",
            value: (
              <MetricValue value={data.summary.averageWinRateSpread} format="percentagePoints" />
            ),
          },
          {
            label: "Effective roster size",
            value: <MetricValue value={data.summary.effectiveRosterSize} format="number" />,
          },
          {
            label: "Top-five usage",
            value: <MetricValue value={data.summary.topFiveShare} format="percent" />,
          },
          {
            label: "Usage weight coverage",
            value: <MetricValue value={data.summary.usageCoverage} format="coverage" />,
          },
        ]}
      />
      <AnalyticsPanel
        title="Average win rate and popularity"
        description="Characters to the right have a higher average win rate; characters higher on the chart have a larger usage share. Dashed lines mark 50% average win rate and equal-share popularity."
      >
        <AverageWinRatePopularityChart data={pointData} usageReference={usageReference} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Character snapshot"
        description="Weighted average win rate uses opponent popularity where both the matchup and opponent usage are available."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              {head("Character", "character")}
              {head("Average win rate", "averageWinRate")}
              {head("Weighted average win rate", "weightedAverageWinRate")}
              {head("Weight coverage", "weightCoverage")}
              {head("Usage", "usage")}
              {head("Win rate change", "averageWinRateDelta")}
              {head("Usage change", "usageDelta")}
              {head("Worst matchup", "floor")}
              {head("Favorable", "favorable")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <CharacterMatchupLink period={period} rank={rank} characterId={row.characterId} />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.averageWinRate} format="percent" tone="winRate" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.weightedAverageWinRate} format="percent" tone="winRate" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.weightCoverage} format="coverage" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.usage} format="percent" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue
                    value={row.averageWinRateDelta}
                    format="percentagePoints"
                    tone="directional"
                    signed
                  />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.usageDelta} format="percentagePoints" signed />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.floor} format="percent" tone="winRate" />
                </TableCell>
                <TableCell className="text-right font-mono">
                  {row.favorableCount} / {row.possibleCount}
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
