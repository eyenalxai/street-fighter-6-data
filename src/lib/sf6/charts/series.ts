import { getCharacterName } from "@/lib/sf6/model"

const CHART_SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

const buildCharacterTrendSeries = (items: readonly { characterId: string }[]) =>
  items.map((item, index) => {return {
    key: item.characterId,
    label: getCharacterName(item.characterId),
    color: CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length] ?? "var(--chart-1)",
  }})

export { buildCharacterTrendSeries, CHART_SERIES_COLORS }
