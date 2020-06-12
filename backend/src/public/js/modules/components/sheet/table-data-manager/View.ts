import { Constructor } from "../../../utils/mixins";


export interface View<T> extends Constructor {
  view__(): Array<T>;
}

type FilterFunction<T> = (item: T) => boolean;
export function Filtered<T>(superClass: View<T>) {
  return class Filtered extends superClass {
    /**
     * | oldValue | newValue | shouldRegenrateView |
     * | true     | true     | true          (SET) |
     * | true     | false    | true         (STAY) |
     * | false    | true     | true          (SET) |
     * | false    | false    | false        (STAY) |
     */
    private _shouldRegenerateView: boolean;
    private _shouldRefineView: boolean;
    private _view: Array<T>;

    private _sourceLastSnapshot: Array<T>;

    private _filterFunctions: Map<any, FilterFunction<T>>;

    constructor(...args: any[]) {
      super(...args);
      Object.defineProperties(this, {
        _shouldRegenerateView: {
            configurable: false,
            enumerable: false,
            value: true,
            writable: true
        },
        _shouldRefineView: {
          configurable: false,
          enumerable: false,
          value: true,
          writable: true
        },
        _view: {
          configurable: false,
          enumerable: false,
          value: null,
          writable: true
        },
        _sourceLastSnapshot: {
          configurable: false,
          enumerable: false,
          value: null,
          writable: true
        },
        _filterFunctions: {
          configurable: false,
          enumerable: false,
          value: new Map(),
          writable: true
        }
      });
    }

    view__(): Array<T> {
      if (this._shouldRegenerateView) {
        this.__regenerateView();
      }
      return this._view;
    }

    private get _source(): Array<T> {
      const sourceSnapshot = super.view__();
      if (sourceSnapshot === this._sourceLastSnapshot) {
        return null;
      } else {
        return this._sourceLastSnapshot = sourceSnapshot;
      }
    }

    addFilterFunction__(key: any, filterFunction: FilterFunction<T>): boolean {
      if (this._filterFunctions.get(key) === filterFunction) {
        return false;
      }

      this._filterFunctions.set(key, filterFunction);
      return this._shouldRegenerateView = true;
    }

    deleteSortingFunction__(key: any): boolean {
      if (this._filterFunctions.delete(key)) {
        this._shouldRefineView = false;
        return this._shouldRegenerateView = true;
      }
      return false;
    }

    clearFilterFunction__() {
      if (this._filterFunctions.size === 0) {
        return false;
      }
      this._filterFunctions.clear();
      this._shouldRefineView = false;
      return this._shouldRegenerateView = true;
    }

    get filter_(): FilterFunction<T> {
      const numFilterFunction: number = this._filterFunctions.size;
      if (numFilterFunction === 0) {
        return null;
      }

      const filterFunctions = Array.from(this._filterFunctions.values());
      return (item) => filterFunctions.every(filterFunction => filterFunction(item));
    }

    private __regenerateView() {
      const filter = this.filter_;

      let source: Array<T> = this._source;
      if (!source && this._shouldRefineView) {
        // parent view has not change and filters have only increased since last view generation
        source = this._view;
      }

      let view: Array<T> = [];
      if (filter) {
        for (const item of source) {
          if (filter(item)) {
            view.push(item);
          }
        }
      } else {
        // no filter is applied
        view = source;
      }

      this._view = view;
      this._shouldRefineView = true;
      this._shouldRegenerateView = false;
    }
  };
}

type SortingFunction<T> = (e1: T, e2: T) => number;
interface SortingFunctionWithPriority<T> {
  sortingFunction: SortingFunction<T>;
  priority: number;
}
export function Sorted<T>(superClass: View<T>) {
  return class Sorted extends superClass {
    private _shouldRegenerateView: boolean;
    private _view: Array<T>;

    private _sortingFunctions: Map<any, SortingFunctionWithPriority<T>>;

    constructor(...args: any[]) {
      super(...args);
      Object.defineProperties(this, {
        _shouldRegenerateView: {
            configurable: false,
            enumerable: false,
            value: true,
            writable: true
        },
        _view: {
          configurable: false,
          enumerable: false,
          value: null,
          writable: true
        },
        _sortingFunctions: {
          configurable: false,
          enumerable: false,
          value: new Map(),
          writable: true
        }
      });
    }

    view__(): Array<T> {
      if (this._shouldRegenerateView) {
        this.__regenerateView();
      }
      return this._view;
    }

    addSortingFunction__(key: any, sortingFunction: SortingFunction<T>, priority: number = -this._sortingFunctions.size): boolean {
      const existingSortingFunction = this._sortingFunctions.get(key);
      if (existingSortingFunction && existingSortingFunction.priority === priority && existingSortingFunction.sortingFunction === sortingFunction) {
        return false;
      }

      this._sortingFunctions.set(key, { sortingFunction, priority });
      return this._shouldRegenerateView = true;
    }

    deleteSortingFunction__(key: any): boolean {
      if (this._sortingFunctions.delete(key)) {
        return this._shouldRegenerateView = true;
      }
      return false;
    }

    clearSortingFunction__(): boolean {
      if (this._sortingFunctions.size === 0) {
        return false;
      }

      this._sortingFunctions.clear();
      return this._shouldRegenerateView = true;
    }

    reorderSortingFunction__(reordering: Map<any, number>): boolean {
      let shouldRegenerateView = false;

      for (const [key, newPriority] of reordering) {
        const { priority, sortingFunction } = this._sortingFunctions.get(key);
        if (priority !== newPriority) {
          this._sortingFunctions.set(key, { priority: newPriority, sortingFunction });
          shouldRegenerateView = true;
        }
      }

      if (shouldRegenerateView) {
        return this._shouldRegenerateView = shouldRegenerateView;
      }
      return false;
    }

    get sorter_(): SortingFunction<T> {
      const numSortingFunction: number = this._sortingFunctions.size;
      if (numSortingFunction === 0) {
        return null;
      }

      const sortingFunctions = Array.from(this._sortingFunctions);
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

    private __regenerateView() {
      const sorter = this.sorter_;

      if (sorter) {
        const source: Array<T> = super.view__();
        const indices: Array<number> = Array.from(source.keys());
        indices.sort((index1, index2) => sorter(source[index1], source[index2]));
        this._view = indices.map(index => source[index]);
      }

      this._shouldRegenerateView = false;
    }
  };
}
