import type { ReactNode } from "react"

import { ChartContainer } from "@/components/ui/chart-container"
import { cn } from "@/lib/utils"

const ANALYTICS_AXIS_TICK = {
  fontSize: 10,
  fill: "var(--muted-foreground)",
}
const ANALYTICS_X_AXIS_TICK = { fontSize: 9, fill: "var(--muted-foreground)" }
// Recharts auto width adds a horizontal axis-label bounding box to tick width.
// Keep this numeric and never render XAxis/YAxis label props in analytics charts.
const ANALYTICS_Y_AXIS_TICK_WIDTH = 44
const ANALYTICS_X_AXIS_TICK_MARGIN = 4
const ANALYTICS_Y_AXIS_TICK_MARGIN = 2
const ANALYTICS_ANGLED_X_AXIS_HEIGHT = 48
const ANALYTICS_SCATTER_X_AXIS_HEIGHT = 30
const ANALYTICS_X_AXIS_MIN_TICK_GAP = 8
const ANALYTICS_CHART_MARGIN = {
  top: 8,
  right: 8,
  bottom: 4,
  left: 0,
} as const
const ANALYTICS_AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
} as const
const ANALYTICS_LINE_CHART_LEGEND_PROPS = {
  verticalAlign: "top" as const,
  align: "right" as const,
}
const DEFAULT_CHART_DIMENSION = { width: 640, height: 300 }
const CHART_SIZE_CLASSES = {
  compact: "h-64 sm:h-72",
  default: "h-72 sm:h-80",
  fill: "min-h-64 flex-1 h-full sm:min-h-72",
} as const

type AnalyticsChartProps = {
  config: Parameters<typeof ChartContainer>[0]["config"]
  children: ReactNode
  className?: string
  initialDimension?: { width: number; height: number }
  size?: keyof typeof CHART_SIZE_CLASSES
}

const AnalyticsChart = ({
  config,
  children,
  className,
  initialDimension = DEFAULT_CHART_DIMENSION,
  size = "default",
}: AnalyticsChartProps) => (
  <ChartContainer
    config={config}
    initialDimension={initialDimension}
    className={cn("aspect-auto min-w-0 w-full", CHART_SIZE_CLASSES[size], className)}
  >
    {children}
  </ChartContainer>
)

export {
  ANALYTICS_ANGLED_X_AXIS_HEIGHT,
  ANALYTICS_AXIS_PROPS,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_CHART_MARGIN,
  ANALYTICS_LINE_CHART_LEGEND_PROPS,
  ANALYTICS_SCATTER_X_AXIS_HEIGHT,
  ANALYTICS_X_AXIS_MIN_TICK_GAP,
  ANALYTICS_X_AXIS_TICK,
  ANALYTICS_X_AXIS_TICK_MARGIN,
  ANALYTICS_Y_AXIS_TICK_MARGIN,
  ANALYTICS_Y_AXIS_TICK_WIDTH,
  AnalyticsChart,
}
