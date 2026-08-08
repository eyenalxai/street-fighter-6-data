import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
  <Card size="sm">
    <CardHeader className="gap-0.5 pb-0">
      <CardTitle>{title}</CardTitle>
      {description === undefined ? null : <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="pt-3">
      <dl className="flex flex-wrap gap-x-6 gap-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="whitespace-nowrap text-xs text-muted-foreground">{item.label}</dt>
            <dd className="mt-0.5 text-base font-semibold tracking-tight">{item.value}</dd>
            {item.description === undefined ? null : (
              <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
)

export { MetricSummary, type SummaryItem }
