import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftRight } from "lucide-react"

import type { CharacterId, LeagueId, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { MatchupSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge } from "@/components/sf6/character-badge"
import { CharacterField } from "@/components/sf6/filters/character-field"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { OpponentMatchupTable } from "@/components/sf6/opponent-matchup-table"
import { ResultsStatus } from "@/components/sf6/results-status"
import { WinRate } from "@/components/sf6/win-rate"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCharacterName, formatReportingPeriod } from "@/lib/sf6/model"
import { matchupsQueryOptions } from "@/lib/sf6/query-options"

type MatchupAnalysisViewProps = {
  period: ReportingPeriod
  search: MatchupSearch
  meta: MetaData
}

const MatchupAnalysisResults = ({ period, search, meta }: MatchupAnalysisViewProps) => {
  const { data } = useSuspenseQuery(
    matchupsQueryOptions({
      period,
      league: search.league,
      character: search.character,
      opponent: search.opponent,
      opponentListControls: search.opponentListControls,
    }),
  )
  const characterName = getCharacterName(search.character)
  const opponentName = getCharacterName(search.opponent)
  const statusLabel =
    data.headToHead.status === "mirror"
      ? "Mirror matchup"
      : data.headToHead.status === "unavailable"
        ? "No reported win rate"
        : "Combined win rate"
  const controlLabel =
    meta.controls.find((control) => control.id === search.opponentListControls)?.label ??
    search.opponentListControls

  return (
    <>
      <ResultsStatus />
      <AnalyticsPanel
        title="Head to head"
        description={`${characterName} vs ${opponentName} · ${statusLabel} · ${formatReportingPeriod(period)}`}
      >
        <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-3">
            <CharacterBadge characterId={search.character} />
            <div>
              <p className="font-medium">{characterName}</p>
              <p className="text-xs text-muted-foreground">Selected character</p>
            </div>
          </div>
          <div className="text-center">
            <WinRate value={data.headToHead.winRate} className="text-4xl font-semibold" />
            <p className="text-xs text-muted-foreground">{characterName} win rate</p>
          </div>
          <div className="flex items-center justify-end gap-3 text-right">
            <div>
              <p className="font-medium">{opponentName}</p>
              <p className="text-xs text-muted-foreground">Opponent</p>
            </div>
            <CharacterBadge characterId={search.opponent} />
          </div>
        </div>
      </AnalyticsPanel>

      <AnalyticsPanel
        title="Reported win rate by control pairing"
        description="Each row is the reported result for this exact player-control and opponent-control pairing. A dash means Buckler did not report that pairing."
      >
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
            {data.controlMatchups.map((control) => (
              <TableRow key={control.controlMatchup}>
                <TableCell>{control.label}</TableCell>
                <TableCell className="text-right">
                  <WinRate value={control.winRate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AnalyticsPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <OpponentMatchupTable
          title="Best opponent matchups"
          description={`Highest reported win rates for ${characterName} against other characters · ${controlLabel}`}
          rows={data.best}
        />
        <OpponentMatchupTable
          title="Worst opponent matchups"
          description={`Lowest reported win rates for ${characterName} against other characters · ${controlLabel}`}
          rows={data.worst}
        />
      </div>
    </>
  )
}

const MatchupListContext = ({
  value,
  controls,
  onChange,
}: {
  value: MatchupSearch["opponentListControls"]
  controls: MetaData["controls"]
  onChange: (value: MatchupSearch["opponentListControls"]) => void
}) => (
  <section className="border border-border bg-background px-4 py-3">
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-semibold tracking-tight">Opponent list controls</h2>
      <p className="text-xs text-muted-foreground">
        Choose the player/opponent control pairing used to rank the best and worst opponent matchups
        below. The combined head-to-head result is unchanged.
      </p>
    </div>
    <FieldGroup className="mt-3 max-w-md">
      <ControlMatchupField
        label="Control pairing for opponent lists"
        value={value}
        controls={controls}
        onChange={onChange}
      />
    </FieldGroup>
  </section>
)

const MatchupAnalysisView = ({ period, search, meta }: MatchupAnalysisViewProps) => {
  const navigate = useNavigate({ from: "/matchups" })
  const change = (
    changes: Partial<{
      period: ReportingPeriod
      league: LeagueId
      character: CharacterId
      opponent: CharacterId
      opponentListControls: MatchupSearch["opponentListControls"]
    }>,
  ) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const swap = () => {
    void navigate({
      search: {
        ...search,
        character: search.opponent,
        opponent: search.character,
      },
      replace: true,
    })
  }
  const toolbar = (
    <AnalysisToolbar
      title="Head-to-head"
      description="What is the reported win rate for one character against another?"
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
      <CharacterField
        label="Character"
        value={search.character}
        characters={meta.characters}
        onChange={(value) => {
          change({ character: value })
        }}
      />
      <CharacterField
        label="Opponent"
        value={search.opponent}
        characters={meta.characters}
        onChange={(value) => {
          change({ opponent: value })
        }}
      />
      <Button type="button" variant="outline" size="default" onClick={swap} className="self-end">
        <ArrowLeftRight data-icon="inline-start" />
        Swap sides
      </Button>
    </AnalysisToolbar>
  )

  return (
    <AnalysisPage
      toolbar={toolbar}
      beforeResults={
        <MatchupListContext
          value={search.opponentListControls}
          controls={meta.controls}
          onChange={(value) => {
            change({ opponentListControls: value })
          }}
        />
      }
      resetKey={`${period}|${search.league}|${search.character}|${search.opponent}|${search.opponentListControls}`}
      skeleton="matchup"
    >
      <MatchupAnalysisResults period={period} search={search} meta={meta} />
    </AnalysisPage>
  )
}

export { MatchupAnalysisView }
