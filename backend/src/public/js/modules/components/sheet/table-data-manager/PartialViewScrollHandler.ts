import { PartialView } from "./ViewFunction";
import { bound } from "../../../utils/math";
import { fillerClass, topFillerClass, bottomFillerClass } from "../../../constants/css-classes";


interface IntersectionObserverOptions {
  root?: Element;
  rootMargin?: string;
  thresholds?: ReadonlyArray<number>;
}

enum Direction {
    Up,
    Down,
    Left,
    Right,
    Stay
}

interface PartialViewScrollHandlerOptions<T> {
  elementExtractor: (viewElement: T) => HTMLElement;
  partialView: PartialView<T>;
  partialViewArea: HTMLElement;
  scrollTarget: HTMLElement;
  elementHeight: number;
  fillerInitializer?: () => HTMLElement;
  beforeViewUpdate?: (handler: PartialViewScrollHandler<T>) => void;
  afterViewUpdate?: (handler: PartialViewScrollHandler<T>) => void;
  topFillerOptions?: IntersectionObserverOptions;
  bottomFillerOptions?: IntersectionObserverOptions;
  topSentinelOptions?: IntersectionObserverOptions;
  bottomSentinelOptions?: IntersectionObserverOptions;
}


export class PartialViewScrollHandler<T> {
  protected scrollTarget: HTMLElement;
  protected lastScrollPosition: number = 0;
  protected get scrollPosition(): number {
    return this.scrollTarget.scrollTop;
  }

  /**
   * store current scroll position and report whether the scroll direction is going upward or downward
   */
  protected get scrollDirection(): Direction {
    const scrollPosition = this.scrollPosition;
    let scrollDirection;
    if (scrollPosition > this.lastScrollPosition) {
      scrollDirection = Direction.Down;
    } else if (scrollPosition === this.lastScrollPosition) {
      scrollDirection = Direction.Stay;
    } else {
      scrollDirection = Direction.Up;
    }
    this.lastScrollPosition = scrollPosition;
    return scrollDirection;
  }

  protected partialView: PartialView<T>;
  protected elementExtractor: (viewElement: T) => HTMLElement;
  protected elementHeight: number;

  get shouldPartialRender(): boolean {
    return this.partialView.numElement > this.partialView.maximumWindowSize;
  }

  protected partialViewArea: HTMLElement;
  beforeViewUpdate: (handler: PartialViewScrollHandler<T>) => void;
  afterViewUpdate: (handler: PartialViewScrollHandler<T>) => void;

  topFillerElement: HTMLElement;
  bottomFillerElement: HTMLElement;
  protected topFillerObserver: IntersectionObserver;
  protected bottomFillerObserver: IntersectionObserver;
  get topFillerHeight(): number {
    return this.partialView.numElementNotRenderedBefore * this.elementHeight;
  }
  get bottomFillerHeight(): number {
    return this.partialView.numElementNotRenderedAfter * this.elementHeight;
  }

  get topSentinelIndex(): number {
    return bound(Math.floor(this.partialView.windowSize / 4) - 1, 0, this.partialView.windowSize);
  }
  get topSentinel(): T {
    return this.partialView.currentView[this.topSentinelIndex];
  }
  get topSentinelElement(): HTMLElement {
    return this.elementExtractor(this.topSentinel);
  }
  get bottomSentinelIndex(): number {
    return bound(Math.floor(this.partialView.windowSize / 4) * 3 - 1, 0, this.partialView.windowSize);
  }
  get bottomSentinel(): T {
    return this.partialView.currentView[this.bottomSentinelIndex];
  }
  get bottomSentinelElement(): HTMLElement {
    return this.elementExtractor(this.bottomSentinel);
  }
  protected topSentinelObserver: IntersectionObserver;
  protected bottomSentinelObserver: IntersectionObserver;

  protected scrollTimeoutId: number;

  constructor(options: PartialViewScrollHandlerOptions<T>) {
    this.elementExtractor = options.elementExtractor;
    this.partialView = options.partialView;
    this.scrollTarget = options.scrollTarget;
    this.elementHeight = options.elementHeight;
    this.partialViewArea = options.partialViewArea;
    this.beforeViewUpdate = options.beforeViewUpdate;
    this.afterViewUpdate = options.afterViewUpdate;

    this.initializeScrollEventListener();
    this.initializeFillers(options.fillerInitializer);
    this.initializeFillerObservers(options.topFillerOptions, options.bottomFillerOptions);
    this.initializeSentinelObservers(options.topSentinelOptions, options.bottomSentinelOptions);
    this.syncView();
    this.activateObservers();
  }

