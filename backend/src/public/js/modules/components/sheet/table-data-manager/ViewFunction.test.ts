import { FilteredView, PartialView, SortedView, ViewFunctionChain } from "./ViewFunction";

describe("SortedView", () => {
  test("basic sorting", () => {
    const array = [1, 2, 3, 4, 5];
    const sv = new SortedView<number>();
    expect(sv.view(array)).toEqual([1, 2, 3, 4, 5]);
    expect(sv.addSortingFunction("desc", (n1, n2) => n2 - n1, 1)).toBe(true);
    expect(sv.view(array)).toEqual([5, 4, 3, 2, 1]);
    expect(sv.view(array)).toEqual([5, 4, 3, 2, 1]);

    const ascSort = (n1: number, n2: number) => n1 - n2;
    expect(sv.addSortingFunction("asc", ascSort, 2)).toBe(true);
    expect(sv.addSortingFunction("asc", ascSort, 2)).toBe(false);
    expect(sv.view(array)).toEqual([1, 2, 3, 4, 5]);

    sv.reorderSortingFunction(new Map([["desc", 10], ["asc", 5]]));
    expect(sv.view(array)).toEqual([5, 4, 3, 2, 1]);

    expect(sv.deleteSortingFunction("desc")).toBe(true);
    expect(sv.view(array)).toEqual([1, 2, 3, 4, 5]);

    expect(sv.deleteSortingFunction("desc")).toBe(false);
    expect(sv.view(array)).toEqual([1, 2, 3, 4, 5]);

    expect(sv.clearSortingFunction()).toBe(true);
    expect(sv.view(array)).toEqual([1, 2, 3, 4, 5]);
    expect(sv.view([2, 4, 5])).toEqual([2, 4, 5]);
    expect(sv.clearSortingFunction()).toBe(false);
  });

  test("Multi Sort", () => {
    interface Cell {
      row: number;
      cellIndex: number;
    }
    const array: Array<Cell> = [
      {
        row: 1,
        cellIndex: 0
      },
      {
        row: 1,
        cellIndex: 1
      },
      {
        row: 2,
        cellIndex: 1
      },
    ];
    const sv = new SortedView<Cell>();
    expect(sv.addSortingFunction("row sort asc", (c1, c2) => c1.row - c2.row, 10)).toBe(true);
    expect(sv.addSortingFunction("cellIndex sort asc", (c1, c2) => c1.cellIndex - c2.cellIndex, 1)).toBe(true);
    expect(sv.view(array)).toEqual([
      {
        row: 1,
        cellIndex: 0
      },
      {
        row: 1,
        cellIndex: 1
      },
      {
        row: 2,
        cellIndex: 1
      },
    ]);

    expect(sv.deleteSortingFunction("cellIndex sort asc")).toBe(true);
    expect(sv.addSortingFunction("cellIndex sort desc", (c1, c2) => c2.cellIndex - c1.cellIndex, 1)).toBe(true);
    expect(sv.view(array)).toEqual([
      {
        row: 1,
        cellIndex: 1
      },
      {
        row: 1,
        cellIndex: 0
      },
      {
        row: 2,
        cellIndex: 1
      },
    ]);

    expect(sv.reorderSortingFunction(new Map([["row sort asc", 1], ["cellIndex sort desc", 2]]))).toBe(true);
    expect(sv.view(array)).toEqual([
      {
        row: 1,
        cellIndex: 1
      },
      {
        row: 2,
        cellIndex: 1
      },
      {
        row: 1,
        cellIndex: 0
      },
    ]);
    expect(sv.reorderSortingFunction(new Map([["row sort asc", 1], ["cellIndex sort desc", 2]]))).toBe(false);
    expect(sv.view(array)).toEqual([
      {
        row: 1,
        cellIndex: 1
      },
      {
        row: 2,
        cellIndex: 1
      },
      {
        row: 1,
        cellIndex: 0
      },
    ]);
  });
});

describe("FilteredView", () => {
  test("basic filtering", () => {
    const array = [1, 2, 3, 4, 5];
    const fv = new FilteredView<number>();
    expect(fv.view(array)).toEqual([1, 2, 3, 4, 5]);
    expect(fv.addFilterFunction("no 1", (n) => n != 1)).toBe(true);
    expect(fv.view(array)).toEqual([2, 3, 4, 5]);

    const lessThan3 = (n: number) => n <= 3;
    expect(fv.addFilterFunction("<= 3", lessThan3)).toBe(true);
    expect(fv.addFilterFunction("<= 3", lessThan3)).toBe(false);
    expect(fv.view(array)).toEqual([2, 3]);
    expect(fv.view(array)).toEqual([2, 3]);
    expect(fv.view([0, 1, 3, 4])).toEqual([0, 3]);

    expect(fv.deleteFilterFunction("no 1")).toBe(true);
    expect(fv.deleteFilterFunction("no 1")).toBe(false);
    expect(fv.view(array)).toEqual([1, 2, 3]);
    expect(fv.view([0, 1, 3, 4])).toEqual([0, 1, 3]);

    expect(fv.clearFilterFunction()).toBe(true);
    expect(fv.view(array)).toEqual([1, 2, 3, 4, 5]);
    expect(fv.clearFilterFunction()).toBe(false);
    expect(fv.view(array)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("PartialView", () => {
  test("basic partial rendering", () => {
    const array = Array.from(Array(100).keys());
    const pv = new PartialView<number>(array, 0, 4, 5);
    // default view
    expect(pv.view(array)).toEqual([0, 1, 2, 3, 4]);
    expect(pv.reachedStart).toBe(true);
    expect(pv.reachedEnd).toBe(false);
    expect(pv.numElement).toBe(array.length);
    expect(pv.windowSize).toBe(5);
    expect(pv.numElementNotRenderedBefore).toBe(0);
    expect(pv.numElementNotRenderedAfter).toBe(95);
    expect(pv.setWindow(0, 4)).toBe(false);
    expect(pv.view(array)).toEqual([0, 1, 2, 3, 4]);
    expect(pv.shiftWindow(5, true)).toBe(5);
    expect(pv.view(array)).toEqual([5, 6, 7, 8, 9]);
    expect(pv.shiftWindow(-5, true)).toBe(-5);
    expect(pv.view(array)).toEqual([0, 1, 2, 3, 4]);

    // reached top
    expect(pv.shiftWindow(-10, false)).toBeFalsy();
    expect(pv.shiftWindow(0, false)).toBeFalsy();

    expect(pv.view([0, 1, 2])).toEqual([0, 1, 2]);
    expect(pv.maximumWindowSize).toBe(3);
  });
});

describe("ViewFunctionChain", () => {
  test("empty", () => {
    const vc = new ViewFunctionChain<number>();
    expect(vc.view([1])).toEqual([1]);
    expect(vc.view([2])).toEqual([2]);
  });

  test("chain", () => {
    const sv = new SortedView<number>();
    sv.addSortingFunction("desc", (n1, n2) => n2 - n1, 1);
    const fv = new FilteredView<number>();
    fv.addFilterFunction("no 1", (n) => n != 1);
    fv.addFilterFunction("<= 3", (n: number) => n <= 3);

    const vc = new ViewFunctionChain<number>([sv, fv]);
    expect(vc.view([1, 2, 3, 4, 5])).toEqual([3, 2]);
    expect((vc.modifyViewFunction(1) as FilteredView<number>).deleteFilterFunction("no 1")).toBe(true);
    expect(vc.view([1, 2, 3, 4, 5])).toEqual([3, 2, 1]);

    vc.modifyViewFunctions().length = 0;
    expect(vc.view([1])).toEqual([1]);
  });
});
