/**
 * @module
 *
 * This module provides a scroll handler that updates rendering view based on scrolling position.
 */

import { PartialView } from './ViewFunction';
import { ViewModel } from './ViewModel';
import { bound } from '../../../utils/math';
import { debounceWithCooldown } from '../../../utils/debounce';
import { fillerClass, startFillerClass, endFillerClass } from '../../../constants/css-classes';
import { getScrollParent } from '../../../dom/scroll';

/**
 * Documents the optional object type which customizes the IntersectionObserver.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver}
 */
export interface IntersectionObserverOptions {
  /** An Element or Document object which is an ancestor of the intended target, whose bounding rectangle will be considered the viewport. Any part of the target not visible in the visible area of the root is not considered visible. */
  root?: Element;
  /** A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections, effectively shrinking or growing the root for calculation purposes. The syntax is approximately the same as that for the CSS margin property; see The root element and root margin in Intersection Observer API for more information on how the margin works and the syntax. The default is "0px 0px 0px 0px". */
  rootMargin?: string;
  /** Either a single number or an array of numbers between 0.0 and 1.0, specifying a ratio of intersection area to total bounding box area for the observed target. A value of 0.0 means that even a single visible pixel counts as the target being visible. 1.0 means that the entire target element is visible. See Thresholds in Intersection Observer API for a more in-depth description of how thresholds are used. The default is a threshold of 0.0. */
  thresholds?: ReadonlyArray<number>;
}

/**
 * A enumeration of possible scroll directions.
 */
enum Direction {
    Up,
    Down,
    Left,
    Right,
    Stay
}

export enum Axis {
  Horizontal,
  Vertical
}

/**
 * Documents the options object type to customize PartialViewScrollHandler
 */
interface PartialViewScrollHandlerOptions<T> {
  /**
   * A function to convert a view element (of type T) to a DOM element (of type HTMLElement).
   *
   * For example, if view element is already is a DOM element, return itself would be sufficient.
   *
   * There is no need to supply convert function when
   *
   *    + T is convertable to HTMLElement (for example, T is simply HTMLElement)
   *    + T is `ViewModel`
   */
  convert?: (viewElement: T) => HTMLElement;
  /**
   * The PartialView view function. This function enables partial rendering of source view. Moreover, by setting the window, different sections of source view may be displayed.
   */
  partialView: PartialView<T>;
  /** Where the target view is rendered in the DOM */
  target: HTMLElement;
  /**
   * The length of an element in the partial-rendering direction.
   *
   * If `elementLength` is not provided, it will be measured by appending an element and measures its `clientWidth` or `clientHeight` depending on scrollAxis.
   *
   * @example If the partial rendering happens on the vertical axis, then `elementLength` denotes the element height
   *
   * **ASSUMPTION**
   * Using one concrete value to designate the length assumes all elements have same length. If elements have different lengths, a possible compromise is to use an average length.
   * @todo Measure element width individually.
   */
  elementLength?: number;
  /**
   * Which axis current handler will watch for scrolling and adjust partial rendering.
   * **ASSUMPTION**
   * One `target` should only support one scroll axis monitoring.
   *
   *    + Horizontal:
   *      ( X X X X X )
   *    + Vertical
   *      [ X ]
   *      [ X ]
   *      [ X ]
   *      [ X ]
   *      [ X ]
   *
   * If both axis need to be monitored, a nesting (hierarchical) approach should be preferred than a free-form approach.
   *
   *    + @example nesting (encouraged):
   *      [ ( X X X X X ) ]
   *      [ ( X X X X X ) ]
   *      [ ( X X X X X ) ]
   *      [ ( X X X X X ) ]
   *      [ ( X X X X X ) ]
   *    + @example free-form (disencouraged):
   *          X X X X X
   *          X X X X X
   *          X X X X X
   *          X X X X X
   *          X X X X X
   */
  scrollAxis?: Axis;
  /**
   * A callback executed before view is updated.
   *
   * @callback
   * @param {Array<T>} view - The old view to be discarded.
   * @param {PartialViewScrollHandler<T>} handler - Where the view update request is initiated.
   */
  beforeViewUpdate?: (view: Array<T>, handler: PartialViewScrollHandler<T>) => void;
  /**
   * A callback executed after view is updated.
   *
   * @callback
   * @param {Array<T>} view - The new view to be discarded.
   * @param {PartialViewScrollHandler<T>} handler - Where the view update request is initiated.
   */
  afterViewUpdate?: (view: Array<T>, handler: PartialViewScrollHandler<T>) => void;
  /** IntersectionObserverOptions for top filler */
  startFillerObserverOptions?: IntersectionObserverOptions;
  /** IntersectionObserverOptions for bottom filler */
  endFillerObserverOptions?: IntersectionObserverOptions;
  /** IntersectionObserverOptions for top sentinel */
  startSentinelObserverOptions?: IntersectionObserverOptions;
  /** IntersectionObserverOptions for bottom sentinel */
  endSentinelObserverOptions?: IntersectionObserverOptions;
}


