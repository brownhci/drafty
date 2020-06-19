import { DOMForwardingInstantiation, ForwardingPropertyDescriptor } from "./Instantiation";
import { MutationReporter, MutationReporterCallback } from "./MutationReporter";
import { generateUUID  as uuid } from "../../../utils/uuid";


/**
 * A function to create a ViewModel from a HTMLElement.
 * @see {@link ViewModel#constructor}.
 * @example A builder to create ViewModel abstraction for a `<p>` element
 *    `(element) => new ViewModel({id: undefined, classList: undefined, textContent: undefined }, element)`
 */
export type ViewModelBuilder = (element: HTMLElement) => ViewModel;

/**
 * ViewModel represents an Abstraction equivalent of HTMLElement in that:
 *
 *    + ViewModel can have DOM attributes and JS properties through forwarding
 *    + ViewModel has `parent_` and `_children` and is therefore hierarchical
 *
 * Different from HTMLElement, it has these additional capacities:
 *
 *    + watch the underlying DOM target for mutations
 *    + has a auto-generated `identifier_` that is automatically registered or revoked in the underlying DOM target
 *
 * @augments DOMForwardingInstantiation
 */
export class ViewModel extends DOMForwardingInstantiation {
  /** parent view model where current view model exists as a child */
  parent_: ViewModel;

  /** every view model has a unique identifier */
  readonly identifier_: string;

  /**
   * If view model has a forwarding target (DOM element), then the view model identifier will also exists in the element's dataset:
   *
   *    `element.dataset[ViewModel.identifierDatasetName_]`
   */
  static readonly identifierDatasetName_ = "identifier_"

  protected forwardingTo_: HTMLElement;

  /**
   * View models that are children of current view model.
   *
   * These view models may contain DOM elements that are also children of the DOM element contained by current view model. However, this double (ViewModel, DOM) parent-child relationship is not required. In fact, by disassociating View Model organization from DOM organization, a View Model can manage DOM elements at different regions of the document.
   */
  private _children: Array<ViewModel>;

   /**
    * An array of builders to create View Model from DOM elements.
    *
    * This array is hierarchical in that first builder is suitable for create child view model of current view model, second builder is suitable for creating child view model of current child view model, and so on...
    *
    * In other words, `_viewModelBuilders` is a set of blueprints for descendant view models.
    *
    * Since `_viewModelBuilders` is hierarchical, it also decides the emulation depth in `patchWithDOM__`. For example, suppose `_viewModelBuilders.length` is 2, then calling `patchWithDOM__` on a `element` will emulate this element's children and grandchildren.
    */
  private _viewModelBuilders: Array<ViewModelBuilder>;

  /** A mapping from identifier to child view model */
  private _identifierToChild: Map<string, ViewModel>;

  /** @see {@link MutationReporter:MutationReporter */
  private _mutationReporter: MutationReporter;

  /**
   * Creates a ViewModel instance.
   *
   * @public
   * @param {Record<Prop, Partial<ForwardingPropertyDescriptor<ViewModel>>} propsToForward: An object containing mapping from properties to their descriptors. {@link Instantiation:ForwardingInstantiation#constructor}
   * @param {HTMLElement} forwardingTo - A DOM element to which access/modification operations are forwarded. {@link Instantiation:ForwardingInstantiation#constructor}
   * @param {MutationReporterCallback} [mutationReporterCallback] - A callback to be executed when desired mutation has been observed. If not specified, `this.onMutation__` will be invoked. {@link MutationReporter:MutationReporter#constructor}.
   * @param {ViewModel} [parent = null] - Parent view model of current view model. Null by default.
   * @param {Array<ViewModel>} [children = []] - View models that are children of current view model.
   * @param {Array<ViewModelBuilder>} [viewModelBuilders = []] - An array of builders to create View Model from DOM elements. This array is hierarchical in that first builder is suitable for create child view model of current view model, second builder is suitable for creating child view model of current child view model, and so on...
   * @constructs ViewModel
   */
  constructor(
    propsToForward: Record<string, Partial<ForwardingPropertyDescriptor<ViewModel>>>= {},
    forwardingTo?: HTMLElement,
    callback?: MutationReporterCallback,
    parent: ViewModel = null,
    children: Array<ViewModel> = [],
    viewModelBuilders: Array<ViewModelBuilder> = []
  ) {
    super(propsToForward, forwardingTo);
    Object.defineProperty(this, "identifier_", {
        configurable: false,
        enumerable: false,
        value: uuid(),
        writable: false
    });
    this.setForwardingTo__(forwardingTo);
    Object.defineProperty(this, "parent_", {
        configurable: false,
        enumerable: false,
        value: parent,
        writable: true
    });
    this.setChildren__(children);
    Object.defineProperty(this, "_viewModelBuilders", {
        configurable: false,
        enumerable: false,
        value: viewModelBuilders,
        writable: true
    });

    this.setMutationReporter__(callback ? callback : (mutations, observer, originalMutations, reporter) => this.onMutation__(mutations, observer, originalMutations, reporter));
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
    return root.querySelector(`${selectors}[data-${ViewModel.identifierDatasetName_}="${identifier}"`);
  }

