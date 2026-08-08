import { ORPCError } from "@orpc/server"

import {
  SnapshotNotFoundError,
  SnapshotReadError,
  SnapshotValidationError,
} from "@/lib/sf6/snapshots/store.server"

const withSnapshotErrors = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await operation()
  } catch (error: unknown) {
    if (error instanceof ORPCError) {
      throw error
    }
    if (error instanceof SnapshotNotFoundError) {
      throw new ORPCError("NOT_FOUND", { message: error.message })
    }
    if (error instanceof SnapshotReadError || error instanceof SnapshotValidationError) {
      console.error(error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "The system cannot load analytics data. Try again later.",
      })
    }
    console.error(error)
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "The analytics request failed. Try again.",
    })
  }
}

export { withSnapshotErrors }