export class PartialViewScrollHandler<T> {
  /** the scrollable container for target view */
  private scrollTarget: HTMLElement;
  /** Which axis to monitor for scrolling */
  scrollAxis: Axis;
  /** previous scroll position, used to determine the scroll direction */
  private lastScrollPosition: number = 0;
  /** current scroll position */
  private get scrollPosition(): number {
    if (this.scrollAxis === Axis.Vertical) {
      return this.scrollTarget.scrollTop;
    } else { /* horizontal */
      return this.scrollTarget.scrollLeft;
    }
  }
  private set scrollPosition(position: number) {
    if (this.scrollAxis === Axis.Vertical) {
      this.scrollTarget.scrollTop = position;
    } else { /* horizontal */
      this.scrollTarget.scrollLeft = position;
    }
  }

  /**
   * Reports the direction of current scroll.
   *
   * As a side effect, `this.lastScrollPosition` will be replaced by current scroll position.
   *
   * @return {Direction} The direction of current scroll.
   */
  private get scrollDirection(): Direction {
    const scrollPosition = this.scrollPosition;
    let scrollDirection;
    if (scrollPosition > this.lastScrollPosition) {
      scrollDirection = this.scrollAxis === Axis.Vertical ? Direction.Down : Direction.Right;
    } else if (scrollPosition === this.lastScrollPosition) {
      scrollDirection = Direction.Stay;
    } else {
      scrollDirection = this.scrollAxis === Axis.Vertical ? Direction.Up : Direction.Left;
    }
    this.lastScrollPosition = scrollPosition;
    return scrollDirection;
  }

  /** @see {@link PartialViewScrollHandlerOptions#partialView} */
  private partialView: PartialView<T>;
  /** @see {@link PartialViewScrollHandlerOptions#convert} */
  private convert: (viewElement: T) => HTMLElement;
  /** @see {@link PartialViewScrollHandlerOptions#elementLength} */
  elementLength: number = 0;

  /**
   * Which the source view should be partially rendered.
   *
   * Source view will be partially rendered if the number of elements in source view exceeds the maximum window size.
   *
   * @returns {boolean} Whether partial rendering should be performed. If false, then the source view will be rendered in one window.
   */
  private get shouldPartialRender(): boolean {
    return this.partialView.numElement > this.partialView.maximumWindowSize;
  }

  /** @see {@link PartialViewScrollHandlerOptions#target} */
  private target: HTMLElement;
  /** @see {@link PartialViewScrollHandlerOptions#beforeViewUpdate} */
  beforeViewUpdate: (view: Array<T>, handler: PartialViewScrollHandler<T>) => void;
  /** @see {@link PartialViewScrollHandlerOptions#afterViewUpdate} */
  afterViewUpdate: (view: Array<T>, handler: PartialViewScrollHandler<T>) => void;

