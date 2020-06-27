import { activeClass, activeAccompanyClass, copiedClass } from "./modules/constants/css-classes";
import "./modules/components/welcome-screen";
import { hasCopyModifier, clearCopyBuffer, copyCurrentSelectionToCopyBuffer, copyTextToCopyBuffer, copyCopyBuffer } from "./modules/utils/copy";
import { hasTextSelected} from "./modules/utils/selection";
import { getLeftTableCellElement, getRightTableCellElement, getUpTableCellElement, getDownTableCellElement } from "./modules/dom/navigate";
import { isTableData, isTableHead, isTableCell, isInput } from "./modules/dom/types";
import { recordCellClick, recordCellDoubleClick, recordCellCopy, recordColumnCopy, recordColumnSearch } from "./modules/api/record-interactions";
import { tableElement, tableBodyElement, tableColumnLabels, getColumnLabel, getTableDataText, tableScrollContainer, isColumnLabelSortButton, getTableRow, getTableCellText, getTableCellTextsInColumn, isColumnSearchInput, isTableCellEditable, getColumnSearchInput, isColumnLabel, isFirstTableCell, isLastTableCell, isColumnSearch, getColumnSearch, getTableColElement, isColumnSearchInputFocused } from "./modules/dom/sheet";
import { getMinimumColumnWidth, updateTableColumnSearchWidth, updateTableCellWidth } from "./modules/components/sheet/column-width";
import { TabularView } from "./modules/components/sheet/tabular-view";
import { FilterFunction } from "./modules/components/sheet/table-data-manager/ViewFunction";
import { activateSortPanel, deactivateSortPanel, tableCellSortButtonOnClick } from "./modules/components/sheet/column-sort-panel";
import { cellEditor } from "./modules/components/sheet/cell-editor";


// TODO last column resize
// TODO ARROW KEY not functioning when scrolling off screen
// TODO add new row
// TODO completions for Rank do not update when cleared

export const tableDataManager = new TabularView(document.getElementById("table-data"), tableBodyElement);

/* which table column is active: a table column is activated when associated head is clicked */
let activeTableColElement: null | HTMLTableColElement = null;


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
  } else {
    cellEditor.isRepositioning = false;
  }
  event.stopPropagation();
}, {passive: true, capture: true});
tableElement.addEventListener("mouseup", function(event: MouseEvent) {
  cellEditor.isRepositioning = false;
  tableHeadOnMouseUp(event);
  event.stopPropagation();
}, {passive: true, capture: true});


/* this interface is used to detect double click (two clicks within short interval specified by {@link recentTimeLimit} */
interface ActiveHTMLTableCellElement extends HTMLTableCellElement {
  lastActiveTimestamp?: number;
}
type CopyTarget = HTMLTableColElement | HTMLTableCellElement;

class TableStatusManager {
  static recentTimeLimit = 1000;

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

  activeElementOnRepeatedClick() {
    const activeTableCellElement = this.activeTableCellElement;
    if (!activeTableCellElement) {
      return;
    }
    if (isTableData(activeTableCellElement)) {
      if (this.isTableDataLastActivatedRecently()) {
				cellEditor.activateForm(activeTableCellElement);
        activeTableCellElement.lastActiveTimestamp = null;
        recordCellDoubleClick(activeTableCellElement);
      } else {
        this.updateActiveTimestamp();
      }
    } else if (isTableHead(activeTableCellElement)) {
      this.activeTableHeadOnRepeatedClick();
    }
  }

  activeTableHeadOnRepeatedClick() {
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
      cellEditor.deactivateForm();
    }

    this.activateTableCellElement(tableCellElement, undefined, shouldGetFocus);
  }

  /* click event */
  tableCellElementOnClick(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
    if (this.isClickOnActiveElement(tableCellElement)) {
      // handle repeated click differently
      this.activeElementOnRepeatedClick();
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

  tableDataElementOnInput(tableDataElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
		cellEditor.activateForm(tableDataElement);
    event.consumed = true;
  }

  restoreTableCellInputFormTargetElement() {
		if (!cellEditor.isActive) {
			return;
		}

		const targetCell = cellEditor.cellElement;
		const targetRow = getTableRow(targetCell);
		if (tableDataManager.isElementInRenderingView(targetRow)) {
			cellEditor.updateLocateCell();
		} else {
			// the target element has moved out of view
			cellEditor.deactivateForm();
		}
  }

  restoreStatus() {
    this.restoreActiveTableCellElement();
    this.restoreCopyTarget();
    this.restoreTableCellInputFormTargetElement();
  }
}

export const tableStatusManager: TableStatusManager = new TableStatusManager();
// initially sort on University A-Z
tableCellSortButtonOnClick(tableElement.querySelectorAll(".sort-btn")[1] as HTMLButtonElement, false);
