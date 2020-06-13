// import { fillerClass, topFillerClass, bottomFillerClass } from "../../../constants/css-classes";

export interface ViewFunction<T> {
  view(source: Array<T>): Array<T>;
}

function bound(n: number, lowerBound: number = 0, upperBound: number = Number.POSITIVE_INFINITY) {
  return Math.min(upperBound, Math.max(lowerBound, n));
}

// interface IntersectionObserverOptions {
//   root?: Element;
//   rootMargin?: string;
//   thresholds?: ReadonlyArray<number>;
// }
// export class ScrollableView<T> implements ViewFunction<T> {
//   private lastSource: Array<T>;
//   private currentView: Array<T>;
//
//   private topFillerElement: HTMLElement;
//   private bottomFillerElement: HTMLElement;
//
//   private topFillerObserver: IntersectionObserver;
//   private bottomFillerObserver: IntersectionObserver;
//
//   private topSentinelObserver: IntersectionObserver;
//   private bottomSentinelObserver: IntersectionObserver;
//
//   private elementExtractor: (element: T) => HTMLElement;
//
//   private partialRenderingCondition: (source: Array<T>) => boolean;
//
//   private get elementHeightEstimate(): number {
//     if (this.numElementInView === 0) {
//       return 0;
//     }
//     return this.elementExtractor(this.currentView[0]).clientHeight;
//   }
//
//   private defaultViewWindowSize: number = 200;
//
//   get numElement(): number {
//     return this.lastSource.length;
//   }
//
//   get numElementInView(): number {
//     return this.currentView.length;
//   }
//
//   get viewWindowSize(): number {
//     return Math.min(this.numElement, this.defaultViewWindowSize);
//   }
//
//   private _numElementNotRenderedAbove: number;
//   get numElementNotRenderedAbove(): number {
//     return this._numElementNotRenderedAbove;
//   }
//   set numElementNotRenderedAbove(n: number) {
//     this._numElementNotRenderedAbove = n;
//     this.topFillerElement.style.height = `${this.fillerTopHeight}px`;
//   }
//   get fillerTopHeight(): number {
//     return this.elementHeightEstimate * this.numElementNotRenderedAbove;
//   }
//   get reachedTop(): boolean {
//     return this.numElementNotRenderedAbove === 0;
//   }
//
//   private _numElementNotRenderedBelow: number;
//   get numElementNotRenderedBelow(): number {
//     return this._numElementNotRenderedBelow;
//   }
//   set numElementNotRenderedBelow(n: number) {
//     this._numElementNotRenderedBelow = n;
//     this.topFillerElement.style.height = `${this.fillerBottomHeight}px`;
//   }
//   get fillerBottomHeight(): number {
//     return this.elementHeightEstimate * this.numElementNotRenderedBelow;
//   }
//
//   get reachedBottom(): boolean {
//     return this.numElementNotRenderedBelow === 0;
//   }
//
//   get viewStartIndex(): number {
//     return this.numElementNotRenderedAbove;
//   }
//
//   get shouldPartialRender(): boolean {
//     if (this.partialRenderingCondition) {
//       return this.partialRenderingCondition(this.lastSource);
//     }
//     return this.numElement >= this.defaultViewWindowSize;
//   }
//
//   get topSentinelIndex(): number {
//     return bound(Math.floor(this.numElementInView / 4) - 1, 0, this.numElementInView);
//   }
//
//   get topSentinel(): T {
//     return this.currentView[this.topSentinelIndex];
//   }
//
//   get topSentinelElement(): HTMLElement {
//     return this.elementExtractor(this.topSentinel);
//   }
//
//   get bottomSentinelIndex(): number {
//     return bound(Math.floor(this.numElementInView / 4) * 3 - 1, 0, this.numElementInView);
//   }
//
//   get bottomSentinel(): T {
//     return this.currentView[this.bottomSentinelIndex];
//   }
//
//   get bottomSentinelElement(): HTMLElement {
//     return this.elementExtractor(this.bottomSentinel);
//   }
//
//   private initializeFiller(initalizer: () => HTMLElement) {
//     this.topFillerElement = initalizer();
//     this.bottomFillerElement = initalizer();
//     this.topFillerElement.classList.add(fillerClass, topFillerClass);
//     this.bottomFillerElement.classList.add(fillerClass, bottomFillerClass);
//   }
//
//   private mountFiller(target: Element) {
//     target.insertAdjacentElement("afterbegin", this.topFillerElement);
//     target.insertAdjacentElement("beforeend", this.bottomFillerElement);
//   }
//
//   private unmountFiller(target: Element) {
//     Array.from(target.getElementsByClassName(fillerClass)).forEach(element => element.remove());
//   }
//
//   private initializeTopFillerObserver(options?: IntersectionObserverOptions) {
//     this.topFillerObserver = new IntersectionObserver((entries) => this.onTopFillerReached(entries), options);
//   }
//
//   private initializeBottomFillerObserver(options?: IntersectionObserverOptions) {
//     this.bottomFillerObserver = new IntersectionObserver((entries) => this.onBottomFillerReached(entries), options);
//   }
//
//   private initializeTopSentinelObserver(options?: IntersectionObserverOptions) {
//     this.topSentinelObserver = new IntersectionObserver((entries) => this.onTopSentinelReached(entries), options);
//   }
//
//   private initializeBottomSentinelObserver(options?: IntersectionObserverOptions) {
//     this.bottomSentinelObserver = new IntersectionObserver((entries) => this.onBottomSentinelReached(entries), options);
//   }
//
//   private activateTopFillerObserver() {
//     this.topFillerObserver.observe(this.topFillerElement);
//   }
//
//   private activateBottomFillerObserver() {
//     this.bottomFillerObserver.observe(this.bottomFillerElement);
//   }
//
//   private activateTopSentinelObserver() {
//     this.topSentinelObserver.observe(this.topSentinelElement);
//   }
//
//   private activateBottomSentinelObserver() {
//     this.bottomSentinelObserver.observe(this.bottomSentinelElement);
//   }
//
//   private activateFillerObservers() {
//     this.activateTopFillerObserver();
//     this.activateBottomFillerObserver();
//   }
//
//   private activateSentinelObservers() {
//     this.activateTopSentinelObserver();
//     this.activateBottomSentinelObserver();
//   }
//
//   private activateObservers() {
//     this.activateFillerObservers();
//     this.activateSentinelObservers();
//   }
//
//   private deactivateTopFillerObserver() {
//     this.topFillerObserver.unobserve(this.topFillerElement);
//   }
//
//   private deactivateBottomFillerObserver() {
//     this.bottomFillerObserver.unobserve(this.bottomFillerElement);
//   }
//
//   private deactivateTopSentinelObserver() {
//     this.topFillerObserver.disconnect();
//   }
//
//   private deactivateBottomSentinelObserver() {
//     this.bottomFillerObserver.disconnect();
//   }
//
//   private deactivateFillerObservers() {
//     this.deactivateTopFillerObserver();
//     this.deactivateBottomFillerObserver();
//   }
//
//   private deactivateSentinelObservers() {
//     this.deactivateTopSentinelObserver();
//     this.deactivateBottomFillerObserver();
//   }
//
//   private deactivateObservers() {
//     this.deactivateFillerObservers();
//     this.deactivateSentinelObservers();
//   }
//
//   shiftRenderingView(shiftDownAmount: number) {
//     const isScrollDown: boolean = shiftDownAmount >= 0;
//     if ((isScrollDown && this.reachedBottom) || (!isScrollDown && this.reachedTop)) {
//       return;
//     }
//
//     const currentStartIndex = this.viewStartIndex;
//     const newStartIndex = bound(currentStartIndex + shiftDownAmount, 0, this.numElement);
//     const newEndIndex = bound(newStartIndex + this.viewWindowSize, 0, this.numElement);
//     this.setRenderingView(newStartIndex, newEndIndex);
//   }
//
//   setRenderingView(startIndex: number, endIndex: number = startIndex + this.viewWindowSize) {
//     this.currentView = this.lastSource.slice(startIndex, endIndex);
//     this.numElementNotRenderedAbove = startIndex;
//     this.numElementNotRenderedBelow = this.numElement - this.numElementNotRenderedAbove - this.numElementInView;
//   }
//
//   private onFillerReached(entries: Array<IntersectionObserverEntry>) {
//   }
//   private onTopFillerReached(entries: Array<IntersectionObserverEntry>) {
//     if (this.reachedTop) {
//       return;
//     }
//   }
//   private onBottomFillerReached(entries: Array<IntersectionObserverEntry>) {
//     if (this.reachedBottom) {
//       return;
//     }
//   }
//
//   private onSentinelReached(entries: Array<IntersectionObserverEntry>) {
//   }
//   private onTopSentinelReached(entries: Array<IntersectionObserverEntry>) {
//     if (this.reachedTop) {
//       return;
//     }
//   }
//   private onBottomSentinelReached(entries: Array<IntersectionObserverEntry>) {
//     if (this.reachedBottom) {
//       return;
//     }
//   }
// }

