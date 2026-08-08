import type { ControlMatchup } from "@/lib/sf6/model"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { MetricValue } from "@/components/sf6/metric-value"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ControlMatchupRow = {
  controlMatchup: Exclude<ControlMatchup, "combined">
  label: string
  winRate: number | null
}

const ControlMatchupResults = ({ rows }: { rows: readonly ControlMatchupRow[] }) => (
  <AnalyticsPanel
    title="Reported win rate by control pairing"
    description="Each row is the reported result for this exact player-control and opponent-control pairing."
  >
    {rows.length === 0 ? (
      <Empty className="min-h-32">
        <EmptyHeader>
          <EmptyTitle>No data available for this rank</EmptyTitle>
          <EmptyDescription>
            Master subdivisions report all control styles together, not separate pairings.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Control pairing</TableHead>
            <TableHead scope="col" className="text-right">
              Win rate
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((control) => (
            <TableRow key={control.controlMatchup}>
              <TableCell>{control.label}</TableCell>
              <TableCell className="text-right">
                <MetricValue value={control.winRate} kind="winRate" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </AnalyticsPanel>
)

export { ControlMatchupResults }
