// import { Constructor } from "../../../utils/mixins";
//
//
// export interface View<T> extends Constructor {
//   view__(): Array<T>;
// }
//
// type FilterFunction<T> = (item: T) => boolean;
// export function Filtered<T>(superClass: View<T>) {
//   return class Filtered extends superClass {
    /**
     * | oldValue | newValue | shouldRegenrateView |
     * | true     | true     | true          (SET) |
     * | true     | false    | true         (STAY) |
     * | false    | true     | true          (SET) |
     * | false    | false    | false        (STAY) |
     */
//     private _shouldRegenerateView: boolean;
//     private _shouldRefineView: boolean;
//     private _view: Array<T>;
//
//     private _sourceLastSnapshot: Array<T>;
//
//     private _filterFunctions: Map<any, FilterFunction<T>>;
//
//     constructor(...args: any[]) {
//       super(...args);
//       Object.defineProperties(this, {
//         _shouldRegenerateView: {
//             configurable: false,
//             enumerable: false,
//             value: true,
//             writable: true
//         },
//         _shouldRefineView: {
//           configurable: false,
//           enumerable: false,
//           value: true,
//           writable: true
//         },
//         _view: {
//           configurable: false,
//           enumerable: false,
//           value: null,
//           writable: true
//         },
//         _sourceLastSnapshot: {
//           configurable: false,
//           enumerable: false,
//           value: null,
//           writable: true
//         },
//         _filterFunctions: {
//           configurable: false,
//           enumerable: false,
//           value: new Map(),
//           writable: true
//         }
//       });
//     }
//
//     view__(): Array<T> {
//       if (this._shouldRegenerateView) {
//         this.__regenerateView();
//       }
//       return this._view;
//     }
//
//     private get _source(): Array<T> {
//       const sourceSnapshot = super.view__();
//       if (sourceSnapshot === this._sourceLastSnapshot) {
//         return null;
//       } else {
//         return this._sourceLastSnapshot = sourceSnapshot;
//       }
//     }
//
//     addFilterFunction__(key: any, filterFunction: FilterFunction<T>): boolean {
//       if (this._filterFunctions.get(key) === filterFunction) {
//         return false;
//       }
//
//       this._filterFunctions.set(key, filterFunction);
//       return this._shouldRegenerateView = true;
//     }
//
//     deleteSortingFunction__(key: any): boolean {
//       if (this._filterFunctions.delete(key)) {
//         this._shouldRefineView = false;
//         return this._shouldRegenerateView = true;
//       }
//       return false;
//     }
//
//     clearFilterFunction__() {
//       if (this._filterFunctions.size === 0) {
//         return false;
//       }
//       this._filterFunctions.clear();
//       this._shouldRefineView = false;
//       return this._shouldRegenerateView = true;
//     }
//
//     get filter_(): FilterFunction<T> {
//       const numFilterFunction: number = this._filterFunctions.size;
//       if (numFilterFunction === 0) {
//         return null;
//       }
//
//       const filterFunctions = Array.from(this._filterFunctions.values());
//       return (item) => filterFunctions.every(filterFunction => filterFunction(item));
//     }
//
//     private __regenerateView() {
//       const filter = this.filter_;
//
//       let source: Array<T> = this._source;
//       if (!source && this._shouldRefineView) {
//         // parent view has not change and filters have only increased since last view generation
//         source = this._view;
//       }
//
//       let view: Array<T> = [];
//       if (filter) {
//         for (const item of source) {
//           if (filter(item)) {
//             view.push(item);
//           }
//         }
//       } else {
//         // no filter is applied
//         view = source;
//       }
//
//       this._view = view;
//       this._shouldRefineView = true;
//       this._shouldRegenerateView = false;
//     }
//   };
// }
//
// type SortingFunction<T> = (e1: T, e2: T) => number;
// interface SortingFunctionWithPriority<T> {
//   sortingFunction: SortingFunction<T>;
//   priority: number;
// }
// export function Sorted<T>(superClass: View<T>) {
//   return class Sorted extends superClass {
//     private _shouldRegenerateView: boolean;
//     private _view: Array<T>;
//
//     private _sortingFunctions: Map<any, SortingFunctionWithPriority<T>>;
//
//     constructor(...args: any[]) {
//       super(...args);
//       Object.defineProperties(this, {
//         _shouldRegenerateView: {
//             configurable: false,
//             enumerable: false,
//             value: true,
//             writable: true
//         },
//         _view: {
//           configurable: false,
//           enumerable: false,
//           value: null,
//           writable: true
//         },
//         _sortingFunctions: {
//           configurable: false,
//           enumerable: false,
//           value: new Map(),
//           writable: true
//         }
//       });
//     }
//
//     view__(): Array<T> {
//       if (this._shouldRegenerateView) {
//         this.__regenerateView();
//       }
//       return this._view;
//     }
//
//     addSortingFunction__(key: any, sortingFunction: SortingFunction<T>, priority: number = -this._sortingFunctions.size): boolean {
//       const existingSortingFunction = this._sortingFunctions.get(key);
//       if (existingSortingFunction && existingSortingFunction.priority === priority && existingSortingFunction.sortingFunction === sortingFunction) {
//         return false;
//       }
//
//       this._sortingFunctions.set(key, { sortingFunction, priority });
//       return this._shouldRegenerateView = true;
//     }
//
//     deleteSortingFunction__(key: any): boolean {
//       if (this._sortingFunctions.delete(key)) {
//         return this._shouldRegenerateView = true;
//       }
//       return false;
//     }
//
//     clearSortingFunction__(): boolean {
//       if (this._sortingFunctions.size === 0) {
//         return false;
//       }
//
//       this._sortingFunctions.clear();
//       return this._shouldRegenerateView = true;
//     }
//
//     reorderSortingFunction__(reordering: Map<any, number>): boolean {
//       let shouldRegenerateView = false;
//
//       for (const [key, newPriority] of reordering) {
//         const { priority, sortingFunction } = this._sortingFunctions.get(key);
//         if (priority !== newPriority) {
//           this._sortingFunctions.set(key, { priority: newPriority, sortingFunction });
//           shouldRegenerateView = true;
//         }
//       }
//
//       if (shouldRegenerateView) {
//         return this._shouldRegenerateView = shouldRegenerateView;
//       }
//       return false;
//     }
//
//     get sorter_(): SortingFunction<T> {
//       const numSortingFunction: number = this._sortingFunctions.size;
//       if (numSortingFunction === 0) {
//         return null;
//       }
//
//       const sortingFunctions = Array.from(this._sortingFunctions);
//       // higher priority sorting function comes first
//       sortingFunctions.sort((s1, s2) => s2[1].priority - s1[1].priority);
//
//       return (e1, e2) => {
//         let sortingFunctionIndex = 0;
//         while (sortingFunctionIndex < numSortingFunction) {
//           const {sortingFunction} = sortingFunctions[sortingFunctionIndex][1];
//           const result: number = sortingFunction(e1, e2);
//           if (result !== 0) {
//             return result;
//           }
//
//           sortingFunctionIndex++;
//         }
//         return 0;
//       };
//     }
//
//     private __regenerateView() {
//       const sorter = this.sorter_;
//
//       if (sorter) {
//         const source: Array<T> = super.view__();
//         const indices: Array<number> = Array.from(source.keys());
//         indices.sort((index1, index2) => sorter(source[index1], source[index2]));
//         this._view = indices.map(index => source[index]);
//       }
//
//       this._shouldRegenerateView = false;
//     }
//   };
// }
//
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
