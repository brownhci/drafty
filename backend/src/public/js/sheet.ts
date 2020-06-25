import { activeClass, activeAccompanyClass, copiedClass, invalidClass } from "./modules/constants/css-classes";
import "./modules/components/welcome-screen";
import { hasCopyModifier, clearCopyBuffer, copyCurrentSelectionToCopyBuffer, copyTextToCopyBuffer, copyCopyBuffer } from "./modules/utils/copy";
import { hasTextSelected} from "./modules/utils/selection";
import { getViewportWidth, getViewportHeight, measureTextWidth } from "./modules/utils/length";
import { getLeftTableCellElement, getRightTableCellElement, getUpTableCellElement, getDownTableCellElement } from "./modules/dom/navigate";
import { isTableData, isTableHead, isTableCell, isInput } from "./modules/dom/types";
import { fuseSelect, initializeFuseSelect, updateFuseSelect } from "./modules/components/sheet/suggestions";
import { recordCellEdit, recordCellClick, recordCellDoubleClick, recordCellCopy, recordColumnCopy, recordColumnSearch, recordColumnSort } from "./modules/api/record-interactions";
import { tableElement, tableBodyElement, tableColumnLabels, isColumnAutocompleteOnly, getColumnLabel, getTableDataText, tableScrollContainer, getLongestColumnTextWidth, getColumnLabelSortButton, isColumnLabelSortButton, getTableRow, getTableCellText, getTableCellTextsInColumn, isColumnSearchInput, isTableCellEditable, getColumnSearchInput, isColumnLabel, isFirstTableCell, isLastTableCell, isColumnSearch, getColumnSearch, getTableColElement, isColumnSearchInputFocused, getColumnLabelText } from "./modules/dom/sheet";
import { getMinimumColumnWidth, updateTableColumnSearchWidth, updateTableCellWidth } from "./modules/components/sheet/column-width";
import { getIdSuggestion, getIdSuggestionType } from "./modules/api/record-interactions";
import { TabularView } from "./modules/components/sheet/tabular-view";
import { FilterFunction, SortingFunction } from "./modules/components/sheet/table-data-manager/ViewFunction";


// TODO last column resize
// TODO ARROW KEY not functioning when scrolling off screen
// TODO add new row
const tableDataManager = new TabularView(document.getElementById("table-data"), tableBodyElement);

/* which table column is active: a table column is activated when associated head is clicked */
let activeTableColElement: null | HTMLTableColElement = null;

function isSortPanelSorterOrderButton(element: HTMLElement): boolean {
  return element && element.classList.contains("column-sorter-order");
}
function isSortPanelSorterDeleteButton(element: HTMLElement): boolean {
  return element && element.classList.contains("column-sorter-delete");
}
const descendingClass: string = "desc";
function isDescendingSorted(element: HTMLElement): boolean {
  return element && element.classList.contains(descendingClass);
}
const columnSorterColumnSelectClass: string = "column-sorter-column-select";
function isColumnSorterColumnSelect(element: HTMLElement): boolean {
  return element && element.classList.contains(columnSorterColumnSelectClass);
}
const columnSorterReorderGripClass = "column-sorter-reorder-grip";
function isColumnSorterReorderGrip(element: HTMLElement): boolean {
  return element && element.classList.contains(columnSorterReorderGripClass);
}


function getColumnIndexFromColumnSorterContainer(columnSorterContainer: HTMLElement): number {
  return Number.parseInt(columnSorterContainer.dataset.columnIndex);
}
const tableColumnSortPanelColumnSorterClass: string = "column-sorter";
function getColumnSorterContainerFromChildElement(childElement: HTMLElement): HTMLElement {
  return childElement.closest(`.${tableColumnSortPanelColumnSorterClass}`);
}


// input editor
/* input editor element */
const tableCellInputFormElement: HTMLFormElement = document.getElementById("table-cell-input-form") as HTMLFormElement;
function isTableCellInputFormActive() {
  return tableCellInputFormElement.classList.contains(activeClass);
}
/* the input element in the input editor */
const tableCellInputFormInputElement: HTMLInputElement = document.getElementById("table-cell-input-entry") as HTMLInputElement;
const tableCellInputFormInputInvalidFeedbackElement: HTMLInputElement = document.getElementById("table-cell-input-feedback") as HTMLInputElement;
const tableCellInputFormInputSaveButtonElement: HTMLButtonElement = document.getElementById("table-cell-input-save") as HTMLButtonElement;
/* the target element the input editor is associated with */

// input editor location
/* the location element */
const tableCellInputFormLocateCellElement: HTMLButtonElement = document.getElementById("locate-cell") as HTMLButtonElement;
/* the row index element in the location element */
const tableCellInputFormLocateCellRowElement: HTMLSpanElement = document.getElementById("locate-cell-associated-row") as HTMLSpanElement;
/* the column index element in the location element */
const tableCellInputFormLocateCellColElement: HTMLSpanElement = document.getElementById("locate-cell-associated-col") as HTMLSpanElement;
/* whether the location element is shown in the input editor */
let tableCellInputFormLocationActive: boolean = false;

const tableCellInputFormInputContainer: HTMLElement = tableCellInputFormLocateCellElement.parentElement;

function activateInvalidFeedback(invalidFeedback: string) {
  tableCellInputFormInputInvalidFeedbackElement.textContent = invalidFeedback;
  tableCellInputFormInputInvalidFeedbackElement.classList.add(activeClass);
  tableCellInputFormInputElement.classList.add(invalidClass);
}
function deactivateInvalidFeedback() {
  tableCellInputFormInputInvalidFeedbackElement.textContent = "";
  tableCellInputFormInputInvalidFeedbackElement.classList.remove(activeClass);
  tableCellInputFormInputElement.classList.remove(invalidClass);
}

function verifyEdit(edit: string, tableCellElement: HTMLTableCellElement): boolean {
  if (isColumnAutocompleteOnly(getColumnLabel(tableCellElement.cellIndex))) {
    if (fuseSelect.hasAutocompleteSuggestion(edit)) {
      deactivateInvalidFeedback();
    } else {
      activateInvalidFeedback("Value must from Completions");
      return false;
    }
  }
  return true;
}

/**
 * Updates the text inside the input element inside the input editor and resizes the input editor properly.
 *
 * @param {HTMLTableCellElement} targetHTMLTableCellElement - Target HTMLTableCellElement to associate the input editor with.
 * @param {string} input - The text to initialize the input element with.
 */
function updateTableCellInputFormInput(targetHTMLTableCellElement: HTMLTableCellElement, input?: string) {
  const text = input === undefined ? getTableDataText(targetHTMLTableCellElement): input;
  tableCellInputFormInputElement.value = text;

  // resize
  const minWidth = targetHTMLTableCellElement.offsetWidth;
  const resizeWidth = measureTextWidth(text) + 120 + 24;
  const width = Math.max(minWidth, resizeWidth);
  tableCellInputFormElement.style.width = `${width}px`;
}
function updateTableCellInputFormWidthToFitText(textToFit: string) {
  const textWidth = measureTextWidth(textToFit);
  const slack = 124;
  const newWidth = textWidth + slack;

  const formWidth = tableCellInputFormElement.offsetWidth;
  if (newWidth > formWidth) {
    tableCellInputFormElement.style.width = `${newWidth}px`;
  }
}

  // if(tableCellInputFormInputElement.value.length === 2) {
  //   if(tableCellInputFormInputElement.value.charAt(0) === tableCellInputFormInputElement.value.charAt(1)) {
  //     tableCellInputFormInputElement.value = tableCellInputFormInputElement.value.charAt(0);
  //   }
  // }

