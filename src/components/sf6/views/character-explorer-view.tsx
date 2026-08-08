import { useNavigate } from "@tanstack/react-router"
import * as z from "zod"

import type { PlayerControl, ReportingPeriod, CharacterId } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"
import type { CharacterExplorerSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { CharacterControlResults } from "@/components/sf6/characters/control-results"
import { CharacterRankResults } from "@/components/sf6/characters/rank-results"
import { CharacterTimeResults } from "@/components/sf6/characters/time-results"
import { CharacterMultiField } from "@/components/sf6/filters/character-multi-field"
import { PlayerControlField } from "@/components/sf6/filters/player-control-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ModeTabs } from "@/components/sf6/mode-tabs"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { characterExplorerQueryOptions } from "@/lib/sf6/query-options"
import {
  getEffectivePlayerControl,
  getPeriodsForRank,
  getRankComparisonPeriods,
} from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

type CharacterExplorerViewProps = {
  period: ReportingPeriod
  search: CharacterExplorerSearch
  meta: MetaData
}

const CharacterExplorerView = ({ period, search, meta }: CharacterExplorerViewProps) => {
  const navigate = useNavigate({ from: "/characters" })
  const change = (
    changes: Partial<{
      period: ReportingPeriod
      rank: RankId
      playerControl: PlayerControl
      characters: CharacterId[]
      mode: CharacterExplorerSearch["mode"]
    }>,
  ) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const input = {
    period,
    rank: search.rank,
    playerControl: getEffectivePlayerControl(search.rank, search.playerControl),
    characters: search.characters,
    mode: search.mode,
  }
  const { data, displayedInput, isUpdating } = useAnalyticsQuery(
    characterExplorerQueryOptions(input),
    input,
  )
  const toolbar = (
    <AnalysisToolbar
      title="Character explorer"
      description="Follow selected characters through time, ranks, and player-control populations."
    >
      <ReportingPeriodField
        value={period}
        periods={
          search.mode === "ranks"
            ? getRankComparisonPeriods(meta.periods, meta.subdivisionPeriods)
            : getPeriodsForRank(search.rank, meta.periods, meta.subdivisionPeriods)
        }
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
      <PlayerControlField
        value={input.playerControl}
        controls={meta.playerControls}
        disabled={isMasterSubdivisionRank(search.rank)}
        onChange={(value) => {
          change({ playerControl: value })
        }}
      />
      <ModeTabs
        value={search.mode}
        options={[
          { value: "time", label: "Over time" },
          { value: "ranks", label: "Across ranks" },
          { value: "controls", label: "Control styles" },
        ]}
        onChange={(value) => {
          change({ mode: z.enum(["time", "ranks", "controls"]).parse(value) })
        }}
      />
      <CharacterMultiField
        label="Characters"
        value={search.characters}
        characters={meta.characters}
        className="sm:col-span-2 xl:col-span-2"
        onChange={(value) => {
          change({ characters: value })
        }}
        description="Select up to five characters to compare."
      />
    </AnalysisToolbar>
  )
  return (
    <AnalysisPage
      toolbar={toolbar}
      resetKey={`${period}|${search.rank}|${search.playerControl}|${search.mode}|${search.characters.join(",")}`}
    >
      {data === undefined ? (
        <ResultsPending />
      ) : (
        <ResultsContent isUpdating={isUpdating}>
          {displayedInput.mode === "time" && data.mode === "time" ? (
            <CharacterTimeResults data={data} meta={meta} />
          ) : displayedInput.mode === "ranks" && data.mode === "ranks" ? (
            <CharacterRankResults data={data} meta={meta} />
          ) : data.mode === "controls" ? (
            <CharacterControlResults data={data} meta={meta} />
          ) : null}
        </ResultsContent>
      )}
    </AnalysisPage>
  )
}

export { CharacterExplorerView }