  /**
   * A filler element to
   *
   *    + emulate full length of the source view
   *    + detect whether a window update is necessary (an update is necessary when filler appears within view)
   *
   * As the start filler (first, topmost or leftmost), it will emulate the length of elements not rendered before the target view.
   */
  startFillerElement: HTMLElement;
  /**
   * How far the start filler is from the top of the `this.scrollTarget`.
   *
   * @example Suppose `this.scrollTarget` is a table which has a table head and table body. Then `this.startFillerElement` is separated (offsetted) by the table head.
   */
  startFillerOffsetTop: number;
  /**
   * A filler element to
   *
   *    + emulate full length of the source view
   *    + detect whether a window update is necessary (an update is necessary when filler appears within view)
   *
   * As the end filler (last, bottommost or rightmost), it will emulate the length of elements not rendered after the target view.
   */
  endFillerElement: HTMLElement;
  /**
   * An intersection observer to watch `this.startFillerElement`: if it enters into view
   */
  private startFillerObserver: IntersectionObserver;
  /**
   * An intersection observer to watch `this.endFillerElement`: if it enters into view
   */
  private endFillerObserver: IntersectionObserver;
  /**
   * @returns {number} The length of the start filler.
   */
  get startFillerLength(): number {
    return this.partialView.numElementNotRenderedBefore * this.elementLength;
  }
  /**
   * @returns {number} The length of the end filler.
   */
  get endFillerLength(): number {
    return this.partialView.numElementNotRenderedAfter * this.elementLength;
  }

  /**
   * Current formula chooses the start sentinel nears the 1/4 of the target window.
   *
   * @returns {number} The index of the start sentinel in the target window.
   */
  get startSentinelIndex(): number {
    return bound(Math.floor(this.partialView.windowSize / 4) - 1, 0, this.partialView.windowSize);
  }
  /**
   * @returns {T} The view element of the start sentinel in the target window.
   */
  get startSentinel(): T {
    return this.partialView.currentView[this.startSentinelIndex];
  }
  /**
   * @returns {HTMLElement} A start sentinel is a DOM element in the target window that signals a landmark: a earlier view should be loaded.
   */
  get startSentinelElement(): HTMLElement {
    return this.convert(this.startSentinel);
  }
  /**
   * Current formula chooses the end sentinel nears the 3/4 of the target window.
   *
   * @returns {number} The index of the end sentinel in the target window.
   */
  get endSentinelIndex(): number {
    return bound(Math.floor(this.partialView.windowSize / 4) * 3 - 1, 0, this.partialView.windowSize);
  }
  /**
   * @returns {T} The view element of the end sentinel in the target window.
   */
  get endSentinel(): T {
    return this.partialView.currentView[this.endSentinelIndex];
  }
  /**
   * @returns {HTMLElement} A end sentinel is a DOM element in the target window that signals a landmark: a later view should be loaded.
   */
  get endSentinelElement(): HTMLElement {
    return this.convert(this.endSentinel);
  }
  /**
   * An intersection observer to watch `this.startSentinelElement`: if it enters into view
   */
  private startSentinelObserver: IntersectionObserver;
  /**
   * An intersection observer to watch `this.endSentinelElement`: if it enters into view
   */
  private endSentinelObserver: IntersectionObserver;

  /**
   * Creates a PartialViewScrollHandler instance.
   *
   * At minimal, the `option` object should contain:
   *
   *    + a `partialView`: used to retrieve target view
   *    + a `target`: where to render the target view
   *
   * @see {@link {PartialViewScrollHandlerOptions} for more details on initialization configuration.
   *
   * @public
   * @param {PartialViewScrollHandlerOptions} options - An option object to initialize the scroll handler.
   * @constructs PartialViewScrollHandler
   */
  constructor(options: PartialViewScrollHandlerOptions<T>) {
    this.initializeConvert(options.convert);
    this.partialView = options.partialView;
    this.target = options.target;
    this.scrollTarget = getScrollParent(this.target) as HTMLElement;
    this.beforeViewUpdate = options.beforeViewUpdate;
    this.afterViewUpdate = options.afterViewUpdate;
    this.initializeScrollEventListener();
    this.initializeFillers();
    this.initializeFillerObservers(options.startFillerObserverOptions, options.endFillerObserverOptions);
    this.initializeSentinelObservers(options.startSentinelObserverOptions, options.endSentinelObserverOptions);

    this.syncView();
    // depends on an overflowing view has been rendered
    this.initializeScrollAxis(options.scrollAxis);
    // depends on target view being rendered and`this.scrollAxis`
    this.initializeElementLength(options.elementLength);
    // depends on `this.scrollAxis` and `this.elementLength`
    this.setFillerLengths();
    this.activateObservers();
  }

