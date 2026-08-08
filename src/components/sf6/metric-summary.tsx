import type { ReactNode } from "react"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"

type SummaryItem = {
  label: string
  value: ReactNode
  description?: string
}

const MetricSummary = ({
  title,
  description,
  items,
}: {
  title: string
  description?: ReactNode
  items: readonly SummaryItem[]
}) => (
  <AnalyticsPanel title={title} description={description}>
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-lg font-semibold tracking-tight">{item.value}</dd>
          {item.description === undefined ? null : (
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
          )}
        </div>
      ))}
    </dl>
  </AnalyticsPanel>
)

export { MetricSummary, type SummaryItem }
