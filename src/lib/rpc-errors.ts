const hasMessage = (value: unknown): value is { message: string } =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string"

export const getOrpcErrorMessage = (error: unknown, fallback: string) => {
  if (hasMessage(error) && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}
