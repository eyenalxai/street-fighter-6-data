import type { CharacterId } from "@/lib/sf6/model"

const CHART_COLOR_COUNT = 30

const getChartSeriesColor = (index: number): string =>
  `var(--chart-${(index % CHART_COLOR_COUNT) + 1})`

const CHARACTER_CHART_COLORS = {
  ryu: getChartSeriesColor(0),
  ken: getChartSeriesColor(1),
  chunli: getChartSeriesColor(2),
  guile: getChartSeriesColor(3),
  blanka: getChartSeriesColor(4),
  dhalsim: getChartSeriesColor(5),
  honda: getChartSeriesColor(6),
  zangief: getChartSeriesColor(7),
  cammy: getChartSeriesColor(8),
  deejay: getChartSeriesColor(9),
  jp: getChartSeriesColor(10),
  juri: getChartSeriesColor(11),
  kimberly: getChartSeriesColor(12),
  lily: getChartSeriesColor(13),
  luke: getChartSeriesColor(14),
  manon: getChartSeriesColor(15),
  marisa: getChartSeriesColor(16),
  jamie: getChartSeriesColor(17),
  rashid: getChartSeriesColor(18),
  aki: getChartSeriesColor(19),
  ed: getChartSeriesColor(20),
  gouki: getChartSeriesColor(21),
  vega: getChartSeriesColor(22),
  terry: getChartSeriesColor(23),
  mai: getChartSeriesColor(24),
  elena: getChartSeriesColor(25),
  sagat: getChartSeriesColor(26),
  cviper: getChartSeriesColor(27),
  alex: getChartSeriesColor(28),
  ingrid: getChartSeriesColor(29),
} satisfies Record<CharacterId, string>

const getCharacterChartColor = (characterId: CharacterId): string =>
  CHARACTER_CHART_COLORS[characterId]

export { CHARACTER_CHART_COLORS, CHART_COLOR_COUNT, getCharacterChartColor, getChartSeriesColor }
