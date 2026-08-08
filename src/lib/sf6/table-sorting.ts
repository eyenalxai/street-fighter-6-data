import { getCharacterName } from "@/lib/sf6/model"
import { RANKS } from "@/lib/sf6/ranks"

type TableSortComparator<T> = (left: T, right: T) => number

type SortableRow = {
  getValue: <TValue>(columnId: string, defaultValue?: TValue) => TValue
  original: unknown
}

type TableSortFn = (left: SortableRow, right: SortableRow, columnId: string) => number

const CHARACTER_COLLATOR = new Intl.Collator("en-US", {
  sensitivity: "base",
})

const compareStrings: TableSortComparator<string> = (left, right) =>
  CHARACTER_COLLATOR.compare(left, right)

const compareNullableNumbers: TableSortComparator<number | null | undefined> = (left, right) => {
  const leftMissing = left === null || left === undefined
  const rightMissing = right === null || right === undefined
  if (leftMissing && rightMissing) {
    return 0
  }
  if (leftMissing) {
    return 1
  }
  if (rightMissing) {
    return -1
  }
  return left - right
}

const compareNumbers: TableSortComparator<number> = (left, right) => left - right

const compareCharacterIds: TableSortComparator<string> = (left, right) =>
  compareStrings(getCharacterName(left), getCharacterName(right))

const compareNullableStrings: TableSortComparator<string | null | undefined> = (left, right) => {
  const leftMissing = left === null || left === undefined
  const rightMissing = right === null || right === undefined
  if (leftMissing && rightMissing) {
    return 0
  }
  if (leftMissing) {
    return 1
  }
  if (rightMissing) {
    return -1
  }
  return compareStrings(left, right)
}

const RANK_ORDER = new Map<string, number>(RANKS.map((rank, index) => [rank.id, index]))

const compareRankIds: TableSortComparator<string | null | undefined> = (left, right) => {
  const leftIndex = left === null || left === undefined ? undefined : RANK_ORDER.get(left)
  const rightIndex = right === null || right === undefined ? undefined : RANK_ORDER.get(right)
  return compareNullableNumbers(leftIndex, rightIndex)
}

const compareReportingPeriods: TableSortComparator<string | null | undefined> = (left, right) =>
  compareNullableStrings(left, right)

const compareBooleans: TableSortComparator<boolean> = (left, right) => Number(left) - Number(right)

const compareEnum = <T extends string>(order: readonly T[]): TableSortComparator<T> => {
  const indexByValue = new Map(order.map((value, index) => [value, index]))
  return (left, right) =>
    (indexByValue.get(left) ?? Number.POSITIVE_INFINITY) -
    (indexByValue.get(right) ?? Number.POSITIVE_INFINITY)
}

const ratio = (numerator: number, denominator: number): number | undefined =>
  denominator === 0 ? undefined : numerator / denominator

const createTableSortFn =
  <TValue>(
    compare: (left: TValue, right: TValue) => number,
    tieBreaker?: TableSortComparator<unknown>,
  ): TableSortFn =>
  (left, right, columnId) => {
    const result = compare(left.getValue<TValue>(columnId), right.getValue<TValue>(columnId))
    return result === 0 && tieBreaker !== undefined
      ? tieBreaker(left.original, right.original)
      : result
  }

export {
  compareBooleans,
  compareCharacterIds,
  compareEnum,
  compareNullableNumbers,
  compareNullableStrings,
  compareNumbers,
  compareRankIds,
  compareReportingPeriods,
  compareStrings,
  createTableSortFn,
  ratio,
  type SortableRow,
  type TableSortComparator,
  type TableSortFn,
}
