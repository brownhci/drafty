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

  constructor(
    source: SourceType,
    target: HTMLElement) {
      // eslint-disable-next-line
      const that = this;
      const viewModelBuilders: Array<ViewModelBuilder> = [this.childViewModelBuilder];

      this.sourceViewModel = new ViewModel(undefined, target, function (mutations, observer, originalMutations, reporter) {
        that.onMutation(mutations, observer, originalMutations, reporter);
      }, undefined, undefined, viewModelBuilders);
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

  get source(): Array<ViewModel> {
    return this.sourceViewModel.children_;
  }

  get view(): Array<ViewModel> {
    return this.viewFunctionChain.view(this.source);
  }

  protected initializeElementHeight() {
    if (this.sourceViewModel.children_.length > 0) {
      const element = this.sourceViewModel.children_[0].element_;
      this.sourceViewModel.element_.appendChild(element);
    }
  }

  protected initializeViewFunction() {
    this.filteredView = new FilteredView<ViewModel>();
    this.partialView = new PartialView<ViewModel>(this.source, 0, this.windowSizeUpperBound - 1, this.windowSizeUpperBound);
    this.sortedView = new SortedView<ViewModel>();
    this.viewFunctionChain = new ViewFunctionChain<ViewModel>([this.filteredView, this.sortedView, this.partialView]);
    this.view;
  }

  protected initializeScrollHandler() {
    this.initializeElementHeight();
    this.scrollHandler = new PartialViewScrollHandler<ViewModel>({
      partialView: this.partialView,
      target: this.sourceViewModel.element_,
      beforeViewUpdate: () => this.pauseMutationObserver(),
      afterViewUpdate: () => this.startMutationObserver(),
    });
  }

  startMutationObserver() {
    // this.sourceViewModel.observe__(this.sourceViewModel.element_, false, undefined, false, true, false);
  }

  pauseMutationObserver() {
    // this.sourceViewModel.unobserve__(this.sourceViewModel.element_);
  }

  protected onMutation(mutations: Array<MutationRecord>, observer: MutationObserver, originalMutations: Array<MutationRecord>, reporter: MutationReporter) {
    this.sourceViewModel.reconnectToExecute__(() => {
      this.scrollHandler.deactivateObservers();
      reporter.report(mutations);
      for (const mutation of mutations) {
        if (mutation.target !== this.sourceViewModel.element_) {
          continue;
        }

        if (mutation.type !== "childList") {
          continue;
        }

        for (const addedNode of mutation.addedNodes) {
          const viewModel = this.childViewModelBuilder(addedNode as HTMLElement);
          this.sourceViewModel.insertChild__(viewModel);
        }

        for (const removedNode of mutation.removedNodes) {
          const identifier = (removedNode as HTMLElement).dataset[ViewModel.identifierDatasetName_];
          this.sourceViewModel.removeChildByIdentifier__(identifier);
        }
      }
      this.scrollHandler.activateObservers();
    });
  }

  refreshView() {
    this.scrollHandler.setWindow(this.partialView.numElementNotRenderedBefore);
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
