import type { CharacterId, ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { MatchupExplorerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { MatchupProfileChart } from "@/components/sf6/charts/matchup-profile-chart"
import { MetricSummary } from "@/components/sf6/metric-summary"
import { MetricValue } from "@/components/sf6/metric-value"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatReportingPeriod, getCharacterName } from "@/lib/sf6/model"

type ProfileData = Extract<MatchupExplorerData, { view: "profile" }>

const MatchupProfileResults = ({
  data,
  meta,
  period,
  controls,
  character,
}: {
  data: ProfileData
  meta: MetaData
  period: ReportingPeriod
  controls: ControlMatchup
  character: CharacterId
}) => {
  const profileChartData = data.profile.flatMap((row) =>
    row.status !== "numeric" || row.winRate === null || row.opponentUsage === null
      ? []
      : [
          {
            name: getCharacterName(row.opponentId),
            usage: row.opponentUsage,
            winRate: row.winRate,
          },
        ],
  )
  return (
    <div className="flex flex-col gap-4">
      <MetricSummary
        title={`${getCharacterName(character)} profile`}
        description={`${formatReportingPeriod(period)} · ${meta.controls.find((control) => control.id === controls)?.label ?? controls}`}
        items={[
          {
            label: "Unweighted average",
            value: (
              <MetricValue value={data.summary.unweightedAverage} format="percent" tone="winRate" />
            ),
          },
          {
            label: "Usage-weighted average",
            value: (
              <MetricValue value={data.summary.weightedAverage} format="percent" tone="winRate" />
            ),
          },
          {
            label: "Worst matchup",
            value: <MetricValue value={data.summary.floor} format="percent" tone="winRate" />,
          },
          {
            label: "Favorable matchups",
            value: `${data.summary.favorableCount} / ${data.summary.possibleCount}`,
          },
          {
            label: "Usage weight coverage",
            value: <MetricValue value={data.summary.weightCoverage} format="coverage" />,
          },
          {
            label: "Top-three lift",
            value: (
              <MetricValue
                value={data.summary.topThreeLift}
                format="percentagePoints"
                tone="directional"
                signed
              />
            ),
          },
          {
            label: "Matchup imbalance",
            value: <MetricValue value={data.summary.matchupImbalance} format="percentagePoints" />,
            description: "Mean absolute distance from 50%.",
          },
        ]}
      />
      <AnalyticsPanel
        title="Opponent popularity and matchup result"
        description="The chart highlights which matchup results matter more in the observed usage environment."
      >
        <MatchupProfileChart data={profileChartData} />
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Full matchup profile"
        description="Unavailable and mirror rows remain visible so incomplete coverage is distinguishable from a poor result."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opponent</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
              <TableHead className="text-right">Opponent usage</TableHead>
              <TableHead className="text-right">Weighted disadvantage contribution</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.profile.map((row) => (
              <TableRow key={row.opponentId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.opponentId} size="small" />
                    <CharacterName characterId={row.opponentId} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.winRate} format="percent" tone="winRate" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue value={row.opponentUsage} format="percent" />
                </TableCell>
                <TableCell className="text-right">
                  <MetricValue
                    value={row.weightedDisadvantageContribution}
                    format="percentagePoints"
                  />
                </TableCell>
                <TableCell className="text-muted-foreground">{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
      <AnalyticsPanel
        title="Similar matchup profiles"
        description="Pearson correlation compares common numeric opponent results; at least five shared opponents are required."
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Character</TableHead>
              <TableHead className="text-right">Correlation</TableHead>
              <TableHead className="text-right">Shared opponents</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.similarProfiles.map((row) => (
              <TableRow key={row.characterId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CharacterBadge characterId={row.characterId} size="small" />
                    <CharacterName characterId={row.characterId} />
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{row.correlation.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">{row.overlap}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </div>
  )
}

export { MatchupProfileResults }
