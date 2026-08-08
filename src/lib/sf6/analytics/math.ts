const round = (value: number, digits = 1): number => {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

const mean = (values: readonly number[]): number | null => {
  if (values.length === 0) {
    return null
  }

  let total = 0
  for (const value of values) {
    total += value
  }
  return total / values.length
}

export { mean, round }
