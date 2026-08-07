import type { ReactNode } from "react"

import { ErrorBoundary } from "react-error-boundary"

import { Button } from "@/components/ui/button"

type ViewErrorBoundaryProps = {
  resetKey: string
  children: ReactNode
}

const ViewErrorFallback = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => (
  <div className="flex min-h-64 flex-col items-center justify-center gap-3 border border-destructive/30 bg-destructive/5 p-8 text-center">
    <p className="font-medium">This view could not load</p>
    <p className="max-w-md text-sm text-muted-foreground">
      The selected reporting period or matchup data is unavailable.
    </p>
    <Button type="button" variant="outline" onClick={resetErrorBoundary}>
      Try again
    </Button>
  </div>
)

const ViewErrorBoundary = ({ resetKey, children }: ViewErrorBoundaryProps) => (
  <ErrorBoundary
    resetKeys={[resetKey]}
    FallbackComponent={ViewErrorFallback}
    onError={(error) => {
      console.error("Ranked analytics view failed", error)
    }}
  >
    {children}
  </ErrorBoundary>
)

export { ViewErrorBoundary }
