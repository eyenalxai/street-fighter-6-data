import type { DefaultError, FetchQueryOptions, QueryKey } from "@tanstack/react-query"

import { StandardRPCJsonSerializer } from "@orpc/client/standard"
import { defaultShouldDehydrateQuery, keepPreviousData, QueryClient } from "@tanstack/react-query"

type SerializedData = {
  json: unknown
  meta: ReturnType<StandardRPCJsonSerializer["serialize"]>[1]
}

type RouterContext = {
  queryClient: QueryClient
}

const serializer = new StandardRPCJsonSerializer({
  customJsonSerializers: [],
})

const isSerializedData = (data: unknown): data is SerializedData => {
  if (typeof data !== "object" || data === null) {
    return false
  }

  if (!("json" in data) || !("meta" in data)) {
    return false
  }

  return Array.isArray(data.meta)
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        placeholderData: keepPreviousData,
        staleTime: 60_000,
        queryKeyHashFn: (queryKey) => {
          const [json, meta] = serializer.serialize(queryKey)
          return JSON.stringify({ json, meta })
        },
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
        serializeData: (data) => {
          const [json, meta] = serializer.serialize(data)
          return { json, meta }
        },
      },
      hydrate: {
        deserializeData: (data: unknown): unknown => {
          if (!isSerializedData(data)) {
            return data
          }

          return serializer.deserialize(data.json, data.meta)
        },
      },
    },
  })

const loadRouteQuery = async <
  TQueryFnData,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryClient: QueryClient,
  options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): Promise<void> => {
  if (typeof window === "undefined") {
    await queryClient.ensureQueryData(options)
    return
  }

  void queryClient.prefetchQuery(options)
}

export { createQueryClient, loadRouteQuery, type RouterContext }