/* visual cue during resize */
function initializeResizeVisualCue() {
  const visualCue = document.createElement("div");
  visualCue.id = "resize-visual-cue";
  tableScrollContainer.appendChild(visualCue);
  return visualCue;
}
const resizeVisualCue: HTMLElement = initializeResizeVisualCue();
function resizeVisualCueMininumX(tableCellElement: HTMLTableCellElement) {
  const elementLeft = tableCellElement.getBoundingClientRect().left;
  const index = tableCellElement.cellIndex;
  return elementLeft + getMinimumColumnWidth(index);
}
function repositionResizeVisualCue(newXPos: number) {
  resizeVisualCue.style.left = `${newXPos}px`;
}
function updateResizeVisualCuePosition(tableCellElement: HTMLTableCellElement, newXPos: number, nearLeftBorder?: boolean) {
  let minX: number;
  if (nearLeftBorder) {
    minX = resizeVisualCueMininumX(getLeftTableCellElement(tableCellElement));
  } else {
    // near right border
    minX = resizeVisualCueMininumX(tableCellElement);
  }

  repositionResizeVisualCue(Math.max(minX, newXPos));
}
function activateResizeVisualCue() {
  resizeVisualCue.classList.add(activeClass);
}
function deactivateResizeVisualCue() {
  resizeVisualCue.classList.remove(activeClass);
}

// events
const tableColumnSortPanel: HTMLElement = document.getElementById("table-column-sort-panel");
const tableColumnSortPanelColumnSorterContainers: HTMLCollection = tableColumnSortPanel.getElementsByTagName("div");
const tableColumnSortPanelColumnSorterContainerTemplate: HTMLTemplateElement = tableColumnSortPanel.firstElementChild as HTMLTemplateElement;
(tableColumnSortPanelColumnSorterContainerTemplate.content.querySelector(`.${columnSorterColumnSelectClass}`) as HTMLElement).style.width = `${getLongestColumnTextWidth() + 50}px`;

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
function updateSorterBasedOnSortPanel() {
  const ordering: Map<number, number> = new Map();

  let order = 0;
  for (const columnSorterContainer of tableColumnSortPanelColumnSorterContainers) {
    const columnIndex: number = getColumnIndexFromColumnSorterContainer(columnSorterContainer as HTMLElement);
    ordering.set(columnIndex, order);

    columnSorterContainer.querySelector(".column-sorter-sortby-text").textContent = order === 0? "Sort by" : "Then by";

    order++;
  }

  tableDataManager.reorderSortingFunction(ordering);
}

/**
 * Align an element horizontally with respect to targetElement (either align to the left border or right border of targetElement.
 *
 * If the element can be aligned after scrolling the container, viewport will be adjusted.
 *
 * NOTE: This method works for elements inside tableScrollContainer.
 *
 * @param {HTMLElement} element - The element to be aligned.
 * @param {DOMRect} targetDimensions - The result of running getBoundingClientRect() on the element to align against.
 */
function alignElementHorizontally(element: HTMLElement, targetDimensions: DOMRect) {

  const {left: leftLimit, right: rightLimit} = tableElement.getBoundingClientRect();
  let {left: targetLeft, right: targetRight} = targetDimensions;
  const elementWidth: number = element.getBoundingClientRect().width;

  const verticalScrollBarWidth = tableScrollContainer.offsetWidth - tableScrollContainer.clientWidth;
  const viewportWidth = getViewportWidth() - verticalScrollBarWidth;

  /**
   * set horizontal placement
   * two choices for horizontal placement
   *   1. left border of form stick to left border of target cell
   *     This option should be picked when right side of the form does not exceed table element's right bound (rightLimit)
   *   2. right border of form stick to right border of target cell
   *     This option should be picked when the first option isn't available and the left side of the form does not exceed table element's left bound (leftLimit)
   */
  let elementLeft: number;
   if (targetLeft + elementWidth <= rightLimit) {
     // option 1
     if (targetLeft < 0) {
       // left border the form is to the left of viewport
       const leftShiftAmount: number = -targetLeft;
       targetLeft += leftShiftAmount;
       tableScrollContainer.scrollLeft -= leftShiftAmount;
     } else if (targetLeft + elementWidth > viewportWidth) {
       // right border of the form is to the right of viewport
       const rightShiftAmount: number = targetLeft + elementWidth - viewportWidth;
       targetLeft -= rightShiftAmount;
       tableScrollContainer.scrollLeft += rightShiftAmount;
     }
     elementLeft = targetLeft;
   } else if (targetRight - elementWidth >= leftLimit) {
     // option 2
     if (targetRight > viewportWidth) {
       // right border of the form is to the right of viewport
       const rightShiftAmount: number = targetRight - viewportWidth;
       targetRight -= rightShiftAmount;
       tableScrollContainer.scrollLeft += rightShiftAmount;
     } else if (targetRight - elementWidth < 0) {
       // left border of the form is to the left left of viewport
       const leftShiftAmount: number = elementWidth - targetRight;
       targetRight += leftShiftAmount;
       tableScrollContainer.scrollLeft -= leftShiftAmount;
     }
     elementLeft = targetRight - elementWidth;
   }

   element.style.left = `${elementLeft}px`;
}
function activateSortPanel(targetElement: HTMLElement) {
  // show sort panel
  tableColumnSortPanel.classList.add(activeClass);

  // patch sort panel
  const sorters = Array.from(tableDataManager.sortingFunctions);
  sorters.sort((s1, s2) => s1[1].priority - s2[1].priority);
  const numSorter: number = sorters.length;

  let sorterContainerIndex = 0;
  for (const columnSorterContainer of tableColumnSortPanelColumnSorterContainers) {
    if (sorterContainerIndex < numSorter) {
      const columnIndex: number = sorters[sorterContainerIndex][0];
      modifyColumnSorterContainer(columnSorterContainer as HTMLElement, columnIndex, sorterContainerIndex);
    } else {
      columnSorterContainer.remove();
    }
    sorterContainerIndex++;
  }

  for (; sorterContainerIndex < numSorter; sorterContainerIndex++) {
    const templateContainer = tableColumnSortPanelColumnSorterContainerTemplate.content.firstElementChild;
    const columnSorterContainer = templateContainer.cloneNode(true) as HTMLElement;
    const columnIndex: number = sorters[sorterContainerIndex][0];
    modifyColumnSorterContainer(columnSorterContainer, columnIndex, sorterContainerIndex);
    tableColumnSortPanel.appendChild(columnSorterContainer);
  }

  // position sort panel
  const targetDimensions = targetElement.getBoundingClientRect();
  alignElementHorizontally(tableColumnSortPanel, targetDimensions);
  tableColumnSortPanel.style.top = `${targetDimensions.bottom}px`;
}
function deactivateSortPanel() {
  tableColumnSortPanel.classList.remove(activeClass);
}
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

  if (tableColumnSortPanelColumnSorterContainers.length === 0) {
    deactivateSortPanel();
  }
}
// click event handler
tableColumnSortPanel.addEventListener("click", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isSortPanelSorterOrderButton(target)) {
    sortPanelSorterOrderButtonOnClick(target);
  } else if (isSortPanelSorterDeleteButton(target)) {
    sortPanelSorterDeleteButtonOnClick(target);
  }
  event.preventDefault();
  event.stopPropagation();
}, true);
// change (select value change) event handler
function sortPanelColumnSelectOnChange(selectElement: HTMLSelectElement, event: Event) {
  const columnSorterContainer = getColumnSorterContainerFromChildElement(selectElement);
  const columnIndex: number = getColumnIndexFromColumnSorterContainer(columnSorterContainer);
  deleteColumnSorter(columnIndex, true);

  const selectedIndex = selectElement.selectedIndex;
  setColumnSorter(selectedIndex);
  columnSorterContainer.dataset.columnIndex = selectedIndex.toString();
}

