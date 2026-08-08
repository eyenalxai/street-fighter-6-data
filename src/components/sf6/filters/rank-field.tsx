import type { MetaData } from "@/lib/sf6/query-options"
import type { RankId } from "@/lib/sf6/ranks"

import { SelectField } from "@/components/sf6/filters/select-field"
import { RankIdSchema } from "@/lib/sf6/ranks"

const RankField = ({
  value,
  ranks,
  onChange,
}: {
  value: RankId
  ranks: MetaData["ranks"]
  onChange: (value: RankId) => void
}) => (
  <SelectField
    label="Rank"
    value={value}
    groups={[
      {
        label: "Ranks",
        options: ranks
          .filter((rank) => rank.id !== "all-master" && rank.group === "standard")
          .map((rank) => {
            return { value: rank.id, label: rank.label }
          }),
      },
      {
        label: "Master",
        options: ranks
          .filter((rank) => rank.group === "master")
          .map((rank) => {
            return { value: rank.id, label: rank.label }
          }),
      },
    ]}
    onChange={(next) => {
      onChange(RankIdSchema.parse(next))
    }}
  />
)

export { RankField }
