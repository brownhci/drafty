/**
 * Determines whether first set is subset of second set
 *
 *    A set is considered a subset of another set if all of its elements are present in the second set
 *
 * @param setA: The first set.
 * @param setB: The second set.
 * @return {boolean} Whether first set is a subset of second set.
 */
export function isSubset(setA: Set<any>, setB: Set<any>): boolean {
  for (const setAElement of setA) {
    if (setB.has(setAElement)) {
      return true;
    }
  }
  return false;
}
