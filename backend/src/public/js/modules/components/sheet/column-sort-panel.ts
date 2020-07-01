import { getColumnLabel, getColumnLabelSortButton, getLongestColumnTextWidth, getTableCellText } from "../../dom/sheet";
import { activeClass } from "./../../constants/css-classes";
import { alignElementHorizontally } from "./align";
import { tableDataManager } from "../../../sheet";
import { SortingFunction } from "./table-data-manager/ViewFunction";
import { clickClass } from "../../constants/css-classes";
import { recordColumnSort } from "../../api/record-interactions";

enum SortingDirection {
  ASCENDING,
  DESCENDING,
}

/** A class on an element that can toggle column sorter's direction between ascending and descending */
const columnSorterOrderClass = "column-sorter-order";
/** A class on an element that will delete current column sorter when clicked */
const columnSorterDeleteClass = "column-sorter-delete";
/** A class on a select element that can choose which column current sorter will operate on */
const columnSorterColumnSelectClass: string = "column-sorter-column-select";
/** @live */
const columnSorterColumnSelects: HTMLCollection = document.getElementsByClassName(columnSorterColumnSelectClass);
/** a class on an element that adjusts the ordering (priority) of current sorter with respect to other sorters */
const columnSorterReorderGripClass = "column-sorter-reorder-grip";
const columnSorterClass: string = "column-sorter";

const columnSortPanel: HTMLElement = document.getElementById("table-column-sort-panel");
/** @live */
const columnSorterContainers: HTMLCollection = columnSortPanel.getElementsByTagName("div");
const columnSorterContainerTemplate: HTMLTemplateElement = columnSortPanel.firstElementChild as HTMLTemplateElement;

const descendingClass: string = "desc";

function isSortPanelSorterOrderButton(element: HTMLElement): boolean {
  return element && element.classList.contains(columnSorterOrderClass);
}
function isSortPanelSorterDeleteButton(element: HTMLElement): boolean {
  return element && element.classList.contains(columnSorterDeleteClass);
}

function isDescendingSorted(element: HTMLElement): boolean {
  return element && element.classList.contains(descendingClass);
}

function isColumnSorterColumnSelect(element: HTMLElement): boolean {
  return element && element.classList.contains(columnSorterColumnSelectClass);
}
function isColumnSorterReorderGrip(element: HTMLElement): boolean {
  return element && element.classList.contains(columnSorterReorderGripClass);
}

function getColumnIndexFromColumnSorterContainer(columnSorterContainer: HTMLElement): number {
  return Number.parseInt(columnSorterContainer.dataset.columnIndex);
}

function getColumnSorterContainerFromChildElement(childElement: HTMLElement): HTMLElement {
  return childElement.closest(`.${columnSorterClass}`);
}


/**
 * Modifies a column sorter container to reflect the existing sorting function for a column.
 *
 * These aspects will be customized:
 *
 *    + Whether it is "Sort by" or "Then by" depending on whether it is the first column sorter container.
 *    + Whether it reflects an ascending or descending sorting function.
 *    + Which column does it operate on
 *
 * @param {HTMLElement} container - The original container to be customized.
 * @param {number} columnIndex - Which column does this sorting function operates on.
 * @param {number{ containerIndex - Whether this column sorter container is the first (most important) container.
 */
function modifyColumnSorterContainer(container: HTMLElement, columnIndex: number, containerIndex: number) {
  container.dataset.columnIndex = columnIndex.toString();

  const sortbyText = containerIndex === 0 ? "Sort by" : "Then by";
  container.querySelector(".column-sorter-sortby-text").textContent = sortbyText;

  const columnLabel = getColumnLabel(columnIndex);
  const columnLabelSortButton = getColumnLabelSortButton(columnLabel);
  if (isDescendingSorted(columnLabelSortButton)) {
    container.querySelector(".column-sorter-order").classList.add(descendingClass);
  }

  const columnSorterColumnSelect: HTMLSelectElement = container.querySelector(`.${columnSorterColumnSelectClass}`);
  columnSorterColumnSelect.selectedIndex = columnIndex;
}

