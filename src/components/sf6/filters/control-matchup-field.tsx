import type { ControlMatchup } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"

import { SelectField } from "@/components/sf6/filters/select-field"
import { ControlMatchupSchema } from "@/lib/sf6/model"

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
    description={
      disabled ? "Master subdivisions include all control styles together." : description
    }
    disabled={disabled}
  />
)

export { ControlMatchupField }
