import { Skeleton } from "@/components/ui/skeleton"

const ViewLoading = () => (
  <div className="flex flex-col gap-5" aria-label="Loading analytics">
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
    <Skeleton className="h-96" />
  </div>
)

export { ViewLoading }