  /**
   * @public
   * @override
   * @description In addition to changing the forwarding target, this method will also remove the identifier from previous forwarding target's dataset (if exists) and add the identifier to the new forwarding target's dataset.
   */
  setForwardingTo__(forwardingTo: HTMLElement) {
    if (this.forwardingTo_) {
      delete this.forwardingTo_.dataset[ViewModel.identifierDatasetName_];
    }
    super.setForwardingTo__(forwardingTo);
    if (this.forwardingTo_) {
      this.forwardingTo_.dataset[ViewModel.identifierDatasetName_] = this.identifier_;
    }
  }

  /**
   * Exposes `this._children`
   * @public
   * @return The child view models of current view model.
   */
  get children_(): Array<ViewModel> {
    return this._children;
  }

  /**
   * Equivalent of `this.setChildren__` as `this.children__`.
   * @public
   */
  set children_(children: Array<ViewModel>) {
    this.setChildren__(children);
  }

  /**
   * Registers an array of ViewModel as current view model's child view models.
   *
   * These steps will be performed:
   *
   *    + previously bound child view models will have their `parent_` nullified
   *    + `this._children` will be replaced by the new array of ViewModel
   *    + `this._identifierToChild` will be replaced by a new Map where entries are from identifiers to new view models
   *    + every new child view model will have their `parent_` set to current view instance
   *
   * @param {Array<ViewModel>} children - An array of child view models.
   */
  protected setChildren__(children: Array<ViewModel>) {
    if (this._children) {
      this._children.forEach(child => child.parent_ = null);
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
      child.parent_ = this;
      this._identifierToChild.set(child.identifier_, child);
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
   * Default to append child at end.
   *
   * @public
   * @param {ViewModel} viewModel - A child view model to be inserted.
   * @param {number} index - Where the child view model should be inserted. Should be a valid number between [0, this._children.length] where 0 is equivalent of prepending to the start and `this._children.length` is equivalent to appending to the end.
   */
  insertChild__(viewModel: ViewModel, index: number = this._children.length) {
    viewModel.parent_ = this;
    this._children.splice(index, 0, viewModel);
    this._identifierToChild.set(viewModel.identifier_, viewModel);
  }

  /**
   * Removes a child view model from current view model by its child index.
   *
   * These steps will be performed:
   *
   *    + view model at specified index in `this._children` will be removed
   *    + deleted child view model's `parent_` will be nullified
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
    viewModel.parent_ = null;
    this._identifierToChild.delete(viewModel.identifier_);
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
   * Removes a child view model from current view model by its identifier.
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
	 * @public
   * @param {MutationReporterCallback} callback - The callback to be invoked when mutations are observed. It will be invoked with `this` bound to current view model.
   */
  setMutationReporter__(callback: MutationReporterCallback) {
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
		if (mutations.some(mutation => mutation.type === "childList")) {
			// update child view models
			this.patchWithDOM__(this.element_);
		}
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

	/** @see {@link MutationReporter:MutationReporter#unobserve} */
	unobserve__(target: Node) {
		this._mutationReporter.unobserve(target);
	}

	/** @see {@link MutationReporter:MutationReporter#reconnectToExecute} */
	reconnectToExecute__(callback: () => void) {
		this._mutationReporter.reconnectToExecute(callback);
	}

  /**
   * Iterate over a range of child view models, applies an operation, and returns an array containing the result.
   *
   * Equivalent of `this._children.slice(begin, end).map(operation)`.
   *
   * @callback operation
   * @param {ViewModel} viewModel - The child view model to apply the operation.
   * @param {number} childIndex - The child index of the current child view model.
   * @param {number} rangeIndex - The sequential index of current child view model in the range where the operation is applied.
   * @returns {T} Result of applying the operation on a child view model.
   *
   * @public
   * @param operation - An operation to be applied to each child view model in the range.
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
	 *    + @example
	 *    	@this ViewModel
	 *    	observe desired mutations on all DOM elements in child view models.
	 *    	`this.operateOnRange__(viewModel => this.observe__(viewModel.element_, ...))`
   */
  operateOnRange__<T>(operation: (viewModel: ViewModel, childIndex: number, rangeIndex: number) => T, start: number = 0, end: number = this._children.length): Array<T> {
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
   * @param {boolean} [noDetach = true] - Whether surplus DOM elements of `this._children` will be removed from DOM tree.
   * @param {boolean} [noAttach = true] - Whether surplus DOM elements of `other._children` will be appended
   */
  patchWithViewModel__(other: ViewModel, noDetach: boolean = true, noAttach: boolean = true) {
    // patch self
    for (const propName of this.propNames_) {
			if ((this as any)[propName] !== (other as any)[propName]) {
				(this as any)[propName] = (other as any)[propName];
			}
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
	 * Note:
	 *
	 * 		+ If the current view model is a partial abstraction of the reference DOM element`other`, then the in-place-patch algorithm might run into live-editing:
	 * 			@example `other` has two child nodes, current view model is an abstraction of `other` but only has a child view model for the second child node. When calling `this.patchWithDOM__(other)`, second child node will be live edited (because of property forwarding): its registered properties wll be set to those of first child node.
	 *
	 * 			To avoid live-editing caused by property forwarding, one can use a cloned node as the reference node
	 * 			`this.patchWithDOM__(this.element_.cloneNode(true))`
   *
   * @param {HTMLElement} other - A HTML element used to patch current view model.
   * @param {boolean} [noDetach = true] - Whether surplus DOM elements of `this._children` will be removed from DOM tree.
   * @param {boolean} [noAttach = true] - Whether surplus DOM elements of `other.children` will be appended
   */
  patchWithDOM__(other: HTMLElement, noDetach: boolean = true, noAttach: boolean = true) {
    // patch self
    for (const propName of this.propNames_) {
			if ((this as any)[propName] !== (other as any)[propName]) {
				(this as any)[propName] = (other as any)[propName];
			}
    }

    // patch children
    this.patchChildViewModelsWithDOMElements__(other.children);
  }


  /**
   * Patches the child view models of current view model using an array of DOM elements. In-place-patch algorithm as documented in {@link ViewModel#patchWithViewModel__} will be used.
	 * 		+ If the current view model is a partial abstraction of the reference DOM element`other`, then the in-place-patch algorithm might run into live-editing:
	 * 			@example `other` has two child nodes, current view model is an abstraction of `other` but only has a child view model for the second child node. When calling `this.patchWithDOM__(other)`, second child node will be live edited (because of property forwarding): its registered properties wll be set to those of first child node.
   *
   * @param {Array<HTMLElement>} elements - An array of DOM elements to patch curent child view models.
   * @param {boolean} [noDetach = true] - Whether surplus DOM elements of `this._children` will be removed from DOM tree.
   * @param {boolean} [noAttach = true] - Whether surplus DOM elements of `other.children` will be appended
   */
  patchChildViewModelsWithDOMElements__(elements: Array<HTMLElement> | HTMLCollection, noDetach: boolean = true, noAttach: boolean = true) {
    // patch children
    const numChildren = elements.length;
    let childIndex = 0;
    for (const child of this._children) {
      if (childIndex < numChildren) {
        child.patchWithDOM__(elements[childIndex] as HTMLElement, noDetach, noAttach);
      } else {
        // this view model surplus: remove
        this.removeChildByIndex__(childIndex);
        if (!noDetach) {
          child.element_.remove();
        }
      }
      childIndex++;
    }

    if (this._viewModelBuilders.length === 0) {
      // stop because no blueprints exist for child view model
      return;
    }

    // other view model surplus: add
    for (; childIndex < numChildren; childIndex++) {
      const child = elements[childIndex] as HTMLElement;
      const viewModel = this._viewModelBuilders[0](child);
      this.insertChild__(viewModel, childIndex);
      if (!noAttach) {
        this.element_.appendChild(viewModel.element_);
      }
    }
  }
}
