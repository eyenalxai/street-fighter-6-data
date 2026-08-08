import type { ReactNode } from "react"

import { ChartContainer } from "@/components/ui/chart-container"
import { cn } from "@/lib/utils"

const ANALYTICS_AXIS_LABEL_STYLE = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
} as const
const ANALYTICS_AXIS_TICK = { fontSize: 10, fill: "var(--muted-foreground)" }
const ANALYTICS_X_AXIS_TICK = { fontSize: 9, fill: "var(--muted-foreground)" }
const ANALYTICS_Y_AXIS_WIDTH = 44
const ANALYTICS_Y_AXIS_LABEL_DY = -18
const ANALYTICS_ANGLED_X_AXIS_HEIGHT = 56
const ANALYTICS_LINE_CHART_MARGIN = { top: 40, right: 20, left: 12, bottom: 88 }
const ANALYTICS_SCATTER_CHART_MARGIN = { top: 40, right: 24, left: 12, bottom: 56 }
const ANALYTICS_LINE_CHART_LEGEND_PROPS = {
  verticalAlign: "top" as const,
  align: "right" as const,
  wrapperStyle: { paddingTop: 4 },
}
const DEFAULT_CHART_DIMENSION = { width: 640, height: 300 }

const analyticsXAxisLabel = (value: string, offset = 8) => {
  return {
    value,
    position: "bottom" as const,
    offset,
    style: ANALYTICS_AXIS_LABEL_STYLE,
  }
}

const analyticsAngledXAxisLabel = (value: string) => analyticsXAxisLabel(value, 16)

const analyticsYAxisLabel = (value: string) => {
  return {
    value,
    position: "top" as const,
    offset: 0,
    dy: ANALYTICS_Y_AXIS_LABEL_DY,
    style: { ...ANALYTICS_AXIS_LABEL_STYLE, textAnchor: "start" as const },
  }
}

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
    className={cn("min-h-70 min-w-0 w-full", className)}
  >
    {children}
  </ChartContainer>
)

export {
  ANALYTICS_ANGLED_X_AXIS_HEIGHT,
  ANALYTICS_AXIS_LABEL_STYLE,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_LINE_CHART_LEGEND_PROPS,
  ANALYTICS_LINE_CHART_MARGIN,
  ANALYTICS_SCATTER_CHART_MARGIN,
  ANALYTICS_X_AXIS_TICK,
  ANALYTICS_Y_AXIS_WIDTH,
  analyticsAngledXAxisLabel,
  analyticsXAxisLabel,
  analyticsYAxisLabel,
  AnalyticsChart,
}
