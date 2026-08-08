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
    <div className="grid gap-3 lg:grid-cols-[minmax(12rem,0.75fr)_minmax(0,3fr)] lg:items-center">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description === undefined ? null : <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
      </CardContent>
    </div>
  </Card>
)

export { MetricSummary, type SummaryItem }
