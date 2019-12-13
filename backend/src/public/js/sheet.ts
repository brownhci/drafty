const activeClass = "active";
let activeTableCellElement: null | HTMLTableCellElement = null;
/* activated when associated head is clicked */
let activeTableColElement: null | HTMLTableColElement = null;
const copiedClass = "copied";
let lastCopiedTableCellElement: null | HTMLTableCellElement | HTMLTableColElement = null;

const tableElement: HTMLTableElement = document.getElementById("sheet") as HTMLTableElement;
const tableScrollContainer: HTMLElement = tableElement.parentElement;
const tableRowElements: HTMLCollection = tableElement.rows;
const tableColElements: HTMLCollection = tableElement.getElementsByTagName("col");
const tableHeadElement: HTMLTableSectionElement = tableElement.tHead;
const tableColumnLabels: HTMLTableRowElement = tableRowElements[0] as HTMLTableRowElement;

// measure text width
const textWidthMeasureElement: HTMLElement = document.getElementById("text-width-measure");
function measureTextWidth(text: string): number {
  textWidthMeasureElement.textContent = text;
  return textWidthMeasureElement.offsetWidth;
}

// platform
function isMac() {
  const platform = window.navigator.platform;
  return platform.includes("Mac");
}
/* handle mac shortcut differently */
const onMac: boolean = isMac();

/* differentiate table element */
function isTableData(element: HTMLElement): boolean {
  return element.tagName === "TD";
}
function isTableHead(element: HTMLElement): boolean {
  return element.tagName === "TH";
}
function isTableCell(element: HTMLElement): boolean {
  const tagName = element.tagName;
  return tagName === "TD" || tagName === "TH";
}

function getTableColElement(index: number): HTMLTableColElement | undefined {
  return tableColElements[index] as HTMLTableColElement;
}
function* getTableColElements(index: number) {
  for (const tableRowElement of tableRowElements) {
    const tableRow = tableRowElement as HTMLTableRowElement;
    yield tableRow.cells[index];
  }
}

/* width conversion */
function vw2px(vw: number) {
  return document.documentElement.clientWidth * vw / 100;
}
function em2px(em: number, fontSize = 16, element: HTMLElement | null = null) {
  if (element === null) {
    return fontSize * em;
  } else {
    return em * parseFloat(getComputedStyle(element).fontSize);
  }
}

/* text extraction */
function getTableDataText(tableCellElement: HTMLTableCellElement) {
  return tableCellElement.textContent;
}

/* navigation */
function getColumnLabel(index: number): HTMLTableCellElement {
  return tableColumnLabels.cells[index];
}
function getTopTableRow(tableRowElement: HTMLTableRowElement): HTMLTableRowElement | null {
  return tableRowElement.previousElementSibling as HTMLTableRowElement;
}
function getDownTableRow(tableRowElement: HTMLTableRowElement): HTMLTableRowElement | null {
  return tableRowElement.nextElementSibling as HTMLTableRowElement;
}

function getCellInTableRow(tableRowElement: HTMLTableRowElement, cellIndex: number): HTMLTableCellElement | null {
  return tableRowElement.cells[cellIndex];
}

function getLeftTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  return tableCellElement.previousElementSibling as HTMLTableCellElement;
}
function getRightTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  return tableCellElement.nextElementSibling as HTMLTableCellElement;
}
function getUpTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  if (!isTableData(tableCellElement)) {
    // ignore up request on table head
    return null;
  }
  const cellIndex = tableCellElement.cellIndex;
  const topTableRow = getTopTableRow(tableCellElement.parentElement as HTMLTableRowElement);
  if (!topTableRow) {
    return null;
  }
  return getCellInTableRow(topTableRow, cellIndex);
}
function getDownTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  if (!isTableData(tableCellElement)) {
    // ignore up request on table head
    return null;
  }
  const cellIndex = tableCellElement.cellIndex;
  const downTableRow = getDownTableRow(tableCellElement.parentElement as HTMLTableRowElement);
  if (!downTableRow) {
    return null;
  }
  return getCellInTableRow(downTableRow, cellIndex);
}