tableColumnSortPanel.addEventListener("change", function(event: Event) {
  const target = event.target as HTMLElement;
  if (isColumnSorterColumnSelect(target)) {
    sortPanelColumnSelectOnChange(target as HTMLSelectElement, event);
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
        updateSorterBasedOnSortPanel();
      }
    }

    activeColumnSorterReorderGrip.classList.remove(activeClass);
    activeColumnSorterReorderGrip = undefined;
  }
}
tableColumnSortPanel.addEventListener("mousedown", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isColumnSorterReorderGrip(target)) {
    activateColumnSorterReorderGrip(target);
    event.preventDefault();
  }
  event.stopPropagation();
}, true);
tableColumnSortPanel.addEventListener("mouseup", function(event: MouseEvent) {
  deactivateColumnSorterReorderGrip(event);
  event.preventDefault();
  event.stopPropagation();
}, true);


enum SortingDirection {
  ASCENDING,
  DESCENDING,
}
const clickClass = "clicked";
function setColumnSorter(columnIndex: number, sortingDirection: SortingDirection = SortingDirection.ASCENDING, order: number = columnIndex, recordColumnSortInteraction: boolean = true) {
  const buttonElement = getColumnLabelSortButton(getColumnLabel(columnIndex));
  buttonElement.classList.add(clickClass);

  let sorter: SortingFunction<HTMLTableRowElement>;
  if (sortingDirection === SortingDirection.ASCENDING) {
    sorter = (r1, r2) => getTableCellText(r1.cells[columnIndex]).localeCompare(getTableCellText(r2.cells[columnIndex]));
  } else {
    sorter = (r1, r2) => getTableCellText(r2.cells[columnIndex]).localeCompare(getTableCellText(r1.cells[columnIndex]));
  }
  tableDataManager.addSortingFunction(columnIndex, sorter, order);
  if (recordColumnSortInteraction) {
    recordColumnSort(columnIndex, sortingDirection);
  }
}
function changeColumnSorterSortOrder(
  columnIndex: number,
  columnLabelSortButton: HTMLButtonElement = getColumnLabelSortButton(getColumnLabel(columnIndex)),
  newSortOrder: SortingDirection = isDescendingSorted(columnLabelSortButton) ? SortingDirection.ASCENDING : SortingDirection.DESCENDING,
  recordColumnSort: boolean = true) {
    columnLabelSortButton.classList.toggle(descendingClass);
    setColumnSorter(columnIndex, newSortOrder, undefined, recordColumnSort);
}

function deleteColumnSorter(columnIndex: number) {
  const columnLabel = getColumnLabel(columnIndex);
  const columnLabelSortButton = getColumnLabelSortButton(columnLabel);
  columnLabelSortButton.classList.remove(clickClass, descendingClass);
  tableDataManager.deleteSortingFunction(columnIndex);
}
function tableCellSortButtonOnClick(buttonElement: HTMLButtonElement, recordColumnSort: boolean = true) {
  const columnIndex = (buttonElement.parentElement as HTMLTableDataCellElement).cellIndex;
  // '' => 'clicked' => 'clicked desc' => 'clicked'
  // since we are sorting on the current displayed data elements, we need to collect
  // data elements from rendered table data sections
  if (buttonElement.classList.contains(clickClass)) {
    changeColumnSorterSortOrder(columnIndex, buttonElement, undefined, recordColumnSort);
  } else {
    // ascending sort
    setColumnSorter(columnIndex, SortingDirection.ASCENDING, undefined, recordColumnSort);
  }
}
tableElement.addEventListener("click", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableStatusManager.tableCellElementOnClick(target as HTMLTableCellElement, event);
  } else if (isColumnLabelSortButton(target)) {
    tableCellSortButtonOnClick(target as HTMLButtonElement);
    activateSortPanel(target);
  }
  event.stopPropagation();
}, true);


tableCellInputFormInputSaveButtonElement.addEventListener("click", function(event) {
   tableStatusManager.quitTableCellInputForm(true);
   event.preventDefault();
   event.stopPropagation();
});

/* keyboard event */
interface ConsumableKeyboardEvent extends KeyboardEvent {
  consumed?: boolean;
}
function copyCellTextToCopyBuffer(tableCellElement: HTMLTableCellElement) {
  copyTextToCopyBuffer(getTableCellText(tableCellElement));
}
function copyTableColumnToCopyBuffer(index: number) {
  let textToCopy = "";
  for (const text of getTableCellTextsInColumn(index, true, true)) {
    textToCopy += `${text}\n`;
  }
  copyTextToCopyBuffer(textToCopy.trimRight());
}

// paste event
function tableCellElementOnPaste(tableCellElement: HTMLTableCellElement, text: string) {
  // invoke edit editor
  tableStatusManager.tableCellInputFormAssignTarget(tableCellElement, text, true);
}
function tableCellElementOnPasteKeyPressed(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  if (isTableHead(tableCellElement)) {
    return;
  }
  if (!hasCopyModifier(event)) {
    return;
  }
  // handle potential CTRL+v or CMD+v
  if (navigator.clipboard) {
    navigator.clipboard.readText().then(text => {
      tableCellElementOnPaste(tableCellElement, text);
    });
    event.consumed = true;
  } else {
    const copyTarget = tableStatusManager.copyTarget;
    if (!copyTarget) {
      return;
    }

    if (!isTableData(copyTarget)) {
      return;
    }

    const text = getTableDataText(copyTarget as HTMLTableCellElement);
    tableCellElementOnPaste(tableCellElement, text);
    event.consumed = true;
  }
}
tableElement.addEventListener("paste", function (event: ClipboardEvent) {
  const pasteContent = event.clipboardData.getData("text");
  const target: HTMLElement = event.target as HTMLElement;
  if(isColumnSearchInput(target)) {
    const targetInput: HTMLInputElement = event.target as HTMLInputElement;
    targetInput.value = pasteContent;
    targetInput.dispatchEvent(new Event("input"));
  } else if (isTableData(target) && isTableCellEditable(target as HTMLTableCellElement)) {
    tableCellElementOnPaste(target as HTMLTableCellElement, pasteContent);
  }
  event.preventDefault();
  event.stopPropagation();
}, true);

function updateTableColumnFilter(columnIndex: number, query: string) {
  if (query == "") {
    tableDataManager.deleteFilterFunction(columnIndex);
  } else {
    const queryRegex = new RegExp(query, "i");
    const filter: FilterFunction<HTMLElement> = element => queryRegex.test(getTableCellText((element as HTMLTableRowElement).cells[columnIndex]));
    tableDataManager.addFilterFunction(columnIndex, filter);
  }
}

let columnSearchFilteringTimeoutId: number | null = null;

