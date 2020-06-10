import { DOMForwardingInstantiation, ForwardingPropertyDescriptor } from "./Instantiation";
import { MutationReporter, MutationReporterCallback } from "./MutationReporter";
import { uuidv4  as uuid } from "../../../utils/uuid";


type ViewModelBuilder = (element: Element) => ViewModel;

export class ViewModel extends DOMForwardingInstantiation {
  /** parent view model where current view model exists as a child */
  private _parent: ViewModel;

  /** every view model has a unique identifier */
  private _identifier: string = uuid();

  /**
   * If view model has a forwarding target (DOM element), then the view model identifier will also exists in the element's dataset:
   *
   *    `element.dataset[ViewModel._identifierDatasetName]`
   */
  static readonly _identifierDatasetName = "_identifier"

  protected forwardingTo_: HTMLElement;

  /**
   * View models that are children of current view model.
   *
   * These view models may contain DOM elements that are also children of the DOM element contained by current view model. However, this double (ViewModel, DOM) parent-child relationship is not required. In fact, by disassociating View Model organization from DOM organization, a View Model can manage DOM elements at different regions of the document.
   */
  private _children: Array<ViewModel>;

  /** A mapping from identifier to child view model */
  private _identifierToChild: Map<string, ViewModel>;

  /** @see {@link MutationReporter:MutationReporter */
  private _mutationReporter: MutationReporter;

  /**
   * Creates a ViewModel instance.
   *
   * @public
   * @param {Record<Prop, Partial<ForwardingPropertyDescriptor>} propsToForward: An object containing mapping from properties to their descriptors. {@link Instantiation:ForwardingInstantiation#constructor}
   * @param {HTMLElement} forwardingTo - A DOM element to which access/modification operations are forwarded. {@link Instantiation:ForwardingInstantiation#constructor}
   * @param {MutationReporterCallback} [mutationReporterCallback] - A callback to be executed when desired mutation has been observed. If not specified, `this.onMutation__` will be invoked. {@link MutationReporter:MutationReporter#constructor}
   * @param {ViewModel} [parent = null] - Parent view model of current view model. Null by default.
   * @param {Array<ViewModel>} [children = []] - View models that are children of current view model.
   * @constructs ViewModel
   */
  constructor(
    propsToForward: Record<string, Partial<ForwardingPropertyDescriptor>>,
    forwardingTo: HTMLElement,
    callback?: MutationReporterCallback,
    parent: ViewModel = null,
    children: Array<ViewModel> = []
  ) {
    super(propsToForward, forwardingTo);
    this._parent = parent;
    this.setChildren__(children);
    this.__setMutationReporter(callback ? callback : this.onMutation__);
  }

  /**
   * Finds the first element that
   *
   *    + is a descendant of the `root`
   *    + has identifier value in dataset
   *    + matches the specified group of selectors.
   *
   * @public
   * @param {string} identifier - The unique view model identifier. A DOM element has a view model identifier only when it is the forwarding target of that view model.
   * @param {Document | DocumentFragment | Element} [root = document] - Where to initiate the search. The returned element must be a descendant of `root`.
   * @param {string} [selectors = ""] - A group of selectors to match the descendant elements of the `root` against.
   * @return {HTMLElement} The first element found which matches specified group of selectors and has the specified identifier value in dataset.
   */
  static getElementByIdentifier(
    identifier: string,
    root: Document | DocumentFragment | Element = document,
    selectors: string = ""
  ): HTMLElement {
    return root.querySelector(`${selectors}[data-${ViewModel._identifierDatasetName}="${identifier}"`);
  }

  /**
   * @public
   * @override
   * @description In addition to changing the forwarding target, this method will also remove the identifier from previous forwarding target's dataset (if exists) and add the identifier to the new forwarding target's dataset.
   */
  setForwardingTo__(forwardingTo: HTMLElement) {
    if (this.forwardingTo_) {
      delete this.forwardingTo_.dataset[ViewModel._identifierDatasetName];
    }
    super.setForwardingTo__(forwardingTo);
    this.forwardingTo_.dataset[ViewModel._identifierDatasetName] = this._identifier;
  }