/* input form */
const inputingClass = "inputing";
const tableCellInputFormElement: HTMLFormElement = document.getElementById("table-cell-input-form") as HTMLFormElement;
const tableCellInputFormInputElement: HTMLInputElement = document.getElementById("table-cell-input-entry") as HTMLInputElement;
// const tableCellInputFormInputStyle: CSSStyleDeclaration = getComputedStyle(tableCellInputFormInputElement);
let tableCellInputFormTargetElement: HTMLTableCellElement | null = null;
// location
const tableCellInputFormLocateCellElement: HTMLButtonElement = document.getElementById("locate-cell") as HTMLButtonElement;
const tableCellInputFormLocateCellRowElement: HTMLSpanElement = document.getElementById("locate-cell-associated-row") as HTMLSpanElement;
const tableCellInputFormLocateCellColElement: HTMLSpanElement = document.getElementById("locate-cell-associated-col") as HTMLSpanElement;
let tableCellInputFormLocationActive: boolean = false;
function activateTableCellInputFormLocation() {
  if (!tableCellInputFormLocationActive) {
    tableCellInputFormLocateCellElement.classList.add(activeClass);
    tableCellInputFormLocationActive = true;
    // reposition the tableCellInputFormElement
    const buttonHeight = tableCellInputFormLocateCellElement.offsetHeight;
    const formTop = parseFloat(tableCellInputFormElement.style.top);
    tableCellInputFormElement.style.top = `${formTop - buttonHeight}px`;
  }
}
function deactivateTableCellInputFormLocation() {
  tableCellInputFormLocateCellElement.classList.remove(activeClass);
  tableCellInputFormLocationActive = false;
}
function updateTableCellInputFormLocation(targetHTMLTableCellElement: HTMLTableCellElement) {
  // row index
  const tableRow: HTMLTableRowElement = targetHTMLTableCellElement.parentElement as HTMLTableRowElement;
  const rowIndex = tableRow.rowIndex;
  tableCellInputFormLocateCellRowElement.textContent = `${rowIndex}`;
  // column index
  const colIndex = targetHTMLTableCellElement.cellIndex + 1; // since we do not have row label
  tableCellInputFormLocateCellColElement.textContent = `${colIndex}`;
}
function restoreTableCellInputFormLocation() {
  if (tableCellInputFormLocationActive && tableCellInputFormTargetElement) {
    const {left: targetLeft, bottom: targetBottom} = tableCellInputFormTargetElement.getBoundingClientRect();
    const {left: inputFormLeft, bottom: inputFormBottom} = tableCellInputFormElement.getBoundingClientRect();
    tableScrollContainer.scrollTop += targetBottom - inputFormBottom;
    tableScrollContainer.scrollLeft += targetLeft - inputFormLeft;
  }
}
tableCellInputFormLocateCellElement.addEventListener("click", function(event: MouseEvent) {
  restoreTableCellInputFormLocation();
  event.stopPropagation();
}, true);

function deactivateTableCellInputForm() {
  if (tableCellInputFormTargetElement) {
    // hide the form
    tableCellInputFormElement.classList.remove(activeClass);

    // unhighlight the table head
    const cellIndex = tableCellInputFormTargetElement.cellIndex;
    const columnLabel: HTMLTableCellElement = getColumnLabel(cellIndex);
    if (columnLabel) {
      columnLabel.classList.remove(inputingClass);
    }

    // unhighlight the target cell
    tableCellInputFormTargetElement.classList.remove(inputingClass);
    tableCellInputFormTargetElement = null;
  }
}
function activateTableCellInputForm(targetHTMLTableCellElement: HTMLTableCellElement) {
  // show the form
  tableCellInputFormElement.classList.add(activeClass);

  // highlight the table head
  const cellIndex = targetHTMLTableCellElement.cellIndex;
  const columnLabel: HTMLTableCellElement = getColumnLabel(cellIndex);
  if (columnLabel) {
    columnLabel.classList.add(inputingClass);
  }

  // highlight the target cell
  tableCellInputFormTargetElement = targetHTMLTableCellElement;
  tableCellInputFormTargetElement.classList.add(inputingClass);
}
function updateTableCellInputFormInput(targetHTMLTableCellElement: HTMLTableCellElement) {
  const text = getTableDataText(targetHTMLTableCellElement);
  tableCellInputFormInputElement.value = text;
  const minWidth = targetHTMLTableCellElement.offsetWidth;
  const resizeWidth = measureTextWidth(text) + em2px(3);
  const width = Math.max(minWidth, resizeWidth);
  tableCellInputFormElement.style.width = `${width}px`;
}
function tableCellInputFormAssignTarget(targetHTMLTableCellElement: HTMLTableCellElement) {
  deactivateTableCellInputForm();
  deactivateTableCellInputFormLocation();
  if (targetHTMLTableCellElement) {
    activateTableCellInputForm(targetHTMLTableCellElement);
    updateTableCellInputFormInput(targetHTMLTableCellElement);

    updateTableCellInputFormLocation(targetHTMLTableCellElement);
    // set position
    const {left, top} = targetHTMLTableCellElement.getBoundingClientRect();
    tableCellInputFormElement.style.left = `${left}px`;
    tableCellInputFormElement.style.top = `${top}px`;
  }
}

