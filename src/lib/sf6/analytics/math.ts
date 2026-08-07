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

const standardDeviation = (values: readonly number[]): number => {
  const average = mean(values)
  if (average === null || values.length < 2) {
    return 0
  }

  let squaredDistance = 0
  for (const value of values) {
    squaredDistance += (value - average) ** 2
  }
  return Math.sqrt(squaredDistance / values.length)
}

const numericValues = (values: readonly (number | null)[]): number[] =>
  values.filter((value): value is number => value !== null)

export { mean, numericValues, round, standardDeviation }
