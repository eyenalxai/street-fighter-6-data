import type { CharacterExplorerData, MetaData, RosterOverviewData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { ControlDeltaChart } from "@/components/sf6/charts/control-delta-chart"
import { MetricValue } from "@/components/sf6/metric-value"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type ControlData =
  | Extract<RosterOverviewData, { view: "controls" }>
  | Extract<CharacterExplorerData, { view: "controls" }>

type ControlComparisonResultsProps = {
  data: ControlData
  meta: MetaData
  chartTitle: string
  chartDescription: string
  tableTitle: string
  tableDescription?: string
  unsupportedDescription: string
}

const ControlComparisonResults = ({
  data,
  meta,
  chartTitle,
  chartDescription,
  tableTitle,
  tableDescription,
  unsupportedDescription,
}: ControlComparisonResultsProps) => {
  if (!data.supported) {
    return (
      <Alert>
        <AlertTitle>Control comparison unavailable</AlertTitle>
        <AlertDescription>{unsupportedDescription}</AlertDescription>
      </Alert>
    )
  }
  const chartRows = data.rows.flatMap((row) =>
    row.averageWinRateDelta === null || row.usageDelta === null
      ? []
      : [
          {
            name:
              meta.characters.find((character) => character.id === row.characterId)?.short ??
              row.characterId,
            averageWinRateDelta: row.averageWinRateDelta,
            usageDelta: row.usageDelta,
          },
        ],
  )
  return (
    <div className="flex flex-col gap-4">
      <AnalyticsPanel title={chartTitle} description={chartDescription}>
        <ControlDeltaChart data={chartRows} />
      </AnalyticsPanel>
      <AnalyticsPanel title={tableTitle} description={tableDescription} contentClassName="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Character</TableHead>
              <TableHead className="text-right">Classic win rate</TableHead>
              <TableHead className="text-right">Modern win rate</TableHead>
              <TableHead className="text-right">Win rate change</TableHead>
              <TableHead className="text-right">Classic usage</TableHead>
              <TableHead className="text-right">Modern usage</TableHead>
              <TableHead className="text-right">Usage delta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.classic} format="percent" tone="winRate" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.modern} format="percent" tone="winRate" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.averageWinRateDelta} format="percentagePoints" signed />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.classicUsage} format="percent" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.modernUsage} format="percent" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.usageDelta} format="percentagePoints" signed />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { ControlComparisonResults }
