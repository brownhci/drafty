/**
 * @module
 *
 * This module provides functions that transform a source view into a target view, where a view is simply an array of elements.
 *
 * These transformations have following properties:
 *
 *    + non-destructive: since the source view for a view function might be used elsewhere, the view function provides the guarantee of not modifying the source view.
 *    + efficient: view generation is avoided as much as possible, especially when same view is provided.
 *    + chainable: see {@link ViewFunctionChain}. The target view of a view function can be passed as source view for another view function. This chaining is still efficient since view generation is avoided when possible at every view function and at the aggregate view function. Therefore, if a view function in the chain changed while the initial source view does not change, the target views before that changed view function is reused while every view function after it will regenerate its view.
 */

import { TaskQueue } from "./TaskQueue";
import { bound } from "../../../utils/math";


/**
 * ViewFunction represents an unit in transforming a source view to a target view.
 *
 * Some `ViewFunction` implementations in this modules includes:
 *
 *    + `FilteredView` which selects elements meeting certain conditions
 *    + `SortedView` which reorders elements according to some criterion
 *
 * @type T: Element type, a view is represented as an array of elements.
 */
export interface ViewFunction<T> {
  /**
   * The view transformer function which will consume a `source` view and produces a target view of same type.
   *
   * @param {Array<T>} source - An array of elements of certain type. Represents the source view. The source view will not be modified.
   * @param {boolean} useCache - Whether previous target view (cache) can be reused giving same source view and same transformation.
   * @return {Array<T>} The transformed view as an array of elements of same type.
   */
  view(source: Array<T>, useCache?: boolean): Array<T>;
}


/**
 * A function type that determines whether an element from the source view should retain in the target view.
 *
 * @param {T} element - An element to be filtered.
 * @returns {boolean} True if this element should be kept in the target view.
 */
export type FilterFunction<T> = (element: T) => boolean;

/**
 * Selects elements meeting certain condition(s).
 */
export class FilteredView<T> implements ViewFunction<T> {
  /** should target view be regenerated if source view is the same */
  private shouldRegenerateView: boolean = true;
  /** should target view be regenerated based off the last target view `this.currentView` (making refinement to current view) if target view needs to be regenerated */
  private shouldRefineView: boolean = true;
  /** previous source view, used to determine whether source view is the same */
  lastSource: Array<T> = null;
  /** holds target view */
  private _currentView: Array<T>;
  get currentView(): Array<T> {
    return this._currentView;
  }
  set currentView(view: Array<T>) {
    this.beforeViewUpdateTaskQueue.work();
    this._currentView = view;
    this.afterViewUpdateTaskQueue.work();
  }

  /** tasks executed before view update */
  beforeViewUpdateTaskQueue: TaskQueue = new TaskQueue();
  /** tasks executed after view update */
  afterViewUpdateTaskQueue: TaskQueue = new TaskQueue();

  /** A mapping from identifier to filter function */
  private filterFunctions: Map<any, FilterFunction<T>> = new Map();

  /** The aggregate filter function -- ANDing all filter functions */
  get filter(): FilterFunction<T> {
    const numFilterFunction: number = this.filterFunctions.size;
    if (numFilterFunction === 0) {
      return null;
    }

    const filterFunctions = Array.from(this.filterFunctions.values());
    return (item) => filterFunctions.every(filterFunction => filterFunction(item));
  }

  /**
   * @public
   * @override
   * @description View is lazily generated. In other words, last target view is cached and reused if possible.
   */
  view(source: Array<T>, useCache: boolean = true): Array<T> {
    this.regenerateView(source, useCache);
    return this.currentView;
  }