export class PartialView<T> implements ViewFunction<T> {
  private shouldRegenerateView: boolean = true;

  private lastSource: Array<T>;
  private currentView: Array<T>;

  private partialViewStartIndex: number;
  private partialViewEndIndex: number;

  private windowSizeUpperBound: number;

  constructor(source: Array<T> = [], windowStartIndex: number = -1, windowEndIndex: number = -1, windowSizeUpperBound: number = 200) {
    this.windowSizeUpperBound = windowSizeUpperBound;
    this.lastSource = source;
    this.setWindow(windowStartIndex, windowEndIndex);
    this.regenerateView(source);
  }

  view(source: Array<T>): Array<T> {
    this.regenerateView(source);
    return this.currentView;
  }

  private regenerateView(source: Array<T>) {
    if (source === this.lastSource && !this.shouldRegenerateView) {
      return;
    }

    this.currentView = source.slice(this.partialViewStartIndex, this.partialViewEndIndex + 1);

    this.lastSource = source;
    this.shouldRegenerateView = false;
  }


  setWindow(startIndex: number = 0, endIndex: number = startIndex + this.maximumWindowSize): boolean {
    const newStartIndex = bound(startIndex, 0, this.numElement - 1);
    const newEndIndex = bound(endIndex, newStartIndex, this.numElement - 1);

    if (newStartIndex === this.partialViewStartIndex && newEndIndex === this.partialViewEndIndex) {
      return false;
    }

    this.partialViewStartIndex = newStartIndex;
    this.partialViewEndIndex = newEndIndex;
    return this.shouldRegenerateView = true;
  }

