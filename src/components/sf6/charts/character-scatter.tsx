import type { ComponentProps } from "react"

import { Scatter } from "recharts"

import type { CharacterId } from "@/lib/sf6/model"

import { getCharacterChartColor } from "@/lib/sf6/charts/palette"

type CharacterScatterPoint = {
  characterId: CharacterId
}

type CharacterScatterProps<Point extends CharacterScatterPoint> = Omit<
  ComponentProps<typeof Scatter>,
  "children" | "data" | "fill"
> & {
  data: readonly Point[]
}

const CharacterScatter = <Point extends CharacterScatterPoint>({
  data,
  ...props
}: CharacterScatterProps<Point>) => {
  const coloredData = data.map((point) => {
    return {
      ...point,
      fill: getCharacterChartColor(point.characterId),
    }
  })
  return <Scatter data={coloredData} {...props} />
}

export { CharacterScatter }
