import type { ReportingPeriod } from "@/lib/sf6/model"

import { SelectField } from "@/components/sf6/filters/select-field"
import { formatReportingPeriod } from "@/lib/sf6/model"

const ReportingPeriodField = ({
  label = "Reporting period",
  value,
  periods,
  onChange,
}: {
  label?: string
  value: ReportingPeriod
  periods: readonly ReportingPeriod[]
  onChange: (value: ReportingPeriod) => void
}) => (
  <SelectField
    label={label}
    value={value}
    options={periods.toReversed().map((period) => {
      return { value: period, label: formatReportingPeriod(period) }
    })}
    onChange={(next) => {
      onChange(next)
    }}
  />
)

export { ReportingPeriodField }
