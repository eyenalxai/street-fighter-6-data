import type { ReactNode } from "react"

import { ResultsErrorBoundary } from "@/components/sf6/results-error-boundary"

type AnalysisPageProps = {
  toolbar: ReactNode
  beforeResults?: ReactNode
  children: ReactNode
  resetKey: string
}

const AnalysisPage = ({ toolbar, beforeResults, children, resetKey }: AnalysisPageProps) => (
  <div className="flex flex-col gap-5">
    {toolbar}
    {beforeResults}
    <ResultsErrorBoundary resetKey={resetKey}>{children}</ResultsErrorBoundary>
  </div>
)

export { AnalysisPage }
