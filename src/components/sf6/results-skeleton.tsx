import { Skeleton } from "@/components/ui/skeleton"

type ResultsSkeletonProps = {
  variant: "table" | "chart" | "matchup"
}

const ResultsSkeleton = ({ variant }: ResultsSkeletonProps) => {
  if (variant === "chart") {
    return (
      <div className="grid min-h-[520px] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)]">
        <Skeleton className="min-h-[360px]" />
        <Skeleton className="min-h-[360px]" />
      </div>
    )
  }

  if (variant === "matchup") {
    return (
      <div className="grid min-h-[620px] gap-4 lg:grid-cols-2">
        <Skeleton className="min-h-[260px]" />
        <Skeleton className="min-h-[260px]" />
        <Skeleton className="min-h-[320px] lg:col-span-2" />
      </div>
    )
  }

  return <Skeleton className="min-h-[560px]" />
}

export { ResultsSkeleton }