function tableColumnSearchElementOnInput(tableColumnSearchInputElement: HTMLInputElement, tableColumnSearchElement: HTMLTableCellElement) {
  if (columnSearchFilteringTimeoutId) {
    window.clearTimeout(columnSearchFilteringTimeoutId);
  }
  columnSearchFilteringTimeoutId = window.setTimeout(() => {
    recordColumnSearch(tableColumnSearchElement, false);
    updateTableColumnFilter(tableColumnSearchElement.cellIndex, tableColumnSearchInputElement.value);
  }, 400);
}

function tableColumnSearchElementOnChange(tableColumnSearchInputElement: HTMLInputElement, tableColumnSearchElement: HTMLTableCellElement) {
  recordColumnSearch(tableColumnSearchElement, true);
}

function tableColumnSearchElementOnKeyDown(tableColumnSearchElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  // focus on the input
  const columnSearchInput: HTMLInputElement = getColumnSearchInput(tableColumnSearchElement);
  const activeElement = document.activeElement;
  if (activeElement !== columnSearchInput) {
    // give focus to the column search input
    columnSearchInput.focus();
    // update the text
    columnSearchInput.value = event.key;
    // update the query regex
    updateTableColumnFilter(tableColumnSearchElement.cellIndex, columnSearchInput.value);
  }

  updateTableColumnSearchWidth(tableColumnSearchElement);
  event.consumed = true;
}
function tableCellElementOnInput(event: ConsumableKeyboardEvent) {
  const tableCellElement: HTMLTableCellElement = event.target as HTMLTableCellElement;
  // ignore if input on table head
  if (isTableData(tableCellElement)) {
    tableStatusManager.tableDataElementOnInput(tableCellElement, event);
  }
}
tableElement.addEventListener("keydown", function(event: KeyboardEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableStatusManager.tableCellElementOnKeyDown(target as HTMLTableCellElement, event);
  } else if (isInput(target)) {
    // inputting on column search
    const columnSearch = target.closest("th.column-search");
    if (columnSearch) {
      const tableColumnSearchElement: HTMLTableCellElement = columnSearch as HTMLTableCellElement;
      tableColumnSearchElementOnKeyDown(tableColumnSearchElement, event);
    }
  }
  event.stopPropagation();
}, true);

tableCellInputFormElement.addEventListener("keydown", function(event: KeyboardEvent) {
  if (isTableCellInputFormActive()) {
    tableStatusManager.tableCellInputFormOnKeyDown(event);
  }
});

// mouse event handlers
let isRepositioningTableCellInputForm = false;
tableCellInputFormElement.addEventListener("mousedown", function(event: MouseEvent) {
  tableStatusManager.activateTableCellInputFormLocation();
  isRepositioningTableCellInputForm = true;
  event.stopPropagation();
}, {passive: true, capture: true});
let tableCellInputFormElementXShift: number = 0;
let tableCellInputFormElementYShift: number = 0;
function tableCellInputFormElementOnMouseMove(event: MouseEvent) {
  const {movementX: xShift, movementY: yShift } = event;
  // debounce
  tableCellInputFormElementXShift += xShift;
  tableCellInputFormElementYShift += yShift;
  tableCellInputFormElement.style.transform = `translate(${tableCellInputFormElementXShift}px, ${tableCellInputFormElementYShift}px)`;
}
tableCellInputFormElement.addEventListener("mousemove", function(event: MouseEvent) {
  if (isRepositioningTableCellInputForm) {
    tableCellInputFormElementOnMouseMove(event);
  }
});
function tableCellInputFormElementOnMouseUp() {
  isRepositioningTableCellInputForm = false;
  tableCellInputFormInputElement.focus({preventScroll: true});
}
tableCellInputFormElement.addEventListener("mouseup", function(event: MouseEvent) {
  if (isRepositioningTableCellInputForm) {
    tableCellInputFormElementOnMouseUp();
  }
});


/* for handling complete searches */
let lastColumnSearchIndex: number = -1;
let lastColumnSearchRecorded: boolean = true;
tableElement.addEventListener("input", function(event: Event) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isInput(target)) {
    // inputting on column search
    const columnSearch = target.closest("th.column-search");
    if (columnSearch) {
      const tableColumnSearchElement: HTMLTableCellElement = columnSearch as HTMLTableCellElement;
      lastColumnSearchIndex = tableColumnSearchElement.cellIndex;
      lastColumnSearchRecorded = false;
      tableColumnSearchElementOnInput(target as HTMLInputElement, tableColumnSearchElement);
    }
  }
  event.stopPropagation();
}, true);

tableElement.addEventListener("blur", function(event: Event) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isInput(target)) {
    const columnSearch = target.closest("th.column-search");
    if (columnSearch) {
      const tableColumnSearchElement: HTMLTableCellElement = columnSearch as HTMLTableCellElement;
      // only recording full search when completing a previous partial search
      if(tableColumnSearchElement.cellIndex === lastColumnSearchIndex && lastColumnSearchRecorded === false) {
        lastColumnSearchRecorded = true;
        tableColumnSearchElementOnChange(target as HTMLInputElement, tableColumnSearchElement);
      }
    }
  }
  event.stopPropagation();
}, true);

/* mouse events */
interface ResizableHTMLTableCellElement extends HTMLTableCellElement {
  atResize?: boolean;
  nearLeftBorder?: boolean;
  nearRightBorder?: boolean;
  startMouseX?: number;
}
let tableCellElementUnderMouse: null | ResizableHTMLTableCellElement = null;
const nearLeftBorderClass = "near-left-border";
const nearRightBorderClass = "near-right-border";
function nearElementLeftBorder(element: HTMLElement) {
  return element.classList.contains(nearLeftBorderClass);
}
function nearElementRightBorder(element: HTMLElement) {
  return element.classList.contains(nearRightBorderClass);
}
function removeNearBorderStatus() {
  for (const element of tableColumnLabels.querySelectorAll(`.${nearLeftBorderClass}`)) {
    element.classList.remove(nearLeftBorderClass);
  }
  for (const element of tableColumnLabels.querySelectorAll(`.${nearRightBorderClass}`)) {
    element.classList.remove(nearRightBorderClass);
  }
}
const resizingBorderClass = "resize-border";
function isResizingTableHeadBorder() {
  return tableColumnLabels.classList.contains(resizingBorderClass);
}
function startResizingBorderOnTableHead(tableCellElement: ResizableHTMLTableCellElement, event: MouseEvent) {
  tableColumnLabels.classList.add(resizingBorderClass);
  tableCellElement.startMouseX = event.clientX;
}
function finishResizingBorderOnTableHead(event: MouseEvent) {
  const startMouseX = tableCellElementUnderMouse.startMouseX;
  if (isNaN(startMouseX)) {
    return;
  } else {
    tableCellElementUnderMouse.startMouseX = undefined;
  }
  const finishMouseX = event.clientX;
  const resizeAmount = finishMouseX - startMouseX;
  if (resizeAmount !== 0) {
    if (nearElementLeftBorder(tableCellElementUnderMouse)) {
      updateTableCellWidth(getLeftTableCellElement(tableCellElementUnderMouse), resizeAmount);
    } else {
      updateTableCellWidth(tableCellElementUnderMouse, resizeAmount);
    }
  }
}
function updateTableCellElementUnderMouse(tableCellElement: HTMLTableCellElement) {
  if (tableCellElementUnderMouse) {
    removeNearBorderStatus();
  }
  tableCellElementUnderMouse = tableCellElement;
}
const distanceConsideredNearToBorder = 10;
/**
 * Handle mouse move near the borders of elements.
 *
 * @param {ResizableHTMLTableCellElement} tableCellElement - An resizable table cell element.
 * @param {MouseEvent} event - The invoking mouse event.
 */
