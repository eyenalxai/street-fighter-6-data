import type { CharacterExplorerData, MetaData } from "@/lib/sf6/query-options"

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

type ControlData = Extract<CharacterExplorerData, { mode: "controls" }>

const CharacterControlResults = ({ data, meta }: { data: ControlData; meta: MetaData }) => {
  if (!data.supported) {
    return (
      <Alert>
        <AlertTitle>Control comparison unavailable</AlertTitle>
        <AlertDescription>
          Master subdivision snapshots contain combined control data only.
        </AlertDescription>
      </Alert>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <AnalyticsPanel
        title="Control performance difference"
        description="Positive values favor Modern player controls for the selected character."
      >
        <ControlDeltaChart
          data={data.rows.flatMap((row) =>
            row.performanceDelta === null || row.usageDelta === null
              ? []
              : [
                  {
                    name:
                      meta.characters.find((character) => character.id === row.characterId)
                        ?.short ?? row.characterId,
                    performanceDelta: row.performanceDelta,
                    usageDelta: row.usageDelta,
                  },
                ],
          )}
        />
      </AnalyticsPanel>
      <AnalyticsPanel title="Selected character control results" contentClassName="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Character</TableHead>
              <TableHead className="text-right">Classic performance</TableHead>
              <TableHead className="text-right">Modern performance</TableHead>
              <TableHead className="text-right">Performance delta</TableHead>
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
                  <MetricValue value={row.performanceDelta} format="percentagePoints" signed />
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

export { CharacterControlResults }
