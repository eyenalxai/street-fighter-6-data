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

export { completeMean, mean }
