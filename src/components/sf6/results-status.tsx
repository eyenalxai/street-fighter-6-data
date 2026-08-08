const ResultsStatus = ({
  message = "Results loaded from ranked Buckler snapshots.",
}: {
  message?: string
}) => (
  <p aria-live="polite" className="sr-only">
    {message}
  </p>
)

export { ResultsStatus }
