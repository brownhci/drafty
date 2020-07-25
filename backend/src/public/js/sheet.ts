import { recordCellClick, recordCellDoubleClick } from "./modules/api/record-interactions";
import { activeClass, activeAccompanyClass } from "./modules/constants/css-classes";
import "./modules/components/welcome-screen";
import { tableHeadOnMouseDown, tableHeadOnMouseMove, tableHeadOnMouseUp } from "./modules/components/sheet/resize-column";
import { activateSortPanel, deactivateSortPanel, tableCellSortButtonOnClick } from "./modules/components/sheet/column-sort-panel";
import { cellEditor } from "./modules/components/sheet/cell-editor";
import "./modules/components/sheet/column-search";
import { columnSuggestions } from "./modules/components/sheet/column-suggestions";
import { activateColumnLabelContextMenu, activateTableDataContextMenu, deactivateColumnLabelContextMenu, deactivateTableDataContextMenu } from "./modules/components/sheet/contextmenu";
import { tableCellElementOnCopyKeyPressed, tableCellElementOnPasteKeyPressed } from "./modules/components/sheet/copy-paste";
import { isInserting, isTableFootActive } from "./modules/components/sheet/table-foot";
import { TabularView } from "./modules/components/sheet/tabular-view";
import { getLeftTableCellElement, getRightTableCellElement, getUpTableCellElement, getDownTableCellElement } from "./modules/dom/navigate";
import { tableElement, tableBodyElement, getColumnLabel, getTableDataText, getTableFootCell, isColumnLabelSortButton, isColumnLabel, isColumnSearch, isTableCellEditable, isTableFootCell, getColumnSearch, getTableColElement } from "./modules/dom/sheet";
import { isInput, isTableData, isTableHead, isTableCell } from "./modules/dom/types";

export const tableDataManager = new TabularView(document.getElementById("table-data"), tableBodyElement);

/* which table column is active: a table column is activated when associated head is clicked */
export let activeTableColElement: HTMLTableColElement = null;

/* this interface is used to detect double click (two clicks within short interval specified by {@link recentTimeLimit} */
interface ActiveHTMLTableCellElement extends HTMLTableCellElement {
  lastActiveTimestamp?: number;
}
const recentTimeLimit: number = 1000;
export let activeTableCellElement: ActiveHTMLTableCellElement = null;
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
    if (isTableFootActive() && isInserting()) {
      const tableFootCell = getTableFootCell(index);
      tableFootCell.classList.add(activeAccompanyClass);
    }
  } else if (isColumnSearch(activeTableCellElement)) {
    const columnLabel = getColumnLabel(index);
    columnLabel.classList.add(activeAccompanyClass);
    if (isTableFootActive() && isInserting()) {
      const tableFootCell = getTableFootCell(index);
      tableFootCell.classList.add(activeAccompanyClass);
    }
  } else if (isTableFootCell(activeTableCellElement)) {
    if (!isInserting()) {
      return;
    }
    const columnSearch = getColumnSearch(index);
    columnSearch.classList.add(activeAccompanyClass);
    const columnLabel = getColumnLabel(index);
    columnLabel.classList.add(activeAccompanyClass);
  }
  activeTableCellElement.classList.add(activeClass);
  if (shouldGetFocus) {
    activeTableCellElement.focus({preventScroll: true});
  }
}
export function activateTableCol() {
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
  const tableFootCell = getTableFootCell(index);
  columnLabel.classList.remove(activeClass);
  columnSearch.classList.remove(activeClass);
  columnLabel.classList.remove(activeAccompanyClass);
  columnSearch.classList.remove(activeAccompanyClass);
  if (tableFootCell) {
    tableFootCell.classList.remove(activeClass);
    tableFootCell.classList.remove(activeAccompanyClass);
  }
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
    // hide context menu
    deactivateTableDataContextMenu();
    deactivateColumnLabelContextMenu();
    // hide input form
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
      cellEditor.formInput = getTableDataText(activeTableCellElement);
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

tableElement.addEventListener("contextmenu", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    if (isColumnLabel(target)) {
      updateActiveTableCellElement(target as HTMLTableCellElement);
      activateColumnLabelContextMenu(event);
      event.preventDefault();
    }
    if (isTableData(target)) {
      updateActiveTableCellElement(target as HTMLTableCellElement);
      activateTableDataContextMenu(event);
      event.preventDefault();
    }
  }
}, true);

interface ConsumableKeyboardEvent extends KeyboardEvent {
  consumed?: boolean;
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

function tableCellElementOnUpKeyPressed(tableCellElement: HTMLTableCellElement) {
  let upElement = getUpTableCellElement(tableCellElement);
  if (!upElement) {
    if (isTableFootCell(tableCellElement) && isTableFootActive() && isInserting()) {
      // jump to table footer cell
      upElement = getColumnSearch(tableCellElement.cellIndex);
    }
  }

  updateActiveTableCellElement(upElement);
}

function tableCellElementOnDownKeyPressed(tableCellElement: HTMLTableCellElement) {
  let downElement = getDownTableCellElement(tableCellElement);
  if (!downElement) {
    if (isColumnSearch(tableCellElement) && isTableFootActive() && isInserting()) {
      // jump to table footer cell
      downElement = getTableFootCell(tableCellElement.cellIndex);
    }
  }

  updateActiveTableCellElement(downElement);
}

function tableCellElementOnKeyDown(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  event.consumed = false;
  switch (event.key) {
    case "Down": // IE/Edge specific value
    case "ArrowDown":
      tableCellElementOnDownKeyPressed(tableCellElement);
      event.consumed = true;
      break;
    case "Up": // IE/Edge specific value
    case "ArrowUp":
      tableCellElementOnUpKeyPressed(tableCellElement);
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
      tableCellElementOnCopyKeyPressed(tableCellElement, event);
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
  }
  event.stopPropagation();
}, true);


tableElement.addEventListener("focus", function(event: FocusEvent) {
  const target = event.target as HTMLElement;
  if (isInput(target) && isTableHead(target.parentElement)) {
    columnSuggestions.activate(target.parentElement as HTMLTableCellElement);
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
