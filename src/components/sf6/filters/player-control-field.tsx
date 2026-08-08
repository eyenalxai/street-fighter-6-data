import type { PlayerControl } from "@/lib/sf6/model"
import type { MetaData } from "@/lib/sf6/query-options"

import { SelectField } from "@/components/sf6/filters/select-field"
import { PlayerControlSchema } from "@/lib/sf6/model"
import { MASTER_SUBDIVISION_COMBINED_CONTROLS } from "@/lib/sf6/presentation"

const PlayerControlField = ({
  value,
  controls,
  onChange,
  disabled = false,
  description,
}: {
  value: PlayerControl
  controls: MetaData["playerControls"]
  onChange: (value: PlayerControl) => void
  disabled?: boolean
  description?: string
}) => (
  <SelectField
    label="Player controls"
    value={value}
    options={controls.map((control) => {
      return { value: control.id, label: control.label }
    })}
    onChange={(next) => {
      onChange(PlayerControlSchema.parse(next))
    }}
    description={description ?? (disabled ? MASTER_SUBDIVISION_COMBINED_CONTROLS : undefined)}
    disabled={disabled}
  />
)

export { PlayerControlField }
