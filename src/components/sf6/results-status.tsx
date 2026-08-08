import { RESULTS_STATUS } from "@/lib/sf6/presentation"

const ResultsStatus = ({ message = RESULTS_STATUS.loaded }: { message?: string }) => (
  <p aria-live="polite" className="sr-only">
    {message}
  </p>
)

export { ResultsStatus }
