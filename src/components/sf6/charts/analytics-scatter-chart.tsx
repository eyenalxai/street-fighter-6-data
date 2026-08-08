import type { ComponentProps, ReactNode } from "react"

import { CartesianGrid, ScatterChart, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart-container"
import type { ChartValueFormat } from "@/lib/sf6/charts/format"

import {
  AnalyticsChart,
  ANALYTICS_AXIS_PROPS,
  ANALYTICS_AXIS_TICK,
  ANALYTICS_CHART_MARGIN,
  ANALYTICS_SCATTER_X_AXIS_HEIGHT,
  ANALYTICS_X_AXIS_TICK_MARGIN,
  ANALYTICS_Y_AXIS_TICK_MARGIN,
  ANALYTICS_Y_AXIS_TICK_WIDTH,
} from "@/components/sf6/charts/analytics-chart"
import { CHART_TICK_FORMATTERS } from "@/lib/sf6/charts/format"

type AnalyticsScatterChartProps = {
  config: ChartConfig
  valueFormat: ChartValueFormat
  xDataKey: string
  xDomain: ComponentProps<typeof XAxis>["domain"]
  xName: string
  yDataKey: string
  yDomain: ComponentProps<typeof YAxis>["domain"]
  yName: string
  children: ReactNode
}

const AnalyticsScatterChart = ({
  config,
  valueFormat,
  xDataKey,
  xDomain,
  xName,
  yDataKey,
  yDomain,
  yName,
  children,
}: AnalyticsScatterChartProps) => {
  const tickFormatter = CHART_TICK_FORMATTERS[valueFormat]
  return (
    <AnalyticsChart config={config} size="default">
      <ScatterChart accessibilityLayer margin={ANALYTICS_CHART_MARGIN}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis
          {...ANALYTICS_AXIS_PROPS}
          type="number"
          dataKey={xDataKey}
          domain={xDomain}
          name={xName}
          height={ANALYTICS_SCATTER_X_AXIS_HEIGHT}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={tickFormatter}
          tickMargin={ANALYTICS_X_AXIS_TICK_MARGIN}
        />
        <YAxis
          {...ANALYTICS_AXIS_PROPS}
          type="number"
          dataKey={yDataKey}
          domain={yDomain}
          name={yName}
          width={ANALYTICS_Y_AXIS_TICK_WIDTH}
          tick={ANALYTICS_AXIS_TICK}
          tickFormatter={tickFormatter}
          tickMargin={ANALYTICS_Y_AXIS_TICK_MARGIN}
        />
        {children}
      </ScatterChart>
    </AnalyticsChart>
  )
}

export { AnalyticsScatterChart }
