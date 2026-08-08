import { useNavigate } from "@tanstack/react-router"

import type { CharacterId, ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"
import type { CounterpickSearch } from "@/lib/sf6/search"

import { AnalysisPage } from "@/components/sf6/analysis-page"
import { AnalysisToolbar } from "@/components/sf6/analysis-toolbar"
import { CounterpickResults } from "@/components/sf6/counterpicks/results"
import { CharacterMultiField } from "@/components/sf6/filters/character-multi-field"
import { ControlMatchupField } from "@/components/sf6/filters/control-matchup-field"
import { RankField } from "@/components/sf6/filters/rank-field"
import { ReportingPeriodField } from "@/components/sf6/filters/reporting-period-field"
import { ResultsContent, ResultsPending } from "@/components/sf6/results-state"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useAnalyticsQuery } from "@/hooks/use-analytics-query"
import { counterpickPlannerQueryOptions } from "@/lib/sf6/query-options"
import { getEffectiveControls, getPeriodsForRank } from "@/lib/sf6/rank-selection"
import { isMasterSubdivisionRank } from "@/lib/sf6/ranks"

type CounterpickPlannerViewProps = {
  period: ReportingPeriod
  search: CounterpickSearch
  meta: MetaData
}
const CounterpickPlannerView = ({ period, search, meta }: CounterpickPlannerViewProps) => {
  const navigate = useNavigate({ from: "/matchups/counterpicks" })
  const change = (
    changes: Partial<{
      period: ReportingPeriod
      rank: RankId
      controls: ControlMatchup
      opponents: CharacterId[]
      order: CounterpickSearch["order"]
    }>,
  ) => {
    void navigate({
      search: (previous) => {
        return { ...previous, ...changes }
      },
      replace: true,
    })
  }
  const controls = getEffectiveControls(search.rank, search.controls)
  const input = {
    period,
    rank: search.rank,
    controls,
    opponents: search.opponents,
    order: search.order,
  }
  const { data, isUpdating } = useAnalyticsQuery(counterpickPlannerQueryOptions(input), input)
  const toolbar = (
    <AnalysisToolbar
      title="Counterpick planner"
      description="Rank complete counterpick candidates by theoretical or popularity-weighted strength."
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
      <ControlMatchupField
        value={controls}
        controls={meta.controls}
        disabled={isMasterSubdivisionRank(search.rank)}
        onChange={(value) => {
          change({ controls: value })
        }}
      />
      <Field>
        <FieldLabel>Order candidates by</FieldLabel>
        <ToggleGroup
          value={[search.order]}
          onValueChange={(value) => {
            const next = value[0]
            if (next === "weighted" || next === "average" || next === "floor") {
              change({ order: next })
            }
          }}
          variant="outline"
          size="sm"
          spacing={0}
          aria-label="Order counterpick candidates"
        >
          <ToggleGroupItem value="weighted">Weighted</ToggleGroupItem>
          <ToggleGroupItem value="average">Average</ToggleGroupItem>
          <ToggleGroupItem value="floor">Floor</ToggleGroupItem>
        </ToggleGroup>
      </Field>
      <CharacterMultiField
        label="Opponents"
        value={search.opponents}
        characters={meta.characters}
        className="sm:col-span-2 xl:col-span-2"
        onChange={(value) => {
          change({ opponents: value })
        }}
        onClear={() => {
          change({ opponents: [] })
        }}
        description="Candidates must have a numeric result against every selected opponent."
      />
    </AnalysisToolbar>
  )
  return (
    <AnalysisPage
      toolbar={toolbar}
      resetKey={`${period}|${search.rank}|${search.controls}|${search.order}|${search.opponents.join(",")}`}
    >
      {search.opponents.length === 0 ? (
        <Empty className="min-h-48 border border-dashed">
          <EmptyHeader>
            <EmptyTitle>Select opponents</EmptyTitle>
            <EmptyDescription>
              Choose one or more opponents to calculate counterpick candidates.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : data === undefined ? (
        <ResultsPending />
      ) : (
        <ResultsContent isUpdating={isUpdating}>
          <CounterpickResults data={data} meta={meta} />
        </ResultsContent>
      )}
    </AnalysisPage>
  )
}

export { CounterpickPlannerView }