  /**
   * Initializes `this.convert`.
   *
   * @param {(viewElement: T) => HTMLElement} [convert] - A conversion function that transforms a view element of type T to a DOM element of type HTMLElement.
   */
  private initializeConvert(convert?: (viewElement: T) => HTMLElement) {
    if (convert) {
      this.convert = convert;
    } else {
      this.convert = (viewElement) => {
        if (viewElement instanceof ViewModel) {
          return viewElement.element_;
        }
        return viewElement as unknown as HTMLElement;
      };
    }
  }

  /**
   * Initializes `this.elementLength`
   *
   * Initialization process:
   *
   *    + If a elementLength is provided, this length will be used directed.
   *    + Otherwise, the elementLength will be measured from first rendered element's length in the appropriate axis `this.scrollAxis`.
   *
   * @param {number} elementLength - The length of the elemnt in the concerning axis `this.scrollAxis`.
   */
  private initializeElementLength(elementLength?: number) {
    if (elementLength) {
      this.elementLength = elementLength;
    } else { // measures element directly
      const propName = this.scrollAxis === Axis.Vertical ? 'clientHeight' : 'clientWidth';
      if (this.partialView.currentView.length > 0) {
        const renderedElement = this.convert(this.partialView.currentView[0]);
        this.elementLength = renderedElement[propName];
      }
    }
  }

  /**
   * Initializes the monitoring axis of current scroll handler:
   *
   *    + if an axis is provided, choose it
   *    + otherwise, set to the overflow direction of `this.scrollTarget` (vertical direction precedes horizontal direction.
   *
   * This function is called after first target view is mounted so that `this.scrollTarget` is appropriated initialized with target view.
   *
   * @param {Axis} axis - Which axis this handler will monitor for scroll event.
   */
  private initializeScrollAxis(axis?: Axis) {
    if (axis) {
      this.scrollAxis = axis;
    } else {
      if (this.partialView.currentView.length >= 2) {
        // check element placement relationship
        const firstElement = this.convert(this.partialView.currentView[0]);
        const secondElement = this.convert(this.partialView.currentView[1]);
        const { x: firstX, y: firstY } = firstElement.getBoundingClientRect();
        const { x: secondX, y: secondY } = secondElement.getBoundingClientRect();
        if (firstX === secondX && firstY !== secondY) {
          this.scrollAxis = Axis.Vertical;
          return;
        } else if (firstX !== secondX && firstY === secondY) {
        this.scrollAxis = Axis.Horizontal;
          return;
        }
      }

      // check existence of scrollbar
      if (this.scrollTarget.scrollHeight > this.scrollTarget.clientHeight) {
        this.scrollAxis = Axis.Vertical;
      } else if (this.scrollTarget.scrollWidth > this.scrollTarget.clientWidth) {
        this.scrollAxis = Axis.Horizontal;
      } else { // default vertical
        this.scrollAxis = Axis.Vertical;
      }
    }
  }

  /**
   * Initializes a scroll event listener bounds to `this.scrollTarget`.
   *
   * This listener will calculate the index that **should** appear in current target view using the scroll position. If the index does not appear in current target view, reset the window to update the target view.
   *
   * @listens ScrollEvent
   */
  private initializeScrollEventListener() {
    const observeTarget = this.scrollTarget === document.documentElement ? window : this.scrollTarget;
    observeTarget.addEventListener('scroll', debounceWithCooldown((event) => {
      if (event.target === this.scrollTarget || (document === event.target && document.documentElement === this.scrollTarget)) {
        // only handle scroll event happening on observed scroll container
        const startIndex = this.getElementIndexFromScrollAmount();
        if (startIndex < this.partialView.partialViewStartIndex || this.partialView.partialViewEndIndex < startIndex) {
          // view out of sync
          this.setWindow(startIndex);
        }
      }
    }, 400), { passive: true });
  }

