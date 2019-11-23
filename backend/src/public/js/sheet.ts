let activeTableCellElement: null | HTMLTableCellElement = null;
const activeClass = "active";

const tableElement: HTMLTableElement = document.getElementById("sheet") as HTMLTableElement;

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

/* deactivate */
function deactivateTableData() {
  activeTableCellElement.classList.remove(activeClass);
}
function deactivateTableHead() {
  activeTableCellElement.classList.remove(activeClass);
}
function deactivateTableCellElement() {
  if (isTableData(activeTableCellElement)) {
    deactivateTableData();
  } else if (isTableHead(activeTableCellElement)) {
    deactivateTableHead();
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
function activateTableCellElement(tableCellElement: HTMLTableCellElement) {
  activeTableCellElement = tableCellElement;
  if (isTableData(tableCellElement)) {
    activateTableData();
  } else if (isTableHead(tableCellElement)) {
    activateTableHead();
  }
}

function updateActiveTableCellElement(tableCellElement: HTMLTableCellElement | null) {
  if (tableCellElement) {
    if (activeTableCellElement) {
      deactivateTableCellElement();
    }
    activateTableCellElement(tableCellElement);
  }
}

// navigation
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

// events
/* click event */
function tableCellElementOnClick(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  updateActiveTableCellElement(tableCellElement);
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