import { Field, FieldLabel } from "@/components/ui/field"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ModeTabs = ({
  value,
  options,
  onChange,
}: {
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}) => (
  <Field>
    <FieldLabel>Analysis mode</FieldLabel>
    <Tabs
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") {
          onChange(next)
        }
      }}
    >
      <TabsList variant="line">
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  </Field>
)

export { ModeTabs }