  /**
   * Registers an array of ViewModel as current view model's child view models.
   *
   * These steps will be performed:
   *
   *    + previously bound child view models will have their `_parent` nullified
   *    + `this._children` will be replaced by the new array of ViewModel
   *    + `this._identifierToChild` will be replaced by a new Map where entries are from identifiers to new view models
   *    + every new child view model will have their `_parent` set to current view instance
   *
   * @param {Array<ViewModel>} children - An array of child view models.
   */
  protected setChildren__(children: Array<ViewModel>) {
    if (this._children) {
      this._children.forEach(child => child._parent = null);
    }

    Object.defineProperty(this, "_children", {
        configurable: false,
        enumerable: false,
        value: children,
        writable: true
    });

    Object.defineProperty(this, "_identifierToChild", {
        configurable: false,
        enumerable: false,
        value: new Map(),
        writable: true
    });
    children.forEach(child => {
      child._parent = this;
      this._identifierToChild.set(child._identifier, child);
    });
  }

  /**
   * Inserts a child view model to current view model at specified index.
   *
   * These steps will be performed:
   *
   *    + child view model's parent will be set to current view model
   *    + child view model will be inserted into `this._children` at specified index
   *    + a mapping from identifier to child view model will be added to `this._identifierToChild`
   *
   * @param {ViewModel} viewModel - A child view model to be inserted.
   * @param {number} index - Where the child view model should be inserted. Should be a valid number between [0, this._children.length] where 0 is equivalent of prepending to the start and `this._children.length` is equivalent to appending to the end.
   */
  protected insertChild__(viewModel: ViewModel, index: number) {
    viewModel._parent = this;
    this._children.splice(index, 0, viewModel);
    this._identifierToChild.set(viewModel._identifier, viewModel);
  }

  /**
   * Removes a child view model from current view model by its child index.
   *
   * These steps will be performed:
   *
   *    + view model at specified index in `this._children` will be removed
   *    + deleted child view model's `_parent` will be nullified
   *    + the mapping from identifier to deleted child view model will be removed from `this._identifierToChild`
   *
   * Note:
   *
   *    The removal is restricted to the view model layer. In other words, the removed view model might still contain a DOM element which is child of DOM element contained in current view model.
   *
   * @public
   * @param {number} index - The index of the child view model to be deleted. Should be in valid range -- [0, this._children.length)
   * @return {ViewModel} The deleted view model.
   */
  removeChildByIndex__(index: number): ViewModel {
    const [viewModel] = this._children.splice(index, 1);
    viewModel._parent = null;
    this._identifierToChild.delete(viewModel._identifier);
    return viewModel;
  }

  /**
   * Removes a child view model from current view model.
   *
   * Finds the view model's child index and calls {@link ViewModel#removeChildByIndex__}.
   *
   * @param {ViewModel} viewModel - A view model to be deleted.
   * @return {ViewModel} The deleted view model.
   */
  removeChild__(viewModel: ViewModel): ViewModel {
    const index: number = this._children.indexOf(viewModel);
    if (index === -1) {
      return null;
    }
    return this.removeChildByIndex__(index);
  }

  /**
   * Removes a child view model from current view model by its identfier.
   *
   * Finds the view model by its identifier from `this._identifierToChild` and calls {@link ViewModel#removeChild__}.
   *
   * @param {string} identifier - The unique identifier of a view model to be deleted.
   * @return {ViewModel} The deleted view model.
   */
  removeChildByIdentifier__(identifier: string): ViewModel {
    const viewModel = this._identifierToChild.get(identifier);
    if (!viewModel) {
      return null;
    }
    return this.removeChild__(viewModel);
  }

  /**
   * Creates a MutationReporter with a callback and bins to current ViewModel instance.
   *
   * Calling this method after a MutationReporter has been bound to current instance will recreate the MutationReporter. Previous bound MutationReporter will be disconnected.
   *
   * @param {MutationReporterCallback} callback - The callback to be invoked when mutations are observed.
   */
  private __setMutationReporter(callback: MutationReporterCallback) {
    if (this._mutationReporter) {
      this._mutationReporter.disconnect();
    }

    Object.defineProperty(this, "_mutationReporter", {
      configurable: false,
      enumerable: false,
      value: new MutationReporter(callback),
      writable: true
    });
  }

