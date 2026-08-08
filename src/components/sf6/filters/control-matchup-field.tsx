import type { ControlMatchup } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"

import { SelectField } from "@/components/sf6/filters/select-field"
import { ControlMatchupSchema } from "@/lib/sf6/model"
import { MASTER_SUBDIVISION_COMBINED_CONTROLS } from "@/lib/sf6/presentation"

const ControlMatchupField = ({
  label = "Control matchup",
  value,
  controls,
  onChange,
  description,
  disabled = false,
}: {
  label?: string
  value: ControlMatchup
  controls: MetaData["controls"]
  onChange: (value: ControlMatchup) => void
  description?: string
  disabled?: boolean
}) => (
  <SelectField
    label={label}
    value={value}
    options={controls.map((control) => {
      return { value: control.id, label: control.label }
    })}
    onChange={(next) => {
      onChange(ControlMatchupSchema.parse(next))
    }}
    description={disabled ? MASTER_SUBDIVISION_COMBINED_CONTROLS : description}
    disabled={disabled}
  />
)

export { ControlMatchupField }
