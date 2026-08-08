type ChartValueFormat = "percent" | "percentagePoints" | "number"

const roundChartValue = (value: number, precision: number): number =>
  Number(value.toFixed(precision))

const precisionForSpan = (span: number): number => {
  if (span >= 20) {
    return 0
  }
  if (span >= 2) {
    return 1
  }
  return 2
}

const formatChartPercentTick = (value: number): string => `${roundChartValue(value, 0)}%`

const formatChartPercent = (value: number | null): string =>
  value === null ? "—" : `${roundChartValue(value, 1)}%`

const formatChartPercentagePointsTick = (value: number): string => `${roundChartValue(value, 0)} pp`

const formatChartPercentagePoints = (value: number | null): string =>
  value === null ? "—" : `${roundChartValue(value, 1)} pp`

const formatChartNumberTick = (value: number): string => roundChartValue(value, 0).toString()

const formatChartNumber = (value: number | null): string =>
  value === null ? "—" : roundChartValue(value, 1).toString()

const CHART_TICK_FORMATTERS = {
  percent: formatChartPercentTick,
  percentagePoints: formatChartPercentagePointsTick,
  number: formatChartNumberTick,
} as const

const CHART_VALUE_FORMATTERS = {
  percent: formatChartPercent,
  percentagePoints: formatChartPercentagePoints,
  number: formatChartNumber,
} as const

const CHART_TOOLTIP_VALUE_FORMATTERS = {
  percent: (value: number) => formatChartPercent(value),
  percentagePoints: (value: number) => formatChartPercentagePoints(value),
  number: (value: number) => formatChartNumber(value),
} as const

export {
  CHART_TICK_FORMATTERS,
  CHART_TOOLTIP_VALUE_FORMATTERS,
  CHART_VALUE_FORMATTERS,
  formatChartNumber,
  formatChartNumberTick,
  formatChartPercent,
  formatChartPercentTick,
  formatChartPercentagePoints,
  formatChartPercentagePointsTick,
  precisionForSpan,
  roundChartValue,
  type ChartValueFormat,
}
