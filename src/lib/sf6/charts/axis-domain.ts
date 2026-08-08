import { precisionForSpan, roundChartValue } from "@/lib/sf6/charts/format"

type AxisDomainOptions = {
  paddingRatio?: number
  includeZero?: boolean
  anchors?: readonly number[]
  minSpan?: number
}

const collectRecordValues = (
  records: readonly Record<string, unknown>[],
  keys: readonly string[],
): number[] => {
  const values: number[] = []
  for (const record of records) {
    for (const key of keys) {
      const value = record[key]
      if (typeof value === "number" && Number.isFinite(value)) {
        values.push(value)
      }
    }
  }
  return values
}

const computeAxisDomain = (
  values: readonly number[],
  { paddingRatio = 0.1, includeZero = false, anchors = [], minSpan }: AxisDomainOptions = {},
): [number, number] => {
  const allValues = [...values, ...anchors].filter((value) => Number.isFinite(value))
  if (allValues.length === 0) {
    return [0, 1]
  }

  let min = Math.min(...allValues)
  let max = Math.max(...allValues)

  if (includeZero) {
    min = Math.min(min, 0)
    max = Math.max(max, 0)
  }

  let span = max - min
  if (span === 0) {
    const half = (minSpan ?? Math.max(Math.abs(min) * 0.1, 1)) / 2
    min -= half
    max += half
    span = max - min
  }

  const effectiveMinSpan = minSpan ?? span * 0.1
  if (span < effectiveMinSpan) {
    const center = (min + max) / 2
    min = center - effectiveMinSpan / 2
    max = center + effectiveMinSpan / 2
    span = effectiveMinSpan
  }

  const padding = span * paddingRatio
  const precision = precisionForSpan(span)
  return [roundChartValue(min - padding, precision), roundChartValue(max + padding, precision)]
}

export { collectRecordValues, computeAxisDomain, type AxisDomainOptions }