  /**
   * Initializes the filler elements.
   *
   * Filler elements serves as special guard nodes: when they appear in view -- blank section is appearing in the viewport, a target view update is necessary to refill the viewport with content.
   */
  private initializeFillers() {
    let tagName: string = 'div';
    switch (this.target.parentElement.tagName) {
      case 'ol':
      case 'ul':
        tagName = 'li';
        break;
      case 'dl':
        tagName = 'dt';
        break;
      case 'table':
      case 'tbody':
        tagName = 'tr';
        break;
      case 'tr':
        tagName = 'td';
        break;
    }

    this.startFillerElement = document.createElement(tagName);
    this.startFillerElement.classList.add(fillerClass, startFillerClass);
    this.target.before(this.startFillerElement);
    this.initializeStartFillerOffsetTop();

    this.endFillerElement = document.createElement(tagName);
    this.endFillerElement.classList.add(fillerClass, endFillerClass);
    this.target.after(this.endFillerElement);
  }

  /**
   * Initializes `this.startFillerOffsetTop`.
   */
  private initializeStartFillerOffsetTop() {
    let offsetTop: number = this.startFillerElement.offsetTop;
    let offsetParent = this.startFillerElement.offsetParent as HTMLElement;
    while (offsetParent && offsetParent !== this.scrollTarget) {
      offsetTop += offsetParent.offsetTop;
      offsetParent = offsetParent.offsetParent as HTMLElement;
    }
    this.startFillerOffsetTop = offsetTop;
  }

  /**
   * Sets the display length (width or height depending on `this.scrollAxis`) of filler elements.
   *
   * @param {number} [startFillerLength = this.startFillerLength] - The length for start filler.
   * @param {number} [endFillerLength = this.endFillerLength] - The length for end filler.
   */
  private setFillerLengths(
    startFillerLength: number = this.startFillerLength,
    endFillerLength: number = this.endFillerLength
  ) {
    const propName = this.scrollAxis === Axis.Vertical ? 'height' : 'width';
    this.startFillerElement.style[propName] = `${startFillerLength}px`;
    this.endFillerElement.style[propName] = `${endFillerLength}px`;
  }

  /**
   * Initializes the IntersectionObserver for both fillers.
   *
   * @param {IntersectionObserverOptions} [startFillerOptions] - A configuration object for start filler's IntersectionObserver.
   * @param {IntersectionObserverOptions} [endFillerOptions] - A configuration object for end filler's IntersectionObserver.
   */
  private initializeFillerObservers(startFillerOptions?: IntersectionObserverOptions, endFillerOptions?: IntersectionObserverOptions) {
    this.startFillerObserver = new IntersectionObserver(entries => this.fillerReachedHandler(entries), startFillerOptions);
    this.endFillerObserver = new IntersectionObserver(entries => this.fillerReachedHandler(entries), endFillerOptions);
  }

  /**
   * Initializes the IntersectionObserver for both sentinels.
   *
   * @param {IntersectionObserverOptions} [startSentinelOptions] - A configuration object for start sentinel's IntersectionObserver.
   * @param {IntersectionObserverOptions} [endSentinelOptions] - A configuration object for end sentinel's IntersectionObserver.
   */
  private initializeSentinelObservers(startSentinelOptions?: IntersectionObserverOptions, endSentinelOptions?: IntersectionObserverOptions) {
    this.startSentinelObserver = new IntersectionObserver(entries => this.sentinelReachedHandler(entries), startSentinelOptions);
    this.endSentinelObserver = new IntersectionObserver(entries => this.sentinelReachedHandler(entries), endSentinelOptions);
  }

