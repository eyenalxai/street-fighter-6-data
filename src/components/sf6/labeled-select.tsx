import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

type SelectOption = {
  value: string
  label: string
}

type LabeledSelectProps = {
  label: string
  value: string
  options: readonly SelectOption[]
  onChange: (value: string) => void
}

const LabeledSelect = ({ label, value, options, onChange }: LabeledSelectProps) => (
  <label className="flex min-w-0 flex-col gap-1">
    <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
    <NativeSelect
      value={value}
      onChange={(event) => {
        onChange(event.currentTarget.value)
      }}
      className="w-full"
    >
      {options.map((option) => (
        <NativeSelectOption key={option.value} value={option.value}>
          {option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  </label>
)

export { LabeledSelect, type SelectOption }