function handleMouseMoveNearElementBorder(tableCellElement: ResizableHTMLTableCellElement, event: MouseEvent) {
  if (!isColumnLabel(tableCellElement)) {
    // ignore mouse moving near borders on elements other than column labels
    return;
  }
  const {left: elementLeft, right: elementRight} = tableCellElement.getBoundingClientRect();
  const mouseX = event.clientX;
  const distanceFromLeftBorder = mouseX - elementLeft;
  const distanceFromRightBorder = elementRight - mouseX;
  if (distanceFromLeftBorder > distanceConsideredNearToBorder && distanceFromRightBorder > distanceConsideredNearToBorder) {
    // reset indicator classes if far from both borders
    removeNearBorderStatus();
  } else if (distanceFromLeftBorder <= distanceConsideredNearToBorder && distanceFromLeftBorder < distanceFromRightBorder && !isFirstTableCell(tableCellElement)) {
    // near left border
    tableCellElement.classList.add(nearLeftBorderClass);
    getLeftTableCellElement(tableCellElement).classList.add(nearRightBorderClass);
  } else if (distanceFromRightBorder <= distanceConsideredNearToBorder && distanceFromRightBorder <= distanceFromLeftBorder) {
    // near right border
    tableCellElement.classList.add(nearRightBorderClass);

    if (!isLastTableCell(tableCellElement)) {
      // last tale column does not have a right border
      getRightTableCellElement(tableCellElement).classList.add(nearLeftBorderClass);
    }
  }
}
// function tableColumnColorify(columnIndex: number, originalWidth: string = "50%", newWidth: string = "100%", bufferBackgroundColor: string = "#f8f9fa") {
//   for (const tableCellElement of getTableCellElementsInColumn(columnIndex, false, false)) {
//     if (isColumnLabel(tableCellElement) || isColumnSearch(tableCellElement)) {
//       tableCellElement.style.paddingRight = `calc(0.75rem + calc(${newWidth} - ${originalWidth}))`;
//     }
//
//     const currentBackgroundColor: string = getComputedStyle(tableCellElement, null).backgroundColor;
//     tableCellElement.style.background = `linear-gradient(to right, ${currentBackgroundColor} 0%, ${currentBackgroundColor} ${originalWidth}, ${bufferBackgroundColor} ${originalWidth}, ${bufferBackgroundColor} ${newWidth})`;
//   }
// }
// function tableColumnDecolorify(columnIndex: number) {
//   for (const tableCellElement of getTableCellElementsInColumn(columnIndex, false, false)) {
//     if (isColumnSearch(tableCellElement)) {
//       tableCellElement.style.paddingRight = "";
//     }
//
//     tableCellElement.style.background = "";
//   }
// }
function tableHeadOnMouseMove(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (isResizingTableHeadBorder()) {
    // reposition visual cue
    updateResizeVisualCuePosition(tableCellElementUnderMouse, event.clientX, nearElementLeftBorder(tableCellElementUnderMouse));
  } else {
    if (tableCellElement !== tableCellElementUnderMouse) {
      // different element under mouse move
      updateTableCellElementUnderMouse(tableCellElement);
    }
    // handle mouse move to element border
    handleMouseMoveNearElementBorder(tableCellElement, event);
  }
}
function tableHeadOnMouseDown(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (tableCellElementUnderMouse !== tableCellElement) {
    updateTableCellElementUnderMouse(tableCellElement);
  }

  // when near a border, start resizing
  if (isColumnLabel(tableCellElementUnderMouse)) {
    if (nearElementLeftBorder(tableCellElementUnderMouse) || nearElementRightBorder(tableCellElementUnderMouse)) {
      startResizingBorderOnTableHead(tableCellElementUnderMouse, event);
      updateResizeVisualCuePosition(tableCellElementUnderMouse, event.clientX, nearElementLeftBorder(tableCellElementUnderMouse));
      activateResizeVisualCue();
    }
  }
}
function tableHeadOnMouseUp(event: MouseEvent) {
  if (isResizingTableHeadBorder()) {
    finishResizingBorderOnTableHead(event);
  }
  deactivateResizeVisualCue();
  tableColumnLabels.classList.remove(resizingBorderClass);
  updateTableCellElementUnderMouse(null);
}
// mouse event handlers
tableElement.addEventListener("mousedown", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableHead(target)) {
    tableHeadOnMouseDown(target as HTMLTableCellElement, event);
  }
  event.stopPropagation();
}, {passive: true, capture: true});
tableElement.addEventListener("mousemove", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableHead(target)) {
    tableHeadOnMouseMove(target as HTMLTableCellElement, event);
  } else if (isRepositioningTableCellInputForm) {
    tableCellInputFormElementOnMouseMove(event);
  }
  event.stopPropagation();
}, {passive: true, capture: true});
tableElement.addEventListener("mouseup", function(event: MouseEvent) {
  if (isRepositioningTableCellInputForm) {
    // stop moving the input form editor
  tableCellInputFormElementOnMouseUp();
  } else {
    tableHeadOnMouseUp(event);
  }
  event.stopPropagation();
}, {passive: true, capture: true});



/* submit event */
tableCellInputFormElement.addEventListener("submit", function(event: Event) {
  // disable submitting
  event.stopPropagation();
  event.preventDefault();
  return false;
}, true);

/* input event */
tableCellInputFormInputElement.addEventListener("input", function(event) {
  const query: string = tableCellInputFormInputElement.value;
  fuseSelect.query(query);
  event.stopPropagation();
}, { passive: true});


// class TableDataManager {
//   get topFromPageTop(): number {
//     return getOffsetFromPageTop(this.topFiller);
//   }
  /**
   * @return {number} How far the bottom of the dataSectionElement is from the top of the page
   */
//   get bottomFromPageTop(): number {
//     return getOffsetFromPageTop(this.bottomFiller);
//   }
//
//   [> sorting <]
//   getSorters(): Map<number, OrderedTextSorter> {
//     return this.dataCollection.cellIndexToSorter;
//   }
  /**
   * @param {string} cellid - The id of cell element.
   * @return {boolean} whether a table cell element specified by `cellid` can appear within rendering view by scrolling
   */
//   isCellInPotentialRenderingView(cellid: string): boolean {
//     if (!cellid) {
//       return false;
//     }
//     return Boolean(this.dataCollection.getDatumByDatumId(cellid));
//   }
//
// }


/* this interface is used to detect double click (two clicks within short interval specified by {@link recentTimeLimit} */
interface ActiveHTMLTableCellElement extends HTMLTableCellElement {
  lastActiveTimestamp?: number;
}
type CopyTarget = HTMLTableColElement | HTMLTableCellElement;

class TableStatusManager {
  static recentTimeLimit = 1000;

  constructor() {
    tableCellInputFormLocateCellElement.addEventListener("click", (event: MouseEvent) => {
      this.restoreTableCellInputFormLocation();
      event.stopPropagation();
    });

  }

  /** which table cell (either a table head or a table data) element is currently active */
  activeTableCellElementId: string = null;
  /** which table cell element (either a table head or a table data) was copied */
  copyTargetId: string = null;

  get copyTarget(): CopyTarget {
    if (!this.copyTargetId) {
      return null;
    }
    return document.getElementById(this.copyTargetId) as CopyTarget;
  }