  /**
   * Default callback for observed mutations -- report each mutation as its corresponding event.
   *
   * @see {@link MutationReporter:MutationReporterCallback}
   */
  protected onMutation__(mutations: Array<MutationRecord>, observer: MutationObserver, originalMutations: Array<MutationRecord>, reporter: MutationReporter) {
    reporter.report(mutations);
  }

  /**
   * Let the bound MutationReporter observe target mutations according to provided options.
   *
   *    + See more about config options from {@link MutationReporter:MutationReporter.createMutationObserverInit}.
   *    + See more about observe from {@link https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe}
   */
  observe__(
    target: Node,
    shouldObserveAttributes: boolean,
    attributeFilter: Array<string>,
    shouldObserveCharacterData: boolean,
    shouldObserveChildList: boolean,
    shouldObserveSubtree: boolean,
  ) {
    const options = MutationReporter.createMutationObserverInit(shouldObserveAttributes, shouldObserveCharacterData, shouldObserveChildList, shouldObserveSubtree, attributeFilter);
    this._mutationReporter.observe(target, options);
  }

  /**
   * Let the bound MutationReporter observe mutations according to provided options for multiple targets.
   *
   * @see {@link ViewModel#observe__}
   */
  observeMany__(
    targets: Array<Node>,
    shouldObserveAttributes: boolean,
    attributeFilter: Array<string>,
    shouldObserveCharacterData: boolean,
    shouldObserveChildList: boolean,
    shouldObserveSubtree: boolean
  ) {
    const options = MutationReporter.createMutationObserverInit(shouldObserveAttributes, shouldObserveCharacterData, shouldObserveChildList, shouldObserveSubtree, attributeFilter);
    targets.forEach(target => this._mutationReporter.observe(target, options));
  }

  /**
   * Iterate over a range of child view models, applies an operation, and returns an array containing the result.
   *
   * Equivalent of `this._children.slice(begin, end).map(operation)`.
   *
   * @public
   * @param operation - An operation to be applied to each child view model in the range.
   *   @callback operation
   *   @param {ViewModel} viewModel - The child view model to apply the operation.
   *   @param {number} childIndex - The child index of the current child view model.
   *   @param {number} rangeIndex - The sequential index of current child view model in the range where the operation is applied.
   *   @returns {T} Result of applying the operation on a child view model.
   * @param {number} [start = 0] - Where to start applying operation.
   * @param {number} [end = this._children.length] - Before which to end applying operation. The child view model at `end` (if any) will not be applied operation.
   * @returns {Array<T>} The operation application result on the specified range of child view models.
   *
   * Some useful operations:
   *
   *    + @example
   *      @return {Array<HTMLElement>} DOM elements of view models in range
   *      extract view models' DOM element
   *      `(viewModel) => viewModel.element_`
   *    + @example
   *      @param {Node} node - A node whose child list will be replaced
   *      @return {Array<HTMLElement>} replaced DOM elements
   *      replace a node's children by view models' DOM elements
   *      `(viewModel, childIndex, rangeIndex) => node.replaceChild(viewModel.element_, node.children[rangeIndex])`
   *    + @example
   *      @param {Array<HTMLElement>} elements - An array of DOM elements to replace view models' original DOM elements
   *      @return {Array<HTMLElement>} Same as `elements`.
   *      change view models' DOM elements
   *      `(viewModel, childIndex, rangeIndex) => viewModel.element_ = elements[rangeIndex]`
   */
  operateOnRange<T>(operation: (viewModel: ViewModel, childIndex: number, rangeIndex: number) => T, start: number = 0, end: number = this._children.length): Array<T> {
    const result: Array<T> = [];

    let rangeIndex = 0;
    for (let childIndex = start; childIndex < end; childIndex++, rangeIndex++) {
      result.push(operation(this._children[childIndex], childIndex, rangeIndex));
    }

    return result;
  }

