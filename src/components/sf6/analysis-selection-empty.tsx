import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

type AnalysisSelectionEmptyProps = {
  title: string
  description: string
}

const AnalysisSelectionEmpty = ({ title, description }: AnalysisSelectionEmptyProps) => (
  <Empty className="min-h-48 border border-dashed">
    <EmptyHeader>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
  </Empty>
)

export { AnalysisSelectionEmpty }
