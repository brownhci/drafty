import { HTMLElementInitializer, ViewModel, ViewModelInitializer } from "./ViewModel";

export class DataRow extends ViewModel {
  private static readonly defaultPropertiesToForward = ["id", "className", "cells"];
  private static readonly defaultPropertiesToMonitor = [];
  private static readonly defaultHTMLElementInitializer: HTMLElementInitializer = () => document.createElement("tr");
  private static readonly defaultViewModelInitializer: ViewModelInitializer = () => new DataRow();


  constructor(
    propertiesToForward: Array<string> = DataRow.defaultPropertiesToForward,
    elementToMonitor?: HTMLElement,
    propertiesToMonitor: Array<string> = DataRow.defaultPropertiesToMonitor
  ) {
    if (!elementToMonitor) {
      elementToMonitor = DataRow.defaultHTMLElementInitializer();
    }

    const mutationObserverInit = ViewModel.buildMutationObserverInit(true, true, false, propertiesToMonitor);

    super(propertiesToForward, elementToMonitor, mutationObserverInit);
  }
}
