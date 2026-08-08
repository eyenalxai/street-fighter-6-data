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

const getDisplayedDelta = (value: number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null
  }
  const rounded = Number(value.toFixed(1))
  return Object.is(rounded, -0) ? 0 : rounded
}

const formatPercentagePoints = (value: number | null | undefined): string => {
  const displayed = getDisplayedDelta(value)
  if (displayed === null) {
    return "—"
  }

  const sign = displayed < 0 ? "−" : displayed > 0 ? "+" : ""
  return `${sign}${Math.abs(displayed).toFixed(1)} pp`
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
  const displayed = getDisplayedDelta(value)
  const positive = displayed !== null && displayed > 0
  const negative = displayed !== null && displayed < 0
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

export { DeltaValue, formatPercentagePoints, formatWr, getDisplayedDelta, WinRate, wrToken }
