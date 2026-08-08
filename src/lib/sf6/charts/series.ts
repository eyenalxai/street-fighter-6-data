import type { CharacterId } from "@/lib/sf6/model"

import { getCharacterChartColor } from "@/lib/sf6/charts/palette"
import { getCharacterName } from "@/lib/sf6/model"
import { METRIC_LABELS } from "@/lib/sf6/presentation"

type MetricTrendSeries = {
  key: string
  label: string
  color?: string
}

type MetricTrendPoint = {
  label: string
  [key: string]: number | string | null
}

const WIN_RATE_SPREAD_SERIES = {
  key: "spread",
  label: METRIC_LABELS.winRateSpread,
} satisfies MetricTrendSeries

const buildCharacterTrendSeries = (items: readonly { characterId: CharacterId }[]) =>
  items.map(({ characterId }) => {
    return {
      key: characterId,
      label: getCharacterName(characterId),
      color: getCharacterChartColor(characterId),
    }
  })

const buildCharacterMetricTrendData = <Point>(
  series: readonly {
    characterId: CharacterId
    points: readonly Point[]
  }[],
  getLabel: (point: Point) => string,
  getValue: (point: Point | undefined) => number | null,
): MetricTrendPoint[] => {
  const points = series[0]?.points ?? []
  return points.map((point, index) => {
    const row: MetricTrendPoint = { label: getLabel(point) }
    for (const item of series) {
      row[item.characterId] = getValue(item.points[index])
    }
    return row
  })
}

export {
  buildCharacterMetricTrendData,
  buildCharacterTrendSeries,
  type MetricTrendPoint,
  type MetricTrendSeries,
  WIN_RATE_SPREAD_SERIES,
}
