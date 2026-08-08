import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ViewOption<T extends string> = {
  value: T
  label: string
}

type AnalysisViewTabsProps<T extends string> = {
  value: T
  options: readonly ViewOption<T>[]
  onChange: (value: T) => void
  "aria-label": string
}

const AnalysisViewTabs = <T extends string>({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
}: AnalysisViewTabsProps<T>) => (
  <Tabs
    value={value}
    onValueChange={(next) => {
      if (typeof next !== "string") {
        return
      }
      const option = options.find((candidate) => candidate.value === next)
      if (option !== undefined) {
        onChange(option.value)
      }
    }}
  >
    <div className="max-w-full overflow-x-auto overflow-y-hidden">
      <TabsList variant="line" aria-label={ariaLabel} className="w-max">
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  </Tabs>
)

export { AnalysisViewTabs, type ViewOption }
