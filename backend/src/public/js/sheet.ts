import { activeClass, activeAccompanyClass, copiedClass } from "./modules/constants/css-classes";
import "./modules/components/welcome-screen";
import { tableHeadOnMouseDown, tableHeadOnMouseMove, tableHeadOnMouseUp } from "./modules/components/sheet/resize-column";
import { updateTableColumnSearchWidth } from "./modules/components/sheet/column-width";
import { TabularView } from "./modules/components/sheet/tabular-view";
import { FilterFunction } from "./modules/components/sheet/table-data-manager/ViewFunction";
import { activateSortPanel, deactivateSortPanel, tableCellSortButtonOnClick } from "./modules/components/sheet/column-sort-panel";
import { cellEditor } from "./modules/components/sheet/cell-editor";
import { hasCopyModifier, clearCopyBuffer, copyCurrentSelectionToCopyBuffer, copyTextToCopyBuffer, copyCopyBuffer } from "./modules/utils/copy";
import { hasTextSelected} from "./modules/utils/selection";
import { getLeftTableCellElement, getRightTableCellElement, getUpTableCellElement, getDownTableCellElement } from "./modules/dom/navigate";
import { isTableData, isTableHead, isTableCell, isInput } from "./modules/dom/types";
import { tableElement, tableBodyElement, getColumnLabel, getTableDataText, isColumnLabelSortButton, getTableCellText, getTableCellTextsInColumn, isColumnSearchInput, isTableCellEditable, getColumnSearchInput, isColumnLabel, isColumnSearch, getColumnSearch, getTableColElement } from "./modules/dom/sheet";
import { recordCellClick, recordCellDoubleClick, recordCellCopy, recordColumnCopy, recordColumnSearch } from "./modules/api/record-interactions";

// TODO add new row

export const tableDataManager = new TabularView(document.getElementById("table-data"), tableBodyElement);

/* which table column is active: a table column is activated when associated head is clicked */
let activeTableColElement: HTMLTableColElement = null;

/* this interface is used to detect double click (two clicks within short interval specified by {@link recentTimeLimit} */
interface ActiveHTMLTableCellElement extends HTMLTableCellElement {
  lastActiveTimestamp?: number;
}
const recentTimeLimit: number = 1000;
let activeTableCellElement: ActiveHTMLTableCellElement = null;
/* activate */

/**
 * renew the timestamp on the active table cell element.
 */
function updateActiveTimestamp() {
  activeTableCellElement.lastActiveTimestamp = Date.now();
}
function activateTableData(shouldUpdateTimestamp=true, shouldGetFocus=true) {
  activeTableCellElement.classList.add(activeClass);
  if (shouldUpdateTimestamp) {
    updateActiveTimestamp();
  }
  if (shouldGetFocus) {
    activeTableCellElement.focus();
  }
}
function activateTableHead(shouldGetFocus=true) {
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
function activateTableCol() {
  const index = activeTableCellElement.cellIndex;
  const tableColElement = getTableColElement(index);
  if (tableColElement) {
    activeTableColElement = tableColElement;
    activeTableColElement.classList.add(activeClass);
  }
}
function activateTableCellElement(tableCellElement: HTMLTableCellElement, shouldUpdateTimestamp=true, shouldGetFocus=true) {
  activeTableCellElement = tableCellElement;
  if (isTableData(tableCellElement)) {
    activateTableData(shouldUpdateTimestamp, shouldGetFocus);
    // record whether this table cell is editable
    isTableCellEditable(tableCellElement);
  } else if (isTableHead(tableCellElement)) {
    activateTableHead(shouldGetFocus);
  }
}
/* deactivate */
function deactivateTableData() {
  activeTableCellElement.classList.remove(activeClass);
  activeTableCellElement.lastActiveTimestamp = null;
}
function deactivateTableHead() {
  const index = activeTableCellElement.cellIndex;
  const columnLabel = getColumnLabel(index);
  const columnSearch = getColumnSearch(index);
  columnLabel.classList.remove(activeClass);
  columnSearch.classList.remove(activeClass);
  columnLabel.classList.remove(activeAccompanyClass);
  columnSearch.classList.remove(activeAccompanyClass);
}
function deactivateTableCol() {
  if (activeTableColElement) {
    activeTableColElement.classList.remove(activeClass);
    activeTableColElement = null;
  }
}
function deactivateTableCellElement() {
  if (isTableData(activeTableCellElement)) {
    deactivateTableData();
  } else if (isTableHead(activeTableCellElement)) {
    deactivateTableHead();
    deactivateTableCol();
  }
  activeTableCellElement = null;
}

function isClickOnActiveElement(tableCellElement: HTMLTableCellElement) {
  return tableCellElement === activeTableCellElement;
}
/**
 * Use this function to change table cell element to ensure previous active element is properly deactivated
 */
export function updateActiveTableCellElement(tableCellElement: HTMLTableCellElement, shouldGetFocus: boolean = true) {
  if (!tableCellElement) {
    return;
  }

  if (activeTableCellElement) {
    deactivateTableCellElement();
    deactivateSortPanel();
    // remove input form
    cellEditor.deactivateForm();
  }

  activateTableCellElement(tableCellElement, undefined, shouldGetFocus);
}
/**
 * Whether the table data is activated recently.
 */
function isTableDataLastActivatedRecently() {
  if (activeTableCellElement === null) {
    return false;
  }

  if (activeTableCellElement.lastActiveTimestamp === null) {
    return false;
  }

  return Date.now() - activeTableCellElement.lastActiveTimestamp <= recentTimeLimit;
}

function activeTableHeadOnRepeatedClick() {
  if (activeTableColElement) {
    // table column is active, deactivate column and focus only on table head
    deactivateTableCol();
  } else {
    // only activate table column at repeated click (after even number of clicks)
    activateTableCol();
  }
}
function activeElementOnRepeatedClick() {
  if (!activeTableCellElement) {
    return;
  }
  if (isTableData(activeTableCellElement)) {
    if (isTableDataLastActivatedRecently()) {
      cellEditor.activateForm(activeTableCellElement);
      activeTableCellElement.lastActiveTimestamp = null;
      recordCellDoubleClick(activeTableCellElement);
    } else {
      updateActiveTimestamp();
    }
  } else if (isTableHead(activeTableCellElement)) {
    activeTableHeadOnRepeatedClick();
  }
}

function tableCellElementOnClick(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (isClickOnActiveElement(tableCellElement)) {
    // handle repeated click differently
    activeElementOnRepeatedClick();
  } else {
    updateActiveTableCellElement(tableCellElement);
    recordCellClick(tableCellElement);
  }
  event.preventDefault();
}

/* click event */
tableElement.addEventListener("click", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnClick(target as HTMLTableCellElement, event);
  } else if (isColumnLabelSortButton(target)) {
    tableCellSortButtonOnClick(target as HTMLButtonElement);
    activateSortPanel(target);
  }
  event.stopPropagation();
}, true);


