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

const completeMean = (values: readonly (number | null | undefined)[]): number | null => {
  const numbers = values.filter((value): value is number => value !== null && value !== undefined)
  return numbers.length === values.length ? mean(numbers) : null
}

const weightedMean = (
  values: readonly { value: number; weight: number }[],
): { value: number; weight: number } | null => {
  const usable = values.filter(({ weight }) => weight > 0)
  const weight = usable.reduce((sum, item) => sum + item.weight, 0)
  if (usable.length === 0 || weight === 0) {
    return null
  }
  return {
    value: usable.reduce((sum, item) => sum + item.value * item.weight, 0) / weight,
    weight,
  }
}

const standardDeviation = (values: readonly number[]): number | null => {
  const average = mean(values)
  if (average === null) {
    return null
  }
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)) ?? 0)
}

const pearsonCorrelation = (left: readonly number[], right: readonly number[]): number | null => {
  if (left.length !== right.length || left.length < 2) {
    return null
  }
  const leftAverage = mean(left)
  const rightAverage = mean(right)
  if (leftAverage === null || rightAverage === null) {
    return null
  }
  let numerator = 0
  let leftVariance = 0
  let rightVariance = 0
  for (const [index, value] of left.entries()) {
    const rightValue = right[index]
    if (rightValue !== undefined) {
      numerator += (value - leftAverage) * (rightValue - rightAverage)
    }
    leftVariance += (value - leftAverage) ** 2
    rightVariance += ((rightValue ?? 0) - rightAverage) ** 2
  }
  if (leftVariance === 0 || rightVariance === 0) {
    return null
  }
  return numerator / Math.sqrt(leftVariance * rightVariance)
}

export { completeMean, mean, pearsonCorrelation, standardDeviation, weightedMean }
