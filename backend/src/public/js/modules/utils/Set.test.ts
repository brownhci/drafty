import { isSubset } from "./Set";


describe("isSubset", () => {
  test("A is subset of itself", () => {
    const setA = new Set(["a"]);
    expect(isSubset(setA, setA)).toBe(true);
  });

  test("A equals B", () => {
    const setA = new Set(["a"]);
    const setB = new Set(["a"]);
    expect(isSubset(setA, setB)).toBe(true);
  });

  test("A is subset of B", () => {
    const setA = new Set(["a"]);
    const setB = new Set(["a", "A"]);
    expect(isSubset(setA, setB)).toBe(true);
  });

  test("A is not subset of B", () => {
    const setA = new Set(["a", "b"]);
    const setB = new Set(["a", "A"]);
    expect(isSubset(setA, setB)).toBe(false);
  });
});