  shiftWindow(shiftDownAmount: number): boolean {
    if (shiftDownAmount === 0) {
      return false;
    }

    const isScrollDown: boolean = shiftDownAmount >= 0;
    if ((isScrollDown && this.reachedBottom) || (!isScrollDown && this.reachedTop)) {
      return false;
    }

    const startIndex = this.partialViewStartIndex + shiftDownAmount;
    const endIndex = startIndex + this.windowSize - 1;
    return this.setWindow(startIndex, endIndex);
  }

  get numElement(): number {
    return this.lastSource.length;
  }

  get maximumWindowSize(): number {
    return Math.min(this.numElement, this.windowSizeUpperBound);
  }

  get windowSize(): number {
    return this.partialViewEndIndex - this.partialViewStartIndex + 1;
  }

  get numElementNotRenderedAbove(): number {
    return this.partialViewStartIndex;
  }

  get reachedTop(): boolean {
    return this.numElementNotRenderedAbove === 0;
  }

  get numElementNotRenderedBelow(): number {
    return this.numElement - this.numElementNotRenderedAbove - this.windowSize;
  }

  get reachedBottom(): boolean {
    return this.numElementNotRenderedBelow === 0;
  }
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

export class ViewFunctionChain<T> implements ViewFunction<T> {
  private viewFunctions: Array<ViewFunction<T>>;

  private shouldRegenerateView: boolean = true;

  private lastSource: Array<T>;
  private currentView: Array<T>;

  constructor(viewFunctions: Array<ViewFunction<T>> = []) {
    this.viewFunctions = viewFunctions;
  }

  view(source: Array<T>): Array<T> {
    this.regenerateView(source);
    return this.currentView;
  }

  modifyViewFunction(index: number): ViewFunction<T> {
    this.shouldRegenerateView = true;
    return this.viewFunctions[index];
  }

  modifyViewFunctions(): Array<ViewFunction<T>> {
    this.shouldRegenerateView = true;
    return this.viewFunctions;
  }

  private regenerateView(source: Array<T>) {
    if (source === this.lastSource && !this.shouldRegenerateView) {
      return;
    }

    this.currentView = this.viewFunctions.reduce((_source, viewFunction) => viewFunction.view(_source), source);

    this.lastSource = source;
    this.shouldRegenerateView = false;
  }
}