  set copyTarget(copyTarget: CopyTarget) {
    if (copyTarget) {
      this.copyTargetId = copyTarget.id;
    } else {
      this.copyTargetId = null;
    }
  }

  removeCurrentCopyTarget() {
    const copyTarget: CopyTarget = this.copyTarget;
    if (copyTarget) {
      copyTarget.classList.remove(copiedClass);
      this.copyTarget = null;
    }
  }

  makeElementCopyTarget(element: HTMLTableCellElement | HTMLTableColElement) {
    this.copyTarget = element;
    element.classList.add(copiedClass);
  }

  tableCellElementOnCopy(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
    if (hasCopyModifier(event)) {
      this.removeCurrentCopyTarget();
      clearCopyBuffer();

      let elementToHighlight;
      if (activeTableColElement) {
        // copy entire column
        const columnIndex: number = this.activeTableCellElement.cellIndex;
        copyTableColumnToCopyBuffer(columnIndex);
        elementToHighlight = activeTableColElement;
        recordColumnCopy(getColumnLabel(columnIndex));
      } else if (!(isColumnSearch(tableCellElement))) {
        if (hasTextSelected(tableCellElement)) {
          // copy selected part
          copyCurrentSelectionToCopyBuffer();
        } else {
          // copy single table cell
          copyCellTextToCopyBuffer(tableCellElement);
        }
        elementToHighlight = tableCellElement;
        if (isTableData(tableCellElement)) {
          // do not record copy on table head element
          recordCellCopy(tableCellElement);
        }

        // regain focus
        elementToHighlight.focus();
      }

      copyCopyBuffer();
      this.makeElementCopyTarget(elementToHighlight);
      event.consumed = true;
    }
    // ignore when only C is pressed
  }

  get activeTableCellElement(): ActiveHTMLTableCellElement {
    if (!this.activeTableCellElementId) {
      return null;
    }
    return document.getElementById(this.activeTableCellElementId) as ActiveHTMLTableCellElement;
  }

  set activeTableCellElement(tableCellElement: ActiveHTMLTableCellElement) {
    if (tableCellElement) {
      this.activeTableCellElementId = tableCellElement.id;
    } else {
      this.activeTableCellElementId = null;
    }
  }

  /**
   * renew the timestamp on the active table cell element.
   */
  updateActiveTimestamp() {
    this.activeTableCellElement.lastActiveTimestamp = Date.now();
  }

  /**
   * Whether the table data is activated recently.
   */
  isTableDataLastActivatedRecently() {
    const activeTableCellElement = this.activeTableCellElement;
    if (activeTableCellElement === null) {
      return false;
    }

    if (activeTableCellElement.lastActiveTimestamp === null) {
      return false;
    }

    return Date.now() - activeTableCellElement.lastActiveTimestamp <= TableStatusManager.recentTimeLimit;
  }

  isClickOnActiveElement(tableCellElement: HTMLTableCellElement) {
    return tableCellElement === this.activeTableCellElement;
  }

  activeElementOnRepeatedClick(event: MouseEvent) {
    const activeTableCellElement = this.activeTableCellElement;
    if (!activeTableCellElement) {
      return;
    }
    if (isTableData(activeTableCellElement)) {
      if (this.isTableDataLastActivatedRecently()) {
        this.tableCellInputFormAssignTarget(activeTableCellElement);
        activeTableCellElement.lastActiveTimestamp = null;
        recordCellDoubleClick(activeTableCellElement);
      } else {
        this.updateActiveTimestamp();
      }
    } else if (isTableHead(activeTableCellElement)) {
      this.activeTableHeadOnRepeatedClick(event);
    }
  }

  activeTableHeadOnRepeatedClick(event: MouseEvent) {
    if (activeTableColElement) {
      // table column is active, deactivate column and focus only on table head
      this.deactivateTableCol();
    } else {
      // only activate table column at repeated click (after even number of clicks)
      this.activateTableCol();
    }
  }
  /* activate */
  activateTableData(shouldUpdateTimestamp=true, shouldGetFocus=true) {
    const activeTableCellElement = this.activeTableCellElement;
    activeTableCellElement.classList.add(activeClass);
    if (shouldUpdateTimestamp) {
      this.updateActiveTimestamp();
    }
    if (shouldGetFocus) {
      activeTableCellElement.focus({preventScroll: true});
    }
  }
  activateTableHead(shouldGetFocus=true) {
    const activeTableCellElement = this.activeTableCellElement;
    const index = activeTableCellElement.cellIndex;
    if (isColumnLabel(activeTableCellElement)) {
      const columnSearch = getColumnSearch(index);
      columnSearch.classList.add(activeAccompanyClass);
    } else if (isColumnSearch(activeTableCellElement)) {
      const columnLabel = getColumnLabel(index);
      columnLabel.classList.add(activeAccompanyClass);
    }
    activeTableCellElement.classList.add(activeClass);
    if (shouldGetFocus) {
      activeTableCellElement.focus({preventScroll: true});
    }
  }
  activateTableCol() {
    const index = this.activeTableCellElement.cellIndex;
    const tableColElement = getTableColElement(index);
    if (tableColElement) {
      activeTableColElement = tableColElement;
      activeTableColElement.classList.add(activeClass);
    }
  }
  activateTableCellElement(tableCellElement: HTMLTableCellElement, shouldUpdateTimestamp=true, shouldGetFocus=true) {
    this.activeTableCellElement = tableCellElement;
    if (isTableData(tableCellElement)) {
      this.activateTableData(shouldUpdateTimestamp, shouldGetFocus);
      // record whether this table cell is editable
      isTableCellEditable(tableCellElement);
    } else if (isTableHead(tableCellElement)) {
      this.activateTableHead(shouldGetFocus);
    }
  }

  /* deactivate */
  deactivateTableData() {
    const activeTableCellElement = this.activeTableCellElement;
    activeTableCellElement.classList.remove(activeClass);
    activeTableCellElement.lastActiveTimestamp = null;
  }
  deactivateTableHead() {
    const index = this.activeTableCellElement.cellIndex;
    const columnLabel = getColumnLabel(index);
    const columnSearch = getColumnSearch(index);
    columnLabel.classList.remove(activeClass);
    columnSearch.classList.remove(activeClass);
    columnLabel.classList.remove(activeAccompanyClass);
    columnSearch.classList.remove(activeAccompanyClass);
  }
  deactivateTableCol() {
    if (activeTableColElement) {
      activeTableColElement.classList.remove(activeClass);
      activeTableColElement = null;
    }
  }
  deactivateTableCellElement() {
    const activeTableCellElement = this.activeTableCellElement;
    if (isTableData(activeTableCellElement)) {
      this.deactivateTableData();
    } else if (isTableHead(activeTableCellElement)) {
      this.deactivateTableHead();
      this.deactivateTableCol();
    }
    this.activeTableCellElement = null;
  }

  /**
   * @public
   * Use this function to change table cell element to ensure previous active element is properly deactivated
   */
  updateActiveTableCellElement(tableCellElement: HTMLTableCellElement | null, shouldGetFocus: boolean = true) {
    if (!tableCellElement) {
      return;
    }

    if (this.activeTableCellElement) {
      this.deactivateTableCellElement();
      deactivateSortPanel();
      // remove input form
      this.deactivateTableCellInputForm();
    }

    this.activateTableCellElement(tableCellElement, undefined, shouldGetFocus);
  }

