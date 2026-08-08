import type { DefaultError, QueryKey, UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"

type AnalyticsQueryResult<TData, TError, TInput> = UseQueryResult<TData, TError> & {
  displayedInput: TInput
  isInitialPending: boolean
  isUpdating: boolean
}

const useAnalyticsQuery = <
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TInput = unknown,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  input: TInput,
): AnalyticsQueryResult<TData, TError, TInput> => {
  const query = useQuery({
    ...options,
    throwOnError: true,
  })
  const inputKey = JSON.stringify(input)
  const [successfulInput, setSuccessfulInput] = useState(input)
  const successfulInputKey = useRef(inputKey)

  useEffect(() => {
    if (
      query.data !== undefined &&
      !query.isPlaceholderData &&
      successfulInputKey.current !== inputKey
    ) {
      successfulInputKey.current = inputKey
      setSuccessfulInput(input)
    }
  }, [input, inputKey, query.data, query.isPlaceholderData])

  return {
    ...query,
    displayedInput: query.isPlaceholderData ? successfulInput : input,
    isInitialPending: query.data === undefined,
    isUpdating: query.data !== undefined && query.isFetching,
  }
}

export { useAnalyticsQuery }
