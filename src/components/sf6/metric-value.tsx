import { cn } from "@/lib/utils"

type MetricFormat = "percent" | "percentagePoints" | "coverage" | "number"
type MetricTone = "neutral" | "winRate" | "directional"

const formatMetric = (
  value: number | null | undefined,
  format: MetricFormat,
  signed = false,
  precision = format === "coverage" ? 0 : format === "number" ? 1 : 1,
): string => {
  if (value === null || value === undefined) {
    return "—"
  }
  const displayValue = format === "coverage" ? value * 100 : value
  const roundedValue = Number(displayValue.toFixed(precision))
  const sign = roundedValue > 0 && signed ? "+" : roundedValue < 0 ? "−" : ""
  const suffix =
    format === "percent" || format === "coverage" ? "%" : format === "percentagePoints" ? " pp" : ""
  return `${sign}${Math.abs(roundedValue).toFixed(precision)}${suffix}`
}

const metricToken = (
  value: number | null | undefined,
  format: MetricFormat,
  tone: MetricTone,
  signed: boolean,
  precision: number,
): string => {
  if (value === null || value === undefined) {
    return "text-muted-foreground"
  }
  const displayValue = Number((format === "coverage" ? value * 100 : value).toFixed(precision))
  if (tone === "winRate") {
    if (displayValue >= 55) {
      return "text-wr-strong"
    }
    if (displayValue >= 52) {
      return "text-wr-good"
    }
    if (displayValue > 48) {
      return "text-wr-even"
    }
    if (displayValue > 45) {
      return "text-wr-bad"
    }
    return "text-wr-weak"
  }
  if (tone === "directional" && signed) {
    return displayValue > 0
      ? "text-wr-strong"
      : displayValue < 0
        ? "text-wr-weak"
        : "text-muted-foreground"
  }
  return "text-foreground"
}

const MetricValue = ({
  value,
  format,
  tone = "neutral",
  signed = false,
  precision = format === "coverage" ? 0 : format === "number" ? 1 : 1,
  className,
}: {
  value: number | null | undefined
  format: MetricFormat
  tone?: MetricTone
  signed?: boolean
  precision?: number
  className?: string
}) => (
  <span
    className={cn(
      "font-mono tabular-nums",
      metricToken(value, format, tone, signed, precision),
      className,
    )}
  >
    {formatMetric(value, format, signed, precision)}
  </span>
)

export { MetricValue, formatMetric, type MetricFormat, type MetricTone }