  /**
   * Activates all IntersectionObserver to detect whether the target view needs to be updated.
   *
   * If the source view can fit within a window (`this.shouldPartialRender` is true), then IntersectionObserver will not be activated.
   * @public
   */
  activateObservers() {
    if (this.shouldPartialRender) {
      this.startFillerObserver.observe(this.startFillerElement);
      this.endFillerObserver.observe(this.endFillerElement);
      this.startSentinelObserver.observe(this.startSentinelElement);
      this.endSentinelObserver.observe(this.endSentinelElement);
    }
  }


  /**
   * Deactivates all IntersectionObserver. Usually called when a view update is taking place.
   * @public
   */
  deactivateObservers() {
    this.startFillerObserver.disconnect();
    this.endFillerObserver.disconnect();
    this.startSentinelObserver.disconnect();
    this.endSentinelObserver.disconnect();
  }

  /**
   * Invokes `this.partialView.setWindow` to change the section of source view that enters into the target view. Window is defined by two indices -- a start index and an end index. The elements with indices between (inclusive) these two window boundaries will be included in the target view.
   *
   * @public
   * @param {number} startIndex - The start index of the new window.
   * @param {number} [endIndex = startIndex + this.partialView.maximumWindowSize] - The end index of the window.
   */
  setWindow(
    startIndex: number,
    endIndex: number = startIndex + this.partialView.maximumWindowSize - 1,
  ) {
    if (this.partialView.setWindow(startIndex, endIndex)) {
      this.setView(() => this.partialView.view(this.partialView.lastSource));
    }
  }

  /**
   * Updates the rendered view.
   *
   * The following steps will be taken in order:
   *
   *    + deactivate all IntersectionObserver
   *    + invoke beforeViewUpdate callback if defined
   *    + update the view
   *    + update the DOM
   *    + invoke afterViewUpdate callback if defined
   *    + activate all IntersectionObserver
   *
   * @param {() => Array<T>} viewFunction - A callback function to generate the new view.
   */
  setView(viewFunction: () => Array<T>) {
    this.deactivateObservers();

    // view generation will happen
    if (this.beforeViewUpdate) {
      this.beforeViewUpdate(this.partialView.currentView, this);
    }

    const newView = viewFunction();
    const scrollPosition = this.scrollPosition;
    this.setFillerLengths();
    this.syncView(newView);
    this.scrollPosition = scrollPosition;
    if (this.afterViewUpdate) {
      this.afterViewUpdate(newView, this);
    }

    this.activateObservers();
  }

  /**
   * Syncing the DOM with a new view. In effect, the child nodes in `this.target` will be replaced with current view.
   *
   * @param {Array<T>} [newView = this.partialView.currentView] - A new view to update the rendered view.
   */
  private syncView(newView: Array<T> = this.partialView.currentView) {
    const numViewElement: number = newView.length;
    const elements = this.target.children;
    let elementIndex = 0;
    for (; elementIndex < numViewElement; elementIndex++) {
      const viewElement = this.convert(newView[elementIndex]);
      const element = elements[elementIndex];
      if (element) {
        if (element === viewElement) {
          continue;
        }
        // has corresponding view element: one-to-one replacement
        element.replaceWith(viewElement);
      } else {
        // if there are more view elements than corresponding DOM elements from old view
        this.target.appendChild(viewElement);
      }
    }

    const numElements = elements.length;
    for (; elementIndex < numElements; elementIndex++) {
      // element has corresponding view element: detach element from DOM
      this.target.lastElementChild.remove();
    }
  }

