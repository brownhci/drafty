  import { BasicView } from "./table-data-manager/View";
  import { SortingFunctionWithPriority } from "./table-data-manager/ViewFunction";
  import { ViewModel } from "./table-data-manager/ViewModel";
  import { getRowIndexInSection } from "../../dom/sheet";
  import { isFirefox } from "../../utils/platform";


  function getOffsetFromPageTop(element: HTMLElement): number {
    let offset = 0;
    while (element.offsetParent) {
      if (isFirefox) {
        // use difference between `element` and `element.offsetParent`'s `getBoundingClientRect().top` to emulate offsetTop
        offset += element.getBoundingClientRect().top - element.offsetParent.getBoundingClientRect().top;
      } else {
        offset += element.offsetTop;
      }
      element = element.offsetParent as HTMLElement;
    }
    return offset;
  }


  export class TabularView extends BasicView {
    /**
     * @returns {Array<ViewModel>} The full view before partial rendering (before passing into PartialView).
     */
    get fullView(): Array<ViewModel> {
      // updates view if necessary
      this.view;
      return this.partialView.lastSource;
    }

    get rowCount(): number {
      return this.partialView.numElement;
    }

    get startFillerFromPageTop(): number {
      return getOffsetFromPageTop(this.scrollHandler.startFillerElement);
    }

    get endFillerFromPageTop(): number {
      return getOffsetFromPageTop(this.scrollHandler.endFillerElement);
    }

    get sortingFunctions(): Map<any, SortingFunctionWithPriority<ViewModel>> {
      return this.sortedView.sortingFunctions;
    }

    getElementIndex(element: HTMLTableRowElement): number {
      const currentViewIndex = getRowIndexInSection(element);
      return currentViewIndex + this.partialView.numElementNotRenderedBefore;
    }

    isElementInRenderingView(element: HTMLTableRowElement): boolean {
      return element.parentElement === this.sourceViewModel.element_;
    }

    /**
     * @param {HTMLTableRowElement} element - The element to find.
     * @returns {boolean} whether the element can be reached by scrolling.
     */
    isElementInPotentialView(element: HTMLTableRowElement): boolean {
      const child: ViewModel = this.sourceViewModel.getChildByElement__(element);
      return child && this.fullView.includes(child);
    }

    putElementInRenderingView(element: HTMLTableRowElement): boolean {
      const viewModel = this.sourceViewModel.getChildByElement__(element);
    const elementIndex = this.fullView.indexOf(viewModel);
    if (elementIndex === -1) {
      return false;
    }
    this.scrollHandler.scrollToElementIndex(elementIndex);
    return true;
  }
}
