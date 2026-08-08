import type { CharacterId, ControlMatchup, ReportingPeriod } from "@/lib/sf6/model"
import type { MatchupExplorerData, MetaData } from "@/lib/sf6/query-options"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge } from "@/components/sf6/character-badge"
import { ControlMatchupResults } from "@/components/sf6/control-matchup-results"
import { MetricValue } from "@/components/sf6/metric-value"
import { formatReportingPeriod, getCharacterName } from "@/lib/sf6/model"
import { getControlLabel } from "@/lib/sf6/presentation"

type HeadToHeadData = Extract<MatchupExplorerData, { view: "head-to-head" }>

const HeadToHeadResults = ({
  data,
  meta,
  period,
  controls,
  character,
  opponent,
}: {
  data: HeadToHeadData
  meta: MetaData
  period: ReportingPeriod
  controls: ControlMatchup
  character: CharacterId
  opponent: CharacterId
}) => (
  <div className="flex flex-col gap-4">
    <AnalyticsPanel
      title="Head to head"
      description={`${getCharacterName(character)} vs ${getCharacterName(opponent)} · ${formatReportingPeriod(period)} · ${getControlLabel(meta.controls, controls)}`}
    >
      <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-3">
          <CharacterBadge characterId={character} />
          <div>
            <p className="font-medium">{getCharacterName(character)}</p>
            <p className="text-xs text-muted-foreground">
              Usage share <MetricValue value={data.playerUsage} format="percent" />
            </p>
          </div>
        </div>
        <MetricValue
          value={data.headToHead.winRate}
          format="percent"
          tone="winRate"
          className="text-center text-4xl font-semibold"
        />
        <div className="flex items-center justify-end gap-3 text-right">
          <div>
            <p className="font-medium">{getCharacterName(opponent)}</p>
            <p className="text-xs text-muted-foreground">
              Usage share <MetricValue value={data.opponentUsage} format="percent" />
            </p>
          </div>
          <CharacterBadge characterId={opponent} />
        </div>
      </div>
    </AnalyticsPanel>
    <ControlMatchupResults rows={data.controlMatchups} />
  </div>
)

export { HeadToHeadResults }
