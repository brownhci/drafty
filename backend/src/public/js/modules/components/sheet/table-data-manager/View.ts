import { ViewModel, ViewModelBuilder } from "./ViewModel";
import { FilterFunction, FilteredView, PartialView, SortedView, SortingFunction, ViewFunctionChain } from "./ViewFunction";
import { MutationReporter } from "./MutationReporter";
import { PartialViewScrollHandler } from "./PartialViewScrollHandler";


type SourceType = HTMLTemplateElement | DocumentFragment | Node | Array<Node>;
export class View {
  sourceViewModel: ViewModel;
  childViewModelBuilder: ViewModelBuilder = (element) => new ViewModel(undefined, element);

  filteredView: FilteredView<ViewModel>;
  sortedView: SortedView<ViewModel>;
  partialView: PartialView<ViewModel>;
  scrollHandler: PartialViewScrollHandler<ViewModel>;
  viewFunctionChain: ViewFunctionChain<ViewModel>;

  windowSizeUpperBound: number = 200;

  useCache: boolean = true;

  get source(): Array<ViewModel> {
    return this.sourceViewModel.children_;
  }

  get view(): Array<ViewModel> {
    const useCache = this.useCache;
    this.useCache = true;
    return this.viewFunctionChain.view(this.source, useCache);
  }

  constructor(
    source: SourceType,
    target: HTMLElement) {

      this.sourceViewModel = new ViewModel(
        undefined,
        target,
        (mutations, observer, originalMutations, reporter) => this.onMutation(mutations, observer, originalMutations, reporter),
        undefined,
        undefined,
        [this.childViewModelBuilder]
      );
      this.parseSource(source);
      this.initializeViewFunction();
      this.initializeScrollHandler();
      this.startMutationObserver();
  }

  parseSource(source: SourceType) {
    if (source instanceof HTMLTemplateElement) {
      source = source.content;
    }
    if (source instanceof DocumentFragment) {
      this.sourceViewModel.patchChildViewModelsWithDOMElements__(source.children);
      return;
    }
    if (source instanceof Node) {
      this.sourceViewModel.patchWithDOM__(source as HTMLElement);
      return;
    }
    this.sourceViewModel.patchChildViewModelsWithDOMElements__(source as Array<HTMLElement>);
  }

  protected initializeViewFunction() {
    this.filteredView = new FilteredView<ViewModel>();
    this.partialView = new PartialView<ViewModel>(this.source, 0, this.windowSizeUpperBound - 1, this.windowSizeUpperBound);
    this.sortedView = new SortedView<ViewModel>();
    this.viewFunctionChain = new ViewFunctionChain<ViewModel>([this.filteredView, this.sortedView, this.partialView]);
    // set up the first target view
    this.view;
  }

  protected initializeScrollHandler() {
    this.scrollHandler = new PartialViewScrollHandler<ViewModel>({
      partialView: this.partialView,
      target: this.sourceViewModel.element_,
      beforeViewUpdate: () => this.pauseMutationObserver(),
      afterViewUpdate: () => this.startMutationObserver(),
    });
  }

  startMutationObserver() {
    this.sourceViewModel.observe__(this.sourceViewModel.element_, false, undefined, false, true, false);
  }

  pauseMutationObserver() {
    this.sourceViewModel.unobserve__(this.sourceViewModel.element_);
  }

  protected onMutation(mutations: Array<MutationRecord>, observer: MutationObserver, originalMutations: Array<MutationRecord>, reporter: MutationReporter) {
    this.sourceViewModel.reconnectToExecute__(() => {
      this.scrollHandler.deactivateObservers();
      reporter.report(mutations);
      for (const mutation of mutations) {
        if (mutation.target !== this.sourceViewModel.element_) {
          continue;
        }

        if (mutation.type === "childList") {
          this.onChildListMutation(mutation);
        }
      }
      this.scrollHandler.activateObservers();
    });
  }

  private onChildListMutation(mutation: MutationRecord) {
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
      const viewModel = this.childViewModelBuilder(addedNode as HTMLElement);
      this.sourceViewModel.insertChild__(viewModel, childIndex);
    }
    this.useCache = false;
  }

  refreshView() {
    this.scrollHandler.setView(() => this.view);
  }

  addFilterFunction(key: any, filterFunction: FilterFunction<ViewModel>) {
    if (this.filteredView.addFilterFunction(key, filterFunction)) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  deleteFilterFunction(key: any) {
    if (this.filteredView.deleteFilterFunction(key)) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  clearFilterFunction() {
    if (this.filteredView.clearFilterFunction()) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  addSortingFunction(key: any, sortingFunction: SortingFunction<ViewModel>, priority: number) {
    if (this.sortedView.addSortingFunction(key, sortingFunction, priority)) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  deleteSortingFunction(key: any) {
    if (this.sortedView.deleteSortingFunction(key)) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }

  clearSortingFunction() {
    if (this.sortedView.clearSortingFunction()) {
      this.viewFunctionChain.modifyViewFunctions();
      this.refreshView();
    }
  }
}
(window as any).View = View;
