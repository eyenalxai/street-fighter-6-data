import { cn } from "@/lib/utils"

const wrToken = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "text-muted-foreground"
  }
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

const formatWr = (value: number | null | undefined): string =>
  value === null || value === undefined ? "—" : `${value.toFixed(1)}%`

const formatPercentagePoints = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "—"
  }

  const sign = value < 0 ? "−" : value > 0 ? "+" : ""
  return `${sign}${Math.abs(value).toFixed(1)} pp`
}

const WinRate = ({
  value,
  className,
  showSign = false,
}: {
  value: number | null | undefined
  className?: string
  showSign?: boolean
}) => {
  const display =
    value === null || value === undefined
      ? "—"
      : showSign
        ? `${value > 0 ? "+" : ""}${value.toFixed(1)}`
        : formatWr(value)
  return <span className={cn("font-mono tabular-nums", wrToken(value), className)}>{display}</span>
}

const DeltaValue = ({ value, className }: { value: number | null; className?: string }) => {
  const positive = value !== null && value > 0.05
  const negative = value !== null && value < -0.05
  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        value === null && "text-muted-foreground",
        positive && "text-wr-strong",
        negative && "text-wr-weak",
        !positive && !negative && value !== null && "text-muted-foreground",
        className,
      )}
    >
      {formatPercentagePoints(value)}
    </span>
  )
}

export { DeltaValue, formatPercentagePoints, formatWr, WinRate, wrToken }
