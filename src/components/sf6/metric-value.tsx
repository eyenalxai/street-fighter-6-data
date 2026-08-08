import { cn } from "@/lib/utils"

type MetricKind = "winRate" | "usage" | "delta" | "coverage" | "number"

const formatMetric = (value: number | null | undefined, kind: MetricKind): string => {
  if (value === null || value === undefined) {
    return "—"
  }
  if (kind === "coverage") {
    return `${(value * 100).toFixed(0)}%`
  }
  if (kind === "number") {
    return value.toFixed(1)
  }
  const sign = kind === "delta" && value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

const metricToken = (value: number | null | undefined, kind: MetricKind): string => {
  if (value === null || value === undefined) {
    return "text-muted-foreground"
  }
  if (kind === "winRate") {
    if (value >= 55) {
      return "text-wr-strong"
    }
    if (value >= 52) {
      return "text-wr-good"
    }
    if (value > 48) {
      return "text-wr-even"
    }
    if (value > 45) {
      return "text-wr-bad"
    }
    return "text-wr-weak"
  }
  if (kind === "delta") {
    return value > 0 ? "text-wr-strong" : value < 0 ? "text-wr-weak" : "text-muted-foreground"
  }
  return "text-foreground"
}

const MetricValue = ({
  value,
  kind,
  className,
}: {
  value: number | null | undefined
  kind: MetricKind
  className?: string
}) => (
  <span className={cn("font-mono tabular-nums", metricToken(value, kind), className)}>
    {formatMetric(value, kind)}
  </span>
)

const formatDelta = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "—"
  }
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  return `${sign}${Math.abs(value).toFixed(1)} pp`
}

const DeltaMetric = ({
  value,
  className,
}: {
  value: number | null | undefined
  className?: string
}) => (
  <span className={cn("font-mono tabular-nums", metricToken(value, "delta"), className)}>
    {formatDelta(value)}
  </span>
)

export { DeltaMetric, MetricValue, formatDelta, formatMetric }