  /**
   * Regenerates the target view if any of the following conditions are true:
   *
   *    + `source` view changed
   *    + target view should be regenerated -- the filter functions changed
   *
   * If both conditions are false, nothing will be done -- same target view will be returned.
   *
   * If `source` view does not change and only new filter functions have been added, target view will be generated from last target view. In other words, previous target view will be refined to reduce computation.
   *
   * @param {Array<T>} source - An array of elements of certain type representing the source view.
   * @param {boolean} useCache - Whether previous target view (cache) can be reused giving same source view and same transformation.
   */
  private regenerateView(source: Array<T>, useCache: boolean) {
    if (useCache && source === this.lastSource) {
      if (this.shouldRegenerateView) {
        if (this.shouldRefineView) {
          source = this.currentView;
        }
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

  /**
   * Binds a filter function under a key.
   *
   * Will trigger a regeneration of view if different filter function was bound to the key.
   *
   * Will cause **refinement** if only filter functions have been added `this.filterFunctions`.
   *
   * @public
   * @param {any} key - An identifier.
   * @param {FilterFunction<T>} filterFunction - A function to determine whether an element in the source view should be kept in the target view.
   * @returns Whether this operation will cause a regeneration of view. Even this operation does not cause view regeneration, a view regeneration might still happen because of other operations.
   */
  addFilterFunction(key: any, filterFunction: FilterFunction<T>): boolean {
    if (this.filterFunctions.get(key) === filterFunction) {
      return false;
    }

    if (this.filterFunctions.has(key)) {
      // when there is already an existing different filter function registered under the same key, the view needs to be regenerated rather than refined
      this.shouldRefineView = false;
    }

    this.filterFunctions.set(key, filterFunction);
    return this.shouldRegenerateView = true;
  }

  /**
   * Deletes a filter function bound under given key.
   *
   * Will trigger a non-refinement regeneration of view if a filter function is actually deleted.
   *
   * @public
   * @param {any} key - An identifier.
   * @returns Whether this operation will cause a regeneration of view. Even this operation does not cause view regeneration, a view regeneration might still happen because of other operations.
   */
  deleteFilterFunction(key: any): boolean {
    if (this.filterFunctions.delete(key)) {
      this.shouldRefineView = false;
      return this.shouldRegenerateView = true;
    }
    return false;
  }

  /**
   * Clears all filter functions.
   *
   * Will trigger a non-refinement regeneration of view if there are filter functions removed.
   *
   * @public
   * @returns Whether this operation will cause a regeneration of view. Even this operation does not cause view regeneration, a view regeneration might still happen because of other operations.
   */
  clearFilterFunction() {
    if (this.filterFunctions.size === 0) {
      return false;
    }
    this.filterFunctions.clear();
    this.shouldRefineView = false;
    return this.shouldRegenerateView = true;
  }
}


/**
 * Selects a window from a view.
 */
export class PartialView<T> implements ViewFunction<T> {
  /** should target view be regenerated if source view is the same */
  private shouldRegenerateView: boolean = true;

  /** previous source view, used to determine whether source view is the same */
  lastSource: Array<T>;
  /** holds target view */
  private _currentView: Array<T>;
  get currentView(): Array<T> {
    return this._currentView;
  }
  set currentView(view: Array<T>) {
    this.beforeViewUpdateTaskQueue.work();
    this._currentView = view;
    this.afterViewUpdateTaskQueue.work();
  }

  /** tasks executed before view update */
  beforeViewUpdateTaskQueue: TaskQueue = new TaskQueue();
  /** tasks executed after view update */
  afterViewUpdateTaskQueue: TaskQueue = new TaskQueue();

  /** start index of the window, inclusive */
  partialViewStartIndex: number;
  /** end index of the window, inclusive */
  partialViewEndIndex: number;

  /** a hard limit on the length of the window */
  private windowSizeUpperBound: number;

  /** number of elements in source view. */
  get numElement(): number {
    return this.lastSource.length;
  }

  /** maximum window size -- maximum number of elements in the window */
  get maximumWindowSize(): number {
    return Math.min(this.numElement, this.windowSizeUpperBound);
  }

  /**
   * Changes the maximum window size by providing an upper bound. If this upper bound causes the maximum window size to change (more or less elements can be rendered), try to expand the window to be maximum window size.
   *
   * @param {number} windowSizeUpperBound - Similar to `this.windowSizeUpperBound`, a hard fixed (compared to the number of elements upper bound which changes when elements are removed or added) upper bound for window size.
   */
  set maximumWindowSize(windowSizeUpperBound: number) {
    const maximumWindowSize = this.maximumWindowSize;
    this.windowSizeUpperBound = windowSizeUpperBound;
    if (maximumWindowSize !== this.maximumWindowSize) {
      // maximum window size changes
      this.setWindow(this.partialViewStartIndex);
    }
  }

  /** actual window size - number of elements in target view */
  get windowSize(): number {
    return this.partialViewEndIndex - this.partialViewStartIndex + 1;
  }

  /** number of elements in source view not rendered because they are "before" the window */
  get numElementNotRenderedBefore(): number {
    return this.partialViewStartIndex;
  }

  /** whether the window has reached the left boundary -- it cannot be shifted leftward without shrinking the window length */
  get reachedStart(): boolean {
    return this.numElementNotRenderedBefore === 0;
  }

  /** number of elements in source view not rendered because they are "after" the window */
  get numElementNotRenderedAfter(): number {
    return this.numElement - this.numElementNotRenderedBefore - this.windowSize;
  }

  /** whether the window has reached the right boundary -- it cannot be shifted rightward without shrinking the window length */
  get reachedEnd(): boolean {
    return this.numElementNotRenderedAfter === 0;
  }

  /**
   * Creates a PartialView instance.
   *
   * @public
   * @param {Array<T>} [source = []] - initial source view.
   * @param {number} [windowStartIndex = -1] - start index of the window.
   * @param {number} [windowEndIndex = -1] - end index of the window.
   * @param {number} [windowSizeUpperBound = Number.POSITIVE_INFINITY] - Maximum window size.
   * @constructs PartialView<T>
   */
  constructor(source: Array<T> = [], windowStartIndex: number = -1, windowEndIndex: number = -1, windowSizeUpperBound: number = Number.POSITIVE_INFINITY) {
    this.windowSizeUpperBound = windowSizeUpperBound;
    this.lastSource = source;
    this.setWindow(windowStartIndex, windowEndIndex);
    this.regenerateView(source, false);
  }

  /**
   * @public
   * @override
   * @description View is lazily generated. In other words, last target view is cached and reused if possible.
   */
  view(source: Array<T>, useCache: boolean = true): Array<T> {
    this.regenerateView(source, useCache);
    return this.currentView;
  }

  /**
   * Regenerates the target view if any of the following conditions are true:
   *
   *    + `source` view changed
   *    + target view should be regenerated -- window changed
   *
   * If both conditions are false, nothing will be done -- same target view will be returned.
   *
   * @param {Array<T>} source - An array of elements of certain type representing the source view.
   * @param {boolean} useCache - Whether previous target view (cache) can be reused giving same source view and same transformation.
   */
  private regenerateView(source: Array<T>, useCache: boolean) {
    if (useCache && source === this.lastSource && !this.shouldRegenerateView) {
      return;
    }

    // if the number of elements in source decreased, trying to shift the window
    // so that same (close) number of elements are rendered
    const numElements = source.length;
    const maximumIndex = numElements - 1;

    const previousEndIndex = this.partialViewEndIndex;
    this.partialViewEndIndex = bound(this.partialViewEndIndex, 0, maximumIndex);
    const adjustment = previousEndIndex - this.partialViewEndIndex;

    this.partialViewStartIndex = bound(this.partialViewStartIndex - adjustment, 0, maximumIndex);
    this.currentView = source.slice(this.partialViewStartIndex, this.partialViewEndIndex + 1);

    this.lastSource = source;
    this.shouldRegenerateView = false;
  }

  /**
   * Sets the **window**. Window is defined by two indices -- a start index and an end index. The elements with indices between (inclusive) these two window boundaries will be included in the target view.
   *
   * The indices are safe as they will be properly bounded:
   *
   *    + `startIndex` will be lowerbounded by 0 and upperbounded by last index in source view.
   *    + `endIndex` will be lowerbounded by bounded `startIndex` and upperbounded by last index in source view.
   *
   * Will trigger a regeneration of view if window boundaries are changed.
   *
   * @public
   * @param {number} [startIndex = 0] - The start index of the window.
   * @param {number} [endIndex = startIndex + this.maximumWindowSize - 1] - The end index of the window.
   * @returns Whether this operation will cause a regeneration of view. Even this operation does not cause view regeneration, a view regeneration might still happen because of other operations.
   */
  setWindow(startIndex: number = 0, endIndex: number = startIndex + this.maximumWindowSize - 1): boolean {
    const newStartIndex = bound(startIndex, 0, this.numElement - 1);
    const newEndIndex = bound(endIndex, newStartIndex, this.numElement - 1);

    if (newStartIndex === this.partialViewStartIndex && newEndIndex === this.partialViewEndIndex) {
      return false;
    }

    this.partialViewStartIndex = newStartIndex;
    this.partialViewEndIndex = newEndIndex;
    return this.shouldRegenerateView = true;
  }

  /**
   * Shifts the current window right by some amount.
   *
   * + if `preserveWindowSize === true`
   *     Window size will not change even when it might cause no shifting happens.
   *     @example Originally, 3 elements are in the window. After trying to shift right by 3 elements, the window still has 3 elements: in order to preserve window size, the window is actually only shifted right 2 elements.
   *        0 1 2 3 4
   *       [- - -]- -
   *        - -[- - -]
   * + if `preserveWindowSize === false`
   *     Window size will not change unless there is not enough elements to include in the window after shifting.
   *
   *     @example Originally, 3 elements are in the window. After shifting right by 3 elements, only 2 elements will be in the window.
   *        0 1 2 3 4
   *       [- - -]- -
   *        - - -[- -]
   *
   * @public
   * @param {number} shiftAmount - The amount to shift the window rightward. If negative, the window will actually be shifted leftward.
   * @param {boolean} preserveWindowSize - Whether the window size should be preserved at the compromise of not shifting sufficiently or no shifting at all.
   * @returns {number} The actual amount of shifting. This number also indicates whether this operation will cause a regeneration of view: 0 means no regeneration while non-zero means regeneration needed. Even this operation does not cause view regeneration, a view regeneration might still happen because of other operations.
   */
  shiftWindow(shiftAmount: number, preserveWindowSize: boolean): number {
    if (shiftAmount === 0) {
      return 0;
    }

    const shiftTowardsEnd: boolean = shiftAmount >= 0;
    if ((shiftTowardsEnd && this.reachedEnd) || (!shiftTowardsEnd && this.reachedStart)) {
      return 0;
    }

    let startIndex, endIndex;
    if (preserveWindowSize) {
      if (shiftTowardsEnd) {
        endIndex = Math.min(this.numElement - 1, this.partialViewEndIndex + shiftAmount);
        startIndex = Math.max(0, endIndex - this.windowSize + 1);
      } else {
        startIndex = Math.max(0, this.partialViewStartIndex + shiftAmount);
        endIndex = Math.min(this.numElement - 1, startIndex + this.windowSize - 1);
      }
    } else {
      startIndex = this.partialViewStartIndex + shiftAmount;
      endIndex = startIndex + this.windowSize - 1;
    }
    const previousStartIndex = this.partialViewStartIndex;
    if (this.setWindow(startIndex, endIndex)) {
      return this.partialViewStartIndex - previousStartIndex;
    } else {
      return 0;
    }
  }
}


/**
 * A function type that orders two elements from source view.
 *
 * @param {T} e1 - The first element.
 * @param {T} e2 - The second element.
 * @returns {number} A number indicating the comparison result. {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort}
 */
export type SortingFunction<T> = (e1: T, e2: T) => number;

/**
 * This interface groups a sorting function with its priority.
 *
 * The priority number determines the precedence of sorting functions. The larger the priority number is, the more important it is.
 *
 * @example Suppose in terms of priority, S1 > S2 > S3. Then S1 will be first used to order elements. If there is a tie (two elements are equivalent according to S1), their order will then be determined by S2, and possibly by S3 if the comparison result is still a tie.
 */
export interface SortingFunctionWithPriority<T> {
  sortingFunction: SortingFunction<T>;
  priority: number;
}

/**
 * Reorders elements according to certain comparison method(s).
 */
export class SortedView<T> implements ViewFunction<T> {
  /** should target view be regenerated if source view is the same */
  private shouldRegenerateView: boolean = true;
  /** previous source view, used to determine whether source view is the same */
  lastSource: Array<T>;
  /** holds target view */
  /** holds target view */
  private _currentView: Array<T>;
  get currentView(): Array<T> {
    return this._currentView;
  }
  set currentView(view: Array<T>) {
    this.beforeViewUpdateTaskQueue.work();
    this._currentView = view;
    this.afterViewUpdateTaskQueue.work();
  }

  /** tasks executed before view update */
  beforeViewUpdateTaskQueue: TaskQueue = new TaskQueue();
  /** tasks executed after view update */
  afterViewUpdateTaskQueue: TaskQueue = new TaskQueue();

  /** a mapping from identifier to a sorting function and its priority */
  sortingFunctions: Map<any, SortingFunctionWithPriority<T>> = new Map();

  /** denotes the current smallest priority associated with sorting function */
  private smallestPriority: number = 0;

  /**
   * Existing sorting functions will be applied in order of priority -- higher priority sorting function will be used first, lower priority sorting function will be used when the higher priority ones result in tie.
   * @returns The aggregate sorting function.
   */
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

  /**
   * @public
   * @override
   * @description View is lazily generated. In other words, last target view is cached and reused if possible.
   */
  view(source?: Array<T>, useCache: boolean = true): Array<T> {
    this.regenerateView(source, useCache);
    return this.currentView;
  }

  /**
   * Regenerates the target view if any of the following conditions are true:
   *
   *    + `source` view changed
   *    + target view should be regenerated -- the sorting function changed
   *
   * @param {Array<T>} source - An array of elements of certain type representing the source view.
   * @param {boolean} useCache - Whether previous target view (cache) can be reused giving same source view and same transformation.
   */
  private regenerateView(source: Array<T>, useCache: boolean) {
    if (useCache && source === this.lastSource && !this.shouldRegenerateView) {
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

  /**
   * Binds a sorting function with given priority under a key.
   *
   * Will trigger a regeneration of view if different sorting function or same sorting function with a different priority was bound to the key.
   *
   * @public
   * @param {any} key - An identifier.
   * @param {SortingFunction<T>} sortingFunction - A function to determine how elements from source view should be ordered in the target view.
   * @param {number} [priority = this.smallestPriority - 1] - The priority of newly-bound sorting function. The higher the priority, the more important the sorting function. Default to add a least important sorting function.
   * @returns Whether this operation will cause a regeneration of view. Even this operation does not cause view regeneration, a view regeneration might still happen because of other operations.
   */
  addSortingFunction(key: any, sortingFunction: SortingFunction<T>, priority: number = this.smallestPriority - 1): boolean {
    const existingSortingFunction = this.sortingFunctions.get(key);
    if (existingSortingFunction && existingSortingFunction.priority === priority && existingSortingFunction.sortingFunction === sortingFunction) {
      return false;
    }

    this.smallestPriority = Math.min(this.smallestPriority, priority);
    this.sortingFunctions.set(key, { sortingFunction, priority });
    return this.shouldRegenerateView = true;
  }

  /**
   * Deletes a sorting function bound under given key.
   *
   * Will trigger a regeneration of view if a sorting function is actually deleted.
   *
   * @public
   * @param {any} key - An identifier.
   * @returns Whether this operation will cause a regeneration of view. Even this operation does not cause view regeneration, a view regeneration might still happen because of other operations.
   */
  deleteSortingFunction(key: any): boolean {
    if (this.sortingFunctions.delete(key)) {
      return this.shouldRegenerateView = true;
    }
    return false;
  }

  /**
   * Clears all sorting functions.
   *
   * Will trigger a regeneration of view if there are filter functions removed.
   *
   * @public
   * @returns Whether this operation will cause a regeneration of view. Even this operation does not cause view regeneration, a view regeneration might still happen because of other operations.
   */
  clearSortingFunction(): boolean {
    if (this.sortingFunctions.size === 0) {
      return false;
    }

    this.sortingFunctions.clear();
    this.smallestPriority = 0;
    return this.shouldRegenerateView = true;
  }

  /**
   * Assigns a set of sorting function different priority numbers.
   *
   * If any sorting function priority is changed, a regeneration of view will be triggered.
   *
   * @public
   * @param {Map<any, number} reordering - A mapping from identifier to new priority number.
   * @returns Whether this operation will cause a regeneration of view. Even this operation does not cause view regeneration, a view regeneration might still happen because of other operations.
   */
  reorderSortingFunction(reordering: Map<any, number>): boolean {
    let shouldRegenerateView = false;

    for (const [key, newPriority] of reordering) {
    this.smallestPriority = Math.min(this.smallestPriority, newPriority);
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
}

/**
 * Combines several view functions into an aggregate view function.
 *
 * When target view needs to be generated from a source view, the source view will be provided to first view function, whose target view will be provided as source view to the second view function until the last view function's target view be returned as the final target view.
 */
export class ViewFunctionChain<T> implements ViewFunction<T> {
  /** an array of view functions that consist the chain */
  private viewFunctions: Array<ViewFunction<T>>;
  /** should target view be regenerated if source view is the same */
  private shouldRegenerateView: boolean = true;
  /** previous source view, used to determine whether source view is the same */
  lastSource: Array<T>;
  /** holds target view */
  private _currentView: Array<T>;
  get currentView(): Array<T> {
    return this._currentView;
  }
  set currentView(view: Array<T>) {
    this.beforeViewUpdateTaskQueue.work();
    this._currentView = view;
    this.afterViewUpdateTaskQueue.work();
  }

  /** tasks executed before view update */
  beforeViewUpdateTaskQueue: TaskQueue = new TaskQueue();
  /** tasks executed after view update */
  afterViewUpdateTaskQueue: TaskQueue = new TaskQueue();

  constructor(viewFunctions: Array<ViewFunction<T>> = []) {
    this.viewFunctions = viewFunctions;
  }

  /**
   * @public
   * @override
   * @description View is lazily generated. In other words, last target view is cached and reused if possible.
   */
  view(source: Array<T>, useCache: boolean = true): Array<T> {
    this.regenerateView(source, useCache);
    return this.currentView;
  }

  /**
   * Regenerates the target view if any of the following conditions are true:
   *
   *    + `source` view changed
   *    + target view should be regenerated -- any view function is inserted, modified, removed. In other words, whether the aggregate view function changed.
   *
   * @param {Array<T>} source - An array of elements of certain type representing the source view.
   * @param {boolean} useCache - Whether previous target view (cache) can be reused giving same source view and same transformation.
   */
  private regenerateView(source: Array<T>, useCache: boolean) {
    if (useCache && source === this.lastSource && !this.shouldRegenerateView) {
      return;
    }

    // Target view will be generated by piping the source view through the chain
    this.currentView = this.viewFunctions.reduce((_source, viewFunction) => viewFunction.view(_source, useCache), source);

    this.lastSource = source;
    this.shouldRegenerateView = false;
  }

  /**
   * Retrieves a view function for modification.
   *
   * Using this function notifies the ViewFunctionChain that the target view needs to be regenerated due to view function change.
   *
   * Will trigger a view regeneration.
   *
   * @param {number} index - which view function to retrieve.
   * @returns {ViewFunction<T>} A view function in the chain.
   */
  modifyViewFunction(index: number): ViewFunction<T> {
    this.shouldRegenerateView = true;
    return this.viewFunctions[index];
  }

  /**
   * Retrieves the entire array of view function for modification.
   *
   * Note any permanent change should be committed in-place to the array. Merely assigning the array to another array will not actually change the view function chain.
   *
   * Using this function notifies the ViewFunctionChain that the target view needs to be regenerated due to view function change.
   *
   * Will trigger a view regeneration.
   *
   * @returns {Array<ViewFunction<T>>} The array of view function constitutes the chain.
   */
  modifyViewFunctions(): Array<ViewFunction<T>> {
    this.shouldRegenerateView = true;
    return this.viewFunctions;
  }
}
