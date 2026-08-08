import { useMemo, useState } from "react"

import type { ChangeExplorerData } from "@/lib/sf6/query-options"

import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { DeltaMetric, MetricValue } from "@/components/sf6/metric-value"
import { SortableTableHead } from "@/components/sf6/sortable-table-head"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"

type ChangeRow = ChangeExplorerData["rows"][number]
type ChangeSortKey =
  | "character"
  | "performanceDelta"
  | "beforePerformance"
  | "performance"
  | "weightedPerformanceDelta"
  | "beforeWeightedPerformance"
  | "weightedPerformance"
  | "weightCoverage"
  | "usageDelta"
  | "beforeUsage"
  | "usage"
  | "debut"

const getValue = (row: ChangeRow, key: ChangeSortKey): number | string => {
  if (key === "character") {
    return row.characterId
  }
  if (key === "debut") {
    return row.debut ? 1 : 0
  }
  return row[key] ?? -Infinity
}

const ChangeCharacterTable = ({ rows }: { rows: readonly ChangeRow[] }) => {
  const [sort, setSort] = useState<{ key: ChangeSortKey; direction: "asc" | "desc" }>({
    key: "performanceDelta",
    direction: "desc",
  })
  const sortedRows = useMemo(
    () =>
      rows.toSorted((left, right) => {
        const leftValue = getValue(left, sort.key)
        const rightValue = getValue(right, sort.key)
        const result =
          typeof leftValue === "string" && typeof rightValue === "string"
            ? leftValue.localeCompare(rightValue)
            : Number(leftValue) - Number(rightValue)
        return sort.direction === "asc" ? result : -result
      }),
    [rows, sort],
  )
  const changeSort = (key: ChangeSortKey) => {
    setSort((current) => {
      return {
        key,
        direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
      }
    })
  }
  const head = (label: string, key: ChangeSortKey) => (
    <SortableTableHead
      label={label}
      active={sort.key === key}
      direction={sort.direction}
      onClick={() => {
        changeSort(key)
      }}
      className="text-right [&>button]:w-full [&>button]:justify-end"
    />
  )

  return (
    <Table className="min-w-max">
      <TableHeader>
        <TableRow>
          <SortableTableHead
            label="Character"
            active={sort.key === "character"}
            direction={sort.direction}
            onClick={() => {
              changeSort("character")
            }}
          />
          {head("Performance change", "performanceDelta")}
          {head("Before performance", "beforePerformance")}
          {head("After performance", "performance")}
          {head("Weighted performance change", "weightedPerformanceDelta")}
          {head("Before weighted", "beforeWeightedPerformance")}
          {head("After weighted", "weightedPerformance")}
          {head("Weight coverage", "weightCoverage")}
          {head("Usage change", "usageDelta")}
          {head("Before usage", "beforeUsage")}
          {head("After usage", "usage")}
          {head("Debut in later period", "debut")}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedRows.map((row) => (
          <TableRow key={row.characterId}>
            <TableCell>
              <div className="flex items-center gap-2">
                <CharacterBadge characterId={row.characterId} size="small" />
                <CharacterName characterId={row.characterId} />
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DeltaMetric value={row.performanceDelta} />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.beforePerformance} kind="winRate" />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.performance} kind="winRate" />
            </TableCell>
            <TableCell className="text-right">
              <DeltaMetric value={row.weightedPerformanceDelta} />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.beforeWeightedPerformance} kind="winRate" />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.weightedPerformance} kind="winRate" />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.weightCoverage} kind="coverage" />
            </TableCell>
            <TableCell className="text-right">
              <DeltaMetric value={row.usageDelta} />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.beforeUsage} kind="usage" />
            </TableCell>
            <TableCell className="text-right">
              <MetricValue value={row.usage} kind="usage" />
            </TableCell>
            <TableCell>{row.debut ? "Yes" : "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { ChangeCharacterTable }
