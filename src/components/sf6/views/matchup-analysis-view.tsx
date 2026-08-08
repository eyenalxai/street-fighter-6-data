import { useNavigate } from "@tanstack/react-router"
import { ArrowLeftRight } from "lucide-react"

import type { CharacterId, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"
import type { MatchupSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge } from "@/components/sf6/character-badge"
import { ControlMatchupResults } from "@/components/sf6/control-matchup-results"
import { CharacterField } from "@/components/sf6/filters/character-field"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { OpponentMatchupTable } from "@/components/sf6/opponent-matchup-table"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { WinRate } from "@/components/sf6/win-rate"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { getCharacterName, formatReportingPeriod } from "@/lib/sf6/model"
import { matchupsQueryOptions } from "@/lib/sf6/query-options"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

type MatchupAnalysisViewProps = {
  period: ReportingPeriod
  search: MatchupSearch
  meta: MetaData
}

const MatchupAnalysisResults = ({ period, search, meta }: MatchupAnalysisViewProps) => {
  const input = {
    period,
    rank: search.rank,
    character: search.character,
    opponent: search.opponent,
    opponentListControls: getEffectiveControls(search.rank, search.opponentListControls),
  }
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(matchupsQueryOptions(input), input)
  if (data === undefined) {
    return <ResultsPending />
  }
  const characterName = getCharacterName(displayedInput.character)
  const opponentName = getCharacterName(displayedInput.opponent)
  const statusLabel =
    data.headToHead.status === "mirror"
      ? "Mirror matchup"
      : data.headToHead.status === "unavailable"
        ? "No reported win rate"
        : "Combined win rate"
  const controlLabel =
    meta.controls.find((control) => control.id === displayedInput.opponentListControls)?.label ??
    displayedInput.opponentListControls

  return (
    <ResultsContent isUpdating={isUpdating}>
      <AnalyticsPanel
        title="Head to head"
        description={`${characterName} vs ${opponentName} · ${statusLabel} · ${formatReportingPeriod(displayedInput.period)}`}
      >
        <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-3">
            <CharacterBadge characterId={displayedInput.character} />
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
            <CharacterBadge characterId={displayedInput.opponent} />
          </div>
        </div>
      </AnalyticsPanel>

      <ControlMatchupResults rows={data.controlMatchups} />

      <div className="grid gap-4 lg:grid-cols-2">
        <OpponentMatchupTable
          title="Best opponent matchups"
          description={`Highest reported win rates for ${characterName} against available opponents · ${controlLabel}`}
          rows={data.best}
        />
        <OpponentMatchupTable
          title="Worst opponent matchups"
          description={`Lowest reported win rates for ${characterName} against available opponents · ${controlLabel}`}
          rows={data.worst}
        />
      </div>
    </ResultsContent>
  )
}

const MatchupListContext = ({
  value,
  controls,
  onChange,
  disabled,
}: {
  value: MatchupSearch["opponentListControls"]
  controls: MetaData["controls"]
  onChange: (value: MatchupSearch["opponentListControls"]) => void
  disabled?: boolean
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
        disabled={disabled}
      />
    </FieldGroup>
  </section>
)

const MatchupAnalysisView = ({ period, search, meta }: MatchupAnalysisViewProps) => {
  const navigate = useNavigate({ from: "/matchups" })
  const change = (
    changes: Partial<{
      period: ReportingPeriod
      rank: RankId
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
        periods={getPeriodsForRank(search.rank, meta.periods, meta.subdivisionPeriods)}
        onChange={(value) => {
          change({ period: value })
        }}
      />
      <RankField
        value={search.rank}
        ranks={meta.ranks}
        onChange={(value) => {
          change({ rank: value })
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
          value={getEffectiveControls(search.rank, search.opponentListControls)}
          controls={meta.controls}
          disabled={isMasterSubdivisionRank(search.rank)}
          onChange={(value) => {
            change({ opponentListControls: value })
          }}
        />
      }
      resetKey={`${period}|${search.rank}|${search.character}|${search.opponent}|${search.opponentListControls}`}
    >
      <MatchupAnalysisResults period={period} search={search} meta={meta} />
    </AnalysisPage>
  )
}

export { MatchupAnalysisView }
