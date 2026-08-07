import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"

import type { DashboardViewProps } from "@/components/sf6/dashboard"
import type { CharacterId } from "@/lib/sf6/model"

import { AnalyticsPanel } from "@/components/sf6/analytics-panel"
import { CharacterBadge, CharacterName } from "@/components/sf6/character-badge"
import { LabeledSelect } from "@/components/sf6/labeled-select"
import { similarityQueryOptions } from "@/lib/sf6/query-options"
import { cn } from "@/lib/utils"

const clusterOptions = [
  { value: "3", label: "3 clusters" },
  { value: "4", label: "4 clusters" },
  { value: "5", label: "5 clusters" },
]

const SimilarityList = ({
  title,
  rows,
  onSelect,
  positive = false,
}: {
  title: string
  rows: { characterId: CharacterId; similarity: number }[]
  onSelect: (characterId: CharacterId) => void
  positive?: boolean
}) => (
  <AnalyticsPanel title={title} description="Pearson correlation of matchup profiles">
    <div className="flex flex-col divide-y divide-border">
      {rows.map((row) => (
        <button
          key={row.characterId}
          type="button"
          onClick={() => {
            onSelect(row.characterId)
          }}
          className="flex items-center gap-3 py-2 text-left hover:bg-accent/40"
        >
          <CharacterBadge characterId={row.characterId} size="small" />
          <span className="flex-1">
            <CharacterName characterId={row.characterId} />
          </span>
          <span
            className={cn("font-mono tabular-nums", positive ? "text-wr-strong" : "text-wr-weak")}
          >
            {row.similarity.toFixed(2)}
          </span>
        </button>
      ))}
    </div>
  </AnalyticsPanel>
)

const SimilarityView = ({ period, search, onChange }: DashboardViewProps) => {
  const [clusterCount, setClusterCount] = useState(4)
  const { data } = useSuspenseQuery(
    similarityQueryOptions({
      period,
      league: search.league,
      controls: search.controls,
      character: search.character,
      clusterCount,
    }),
  )

  return (
    <div className="flex flex-col gap-5">
      <AnalyticsPanel
        title="Matchup profile clusters"
        description="Agglomerative clusters of residualized matchup profiles"
        action={
          <LabeledSelect
            label="Clusters"
            value={String(clusterCount)}
            options={clusterOptions}
            onChange={(value) => {
              const next = Number(value)
              if (Number.isInteger(next) && next >= 3 && next <= 5) {
                setClusterCount(next)
              }
            }}
          />
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.clusters.map((cluster) => (
            <div key={cluster.id} className="border border-border p-3">
              <p className="mb-2 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Cluster {cluster.id + 1} · {cluster.members.length} characters
              </p>
              <div className="flex flex-wrap gap-1">
                {cluster.members.map((characterId) => (
                  <button
                    key={characterId}
                    type="button"
                    onClick={() => {
                      onChange({ character: characterId })
                    }}
                    className="border border-border px-1.5 py-1 text-xs hover:bg-accent/40"
                  >
                    {characterId}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AnalyticsPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <SimilarityList
          title={`Most similar to ${search.character}`}
          rows={data.similar}
          onSelect={(characterId) => {
            onChange({ character: characterId })
          }}
          positive
        />
        <SimilarityList
          title={`Most different from ${search.character}`}
          rows={data.different}
          onSelect={(characterId) => {
            onChange({ character: characterId })
          }}
        />
      </div>
    </div>
  )
}

export { SimilarityView }
