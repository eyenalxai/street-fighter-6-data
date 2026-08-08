import type { ReactNode } from "react"

import { ErrorBoundary } from "react-error-boundary"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type ResultsErrorBoundaryProps = {
  resetKey: string
  children: ReactNode
}

const ResultsErrorFallback = ({ resetErrorBoundary }: { resetErrorBoundary: () => void }) => (
  <Alert
    variant="destructive"
    className="min-h-[280px] place-content-center justify-items-center text-center"
  >
    <AlertTitle>Results could not load</AlertTitle>
    <AlertDescription>
      Try again or change one of the controls above. The controls remain available while this result
      is unavailable.
    </AlertDescription>
    <Button type="button" variant="outline" onClick={resetErrorBoundary} className="mt-2">
      Try again
    </Button>
  </Alert>
)

const ResultsErrorBoundary = ({ resetKey, children }: ResultsErrorBoundaryProps) => (
  <ErrorBoundary
    resetKeys={[resetKey]}
    FallbackComponent={ResultsErrorFallback}
    onError={(error) => {
      console.error("Ranked analytics results failed", error)
    }}
  >
    {children}
  </ErrorBoundary>
)

export { ResultsErrorBoundary }
