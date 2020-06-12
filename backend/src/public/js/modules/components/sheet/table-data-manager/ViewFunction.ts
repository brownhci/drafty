export interface ViewFunction<T> {
  view(source: Array<T>): Array<T>;
}


type FilterFunction<T> = (item: T) => boolean;
export class FilteredView<T> implements ViewFunction<T> {
  /**
   * | oldValue | newValue | shouldRegenrateView |
   * | true     | true     | true          (SET) |
   * | true     | false    | true         (STAY) |
   * | false    | true     | true          (SET) |
   * | false    | false    | false        (STAY) |
   */
  private shouldRegenerateView: boolean = true;
  private shouldRefineView: boolean = true;
  private lastSource: Array<T> = null;
  private currentView: Array<T>;

  private filterFunctions: Map<any, FilterFunction<T>> = new Map();

  view(source: Array<T>): Array<T> {
    this.regenerateView(source);
    return this.currentView;
  }

  private regenerateView(source: Array<T>) {
    if (source === this.lastSource) {
      if (this.shouldRegenerateView && this.shouldRefineView) {
        source = this.currentView;
      } else {
        return;
      }
    }

    const filter = this.filter;
    if (filter) {
      this.currentView = source.filter(filter);
    } else {
      // no filter is applied
      this.currentView = source;
    }

    this.shouldRegenerateView = false;
    this.shouldRefineView = true;
    this.lastSource = source;
  }

  addFilterFunction(key: any, filterFunction: FilterFunction<T>): boolean {
    if (this.filterFunctions.get(key) === filterFunction) {
      return false;
    }

    this.filterFunctions.set(key, filterFunction);
    return this.shouldRegenerateView = true;
  }

  deleteFilterFunction(key: any): boolean {
    if (this.filterFunctions.delete(key)) {
      this.shouldRefineView = false;
      return this.shouldRegenerateView = true;
    }
    return false;
  }

  clearFilterFunction() {
    if (this.filterFunctions.size === 0) {
      return false;
    }
    this.filterFunctions.clear();
    this.shouldRefineView = false;
    return this.shouldRegenerateView = true;
  }

  get filter(): FilterFunction<T> {
    const numFilterFunction: number = this.filterFunctions.size;
    if (numFilterFunction === 0) {
      return null;
    }

    const filterFunctions = Array.from(this.filterFunctions.values());
    return (item) => filterFunctions.every(filterFunction => filterFunction(item));
  }
}

type SortingFunction<T> = (e1: T, e2: T) => number;
interface SortingFunctionWithPriority<T> {
  sortingFunction: SortingFunction<T>;
  priority: number;
}
export class SortedView<T> implements ViewFunction<T> {
  private shouldRegenerateView: boolean = true;

  private lastSource: Array<T>;
  private currentView: Array<T>;

  private sortingFunctions: Map<any, SortingFunctionWithPriority<T>> = new Map();

  view(source?: Array<T>): Array<T> {
    this.regenerateView(source);
    return this.currentView;
  }

  private regenerateView(source: Array<T>) {
    if (source === this.lastSource && !this.shouldRegenerateView) {
      // source has not change and sorting functions have not changed => we can reuse current view
      return;
    }

    const sorter = this.sorter;

    if (sorter) {
      const indices: Array<number> = Array.from(source.keys());
      indices.sort((index1, index2) => sorter(source[index1], source[index2]));
      this.currentView = indices.map(index => source[index]);
    } else {
      this.currentView = source;
    }

    this.lastSource = source;
    this.shouldRegenerateView = false;
  }

  addSortingFunction(key: any, sortingFunction: SortingFunction<T>, priority: number = -this.sortingFunctions.size): boolean {
    const existingSortingFunction = this.sortingFunctions.get(key);
    if (existingSortingFunction && existingSortingFunction.priority === priority && existingSortingFunction.sortingFunction === sortingFunction) {
      return false;
    }

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

  reorderSortingFunction(reordering: Map<any, number>): boolean {
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

  get sorter(): SortingFunction<T> {
    const numSortingFunction: number = this.sortingFunctions.size;
    if (numSortingFunction === 0) {
      return null;
    }

    const sortingFunctions = Array.from(this.sortingFunctions);
    // higher priority sorting function comes first
    sortingFunctions.sort((s1, s2) => s2[1].priority - s1[1].priority);

    return (e1, e2) => {
      let sortingFunctionIndex = 0;
      while (sortingFunctionIndex < numSortingFunction) {
        const {sortingFunction} = sortingFunctions[sortingFunctionIndex][1];
        const result: number = sortingFunction(e1, e2);
        if (result !== 0) {
          return result;
        }

        sortingFunctionIndex++;
      }
      return 0;
    };
  }
}
