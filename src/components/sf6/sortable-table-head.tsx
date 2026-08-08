import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type SortDirection = "asc" | "desc"

const SortableTableHead = ({
  label,
  active,
  direction,
  onClick,
  align = "left",
  className,
}: {
  align?: "left" | "right"
  label: string
  active: boolean
  direction: SortDirection
  onClick: () => void
  className?: string
}) => (
  <TableHead
    className={cn(
      align === "right" && "text-right [&>button]:w-full [&>button]:justify-end",
      className,
    )}
    aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
  >
    <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-1" onClick={onClick}>
      {label}
      {active ? (
        direction === "asc" ? (
          <ArrowUp data-icon="inline-end" />
        ) : (
          <ArrowDown data-icon="inline-end" />
        )
      ) : (
        <ChevronsUpDown data-icon="inline-end" />
      )}
    </Button>
  </TableHead>
)

export { SortableTableHead, type SortDirection }
