interface ErrorWithMessage {
  message: string
}

const isErrorWithMessage = (value: unknown): value is ErrorWithMessage =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string"

export const getFormErrorMessage = (error: unknown): string | null => {
  if (typeof error === "string") {
    return error.length > 0 ? error : null
  }

  if (typeof error === "number" || typeof error === "boolean") {
    return String(error)
  }

  if (Array.isArray(error)) {
    const messages = error
      .map((item) => getFormErrorMessage(item))
      .filter((message): message is string => message !== null && message.length > 0)

    return messages.length > 0 ? messages.join(", ") : null
  }

  if (isErrorWithMessage(error)) {
    return error.message.length > 0 ? error.message : null
  }

  return null
}
