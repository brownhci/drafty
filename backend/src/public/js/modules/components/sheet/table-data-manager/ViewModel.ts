import { DOMForwardingInstantiation, ForwardingPropertyDescriptor } from "./Instantiation";
import { MutationReporter, MutationReporterCallback } from "./MutationReporter";
import { uuidv4  as uuid } from "../../../utils/uuid";


export class ViewModel extends DOMForwardingInstantiation {
  private _mutationReporter: MutationReporter;

  protected forwardingTo_: HTMLElement;

  private _children: Array<ViewModel>;
  private _identifierToChild: Map<string, ViewModel>;

  private readonly _identifier: string = uuid();
  private static readonly _identifierDatasetName = "_identifier"

  constructor(propsToForward: Record<string, Partial<ForwardingPropertyDescriptor>>, forwardingTo: HTMLElement, callback?: MutationReporterCallback, children: Array<ViewModel> = []) {
    super(propsToForward, forwardingTo);
    this.__setMutationReporter(callback ? callback : this.onMutation__);
    this.setChildren__(children);
  }

  static getElementByIdentifier(identifier: string, root: Document | DocumentFragment | Element = document, selectors: string): HTMLElement {
    return root.querySelector(`${selectors}[data-${ViewModel._identifierDatasetName}="${identifier}"`);
  }

  setForwardingTo__(forwardingTo: HTMLElement) {
    if (this.forwardingTo_) {
      delete this.forwardingTo_.dataset[ViewModel._identifierDatasetName];
    }
    super.setForwardingTo__(forwardingTo);
    this.forwardingTo_.dataset[ViewModel._identifierDatasetName] = this._identifier;
  }

  private __setMutationReporter(callback: MutationReporterCallback) {
    Object.defineProperty(this, "_mutationReporter", {
      configurable: false,
      enumerable: false,
      value: new MutationReporter(callback),
      writable: true
    });
  }

  protected setChildren__(children: Array<ViewModel>) {
    Object.defineProperty(this, "_children", {
        configurable: false,
        enumerable: false,
        value: [],
        writable: true
    });

    Object.defineProperty(this, "_identifierToChild", {
        configurable: false,
        enumerable: false,
        value: new Map(),
        writable: true
    });
    children.forEach(child => this._identifierToChild.set(child._identifier, child));
  }

  protected insertChild__(viewModel: ViewModel, index: number) {
    this._children.splice(index, 0, viewModel);
    this._identifierToChild.set(viewModel._identifier, viewModel);
  }

  protected removeChildByIndex__(index: number): ViewModel {
    const [viewModel] = this._children.splice(index, 1);
    this._identifierToChild.delete(viewModel._identifier);
    return viewModel;
  }

  protected removeChild__(viewModel: ViewModel): ViewModel {
    const index: number = this._children.indexOf(viewModel);
    return this.removeChildByIndex__(index);
  }

  protected removeChildByIdentifier__(identifier: string): ViewModel {
    const viewModel = this._identifierToChild.get(identifier);
    return this.removeChild__(viewModel);
  }

  protected observe__(target: Node = this.forwardingTo_, shouldObserveAttributes: boolean, shouldObserveCharacterData: boolean, shouldObserveChildList: boolean, attributeFilter: Array<string>) {
    const options = MutationReporter.createMutationObserverInit(shouldObserveAttributes, shouldObserveCharacterData, shouldObserveChildList, attributeFilter);
    this._mutationReporter.observe(target, options);
  }

  protected observeMany__(targets: Array<Node>, shouldObserveAttributes: boolean, shouldObserveCharacterData: boolean, shouldObserveChildList: boolean, attributeFilter: Array<string>) {
    const options = MutationReporter.createMutationObserverInit(shouldObserveAttributes, shouldObserveCharacterData, shouldObserveChildList, attributeFilter);
    targets.forEach(target => this._mutationReporter.observe(target, options));
  }


  protected onMutation__(mutations: Array<MutationRecord>, originalMutations: Array<MutationRecord>, observer: MutationObserver, reporter: MutationReporter) {
    reporter.report(mutations);
  }

  protected attachSelf__(parentNode: Element, index: number): Node | DocumentFragment {
    let referenceNode = parentNode.children[index];
    if (!referenceNode) {
      referenceNode = null;
    }
    return parentNode.insertBefore(this.forwardingTo_, referenceNode);
  }

  protected attachChild__(child: Node, index: number): Node | DocumentFragment {
    if (index === this._children.length) {
      return this.forwardingTo_.appendChild(child);
    } else {
      return this.forwardingTo_.insertBefore(child, this._children[index].forwardingTo_);
    }
  }

  protected detachSelf__(): Node {
    this.forwardingTo_.remove();
    return this.forwardingTo_;
  }

  protected detachChild__(child: Node): Node {
    return this.forwardingTo_.removeChild(child);
  }

  protected patchWithViewModel(other: ViewModel) {
    // patch self
    for (const propName of this.propNames_) {
      this[propName] = other[propName];
    }

    // patch children
    const numChildren = other._children.length;
    let childIndex = 0;
    for (const child of this._children) {
      if (childIndex < numChildren) {
        child.patchWithViewModel(other[childIndex]);
      } else {
        // this view model surplus: remove
        this.removeChildByIndex__(childIndex);
        this.detachChild__(child.forwardingTo_);
      }
      childIndex++;
    }

    // other view model surplus: add
    for (; childIndex < numChildren; childIndex++) {
      const viewModel = other._children[childIndex];
      this.insertChild__(viewModel, childIndex);
      this.attachChild__(viewModel.forwardingTo_, childIndex);
    }
  }
}
