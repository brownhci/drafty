let currentActiveTableEntry: null | HTMLElement = null;
const classForActiveTableEntry = "active";

function updateActiveTableEntry(newTableEntry: HTMLElement) {
  if (newTableEntry) {
    if (currentActiveTableEntry) {
      currentActiveTableEntry.classList.remove(classForActiveTableEntry);
    }
    newTableEntry.classList.add(classForActiveTableEntry);
    newTableEntry.focus();
    currentActiveTableEntry = newTableEntry;
  }
}

// event handlers
function tableEntryOnClick(tableEntry: HTMLElement) {
  updateActiveTableEntry(tableEntry);
  event.preventDefault();
  event.stopPropagation();
}

function getUpTableEntry(tableEntry: HTMLTableCellElement) {
  const tableRow = tableEntry.parentElement as HTMLTableRowElement;
  const currentTableEntryIndex = tableEntry.cellIndex;
  const topTableRow = tableRow.previousElementSibling as HTMLTableRowElement;
  if (topTableRow) {
    return topTableRow.cells[currentTableEntryIndex];
  } else {
    return null;
  }
}
function getDownTableEntry(tableEntry: HTMLTableCellElement) {
  const tableRow = tableEntry.parentElement as HTMLTableRowElement;
  const currentTableEntryIndex = tableEntry.cellIndex;
  const downTableRow = tableRow.nextElementSibling as HTMLTableRowElement;
  if (downTableRow) {
    return downTableRow.cells[currentTableEntryIndex];
  } else {
    return null;
  }
}
function getLeftTableEntry(tableEntry: HTMLTableCellElement) {
  return tableEntry.previousElementSibling as HTMLTableCellElement;
}
function getRightTableEntry(tableEntry: HTMLTableCellElement) {
  return tableEntry.nextElementSibling as HTMLTableCellElement;
}

function tableEntryOnKeyEvent(tableEntry: HTMLTableCellElement, event: KeyboardEvent) {
  switch (event.key) {
    case "Down": // IE/Edge specific value
    case "ArrowDown":
      updateActiveTableEntry(getDownTableEntry(tableEntry));
      break;
    case "Up": // IE/Edge specific value
    case "ArrowUp":
      updateActiveTableEntry(getUpTableEntry(tableEntry));
      break;
    case "Left": // IE/Edge specific value
    case "ArrowLeft":
      updateActiveTableEntry(getLeftTableEntry(tableEntry));
      break;
    case "Right": // IE/Edge specific value
    case "ArrowRight":
    case "Tab": // handle Tab as a pressing Right arrow
      updateActiveTableEntry(getRightTableEntry(tableEntry));
      break;
  }
  event.preventDefault();
  event.stopPropagation();
}

function isDataEntry(element: HTMLElement) {
  const tagName = element.tagName;
  return tagName === "TD";
}

// register listeners on topmost table element
const tableElement = document.getElementById("sheet");
tableElement.addEventListener("click", function(event: Event) {
  const target = event.target as HTMLElement;
  if (isDataEntry(target)) {
    tableEntryOnClick(target);
  }
}, true);
tableElement.addEventListener("keydown", function(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (isDataEntry(target)) {
    tableEntryOnKeyEvent(target as HTMLTableCellElement, event);
  }
}, true);