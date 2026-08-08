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
  contentInset?: "default" | "none"
  size?: "default" | "sm"
}

const AnalyticsPanel = ({
  title,
  description,
  action,
  children,
  className,
  contentInset = "default",
  size = "sm",
}: AnalyticsPanelProps) => (
  <Card className={className} size={size}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description === undefined ? null : <CardDescription>{description}</CardDescription>}
      {action === undefined ? null : <CardAction>{action}</CardAction>}
    </CardHeader>
    <CardContent className={cn(contentInset === "none" && "px-0")}>{children}</CardContent>
  </Card>
)

export { AnalyticsPanel }
