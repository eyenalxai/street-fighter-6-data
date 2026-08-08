import type { ReactNode } from "react"

import { ChartContainer } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const ANALYTICS_CHART_MARGIN = { top: 8, right: 16, left: -12, bottom: 24 }
const ANALYTICS_AXIS_TICK = { fontSize: 10, fill: "var(--muted-foreground)" }
const ANALYTICS_X_AXIS_TICK = { fontSize: 9, fill: "var(--muted-foreground)" }
const DEFAULT_CHART_DIMENSION = { width: 640, height: 300 }

type AnalyticsChartProps = {
  config: Parameters<typeof ChartContainer>[0]["config"]
  children: ReactNode
  className?: string
  initialDimension?: { width: number; height: number }
}

const AnalyticsChart = ({
  config,
  children,
  className,
  initialDimension = DEFAULT_CHART_DIMENSION,
}: AnalyticsChartProps) => (
  <ChartContainer
    config={config}
    initialDimension={initialDimension}
    className={cn("min-h-[280px] w-full", className)}
  >
    {children}
  </ChartContainer>
)

export { ANALYTICS_AXIS_TICK, ANALYTICS_CHART_MARGIN, ANALYTICS_X_AXIS_TICK, AnalyticsChart }
