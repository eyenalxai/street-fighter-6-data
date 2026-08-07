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

const wrBg = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "var(--muted)"
  }
  const clamped = Math.max(40, Math.min(60, value))
  const distance = Math.abs(clamped - 50) / 10
  const color = clamped >= 50 ? "var(--wr-strong)" : "var(--wr-weak)"
  return `color-mix(in oklch, var(--card) ${100 - distance * 78}%, ${color})`
}

const formatWr = (value: number | null | undefined): string =>
  value === null || value === undefined ? "—" : `${value.toFixed(1)}%`

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
      {value === null ? "—" : `${value > 0 ? "+" : ""}${value.toFixed(1)}`}
    </span>
  )
}

export { DeltaValue, formatWr, wrBg, WinRate, wrToken }
