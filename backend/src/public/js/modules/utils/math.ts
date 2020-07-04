/**
 * Lowerbound and upperbound a number.
 *
 * Equivalent to `min(UPPERBOUND, max(LOWERBOUND, 0))`.
 *
 * If `upperBound` is lower than the `lowerBound`, this function will degrade to return `upperBound`.
 *
 * @param {number} n - The number to be bounded.
 * @param {number} [lowerBound = 0] - The lower bound.
 * @param {number} [upperBound = Number.POSITIVE_INFINITY] - The upper bound.
 * @returns {number} The bounded number.
 */
export function bound(n: number, lowerBound: number = 0, upperBound: number = Number.POSITIVE_INFINITY): number {
  return Math.min(upperBound, Math.max(lowerBound, n));
}