  /**
   * Updates current view model by another view model using the in-place-patch algorithm.
   *
   * From the following illustrations describing scenarios different `_children` length, one call tell there are three potential scenarios:
   *
   *    + MATCH: there is a child view model and a matching child view model in `other`. In this case, `patchWithViewModel__` will recur on these two view models.
   *    + SURPLUS (append): there is a child view model in `other` that does not have a matching child view model in `this`. In this case, the child view model will be appended to `this._children`. If `noAttach` is false, the corresponding DOM element will also be appended to `this.element_`.
   *    + SURPLUS (remove): there is a child view model in `this` that does not have a matching child view model in `other`. In this case, the child view model will be removed from `this._children`. If `noDetach` is false, the corresponding DOM element will also be removed from `this.element_`.
   *
   *             MATCH
   *    this:  [ - - - ]
   *    other: [ - - - - - - - ]
   *                   SURPLUS (append)
   *
   *                   SURPLUS (remove)
   *    this:  [ - - - - - - - ]
   *    other: [ - - - ]
   *             MATCH
   *
   *
   * @param {ViewModel} other - An view model used to patch current view model.
   * @param {boolean} [noDetach = false] - Whether surplus DOM elements of `this._children` will be removed from DOM tree.
   * @param {boolean} [noAttach = false] - Whether surplus DOM elements of `other._children` will be appended
   */
  patchWithViewModel__(other: ViewModel, noDetach: boolean = false, noAttach: boolean = false) {
    // patch self
    for (const propName of this.propNames_) {
      this[propName] = other[propName];
    }

    // patch children
    const numChildren = other._children.length;
    let childIndex = 0;
    for (const child of this._children) {
      if (childIndex < numChildren) {
        child.patchWithViewModel__(other._children[childIndex], noDetach, noAttach);
      } else {
        // this view model surplus: remove
        this.removeChildByIndex__(childIndex);
        if (!noDetach) {
          child.element_.remove();
        }
      }
      childIndex++;
    }

    // other view model surplus: append to the end
    for (; childIndex < numChildren; childIndex++) {
      const viewModel = other._children[childIndex];
      this.insertChild__(viewModel, childIndex);
      if (!noAttach) {
        this.element_.appendChild(viewModel.element_);
      }
    }
  }

  /**
   * Similar as {@link ViewModel#patchWithViewModel__} where current view model is updated by another DOM element using the in-place-patch algorithms.
   *
   * @param {ViewModel} other - An view model used to patch current view model.
   * @param {Array<ViewModelBuilder>} An array of builders to create View Model from DOM elements. This array is hierarchical in that first builder is suitable for create child view model of current view model, second builder is suitable for creating child view model of current child view model, and so on...
   * @param {boolean} [noDetach = false] - Whether surplus DOM elements of `this._children` will be removed from DOM tree.
   * @param {boolean} [noAttach = false] - Whether surplus DOM elements of `other.children` will be appended
   */
  patchWithDOM__(other: Element, viewModelBuilders: Array<ViewModelBuilder>, noDetach: boolean = false, noAttach: boolean = false) {
    // patch self
    for (const propName of this.propNames_) {
      this[propName] = other[propName];
    }

    // patch children
    const numChildren = other.children.length;
    let childIndex = 0;
    for (const child of this._children) {
      if (childIndex < numChildren) {
        child.patchWithDOM__(other.children[childIndex], viewModelBuilders.slice(1), noDetach, noAttach);
      } else {
        // this view model surplus: remove
        this.removeChildByIndex__(childIndex);
        if (!noDetach) {
          child.element_.remove();
        }
      }
      childIndex++;
    }

    // other view model surplus: add
    for (; childIndex < numChildren; childIndex++) {
      const child = other.children[childIndex];
      const viewModel = viewModelBuilders[0](child);
      this.insertChild__(viewModel, childIndex);
      if (!noAttach) {
        this.element_.appendChild(viewModel.element_);
      }
    }
  }
}
