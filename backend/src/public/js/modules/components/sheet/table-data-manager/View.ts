import { ViewModel } from "./ViewModel";
import { FilterFunction, FilteredView, PartialView, SortedView, SortingFunction, ViewFunctionChain } from "./ViewFunction";
import { MutationReporter } from "./MutationReporter";
import { PartialViewScrollHandler, Axis } from "./PartialViewScrollHandler";
import { getViewportHeight, getViewportWidth } from "../../../utils/length";


/**
 * A union type represents the source view.
 *
 * Since HTMLTemplateElement (`<template>`)'s content is a DocumentFragment and since DocumentFragment implements the ParentNode interface, source can therefore be classified into one of two forms:
   *
   *    + (rooted) a node whose children will be the source view elements
   *    + (unrooted) a collection of elements which will themselves be source view elements
 */
type SourceType = HTMLTemplateElement | DocumentFragment | Node | Array<Node>;

/**
 * A View represents a rendering of elements. The source is provided at initialization which, after undergoing a series of transformations, is rendered at a specified DOM target node.
 *
 * Such rendering are responsive in that changes to DOM target will be observed and handled. For example, inserting or deleting a child of DOM target node will cause an insertion or deletion of its abstraction (ViewModel).
 *
 * Being a BasicView, it has following limitations:
 *
 *    + Its representation is a depth one tree (parent-child) and it will only respond to child mutation.
 *    + Its transformation consists of a FilteredView, SortedView, and a PartialView and its renderer is a scroll handler.
 */
export class BasicView {
  /** organizes source view as a ViewModel, this allows source view to include elements from different regions of DOM or not in DOM */
  protected sourceViewModel: ViewModel;
  /**
   * @returns {Array<ViewModel>} Elements of source view.
   */
  get source(): Array<ViewModel> {
    return this.sourceViewModel.children_;
  }

  /** 1st view function: filter source view according to some criterion */
  protected filteredView: FilteredView<ViewModel>;
  /** 2nd view function: reorder previous view according to some criterion */
  protected sortedView: SortedView<ViewModel>;
  /** 3rd view function: partial renders part of previous view */
  protected partialView: PartialView<ViewModel>;
  /** adjusts the partialView -- updates rendered partial view according to scroll position */
  protected scrollHandler: PartialViewScrollHandler<ViewModel>;
  /** provides an aggregate transformation from source view to final target view */
  protected viewFunctionChain: ViewFunctionChain<ViewModel>;

  /**
   * @returns {number} The maximum number of elements to be rendered.
   */
  protected get windowSizeUpperBound(): number {
    return this.partialView.maximumWindowSize;
  }
  /**
   * Changes the maximum number of elements to be rendered. Will cause rendered view change.
   *
   * @param {number} upperBound - A new upper bound for window size.
   */
  protected set windowSizeUpperBound(upperBound: number) {
    this.viewFunctionChain.modifyViewFunction(2);
    this.partialView.maximumWindowSize = upperBound;
  }

  /**
   * Whether target view needs to be generated from scratch and whether cached intermediate view can be reused.
   *
   * A potential scenario where `useCache` should be set to `false` is when the source is modified. Since all previous views are built from previous source, they should be all be outdated.
   */
  protected useCache: boolean = true;

  /**
   * @returns {Array<ViewModel>} Elements of target view.
   */
  get view(): Array<ViewModel> {
    const useCache = this.useCache;
    this.useCache = true;
    return this.viewFunctionChain.view(this.source, useCache);
  }

  /**
   * Creates a BasicView instance.
   *
   * @public
   * @param {SourceType} source - Provides the source view.
   * @param {HTMLElement} target - Where to mount the target view.
   * @constructs BasicView
   */
  constructor(
    source: SourceType,
    target: HTMLElement) {
      this.sourceViewModel = new ViewModel(
        undefined,
        target,
        (mutations, observer, originalMutations, reporter) => this.onMutation(mutations, observer, originalMutations, reporter),
        undefined,
        undefined,
        // model only children of `target`
        [(element) => new ViewModel(undefined, element)]
      );
      this.parseSource(source);
      this.initializeViewFunction();
      this.initializeScrollHandler();
      // updates to a window size appropriate for window size
      this.adjustWindowSizeUpperBound();
      this.refreshView();
      this.initializeResizeHandler();
      this.monitor();
  }