  protected initializeScrollEventListener() {
    this.scrollTarget.addEventListener("scroll", () => {
      if (this.scrollTimeoutId) {
        window.clearTimeout(this.scrollTimeoutId);
      }
      this.scrollTimeoutId = window.setTimeout(() => {
        const startIndex = this.calculateStartIndexByScrollAmount();
        if (startIndex < this.partialView.partialViewStartIndex && this.partialView.partialViewEndIndex < startIndex) {
          // view out of sync
          this.setWindow(startIndex);
        }
      }, 400);
    }, { passive: true });
  }

  protected initializeFillers(initializer: () => HTMLElement = () => document.createElement("div")) {
    this.topFillerElement = initializer();
    this.topFillerElement.classList.add(fillerClass, topFillerClass);
    this.partialViewArea.before(this.topFillerElement);

    this.bottomFillerElement = initializer();
    this.bottomFillerElement.classList.add(fillerClass, bottomFillerClass);
    this.partialViewArea.after(this.bottomFillerElement);

    this.setFillerHeights();
  }

  protected setFillerHeights(topFillerHeight: number = this.topFillerHeight, bottomFillerHeight: number = this.bottomFillerHeight) {
    this.topFillerElement.style.height = `${topFillerHeight}px`;
    this.bottomFillerElement.style.height = `${bottomFillerHeight}px`;
  }

  protected initializeFillerObservers(topFillerOptions?: IntersectionObserverOptions, bottomFillerOptions?: IntersectionObserverOptions) {
    this.topFillerObserver = new IntersectionObserver(entries => this.fillerReachedHandler(entries), topFillerOptions);
    this.bottomFillerObserver = new IntersectionObserver(entries => this.fillerReachedHandler(entries), bottomFillerOptions);
  }

  protected initializeSentinelObservers(topSentinelOptions?: IntersectionObserverOptions, bottomSentinelOptions?: IntersectionObserverOptions) {
    this.topSentinelObserver = new IntersectionObserver(entries => this.sentinelReachedHandler(entries), topSentinelOptions);
    this.bottomSentinelObserver = new IntersectionObserver(entries => this.sentinelReachedHandler(entries), bottomSentinelOptions);
  }

  activateObservers() {
    if (this.shouldPartialRender) {
      this.topFillerObserver.observe(this.topFillerElement);
      this.bottomFillerObserver.observe(this.bottomFillerElement);
      this.topSentinelObserver.observe(this.topSentinelElement);
      this.bottomSentinelObserver.observe(this.bottomSentinelElement);
    }
  }

  deactivateObservers() {
    this.topFillerObserver.disconnect();
    this.bottomFillerObserver.disconnect();
    this.topSentinelObserver.disconnect();
    this.bottomSentinelObserver.disconnect();
  }

  setWindow(startIndex: number, endIndex: number = startIndex + this.partialView.maximumWindowSize - 1) {
    if (this.beforeViewUpdate) {
      this.beforeViewUpdate(this);
    }
    this.deactivateObservers();
    this.partialView.setWindow(startIndex, endIndex);
    this.partialView.view(this.partialView.lastSource);
    this.syncView();
    this.activateObservers();
    if (this.afterViewUpdate) {
      this.afterViewUpdate(this);
    }
  }

  protected syncView() {
    const position = this.scrollPosition;
    const view: Array<T> = this.partialView.currentView;
    this.setFillerHeights();
    while (this.partialViewArea.firstChild) {
      this.partialViewArea.lastChild.remove();
    }
    const fragment = new DocumentFragment();
    view.forEach(viewElement => fragment.appendChild(this.elementExtractor(viewElement)));
    this.partialViewArea.appendChild(fragment);
    this.scrollTarget.scrollTop = position;
  }

  protected calculateStartIndexByScrollAmount(scrollAmount: number = this.scrollPosition) {
    const position = bound(scrollAmount - this.topFillerElement.offsetTop, 0);
    return bound(Math.floor(position / this.elementHeight), 0, this.partialView.numElement);
  }

  protected fillerReachedHandler(entries: Array<IntersectionObserverEntry>) {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRect.height > 0) {
        const startIndex = this.calculateStartIndexByScrollAmount();
        this.setWindow(startIndex);
      }
    });
  }

  protected sentinelReachedHandler(entries: Array<IntersectionObserverEntry>) {
    const shiftAmount = Math.floor(this.partialView.maximumWindowSize / 2);
    const scrollDirection: Direction = this.scrollDirection;

    entries.forEach(entry => {
      const desiredDirection: Direction = this.topSentinelElement === entry.target ? Direction.Up : Direction.Down;
      if (entry.isIntersecting && entry.intersectionRect.height > 0 && scrollDirection === desiredDirection) {
        // the last element of the first data section is appearing into view
        const startIndex: number = this.partialView.numElementNotRenderedBefore + (scrollDirection === Direction.Up ? -shiftAmount : shiftAmount);
        this.setWindow(startIndex);
      }
    });
  }
}