/* deactivate */
function deactivateTableData() {
  activeTableCellElement.classList.remove(activeClass);
}
function deactivateTableHead() {
  activeTableCellElement.classList.remove(activeClass);
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

/* activate */
function activateTableData() {
  activeTableCellElement.classList.add(activeClass);
  activeTableCellElement.focus();
}
function activateTableHead() {
  activeTableCellElement.classList.add(activeClass);
  activeTableCellElement.focus();
}
function activateTableCol() {
  const index = activeTableCellElement.cellIndex;
  const tableColElement = getTableColElement(index);
  if (tableColElement) {
    activeTableColElement = tableColElement;
    activeTableColElement.classList.add(activeClass);
  }
}
function activateTableCellElement(tableCellElement: HTMLTableCellElement) {
  activeTableCellElement = tableCellElement;
  if (isTableData(tableCellElement)) {
    activateTableData();
  } else if (isTableHead(tableCellElement)) {
    activateTableHead();
  }
}
function clickOnActiveElement(tableCellElement: HTMLTableCellElement) {
  return tableCellElement === activeTableCellElement;
}

function updateActiveTableCellElement(tableCellElement: HTMLTableCellElement | null) {
  if (!tableCellElement) {
    return;
  }

  if (activeTableCellElement) {
    deactivateTableCellElement();
    // remove input form
    deactivateTableCellInputForm();
  }
  activateTableCellElement(tableCellElement);
}

// store resized width in local storage
function getStoredColumnWidthKey(index: number) {
  return `columnWidth${index}`;
}
function storePreferredColumnWidth(index: number, columnWidth: string) {
  window.localStorage.setItem(getStoredColumnWidthKey(index), columnWidth);
}
function getPreferredColumnWidth(index: number): string | null {
  return window.localStorage.getItem(getStoredColumnWidthKey(index));
}
function loadPreferredColumnWidths() {
  let index = 0;
  for (const tableColElement of tableColElements) {
    const preferredColumnWidth = getPreferredColumnWidth(index);
    if (preferredColumnWidth) {
      const tableColEl = tableColElement as HTMLTableColElement;
      tableColEl.style.width = preferredColumnWidth;
    }

    index += 1;
  }
}
loadPreferredColumnWidths();

// resize width
function updateTableColumnWidth(index: number, newWidth: string) {
  const tableColElement = getTableColElement(index);
  tableColElement.style.width = newWidth;
  storePreferredColumnWidth(index, newWidth);
}
function getMinimumAllowedColumnWidth(index: number) {
  return vw2px(5);
}
function updateTableCellElementWidth(tableCellElement: HTMLTableCellElement, resizeAmount: number) {
  if (resizeAmount === 0) {
    return;
  }

  const index = tableCellElement.cellIndex;
  // in pixels
  const currenColumnWidth = tableCellElement.clientWidth;
  let newColumnWidth = currenColumnWidth + resizeAmount;

  const minColumnWidth = getMinimumAllowedColumnWidth(index);
  if (newColumnWidth < minColumnWidth) {
    newColumnWidth = minColumnWidth;
  }
  updateTableColumnWidth(index, `${newColumnWidth}px`);
}
/* visual cue during resize */
function initializeResizeVisualCue() {
  const visualCue = document.createElement("div");
  visualCue.id = "resize-visual-cue";
  tableScrollContainer.appendChild(visualCue);
  return visualCue;
}
const resizeVisualCue: HTMLElement = initializeResizeVisualCue();
function resizeVisualCueMininumX(referencedTableCellElement: HTMLTableCellElement) {
  const index = referencedTableCellElement.cellIndex;
  const elementLeft = referencedTableCellElement.getBoundingClientRect().left;
  return elementLeft + getMinimumAllowedColumnWidth(index);
}
function repositionResizeVisualCue(newXPos: number) {
  resizeVisualCue.style.left = `${newXPos}px`;
}
function updateResizeVisualCuePosition(referencedTableCellElement: HTMLTableCellElement, newXPos: number, isFirstTableCell?: boolean) {
  const minX = isFirstTableCell === true ? 0 : resizeVisualCueMininumX(referencedTableCellElement);
  repositionResizeVisualCue(newXPos < minX ? minX : newXPos);
}
function activateResizeVisualCue() {
  resizeVisualCue.classList.add(activeClass);
}
function deactivateResizeVisualCue() {
  resizeVisualCue.classList.remove(activeClass);
}

// events
/* click event */
function activeTableHeadOnRepeatedClick(event: MouseEvent) {
  if (activeTableColElement) {
    // table column is active, deactivate column and focus only on table head
    deactivateTableCol();
  } else {
    // only activate table column at repeated click (after even number of clicks)
    activateTableCol();
  }
}
function activeElementOnRepeatedClick(event: MouseEvent) {
  if (!activeTableCellElement) {
    return;
  }
  if (isTableData(activeTableCellElement)) {
    // TODO
  } else if (isTableHead(activeTableCellElement)) {
    activeTableHeadOnRepeatedClick(event);
  }
}
function tableCellElementOnClick(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (clickOnActiveElement(tableCellElement)) {
    // handle repeated click differently
    activeElementOnRepeatedClick(event);
  } else {
    updateActiveTableCellElement(tableCellElement);
  }
  event.preventDefault();
  event.stopPropagation();
}
tableElement.addEventListener("click", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnClick(target as HTMLTableCellElement, event);
  }
}, true);

