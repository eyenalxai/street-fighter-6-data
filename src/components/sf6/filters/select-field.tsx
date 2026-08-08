import { useId } from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectOption = { value: string; label: string }
type SelectGroupOption = { label: string; options: readonly SelectOption[] }
const EMPTY_OPTIONS: readonly SelectOption[] = []
const EMPTY_GROUPS: readonly SelectGroupOption[] = []
type SelectFieldProps = {
  label: string
  value: string
  options?: readonly SelectOption[]
  groups?: readonly SelectGroupOption[]
  onChange: (value: string) => void
  description?: string
  disabled?: boolean
}

const SelectField = ({
  label,
  value,
  options = EMPTY_OPTIONS,
  groups = EMPTY_GROUPS,
  onChange,
  description,
  disabled = false,
}: SelectFieldProps) => {
  const id = useId()
  const hasGroups = groups.length > 0
  const allOptions = hasGroups ? groups.flatMap((group) => group.options) : options

  return (
    <Field data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={allOptions}
        value={value}
        disabled={disabled}
        onValueChange={(nextValue) => {
          if (nextValue !== null) {
            onChange(nextValue)
          }
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hasGroups ? (
            groups.map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          ) : (
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
      {description === undefined ? null : <FieldDescription>{description}</FieldDescription>}
    </Field>
  )
}

export { SelectField }
