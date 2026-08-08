import type { ReactNode } from "react"

import { Spinner } from "@/components/ui/spinner"
import { RESULTS_STATUS } from "@/lib/sf6/presentation"
import { cn } from "@/lib/utils"

import { ResultsStatus } from "./results-status"

const ResultsPending = () => (
  <>
    <ResultsStatus message={RESULTS_STATUS.loading} />
    <div aria-busy="true" className="flex min-h-70 items-center justify-center">
      <Spinner className="size-6" />
    </div>
  </>
)

const ResultsContent = ({ isUpdating, children }: { isUpdating: boolean; children: ReactNode }) => (
  <div aria-busy={isUpdating} className={cn("flex flex-col gap-5", isUpdating && "animate-pulse")}>
    <ResultsStatus message={isUpdating ? RESULTS_STATUS.updating : undefined} />
    {children}
  </div>
)

export { ResultsContent, ResultsPending }
