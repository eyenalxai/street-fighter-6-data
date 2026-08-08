import { Link, useNavigate } from "@tanstack/react-router"

import type { LeagueId, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RosterSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { WinRate } from "@/components/sf6/win-rate"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { formatReportingPeriod } from "@/lib/sf6/model"
import { toMatchupSearch } from "@/lib/sf6/navigation"
import { leaderboardQueryOptions } from "@/lib/sf6/query-options"

type LeaderboardViewProps = {
  period: ReportingPeriod
  search: RosterSearch
  meta: MetaData
}

const LeaderboardResults = ({ period, search, meta }: LeaderboardViewProps) => {
  const input = {
    period,
    league: search.league,
    controls: search.controls,
  }
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(
    leaderboardQueryOptions(input),
    input,
  )
  if (data === undefined) {
    return <ResultsPending />
  }
  const leagueLabel =
    meta.leagues.find((league) => league.id === displayedInput.league)?.label ?? "Rank"
  const controlLabel =
    meta.controls.find((control) => control.id === displayedInput.controls)?.label ??
    displayedInput.controls

  return (
    <ResultsContent isUpdating={isUpdating}>
      <AnalyticsPanel
        title="Average win rate vs available opponents"
        description={`Highest average win rate first · ${leagueLabel} · ${controlLabel} · ${formatReportingPeriod(displayedInput.period)}`}
        action={<Badge variant="outline">{data.rows.length} characters</Badge>}
        contentClassName="p-0"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Position</TableHead>
              <TableHead scope="col">Character</TableHead>
              <TableHead scope="col" className="text-right">
                Average win rate
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row, index) => {
              const opponent =
                meta.characters.find((character) => character.id !== row.characterId)?.id ?? "ryu"
              return (
                <TableRow key={row.characterId}>
                  <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <Link
                      to="/matchups"
                      search={toMatchupSearch({
                        period: displayedInput.period,
                        league: displayedInput.league,
                        character: row.characterId,
                        opponent,
                        controls: displayedInput.controls,
                      })}
                      className="inline-flex items-center gap-2 font-medium hover:underline"
                    >
                      <CharacterBadge characterId={row.characterId} size="small" />
                      <CharacterName characterId={row.characterId} />
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <WinRate value={row.winRate} className="font-semibold" />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </AnalyticsPanel>
    </ResultsContent>
  )
}

const LeaderboardView = ({ period, search, meta }: LeaderboardViewProps) => {
  const navigate = useNavigate({ from: "/roster" })
  const change = (
    changes: Partial<{
      period: ReportingPeriod
      league: LeagueId
      controls: RosterSearch["controls"]
    }>,
  ) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }

  const toolbar = (
    <AnalysisToolbar
      title="Roster"
      description="Which characters have the highest average win rate against available opponents?"
    >
      <ReportingPeriodField
        value={period}
        periods={meta.periods}
        onChange={(value) => {
          change({ period: value })
        }}
      />
      <RankField
        value={search.league}
        leagues={meta.leagues}
        onChange={(value) => {
          change({ league: value })
        }}
      />
      <ControlMatchupField
        value={search.controls}
        controls={meta.controls}
        onChange={(value) => {
          change({ controls: value })
        }}
      />
    </AnalysisToolbar>
  )

  return (
    <AnalysisPage toolbar={toolbar} resetKey={`${period}|${search.league}|${search.controls}`}>
      <LeaderboardResults period={period} search={search} meta={meta} />
    </AnalysisPage>
  )
}

export { LeaderboardView }