function updateDisabledOptions() {
  const disabledOptionIndices = new Set(tableDataManager.sortingFunctions.keys()) as Set<number>;
  for (const select of columnSorterColumnSelects) {
    const options: HTMLOptionsCollection = (select as HTMLSelectElement).options;
    // re-enable all disabled options
    for (const disabledOption of select.querySelectorAll("option:disabled")) {
      if (disabledOptionIndices.has(disabledOption.index);
      disabledOption.disabled = false;
    }

    // disable active options
    for (const optionIndex of disabledOptionIndices) {
      options[optionIndex].disabled = true;
    }
  }
}


/**
 * Changes the ordering of column sorting functions according to the ordering in sort panel.
 */
function reorderSortingFunctionFromSortPanel() {
  const ordering: Map<number, number> = new Map();

  // earlier sorting function in panel has higher priority
  let order = 0;
  for (const columnSorterContainer of columnSorterContainers) {
    const columnIndex: number = getColumnIndexFromColumnSorterContainer(columnSorterContainer as HTMLElement);
    ordering.set(columnIndex, order);

    columnSorterContainer.querySelector(".column-sorter-sortby-text").textContent = order === 0? "Sort by" : "Then by";

    order--;
  }

  tableDataManager.reorderSortingFunction(ordering);
}

export function activateSortPanel(targetElement: HTMLElement) {
  // show sort panel
  columnSortPanel.classList.add(activeClass);

  // patch sort panel
  const sorters = Array.from(tableDataManager.sortingFunctions);
  sorters.sort((s1, s2) => s2[1].priority - s1[1].priority);
  const numSorter: number = sorters.length;

  let sorterContainerIndex = 0;
  for (const columnSorterContainer of columnSorterContainers) {
    if (sorterContainerIndex < numSorter) {
      const columnIndex: number = sorters[sorterContainerIndex][0];
      modifyColumnSorterContainer(columnSorterContainer as HTMLElement, columnIndex, sorterContainerIndex);
    } else {
      columnSorterContainer.remove();
    }
    sorterContainerIndex++;
  }

  for (; sorterContainerIndex < numSorter; sorterContainerIndex++) {
    const templateContainer = columnSorterContainerTemplate.content.firstElementChild;
    const columnSorterContainer = templateContainer.cloneNode(true) as HTMLElement;
    const columnIndex: number = sorters[sorterContainerIndex][0];
    modifyColumnSorterContainer(columnSorterContainer, columnIndex, sorterContainerIndex);
    columnSortPanel.appendChild(columnSorterContainer);
  }

  // position sort panel
  const targetDimensions = targetElement.getBoundingClientRect();
  alignElementHorizontally(columnSortPanel, targetDimensions);
  columnSortPanel.style.top = `${targetDimensions.bottom}px`;

  updateDisabledOptions();
}
export function deactivateSortPanel() {
  columnSortPanel.classList.remove(activeClass);
}

function deleteColumnSorter(columnIndex: number) {
  const columnLabel = getColumnLabel(columnIndex);
  const columnLabelSortButton = getColumnLabelSortButton(columnLabel);
  columnLabelSortButton.classList.remove(clickClass, descendingClass);
  tableDataManager.deleteSortingFunction(columnIndex);
}

function getColumnSorterPriority(columnIndex: number): number {
  return tableDataManager.sortingFunctions.get(columnIndex).priority;
}

function setColumnSorter(
  columnIndex: number,
  sortingDirection: SortingDirection = SortingDirection.ASCENDING,
  priority?: number,
  recordColumnSortInteraction: boolean = true
) {
  const buttonElement = getColumnLabelSortButton(getColumnLabel(columnIndex));
  buttonElement.classList.add(clickClass);

  let sorter: SortingFunction<HTMLTableRowElement>;
  if (sortingDirection === SortingDirection.ASCENDING) {
    sorter = (row1, row2) => getTableCellText(row1.cells[columnIndex]).localeCompare(getTableCellText(row2.cells[columnIndex]));
  } else {
    sorter = (row1, row2) => getTableCellText(row2.cells[columnIndex]).localeCompare(getTableCellText(row1.cells[columnIndex]));
  }
  tableDataManager.addSortingFunction(columnIndex, sorter, priority);
  if (recordColumnSortInteraction) {
    recordColumnSort(columnIndex, sortingDirection);
  }
}

/**
 * Changes the sorting order of a column sorter (a sorting function might sort ascendly or descendingly)
 *
 * This sorting function will have same priority.
 */
function changeColumnSorterSortOrder(
  columnIndex: number,
  columnLabelSortButton: HTMLButtonElement = getColumnLabelSortButton(getColumnLabel(columnIndex)),
  newSortOrder: SortingDirection = isDescendingSorted(columnLabelSortButton) ? SortingDirection.ASCENDING : SortingDirection.DESCENDING,
  recordColumnSort: boolean = true) {
    columnLabelSortButton.classList.toggle(descendingClass);
    setColumnSorter(columnIndex, newSortOrder, getColumnSorterPriority(columnIndex), recordColumnSort);
}


// interactions
// click event
function sortPanelSorterOrderButtonOnClick(sorterOrderButton: HTMLElement) {
  const columnIndex = getColumnIndexFromColumnSorterContainer(getColumnSorterContainerFromChildElement(sorterOrderButton));
  if (isDescendingSorted(sorterOrderButton)) {
      // ascending sort
      sorterOrderButton.classList.remove(descendingClass);
      changeColumnSorterSortOrder(columnIndex);
  } else {
      // descending sort
      sorterOrderButton.classList.add(descendingClass);
      changeColumnSorterSortOrder(columnIndex);
  }
}
function sortPanelSorterDeleteButtonOnClick(sorterDeleteButton: HTMLElement) {
  const columnSorterContainer: HTMLElement = getColumnSorterContainerFromChildElement(sorterDeleteButton);
  const columnIndex = getColumnIndexFromColumnSorterContainer(columnSorterContainer);
  deleteColumnSorter(columnIndex);
  columnSorterContainer.remove();

  if (columnSorterContainers.length === 0) {
    deactivateSortPanel();
  }
}
columnSortPanel.addEventListener("click", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isSortPanelSorterOrderButton(target)) {
    sortPanelSorterOrderButtonOnClick(target);
  } else if (isSortPanelSorterDeleteButton(target)) {
    sortPanelSorterDeleteButtonOnClick(target);
  }
  event.preventDefault();
  event.stopPropagation();
}, true);