type CopyTarget = HTMLTableColElement | HTMLTableCellElement;
let copyTarget: CopyTarget = null;
function makeElementCopyTarget(element: HTMLTableCellElement | HTMLTableColElement) {
  copyTarget = element;
  element.classList.add(copiedClass);
}

function removeCurrentCopyTarget() {
  if (copyTarget) {
    copyTarget.classList.remove(copiedClass);
    copyTarget = null;
  }
}

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
function tableCellElementOnCopy(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  if (hasCopyModifier(event)) {
    removeCurrentCopyTarget();
    clearCopyBuffer();

    let elementToHighlight;
    if (activeTableColElement) {
      // copy entire column
      const columnIndex: number = activeTableCellElement.cellIndex;
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
    makeElementCopyTarget(elementToHighlight);
    event.consumed = true;
  }
  // ignore when only C is pressed
}

/* keyboard event */

// paste event
function tableCellElementOnPaste(tableCellElement: HTMLTableCellElement, text: string) {
  // invoke edit editor
  cellEditor.activateForm(tableCellElement);
  cellEditor.formInput = text;
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

function tableDataElementOnInput(tableDataElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  cellEditor.activateForm(tableDataElement);
  event.consumed = true;
}
function tableCellElementOnInput(event: ConsumableKeyboardEvent) {
  const tableCellElement: HTMLTableCellElement = event.target as HTMLTableCellElement;
  // ignore if input on table head
  if (isTableData(tableCellElement)) {
    tableDataElementOnInput(tableCellElement, event);
  }
}

function tableCellElementOnKeyDown(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  event.consumed = false;
  switch (event.key) {
    case "Down": // IE/Edge specific value
    case "ArrowDown":
      updateActiveTableCellElement(getDownTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case "Up": // IE/Edge specific value
    case "ArrowUp":
      updateActiveTableCellElement(getUpTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case "Left": // IE/Edge specific value
    case "ArrowLeft":
      updateActiveTableCellElement(getLeftTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case "Right": // IE/Edge specific value
    case "ArrowRight":
    case "Tab": // handle Tab as a pressing Right arrow
      updateActiveTableCellElement(getRightTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case "c": // handle potential CTRL+c or CMD+c
      tableCellElementOnCopy(tableCellElement, event);
      break;
    case "v":
      tableCellElementOnPasteKeyPressed(tableCellElement, event);
      break;
    case "Escape":
      deactivateSortPanel();
      // fallthrough
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
tableElement.addEventListener("keydown", function(event: KeyboardEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnKeyDown(target as HTMLTableCellElement, event);
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
  } else {
    cellEditor.onMouseMove(event);
  }
  event.stopPropagation();
}, {passive: true, capture: true});
tableElement.addEventListener("mouseup", function(event: MouseEvent) {
  cellEditor.isRepositioning = false;
  tableHeadOnMouseUp(event);
  event.stopPropagation();
}, {passive: true, capture: true});

// initially sort on University A-Z
tableCellSortButtonOnClick(tableElement.querySelectorAll(".sort-btn")[1] as HTMLButtonElement, false);