/* keyboard event */
/** copy **/
function initializeClipboardTextarea() {
  const textarea = document.createElement("textarea");
  textarea.id = "clipboard-textarea";
  textarea.readOnly = true;
  const bodyElement = document.body;
  bodyElement.appendChild(textarea);
  return textarea;
}
const clipboardTextarea: HTMLTextAreaElement = initializeClipboardTextarea();
function copyTextareaToClipboard() {
  clipboardTextarea.select();
  document.execCommand("copy");
}
function clearClipboardTextarea() {
  clipboardTextarea.value = "";
}
function unhighlightCopiedElement() {
  if (lastCopiedTableCellElement) {
    lastCopiedTableCellElement.classList.remove(copiedClass);
    lastCopiedTableCellElement = null;
  }
}
function highlightCopiedElement(element: HTMLTableCellElement | HTMLTableColElement) {
  lastCopiedTableCellElement = element;
  element.classList.add(copiedClass);
}
function hasCopyModifier(event: KeyboardEvent) {
  if (onMac) {
    return event.metaKey;
  } else {
    return event.ctrlKey;
  }
}
function copyElementTextToTextarea(tableCellElement: HTMLTableCellElement) {
  clipboardTextarea.value = tableCellElement.textContent;
}
function copyTableColumnToTextarea(index: number) {
  for (const tableCellElement of getTableColElements(index)) {
    clipboardTextarea.value += `${tableCellElement.textContent}\n`;
  }
  clipboardTextarea.value = clipboardTextarea.value.trimRight();
}
function tableCellElementOnCopy(tableCellElement: HTMLTableCellElement, event: KeyboardEvent) {
  if (hasCopyModifier(event)) {
    unhighlightCopiedElement();
    clearClipboardTextarea();
    let elementToHighlight;
    if (activeTableColElement) {
      // copy entire column
      copyTableColumnToTextarea(activeTableCellElement.cellIndex);
      elementToHighlight = activeTableColElement;
    } else {
      copyElementTextToTextarea(tableCellElement);
      elementToHighlight = tableCellElement;
    }
    copyTextareaToClipboard();
    highlightCopiedElement(elementToHighlight);
  }
  // ignore when only C is pressed
}