  private shiftView(shiftAmount: number) {
    // shiftAmount will be rectified to the actual window shift amount
    if ((shiftAmount = this.partialView.shiftWindow(shiftAmount, true)) === 0) {
      return;
    }

    this.deactivateObservers();
    if (this.beforeViewUpdate) {
      this.beforeViewUpdate(this.partialView.currentView, this);
    }

    const view = this.partialView.view(this.partialView.lastSource);
    const isShiftTowardsEnd = shiftAmount > 0;
    const numViewElement = view.length;

    // the number of elements in current view to be removed, upper bounded by the number of existing elements
    const numElementToRemove = Math.min(this.partialView.windowSize, Math.abs(shiftAmount));
    if (isShiftTowardsEnd) {
      for (let i = 0; i < numElementToRemove; i++) {
        this.target.firstElementChild.remove();
      }
      this.setFillerLengths();
      // use 0 as lower bound since there can be at most 0 overlapping elements (windowSize distinct elements)
      for (let viewElementIndex = Math.max(0, numViewElement - shiftAmount); viewElementIndex < numViewElement; viewElementIndex++) {
        const viewElement = this.convert(view[viewElementIndex]);
        this.target.appendChild(viewElement);
      }
    } else {
      shiftAmount = -shiftAmount;
      for (let i = 0; i < numElementToRemove; i++) {
        this.target.lastElementChild.remove();
      }
      const referenceNode = this.target.firstElementChild;
      // at most there can be 0 overlapping elements (windowSize distinct elements)
      const numViewElementToAdd = Math.min(numViewElement, shiftAmount);
      for (let viewElementIndex = 0; viewElementIndex < numViewElementToAdd; viewElementIndex++) {
        const viewElement = this.convert(view[viewElementIndex]);
        this.target.insertBefore(viewElement, referenceNode);
      }
      this.setFillerLengths();
    }

    if (this.afterViewUpdate) {
      this.afterViewUpdate(this.partialView.currentView, this);
    }
    this.activateObservers();
  }


  /**
   * Calculate element index from a scroll amount.
   *
   *    (scrollAmount - this.startFillerOffsetTop) / elementLength
   *
   * @param {number} [scrollAmount = this.scrollPosition] - How far scrolled from page top.
   */
  private getElementIndexFromScrollAmount(scrollAmount: number = this.scrollPosition) {
    const position = Math.max(scrollAmount - this.startFillerOffsetTop, 0);
    return bound(Math.floor(position / this.elementLength), 0, this.partialView.numElement - 1);
  }

  /**
   * Scrolls to the start of an element at specified index.
   *
   * An optional offset can be specified to adjust the final scroll position.
   *
   * The position is calculated by:
   *
   *    elementIndex * elementLength + startFillerOffsetTop + offset
   *
   * @param {number} elementIndex - The index of an element to scroll to. It should be a safe index: neither less than 0 nor equal or greater than the number of elements.
   * @param {number} offset - The amount to adjust the final scroll position. See the formula.
   */
  scrollToElementIndex(elementIndex: number, offset: number = 0) {
    this.scrollPosition = this.elementLength * elementIndex + this.startFillerOffsetTop + offset;
  }

  /**
   * Called when a filler is reached, which indicates a view update might be necessary as the user has scrolled past all rendered view elements.
   *
   * @callback
   * @param {Array<IntersectionObserverEntry>} entries - An array of IntersectionObserver entries.
   */
  private fillerReachedHandler(entries: Array<IntersectionObserverEntry>) {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRect.height > 0) {
        const newStartIndex = this.getElementIndexFromScrollAmount();
        const shiftAmount = newStartIndex - this.partialView.partialViewStartIndex;
        this.shiftView(shiftAmount);
      }
    });
  }

  /**
   * Called when a sentinel is reached, which indicates a view update might be necessary as the user has scrolled past most of rendered view elements.
   *
   * @callback
   * @param {Array<IntersectionObserverEntry>} entries - An array of IntersectionObserver entries.
   */
  private sentinelReachedHandler(entries: Array<IntersectionObserverEntry>) {
    const shiftAmount = Math.floor(this.partialView.maximumWindowSize / 2);
    const scrollDirection: Direction = this.scrollDirection;

    entries.forEach(entry => {
      const desiredDirection: Direction = this.startSentinelElement === entry.target ? Direction.Up : Direction.Down;
      if (entry.isIntersecting && entry.intersectionRect.height > 0 && scrollDirection === desiredDirection) {
        // the last element of the first data section is appearing into view
        const shift = scrollDirection === Direction.Up ? -shiftAmount : shiftAmount;
        this.shiftView(shift);
      }
    });
  }
}