  // input editor exit
  quitTableCellInputForm(saveContent = false) {
    const activeTableCellElement = this.activeTableCellElement;
    if (saveContent) {
      if (verifyEdit(tableCellInputFormInputElement.value, this.tableCellInputFormTargetElement)) {
        this.saveTableCellInputForm();
      } else {
        return;
      }
      // move to next cell to allow continuous edit
      if (activeTableCellElement) {
        const nextCell = getRightTableCellElement(activeTableCellElement);
        if (nextCell) {
          this.updateActiveTableCellElement(nextCell);
        }
      }
    }

    this.tableCellInputFormAssignTarget(null);
  }

  /* click event */
  tableCellElementOnClick(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
    if (this.isClickOnActiveElement(tableCellElement)) {
      // handle repeated click differently
      this.activeElementOnRepeatedClick(event);
    } else {
      this.updateActiveTableCellElement(tableCellElement);
      recordCellClick(tableCellElement);
    }
    event.preventDefault();
  }

  tableCellElementOnKeyDown(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
    event.consumed = false;
    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        this.updateActiveTableCellElement(getDownTableCellElement(tableCellElement));
        event.consumed = true;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        this.updateActiveTableCellElement(getUpTableCellElement(tableCellElement));
        event.consumed = true;
        break;
      case "Left": // IE/Edge specific value
      case "ArrowLeft":
        this.updateActiveTableCellElement(getLeftTableCellElement(tableCellElement));
        event.consumed = true;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
      case "Tab": // handle Tab as a pressing Right arrow
        this.updateActiveTableCellElement(getRightTableCellElement(tableCellElement));
        event.consumed = true;
        break;
      case "c": // handle potential CTRL+c or CMD+c
        this.tableCellElementOnCopy(tableCellElement, event);
        break;
      case "v":
        tableCellElementOnPasteKeyPressed(tableCellElement, event);
        break;
      case "Alt":
      case "AltLock":
      case "CapsLock":
      case "Control":
      case "Fn":
      case "FnLock":
      case "Hyper":
      case "Meta":
      case "NumLock":
      case "ScrollLock":
      case "Shift":
      case "Super":
      case "Symbol":
      case "SymbolLock":
        event.consumed = true;
    }
    if (event.consumed) {
      event.preventDefault();
    } else {
      tableCellElementOnInput(event);
    }
  }

  tableCellInputFormOnKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "Esc": // IE/Edge specific value
      case "Escape":
        this.quitTableCellInputForm(false);
        break;
      case "Enter":
        this.quitTableCellInputForm(true);
        break;
    }
    event.stopPropagation();
  }

  /* restore */
  restoreActiveTableCellElement() {
    const activeTableCellElement = this.activeTableCellElement;
    if (!activeTableCellElement) {
      return;
    }

    if (isTableHead(activeTableCellElement)) {
      // no need to recover active element since table header is the active element (will not disappear because of scrolling)
      return;
    }

    const shouldGetFocus: boolean = !isColumnSearchInputFocused();
    // active element is in view: tableDataSectionRendered
    this.activateTableCellElement(activeTableCellElement, false, shouldGetFocus);
  }

  restoreCopyTarget() {
    const recoveredCopyTarget = this.copyTarget;
    if (recoveredCopyTarget) {
      // copy target is in view
      this.makeElementCopyTarget(recoveredCopyTarget as HTMLTableCellElement);
      return;
    }
  }

  static inputtingClass = "inputting";
  tableCellInputFormTargetElementId: string = null;

  get tableCellInputFormTargetElement(): HTMLTableCellElement {
    if (!this.tableCellInputFormTargetElementId) {
      return null;
    }
    return document.getElementById(this.tableCellInputFormTargetElementId) as HTMLTableCellElement;
  }

  set tableCellInputFormTargetElement(tableCellElement: HTMLTableCellElement) {
    if (tableCellElement) {
      this.tableCellInputFormTargetElementId = tableCellElement.id;
    } else {
      this.tableCellInputFormTargetElementId = null;
    }
  }


  activateTableCellInputFormLocation() {
    if (isTableCellInputFormActive() && !tableCellInputFormLocationActive) {
      tableCellInputFormLocateCellElement.classList.add(activeClass);
      tableCellInputFormLocationActive = true;
      // reposition the tableCellInputFormElement
      const buttonHeight = tableCellInputFormLocateCellElement.offsetHeight;
      const formTop = parseFloat(tableCellInputFormElement.style.top);
      tableCellInputFormElement.style.top = `${formTop - buttonHeight}px`;
    }
  }
  deactivateTableCellInputFormLocation() {
    tableCellInputFormLocateCellElement.classList.remove(activeClass);
    tableCellInputFormLocationActive = false;
  }

  updateTableCellInputFormLocation(targetHTMLTableCellElement: HTMLTableCellElement) {
    // row index
    /* since recordIndex is 0-based */
    const elementIndex = tableDataManager.getElementIndex(getTableRow(targetHTMLTableCellElement));
    tableCellInputFormLocateCellRowElement.textContent = `${elementIndex + 1}`;
    // column index
    const colIndex = targetHTMLTableCellElement.cellIndex;
    const columnLabelText = getColumnLabelText(getColumnLabel(colIndex));
    tableCellInputFormLocateCellColElement.textContent = columnLabelText;
  }

  restoreTableCellInputFormLocation() {
    if (tableCellInputFormLocationActive) {
      const cell = this.tableCellInputFormTargetElement;
      const tableRow = getTableRow(cell);
      if (tableDataManager.isElementInRenderingView(tableRow)) {
        // cell is in rendering view, only alignment is needed
        this.alignTableCellInputForm();
      } else {
        // cell not in rendering view, need to put cell into rendering view before setting alignment
        if (tableDataManager.putElementInRenderingView(tableRow)) {
          this.alignTableCellInputForm();
        }
      }
    }
  }

  activateTableCellInputForm(targetHTMLTableCellElement: HTMLTableCellElement, getFocus: boolean = true) {
    // show the form
    tableCellInputFormElement.classList.add(activeClass);

    // focus the input
    if (getFocus) {
      tableCellInputFormInputElement.focus({preventScroll: true});
    }

    // highlight the table head
    const cellIndex = targetHTMLTableCellElement.cellIndex;
    const columnLabel: HTMLTableCellElement = getColumnLabel(cellIndex);
    if (columnLabel) {
      columnLabel.classList.add(TableStatusManager.inputtingClass);
    }

    // highlight the target cell
    targetHTMLTableCellElement.classList.add(TableStatusManager.inputtingClass);
    this.tableCellInputFormTargetElement = targetHTMLTableCellElement;
  }

  /**
   * @public
   * Use this function to change the editor associated table cell.
   */
  tableCellInputFormAssignTarget(targetHTMLTableCellElement: HTMLTableCellElement, input?: string, getFocus: boolean = true) {
    // ignore if input on table head
    if (isTableHead(targetHTMLTableCellElement)) {
      return;
    }

    this.deactivateTableCellInputForm();
    this.deactivateTableCellInputFormLocation();

    tableCellInputFormInputElement.value = "";
    deactivateInvalidFeedback();

    if (targetHTMLTableCellElement) {
      if (!isTableCellEditable(targetHTMLTableCellElement)) {
        return;
      }

      this.activateTableCellInputForm(targetHTMLTableCellElement, getFocus);
      updateTableCellInputFormInput(targetHTMLTableCellElement, input);

			// remount the fuse select
			fuseSelect.mount(element => tableCellInputFormInputContainer.appendChild(element));
			const columnLabel = getColumnLabel(targetHTMLTableCellElement.cellIndex);
			updateFuseSelect(getIdSuggestion(targetHTMLTableCellElement), getIdSuggestionType(columnLabel), () => {
				this.alignTableCellInputForm();
				// resize form editor
				updateTableCellInputFormWidthToFitText(fuseSelect.longestText);
			});

      this.updateTableCellInputFormLocation(targetHTMLTableCellElement);
			updateTableCellInputFormWidthToFitText(fuseSelect.longestText);
      this.alignTableCellInputForm();
    }
  }

  alignTableCellInputForm(tableCellInputFormLocateCellElementActive: boolean = tableCellInputFormLocationActive) {
    // reset last shifting
    tableCellInputFormElement.style.transform = "";
    tableCellInputFormElementXShift = 0;
    tableCellInputFormElementYShift = 0;

    // configure placement
    const targetCellElement = this.tableCellInputFormTargetElement;
    const cellDimensions = targetCellElement.getBoundingClientRect();
    const cellHeight = cellDimensions.height;
    let {top: cellTop, bottom: cellBottom} = cellDimensions;
    let {width: formWidth, height: formHeight} = tableCellInputFormElement.getBoundingClientRect();

    const verticalScrollBarWidth = tableScrollContainer.offsetWidth - tableScrollContainer.clientWidth;
    const viewportWidth = getViewportWidth() - verticalScrollBarWidth;
    const horizontalScrollBarHeight = tableScrollContainer.offsetHeight - tableScrollContainer.clientHeight;
    const viewportHeight = getViewportHeight() - horizontalScrollBarHeight;

    const topFromPageTopLimit = tableDataManager.startFillerFromPageTop;
    // the concerned viewport is restricted to the table rows in <tbody>
    const viewportTopPadding = topFromPageTopLimit;
    const bottomFromPageTopLimit = Math.max(viewportHeight, tableDataManager.endFillerFromPageTop);

    if (formWidth > viewportWidth) {
      formWidth = viewportWidth;
      tableCellInputFormElement.style.width = `${formWidth}px`;
    }

    /* set horizontal placement */
    alignElementHorizontally(tableCellInputFormElement, cellDimensions);

    if (formHeight > viewportHeight) {
      fuseSelect.unmount();
      formHeight = tableCellInputFormElement.getBoundingClientRect().height;
    }
    /**
     * set vertical placement
     * two choices for vertical placement
     *   1. top border (offset by buttonHeight) of form stick to the top border of the target cell
     *   2. bottom border of form stick to the bottom border of the target cell
     */
    const buttonHeight = tableCellInputFormLocateCellElementActive? tableCellInputFormLocateCellElement.offsetHeight: 0;

    const cellTopFromPageTop = targetCellElement.offsetTop;
    const cellBottomFromPageTop = cellTopFromPageTop + cellHeight;
    let formTop: number;
    if (cellTopFromPageTop + formHeight - buttonHeight < bottomFromPageTopLimit) {
      // option 1
      if (cellTop < viewportTopPadding) {
        // top border of form is to the top of the viewport
        const upShiftAmount: number = viewportTopPadding - cellTop;
        cellTop += upShiftAmount;
        tableScrollContainer.scrollTop -= upShiftAmount;
      } else if (cellTop + formHeight - buttonHeight > viewportHeight) {
        // bottom border of form is to the bottom of the viewport
        const downShiftAmount: number = cellTop + formHeight - buttonHeight - viewportHeight;
        cellTop -= downShiftAmount;
        tableScrollContainer.scrollTop += downShiftAmount;
      }
      formTop = cellTop - buttonHeight;
    } else if (cellBottomFromPageTop - formHeight + buttonHeight >= topFromPageTopLimit) {
      // option 2
      if (cellBottom > viewportHeight) {
        // bottom border of form is to the bottom of the viewport
        const downShiftAmount: number = cellBottom - viewportHeight;
        cellBottom -= downShiftAmount;
        tableScrollContainer.scrollTop += downShiftAmount;
      } else if (cellBottom - formHeight + buttonHeight < viewportTopPadding) {
        // top border of form is to the top of the viewport
        const upShiftAmount: number = viewportTopPadding - (cellBottom - formHeight + buttonHeight);
        cellBottom += upShiftAmount;
        tableScrollContainer.scrollTop -= upShiftAmount;
      }
      formTop = cellBottom - formHeight + buttonHeight;
    }
    tableCellInputFormElement.style.top = `${formTop}px`;
  }

  saveTableCellInputForm() {
    const tableCellInputFormTargetElement = this.tableCellInputFormTargetElement;
    const text = tableCellInputFormInputElement.value;
    if (tableCellInputFormTargetElement) {
      // call backend api to send user submission
      recordCellEdit(tableCellInputFormTargetElement, text);
    }
  }

  tableCellInputFormLocationOnScroll() {
    this.activateTableCellInputFormLocation();
  }

  deactivateTableCellInputForm() {
    const tableCellInputFormTargetElement = this.tableCellInputFormTargetElement;
    if (isTableCellInputFormActive()) {
      // hide the form
      tableCellInputFormElement.classList.remove(activeClass);

      // unhighlight the table head
      const columnLabel: HTMLTableCellElement = tableColumnLabels.querySelector(`.${TableStatusManager.inputtingClass}`);
      if (columnLabel) {
        columnLabel.classList.remove(TableStatusManager.inputtingClass);
      }

      // unhighlight the target cell
      if (tableCellInputFormTargetElement) {
        this.tableCellInputFormTargetElement = null;
      }
    }
  }

  tableDataElementOnInput(tableDataElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
    this.tableCellInputFormAssignTarget(tableDataElement);
    event.consumed = true;
  }

  restoreTableCellInputFormTargetElement() {
    const tableCellInputFormTargetElement = this.tableCellInputFormTargetElement;
    if (tableCellInputFormTargetElement) {
      const getFocus: boolean = !isColumnSearchInputFocused();
      // form target is in view
      this.tableCellInputFormAssignTarget(tableCellInputFormTargetElement, undefined, getFocus);
    } else {
      if (!isTableCellInputFormActive()) {
        return;
      }

      const targetCell = this.tableCellInputFormTargetElement;
      const targetRow = getTableRow(targetCell);
      if (tableDataManager.isElementInRenderingView(targetRow)) {
        // row index
        const elementIndex = tableDataManager.getElementIndex(targetRow);
        tableCellInputFormLocateCellRowElement.textContent = `${elementIndex + 1}`;
      } else {
        // the target element has moved out of view
        this.tableCellInputFormAssignTarget(null);
      }
    }
  }

  restoreStatus() {
    this.restoreActiveTableCellElement();
    this.restoreCopyTarget();
    this.restoreTableCellInputFormTargetElement();
  }
}

initializeFuseSelect(tableCellInputFormInputElement, (element: HTMLElement) => tableCellInputFormInputContainer.appendChild(element));
const tableStatusManager: TableStatusManager = new TableStatusManager();
// const tableDataManager = new TableDataManager(tableElement, document.getElementById("table-data"), tableScrollContainer, tableRowHeight, undefined, () => tableStatusManager.restoreStatus());
// sort on University A-Z
tableCellSortButtonOnClick(tableElement.querySelectorAll(".sort-btn")[1] as HTMLButtonElement, false);
