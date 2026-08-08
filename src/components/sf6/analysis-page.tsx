import type { ReactNode } from "react"

import { Suspense } from "react"

import { ResultsErrorBoundary } from "@/components/sf6/results-error-boundary"
import { ResultsSkeleton } from "@/components/sf6/results-skeleton"

type AnalysisPageProps = {
  toolbar: ReactNode
  beforeResults?: ReactNode
  children: ReactNode
  resetKey: string
  skeleton?: "table" | "chart" | "matchup"
}

const AnalysisPage = ({
  toolbar,
  beforeResults,
  children,
  resetKey,
  skeleton = "table",
}: AnalysisPageProps) => (
  <div className="flex flex-col gap-5">
    {toolbar}
    {beforeResults}
    <ResultsErrorBoundary resetKey={resetKey}>
      <Suspense fallback={<ResultsSkeleton variant={skeleton} />}>{children}</Suspense>
    </ResultsErrorBoundary>
  </div>
)

export { AnalysisPage }
