import type { ReactNode } from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AnalyticsPanelProps = {
  title: string
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  size?: "default" | "sm"
}

const AnalyticsPanel = ({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  size = "sm",
}: AnalyticsPanelProps) => (
  <Card className={className} size={size}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description === undefined ? null : <CardDescription>{description}</CardDescription>}
      {action === undefined ? null : <CardAction>{action}</CardAction>}
    </CardHeader>
    <CardContent className={cn(contentClassName)}>{children}</CardContent>
  </Card>
)

export { AnalyticsPanel }
