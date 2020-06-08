import { ViewModel } from "./ViewModel";


type SortingFunction = (vm1: ViewModel, vm2: ViewModel) => number;
type FilterFunction = (viewModel: ViewModel) => boolean;

interface SortingFunctionWithPriority {
  sortingFunction: SortingFunction;
  priority: number;
}

export class View {
  private _children: Array<ViewModel>;
  childrenView: Array<ViewModel>;

  shouldRegenerateView: boolean = true;

  sortingFunctions: Map<any, SortingFunctionWithPriority> = new Map();
  filterFunctions: Map<any, FilterFunction> = new Map();

  limit: number = Number.POSITIVE_INFINITY;

  get children(): Array<ViewModel> {
    if (this.shouldRegenerateView) {
      this.regenerateView();
    }
    return this.childrenView;
  }

  set children(children: Array<ViewModel>) {
    this._children = children;
    this.shouldRegenerateView = true;
  }

  get sorter(): SortingFunction {
    const numSortingFunction: number = this.sortingFunctions.size;
    if (numSortingFunction === 0) {
      return null;
    }

    const sortingFunctions = Array.from(this.sortingFunctions);
    // higher priority sorting function comes first
    sortingFunctions.sort((s1, s2) => s2[1].priority - s1[1].priority);

    return (viewModel1, viewModel2) => {
      let sortingFunctionIndex = 0;
      while (sortingFunctionIndex < numSortingFunction) {
        const {sortingFunction} = sortingFunctions[sortingFunctionIndex][1];
        const result: number = sortingFunction(viewModel1, viewModel2);
        if (result !== 0) {
          return result;
        }

        sortingFunctionIndex++;
      }
      return 0;
    };
  }

  addSortingFunction(key: any, sortingFunction: SortingFunction, priority: number = -this.sortingFunctions.size): boolean {
    this.sortingFunctions.set(key, { sortingFunction, priority });
    return this.shouldRegenerateView = true;
  }

  deleteSortingFunction(key: any): boolean {
    if (this.sortingFunctions.delete(key)) {
      return this.shouldRegenerateView = true;
    }
    return false;
  }

  clearSortingFunction(): boolean {
    if (this.sortingFunctions.size === 0) {
      return false;
    }

    this.sortingFunctions.clear();
    return this.shouldRegenerateView = true;
  }

  setSortingFunctionPriority(reordering: Map<any, number>): boolean {
    let shouldRegenerateView = false;

    for (const [key, newPriority] of reordering) {
      const { priority, sortingFunction } = this.sortingFunctions.get(key);
      if (priority !== newPriority) {
        this.sortingFunctions.set(key, { priority: newPriority, sortingFunction });
        shouldRegenerateView = true;
      }
    }

    if (shouldRegenerateView) {
      return this.shouldRegenerateView = shouldRegenerateView;
    }
    return false;
  }

  get filter(): FilterFunction {
    const numFilterFunction: number = this.filterFunctions.size;
    if (numFilterFunction === 0) {
      return null;
    }

    const filterFunctions = Array.from(this.filterFunctions.values());
    return (viewModel) => filterFunctions.every(filterFunction => filterFunction(viewModel));
  }

  addFilterFunction(key: any, filterFunction: FilterFunction): boolean {
    this.filterFunctions.set(key, filterFunction);
    return this.shouldRegenerateView = true;
  }

  deleteFilterFunction(key: any): boolean {
    if (this.filterFunctions.delete(key)) {
      return this.shouldRegenerateView = true;
    }
    return false;
  }

  clearFilterFunction() {
    if (this.filterFunctions.size === 0) {
      return false;
    }
    this.filterFunctions.clear();
    return this.shouldRegenerateView = true;
  }

  regenerateView() {
    const childIndices: Array<number> = Array.from(this._children.keys());

    const sorter = this.sorter;
    if (sorter) {
      childIndices.sort((index1, index2) => sorter(this._children[index1], this._children[index2]));
    }

    const filter = this.filter;
    const childrenView: Array<ViewModel> = [];
    for (const childIndex of childIndices) {
      if (childrenView.length === this.limit) {
        break;
      }
      const viewModel = this._children[childIndex];
      if (!filter || filter(viewModel)) {
        childrenView.push(viewModel);
      }
    }

    this.childrenView = childrenView;
    this.shouldRegenerateView = false;
  }
}
