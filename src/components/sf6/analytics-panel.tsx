import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AnalyticsPanelProps = {
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

const AnalyticsPanel = ({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: AnalyticsPanelProps) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-start justify-between gap-3">
      <div className="min-w-0">
        <CardTitle>{title}</CardTitle>
        {description === undefined ? null : <CardDescription>{description}</CardDescription>}
      </div>
      {action}
    </CardHeader>
    <CardContent className={cn(contentClassName)}>{children}</CardContent>
  </Card>
)

export { AnalyticsPanel }
