import type { LeagueId } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"

import { SelectField } from "@/components/sf6/filters/select-field"
import { LeagueIdSchema } from "@/lib/sf6/model"

const RankField = ({
  value,
  leagues,
  onChange,
}: {
  value: LeagueId
  leagues: MetaData["leagues"]
  onChange: (value: LeagueId) => void
}) => (
  <SelectField
    label="Rank"
    value={value}
    options={leagues.map((league) => {
      return { value: league.id, label: league.label }
    })}
    onChange={(next) => {
      onChange(LeagueIdSchema.parse(next))
    }}
  />
)

export { RankField }
