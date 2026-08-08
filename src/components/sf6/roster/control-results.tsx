import type { MetaData, RosterOverviewData } from "@/lib/sf6/query-options"

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

type ControlsData = Extract<RosterOverviewData, { mode: "controls" }>

const ControlResults = ({ data, meta }: { data: ControlsData; meta: MetaData }) => {
  if (!data.supported) {
    return (
      <Alert>
        <AlertTitle>Control comparison unavailable</AlertTitle>
        <AlertDescription>
          Master subdivision snapshots combine all control styles. Choose All Master or a standard
          rank to compare Classic and Modern players.
        </AlertDescription>
      </Alert>
    )
  }
  const chartRows = data.rows.flatMap((row) =>
    row.performanceDelta === null || row.usageDelta === null
      ? []
      : [
          {
            name:
              meta.characters.find((character) => character.id === row.characterId)?.short ??
              row.characterId,
            performanceDelta: row.performanceDelta,
            usageDelta: row.usageDelta,
          },
        ],
  )
  return (
    <div className="flex flex-col gap-4">
      <AnalyticsPanel
        title="Modern minus Classic"
        description="Positive values mean the character's average performance is higher when the player uses Modern controls."
      >
        <ControlDeltaChart data={chartRows} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Control-style results"
        description="Performance compares player control while averaging both opponent control styles. Usage is the character's share among players using that control style."
        contentClassName="p-0"
      >
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

export { ControlResults }