// change event (select value change)
function sortPanelColumnSelectOnChange(selectElement: HTMLSelectElement) {
  const columnSorterContainer = getColumnSorterContainerFromChildElement(selectElement);
  const columnIndex: number = getColumnIndexFromColumnSorterContainer(columnSorterContainer);
  const priority = getColumnSorterPriority(columnIndex);
  deleteColumnSorter(columnIndex);

  const selectedIndex = selectElement.selectedIndex;
  // inherit priority from previous column sorter
  setColumnSorter(selectedIndex, undefined, priority);
  columnSorterContainer.dataset.columnIndex = selectedIndex.toString();
  updateDisabledOptions();
}

columnSortPanel.addEventListener("change", function(event: Event) {
  const target = event.target as HTMLElement;
  if (isColumnSorterColumnSelect(target)) {
    sortPanelColumnSelectOnChange(target as HTMLSelectElement);
  } else {
    event.preventDefault();
  }

  event.stopPropagation();
}, true);

// mouse event handlers
let activeColumnSorterReorderGrip: HTMLElement = undefined;
function activateColumnSorterReorderGrip(element: HTMLElement) {
  element.classList.add(activeClass);
  activeColumnSorterReorderGrip = element;
}
function deactivateColumnSorterReorderGrip(event: MouseEvent) {
  if (activeColumnSorterReorderGrip) {
    const {clientX: x, clientY: y} = event;
    const elementAtPoint = document.elementFromPoint(x, y) as HTMLElement;
    if (elementAtPoint) {
      const columnSorterContainer = getColumnSorterContainerFromChildElement(elementAtPoint);
      const {top, bottom} = columnSorterContainer.getBoundingClientRect();
      if (columnSorterContainer) {
        const initialColumnSorterContainer = getColumnSorterContainerFromChildElement(activeColumnSorterReorderGrip);

        let insertBefore: boolean;
        if (columnSorterContainer.nextElementSibling === initialColumnSorterContainer) {
          insertBefore = true;
        } else if (columnSorterContainer.previousElementSibling === initialColumnSorterContainer) {
          insertBefore = false;
        } else {
          // will insert before if closer to top
          insertBefore = Math.abs(top - y) < Math.abs(bottom - y);
        }

        if (insertBefore) {
          columnSorterContainer.before(initialColumnSorterContainer);
        } else {
          columnSorterContainer.after(initialColumnSorterContainer);
        }
        reorderSortingFunctionFromSortPanel();
      }
    }

    activeColumnSorterReorderGrip.classList.remove(activeClass);
    activeColumnSorterReorderGrip = undefined;
  }
}
columnSortPanel.addEventListener("mousedown", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isColumnSorterReorderGrip(target)) {
    activateColumnSorterReorderGrip(target);
    event.preventDefault();
  }
  event.stopPropagation();
}, true);
columnSortPanel.addEventListener("mouseup", function(event: MouseEvent) {
  deactivateColumnSorterReorderGrip(event);
  event.preventDefault();
  event.stopPropagation();
}, true);

// click
export function tableCellSortButtonOnClick(buttonElement: HTMLButtonElement, recordColumnSort: boolean = true) {
  const columnIndex = (buttonElement.parentElement as HTMLTableDataCellElement).cellIndex;
  // '' => 'clicked' => 'clicked desc' => 'clicked'
  // since we are sorting on the current displayed data elements, we need to collect
  // data elements from rendered table data sections
  if (buttonElement.classList.contains(clickClass)) {
    changeColumnSorterSortOrder(columnIndex, buttonElement, undefined, recordColumnSort);
  } else {
    // ascending sort
    setColumnSorter(columnIndex, SortingDirection.ASCENDING, undefined, recordColumnSort);
    updateDisabledOptions();
  }
}


// initialization
(columnSorterContainerTemplate.content.querySelector(`.${columnSorterColumnSelectClass}`) as HTMLElement).style.width = `${getLongestColumnTextWidth() + 50}px`;
