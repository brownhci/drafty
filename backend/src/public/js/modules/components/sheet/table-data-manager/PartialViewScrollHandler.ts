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
  sourceGetter: () => Array<T>;
  elementExtractor: (viewElement: T) => HTMLElement;
  partialView: PartialView<T>;
  scrollTarget: HTMLElement;
  elementHeight: number;
  partialViewArea: HTMLElement;
  beforeViewUpdate?: (handler: PartialViewScrollHandler<T>) => void;
  afterViewUpdate?: (handler: PartialViewScrollHandler<T>) => void;
  topFillerOptions?: IntersectionObserverOptions;
  bottomFillerOptions?: IntersectionObserverOptions;
  topSentinelOptions?: IntersectionObserverOptions;
  bottomSentinelOptions?: IntersectionObserverOptions;
}


export class PartialViewScrollHandler<T> {
  private sourceGetter: () => Array<T>;
  private get source(): Array<T> {
    return this.sourceGetter();
  }

  private scrollTarget: HTMLElement;
  private lastScrollPosition: number = 0;
  private get scrollPosition(): number {
    return this.scrollTarget.scrollTop;
  }

  /**
   * store current scroll position and report whether the scroll direction is going upward or downward
   */
  private get scrollDirection(): Direction {
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

  private partialView: PartialView<T>;
  private elementExtractor: (viewElement: T) => HTMLElement;
  private elementHeight: number;

  get shouldPartialRender(): boolean {
    return this.partialView.numElement > this.partialView.maximumWindowSize;
  }

  private partialViewArea: HTMLElement;
  beforeViewUpdate: (handler: PartialViewScrollHandler<T>) => void;
  afterViewUpdate: (handler: PartialViewScrollHandler<T>) => void;

  private topFillerElement: HTMLElement;
  private bottomFillerElement: HTMLElement;
  private topFillerObserver: IntersectionObserver;
  private bottomFillerObserver: IntersectionObserver;
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
    return this.partialView.view(this.source)[this.topSentinelIndex];
  }
  get topSentinelElement(): HTMLElement {
    return this.elementExtractor(this.topSentinel);
  }
  get bottomSentinelIndex(): number {
    return bound(Math.floor(this.partialView.windowSize / 4) * 3 - 1, 0, this.partialView.windowSize);
  }
  get bottomSentinel(): T {
    return this.partialView.view(this.source)[this.bottomSentinelIndex];
  }
  get bottomSentinelElement(): HTMLElement {
    return this.elementExtractor(this.bottomSentinel);
  }
  private topSentinelObserver: IntersectionObserver;
  private bottomSentinelObserver: IntersectionObserver;

  constructor(options: PartialViewScrollHandlerOptions<T>) {
    this.sourceGetter = options.sourceGetter;
    this.elementExtractor = options.elementExtractor;
    this.partialView = options.partialView;
    this.scrollTarget = options.scrollTarget;
    this.elementHeight = options.elementHeight;
    this.partialViewArea = options.partialViewArea;
    this.beforeViewUpdate = options.beforeViewUpdate;
    this.afterViewUpdate = options.afterViewUpdate;

    this.initializeFillers();
    this.initializeFillerObservers(options.topFillerOptions, options.bottomFillerOptions);
    this.initializeSentinelObservers(options.topSentinelOptions, options.bottomSentinelOptions);
    this.activateObservers();
  }

  private initializeFillers(initializer: () => HTMLElement = () => document.createElement("div")) {
    this.topFillerElement = initializer();
    this.topFillerElement.classList.add(fillerClass, topFillerClass);
    this.partialViewArea.before(this.topFillerElement);

    this.bottomFillerElement = initializer();
    this.bottomFillerElement.classList.add(fillerClass, bottomFillerClass);
    this.partialViewArea.after(this.bottomFillerElement);
  }

  private initializeFillerObservers(topFillerOptions?: IntersectionObserverOptions, bottomFillerOptions?: IntersectionObserverOptions) {
    this.topFillerObserver = new IntersectionObserver(entries => this.fillerReachedHandler(entries), topFillerOptions);
    this.bottomFillerObserver = new IntersectionObserver(entries => this.fillerReachedHandler(entries), bottomFillerOptions);
  }

  private initializeSentinelObservers(topSentinelOptions?: IntersectionObserverOptions, bottomSentinelOptions?: IntersectionObserverOptions) {
    this.topSentinelObserver = new IntersectionObserver(entries => this.sentinelReachedHandler(entries), topSentinelOptions);
    this.bottomSentinelObserver = new IntersectionObserver(entries => this.sentinelReachedHandler(entries), bottomSentinelOptions);
  }

  private activateObservers() {
    if (this.shouldPartialRender) {
      this.topFillerObserver.observe(this.topFillerElement);
      this.bottomFillerObserver.observe(this.bottomFillerElement);
      this.topSentinelObserver.observe(this.topSentinelElement);
      this.bottomSentinelObserver.observe(this.bottomSentinelElement);
    }
  }

  private deactivateObservers() {
    this.topFillerObserver.disconnect();
    this.bottomFillerObserver.disconnect();
    this.topSentinelObserver.disconnect();
    this.bottomSentinelObserver.disconnect();
  }

  protected setWindow(startIndex: number, endIndex: number = startIndex + this.partialView.maximumWindowSize) {
    if (this.beforeViewUpdate) {
      this.beforeViewUpdate(this);
    }
    this.partialView.setWindow(startIndex, endIndex);
    this.updateView();
    if (this.afterViewUpdate) {
      this.afterViewUpdate(this);
    }
  }

  protected updateView() {
    const view: Array<T> = this.partialView.view(this.source);
    while (this.partialViewArea.firstChild) {
      this.partialViewArea.lastChild.remove();
    }
    const fragment = new DocumentFragment();
    view.forEach(viewElement => fragment.appendChild(this.elementExtractor(viewElement)));
    this.partialViewArea.appendChild(fragment);
  }

  private fillerReachedHandler(entries: Array<IntersectionObserverEntry>) {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRect.height > 0) {
        this.deactivateObservers();
        const position = this.scrollPosition - this.topFillerElement.offsetTop;
        const startIndex = bound(Math.floor(position / this.elementHeight), 0, this.partialView.numElement);
        this.setWindow(startIndex);
        this.activateObservers();
      }
    });
  }

  private sentinelReachedHandler(entries: Array<IntersectionObserverEntry>) {
    const scrollDirection: Direction = this.scrollDirection;

    entries.forEach(entry => {
      const desiredDirection: Direction = this.topSentinelElement === entry.target ? Direction.Up : Direction.Down;
      if (entry.isIntersecting && entry.intersectionRect.height > 0 && scrollDirection === desiredDirection) {
        // the last element of the first data section is appearing into view
        this.deactivateObservers();
        const startIndex: number = this.partialView.numElementNotRenderedBefore + scrollDirection === Direction.Up ? -this.partialView.maximumWindowSize : this.partialView.maximumWindowSize;
        this.setWindow(startIndex);
        this.activateObservers();
      }
    });
  }
}