  /**
   * Parses source into `this.sourceViewModel`.
   *
   * Source can be one of two forms:
   *
   *    + (rooted) an element that has same tagName as `target` whose children will be the source view elements
   *    + (unrooted) a collection of elements which will themselves be source view elements
   *
   * @param {SourceType} source - Contains the source view elements.
   */
  protected parseSource(source: SourceType) {
    if (source instanceof HTMLTemplateElement) {
      source = source.content;
    }

    if (source instanceof DocumentFragment) {
      const children = source.children;
      if (children.length === 1) {
        source = children[0] as Node;
      } else {
        this.sourceViewModel.patchChildViewModelsWithDOMElements__(children);
        return;
      }
    }

    if (Array.isArray(source)) {
      this.sourceViewModel.patchChildViewModelsWithDOMElements__(source as Array<HTMLElement>);
    } else {
      this.sourceViewModel.patchWithDOM__(source as HTMLElement);
    }
  }

  /** A timeout used to debounce the timeout event */
  private resizeTimeout: number;
  /**
   * Set up a handler for the {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event resize} event. This handler will adjust the maximum window size so that a smaller screen has a smaller window size while a larger screen has a larger window size.
   */
  protected initializeResizeHandler() {
    window.addEventListener("resize", () => {
      if (this.resizeTimeout) {
        window.clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = window.setTimeout(() => {
        this.resizeTimeout = null;
        this.adjustWindowSizeUpperBound();
      }, 1000);
    });
  }

  /**
   * Adjust `this.windowSizeUpperBound` according to the viewport length.
   */
  protected adjustWindowSizeUpperBound() {
    const elementLength = this.scrollHandler.elementLength;
    const viewportLength = this.scrollHandler.scrollAxis === Axis.Horizontal ? getViewportWidth() : getViewportHeight();
    // four times the current viewport height
    let numElements = Math.max(1, Math.floor(viewportLength / elementLength)) * 4;
    // round to next number divisible by 10
    numElements = Math.ceil(numElements / 10) * 10;
    if (numElements !== this.windowSizeUpperBound) {
      this.windowSizeUpperBound = numElements;
    }
  }

  /**
   * Initializes the transformation that converts a source view into a target view.
   */
  protected initializeViewFunction() {
    this.filteredView = new FilteredView<ViewModel>();
    // initially only render one element
    this.partialView = new PartialView<ViewModel>(this.source, 0, 1, 2);
    this.sortedView = new SortedView<ViewModel>();
    this.viewFunctionChain = new ViewFunctionChain<ViewModel>([this.filteredView, this.sortedView, this.partialView]);
    // set up the first target view
    this.view;
  }

  /**
   * Initializes the scroll handler that renders the partial view according to scroll position.
   */
  protected initializeScrollHandler() {
    this.scrollHandler = new PartialViewScrollHandler<ViewModel>({
      partialView: this.partialView,
      target: this.sourceViewModel.element_,
      beforeViewUpdate: () => this.unmonitor(),
      afterViewUpdate: () => this.monitor(),
    });
  }

  /**
   * Ask `target` to monitor mutations. Only childlist mutations on direct children of `target` will be handled.
   */
  protected monitor() {
    this.sourceViewModel.observe__(this.sourceViewModel.element_, false, undefined, false, true, false);
  }

  /**
   * Stops monitoring mutations.
   */
  protected unmonitor() {
    this.sourceViewModel.unobserve__(this.sourceViewModel.element_);
  }

  /**
   * Handler for observed mutations. It will only handle direct children mutation of `target`.
   */
  protected onMutation(mutations: Array<MutationRecord>, observer: MutationObserver, originalMutations: Array<MutationRecord>, reporter: MutationReporter) {
    reporter.report(mutations);

    this.scrollHandler.deactivateObservers();
    this.sourceViewModel.reconnectToExecute__(() => {
      for (const mutation of mutations) {
        if (mutation.target !== this.sourceViewModel.element_) {
          continue;
        }

        if (mutation.type === "childList") {
          this.onChildListMutation(mutation);
        }
      }
    });
    this.scrollHandler.activateObservers();
  }

  /**
   * Handles ChildList mutation.
   *
   * If a DOM child is removed from `target`, remove the ViewModel child corresponding to that DOM child from `this.sourceViewModel`.
   */
  protected onChildListMutation(mutation: MutationRecord) {
    for (const removedNode of mutation.removedNodes) {
      const identifier = (removedNode as HTMLElement).dataset[ViewModel.identifierDatasetName_];
      this.sourceViewModel.removeChildByIdentifier__(identifier);
    }

    const addedNodeToChildIndex: Map<Node, number> = new Map();
    for (const addedNode of mutation.addedNodes) {
      let childIndex = 0;
      let child;
      while ((child = (addedNode as HTMLElement).previousElementSibling)) {
        childIndex++;
        if (addedNodeToChildIndex.has(child)) {
          childIndex += addedNodeToChildIndex.get(child);
          break;
        }
      }
      addedNodeToChildIndex.set(addedNode, childIndex);
      this.sourceViewModel.insertChild__(addedNode as HTMLElement, childIndex);
    }

    // indicates that a full rebuild is necessary to generate target view
    this.useCache = false;
  }

  /**
   * Renders current target view to the page.
   */
  protected refreshView() {
    this.scrollHandler.setView(() => this.view);
  }

  /**
   * Binds a filter function under a key.
   *
   * This filter function should determine whether a ViewModel should go into the target view.
   *
   * Will update the DOM when the filter function changes the final view.
   *
   * @see {@link ViewFunction:FilteredView#addFilterFunction}
   * @param {any} key - An identifier.
   * @param {FilterFunction<ViewModel>} filterFunction - A function to determine whether an element in the source view should be kept in the target view.
   */
  protected addFilterFunction_(key: any, filterFunction: FilterFunction<ViewModel>) {
    if (this.filteredView.addFilterFunction(key, filterFunction)) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  /**
   * Binds a filter function under a key.
   *
   * This filter function should determine whether an HTML element should go into the DOM target view.
   *
   * This function is a wrapper around {BasicView#addFilterFunction_} as it will simply operates on the extracted HTMLElement from ViewModel.
   *
   * @public
   */
  addFilterFunction(name: any, filterFunction: FilterFunction<HTMLElement>) {
    this.addFilterFunction_(name, viewModel => filterFunction(viewModel.element_));
  }


  /**
   * Deletes a filter function bound under given key.
   *
   * Will update the DOM when the deletion changes the final view.
   *
   * @public
   * @see {@link ViewFunction:FilteredView#deleteFilterFunction}
   */
  deleteFilterFunction(key: any) {
    if (this.filteredView.deleteFilterFunction(key)) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  /**
   * Clears all filter functions.
   *
   * Will update the DOM when the deletions change the final view.
   *
   * @public
   * @see {@link ViewFunction:FilteredView#clearFilterFunction}
   */
  clearFilterFunction() {
    if (this.filteredView.clearFilterFunction()) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  /**
   * Binds a sorting function with given priority under a key.
   *
   * This filter function should determine whether a ViewModel should go into the target view.
   *
   * Will update the DOM when the added sorting function changes the final view.
   *
   * @see {@link ViewFunction:FilteredView#addSortingFunction}
   * @param {any} key - An identifier.
   * @param {SortingFunction<T>} sortingFunction - A function to determine how elements from source view should be ordered in the target view.
   * @param {number} priority - The priority of newly-bound sorting function. The higher the priority, the more important the sorting function. Defaults to the negative of the number of existing sorting function. In other words, default to add a least important sorting function.
   */
  addSortingFunction_(key: any, sortingFunction: SortingFunction<ViewModel>, priority?: number) {
    if (this.sortedView.addSortingFunction(key, sortingFunction, priority)) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  /**
   * Binds a sorting function with given priority under a key. This sorting function should determine the ordering between two HTMLElements.
   *
   * This function is a wrapper around {BasicView#addSortingFunction_} as it will simply operates on the extracted HTMLElements from ViewModels.
   *
   * @public
   */
  addSortingFunction(key: any, sortingFunction: SortingFunction<HTMLElement>, priority?: number) {
    this.addSortingFunction_(key, (vm1, vm2) => sortingFunction(vm1.element_, vm2.element_), priority);
  }

  /**
   * Deletes a sorting function bound under given key.
   *
   * Will update the DOM when the deletion changes the final view.
   *
   * @public
   * @see {@link ViewFunction:SortedView#deleteSortingFunction}
   */
  deleteSortingFunction(key: any) {
    if (this.sortedView.deleteSortingFunction(key)) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  /**
   * Clears all sorting functions.
   *
   * Will update the DOM when the deletions change the final view.
   *
   * @public
   * @see {@link ViewFunction:SortedView#clearSortingFunction}
   */
  clearSortingFunction() {
    if (this.sortedView.clearSortingFunction()) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  /**
   * Assigns a set of sorting function different priority numbers.
   *
   * Will update the DOM when the reordering change the final view.
   *
   * @public
   * @see {@link ViewFunction:SortedView#clearSortingFunction}
   */
  reorderSortingFunction(reordering: Map<any, number>) {
    if (this.sortedView.reorderSortingFunction(reordering)) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }
}
(window as any).View = BasicView;
