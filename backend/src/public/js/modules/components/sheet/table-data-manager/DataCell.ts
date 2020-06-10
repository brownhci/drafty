import { HTMLElementInitializer, ViewModel, ViewModelInitializer } from "./ViewModel";

export class DataCell extends ViewModel {
  private static readonly defaultPropertiesToForward = ["id", "className", "textContent"];
  private static readonly defaultPropertiesToMonitor = [];
  private static readonly defaultHTMLElementInitializer: HTMLElementInitializer = () => document.createElement("td");
  private static readonly defaultViewModelInitializer: ViewModelInitializer = () => new DataCell();


  constructor(
    propertiesToForward: Array<string> = DataCell.defaultPropertiesToForward,
    elementToMonitor?: HTMLElement,
    propertiesToMonitor: Array<string> = DataCell.defaultPropertiesToMonitor
  ) {
    if (!elementToMonitor) {
      elementToMonitor = DataCell.defaultHTMLElementInitializer();
    }

    const mutationObserverInit = ViewModel.buildMutationObserverInit(true, true, false, propertiesToMonitor);

    super(propertiesToForward, elementToMonitor, mutationObserverInit);
  }
}