function tableCellElementOnKeyEvent(tableCellElement: HTMLTableCellElement, event: KeyboardEvent) {
  switch (event.key) {
    case "Down": // IE/Edge specific value
    case "ArrowDown":
      updateActiveTableCellElement(getDownTableCellElement(tableCellElement));
      break;
    case "Up": // IE/Edge specific value
    case "ArrowUp":
      updateActiveTableCellElement(getUpTableCellElement(tableCellElement));
      break;
    case "Left": // IE/Edge specific value
    case "ArrowLeft":
      updateActiveTableCellElement(getLeftTableCellElement(tableCellElement));
      break;
    case "Right": // IE/Edge specific value
    case "ArrowRight":
    case "Tab": // handle Tab as a pressing Right arrow
      updateActiveTableCellElement(getRightTableCellElement(tableCellElement));
      break;
    case "c": // handle potential CTRL+c or CMD+c
      tableCellElementOnCopy(tableCellElement, event);
      break;
  }
  event.preventDefault();
  event.stopPropagation();
}
tableElement.addEventListener("keydown", function(event: KeyboardEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnKeyEvent(target as HTMLTableCellElement, event);
  }
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
function removeNearBorderStatus(element: HTMLElement) {
  element.classList.remove(nearLeftBorderClass, nearRightBorderClass);
}
const resizeLeftBorderClass = "resize-left-border";
const resizeRightBorderClass = "resize-right-border";
function resizingElementLeftBorder(element: HTMLElement) {
  return element.classList.contains(resizeLeftBorderClass);
}
function resizingElementRightBorder(element: HTMLElement) {
  return element.classList.contains(resizeRightBorderClass);
}
function startResizingLeftBorderOnTableHead(tableCellElement: ResizableHTMLTableCellElement, event: MouseEvent) {
  tableCellElement.classList.add(resizeLeftBorderClass);
  tableCellElement.startMouseX = event.clientX;
}
function startResizingRightBorderOnTableHead(tableCellElement: ResizableHTMLTableCellElement, event: MouseEvent) {
  tableCellElement.classList.add(resizeRightBorderClass);
  tableCellElement.startMouseX = event.clientX;
}
function finishResizingLeftBorderOnTableHead(tableCellElement: ResizableHTMLTableCellElement, event: MouseEvent) {
  const previousTableCellElement = getLeftTableCellElement(tableCellElement);
  if (previousTableCellElement === null) {
    return;
  }

  const startMouseX = tableCellElement.startMouseX;
  if (isNaN(startMouseX)) {
    return;
  } else {
    tableCellElement.startMouseX = undefined;
  }
  const finishMouseX = event.clientX;
  const resizeAmount = finishMouseX - startMouseX;
  // move left border to the left is equivalent to move right border of previous element to the right
  // move left border to the right is equivalent to move right border of previous element to the left
  updateTableCellElementWidth(previousTableCellElement, resizeAmount);
  tableCellElement.classList.remove(resizeLeftBorderClass);
}
function finishResizingRightBorderOnTableHead(tableCellElement: ResizableHTMLTableCellElement, event: MouseEvent) {
  const startMouseX = tableCellElement.startMouseX;
  if (isNaN(startMouseX)) {
    return;
  } else {
    tableCellElement.startMouseX = undefined;
  }
  const finishMouseX = event.clientX;
  const resizeAmount = finishMouseX - startMouseX;
  updateTableCellElementWidth(tableCellElement, resizeAmount);
  tableCellElement.classList.remove(resizeRightBorderClass);
}
function updateTableCellElementUnderMouse(tableCellElement: HTMLTableCellElement) {
  if (tableCellElementUnderMouse) {
    removeNearBorderStatus(tableCellElementUnderMouse);
  }
  tableCellElementUnderMouse = tableCellElement;
}
const distanceConsideredNearToBorder = 10;
function handleMouseMoveNearElementBorder(tableCellElement: ResizableHTMLTableCellElement, event: MouseEvent) {
  const {left: elementLeft, right: elementRight} = tableCellElement.getBoundingClientRect();
  const mouseX = event.clientX;
  const distanceFromLeftBorder = mouseX - elementLeft;
  const distanceFromRightBorder = elementRight - mouseX;
  if (distanceFromLeftBorder > distanceConsideredNearToBorder && distanceFromRightBorder > distanceConsideredNearToBorder) {
    // reset indicator classes if far from both borders
    removeNearBorderStatus(tableCellElement);
  } else if (distanceFromLeftBorder <= distanceConsideredNearToBorder && distanceFromLeftBorder < distanceFromRightBorder) {
    // near left border
    tableCellElement.classList.add(nearLeftBorderClass);
  } else if (distanceFromRightBorder <= distanceConsideredNearToBorder && distanceFromRightBorder <= distanceFromLeftBorder) {
    // near right border
    tableCellElement.classList.add(nearRightBorderClass);
  }
}
function tableHeadOnMouseMove(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (tableCellElementUnderMouse) {
    if (resizingElementLeftBorder(tableCellElementUnderMouse)) {
      // reposition visual cue
      const referencedTableCellElement = getLeftTableCellElement(tableCellElementUnderMouse);
      const isFirstTableCell = referencedTableCellElement === null;
      updateResizeVisualCuePosition(referencedTableCellElement, event.clientX, isFirstTableCell);
      return;
    } else if (resizingElementRightBorder(tableCellElementUnderMouse)) {
      // reposition visual cue
      updateResizeVisualCuePosition(tableCellElementUnderMouse, event.clientX);

      // ignore mouse move during resizing
      return;
    }
  }

  if (tableCellElement !== tableCellElementUnderMouse) {
    // different element under mouse move
    updateTableCellElementUnderMouse(tableCellElement);
  }
  // handle mouse move to element border
  handleMouseMoveNearElementBorder(tableCellElement, event);
}
function tableHeadOnMouseDown(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (tableCellElementUnderMouse !== tableCellElement) {
    updateTableCellElementUnderMouse(tableCellElement);
  }

  // when near a border, start resizing
  if (nearElementLeftBorder(tableCellElementUnderMouse)) {
    startResizingLeftBorderOnTableHead(tableCellElement, event);
    repositionResizeVisualCue(event.clientX);
    activateResizeVisualCue();
  } else if (nearElementRightBorder(tableCellElementUnderMouse)) {
    startResizingRightBorderOnTableHead(tableCellElement, event);
    repositionResizeVisualCue(event.clientX);
    activateResizeVisualCue();
  }
}
function tableHeadOnMouseUp(event: MouseEvent) {
  if (tableCellElementUnderMouse !== null) {
    if (resizingElementLeftBorder(tableCellElementUnderMouse)) {
      finishResizingLeftBorderOnTableHead(tableCellElementUnderMouse, event);
    } else if (resizingElementRightBorder(tableCellElementUnderMouse)) {
      finishResizingRightBorderOnTableHead(tableCellElementUnderMouse, event);
    }
  }
  deactivateResizeVisualCue();
  updateTableCellElementUnderMouse(null);
}
// mouse event handlers
tableElement.addEventListener("mousedown", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableHead(target)) {
    tableHeadOnMouseDown(target as HTMLTableCellElement, event);
  }
});
tableElement.addEventListener("mousemove", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableHead(target)) {
    tableHeadOnMouseMove(target as HTMLTableCellElement, event);
  } else {
    if (tableCellElementUnderMouse) {
      // some table cell is previous hovered or resized
      if (resizingElementLeftBorder(tableCellElementUnderMouse)) {
        // TODO allow moving of resize visual cue
      } else if (resizingElementRightBorder(tableCellElementUnderMouse)) {
        // TODO allow moving of resize visual cue
      }

      // remove near border status because mouse has leaved the cell region
      removeNearBorderStatus(tableCellElementUnderMouse);
    }
  }
});
tableElement.addEventListener("mouseup", tableHeadOnMouseUp);

/* scroll event */
function tableCellInputFormLocationOnScroll(event: Event) {
  activateTableCellInputFormLocation();
}
tableScrollContainer.addEventListener("scroll", function(event: Event) {
  tableCellInputFormLocationOnScroll(event);
}, true);