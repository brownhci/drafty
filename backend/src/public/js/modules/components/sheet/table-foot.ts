import { activeClass } from "../../constants/css-classes";
import { numTableColumns, tableFootElement, tableFootRow } from "../../dom/sheet";
import { isInput } from "../../dom/types";
import { tableDataManager } from ".././../../sheet";


const summaryClass = "summary";
const insertClass = "insert";
const summaryCell = (tableFootRow.firstElementChild as HTMLTableCellElement);
function activateTableFoot() {
  tableFootElement.classList.add(activeClass);
}
export function deactivateTableFoot() {
  tableFootElement.classList.remove(activeClass);
  tableFootRow.classList.remove(summaryClass);
  tableFootRow.classList.remove(insertClass);
}

export function isTableFootActive(): boolean {
  return  tableFootElement.classList.contains(activeClass);
}
export function isInserting(): boolean {
  return tableFootRow.classList.contains(insertClass);
}
function activateForInsertion() {
  if (isReportingSummary()) {
    summaryCell.colSpan = 1;
    summaryCell.textContent = "";
    deactivateTableFoot();
  }

  activateTableFoot();
  tableFootRow.classList.add(insertClass);
  // transform to `numTableColumns` <td> each containing an input
  if (!isInput(summaryCell.firstElementChild as HTMLElement)) {
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    summaryCell.appendChild(inputElement);
  }
  const numCells = tableFootRow.cells.length;
  for (let cellIndex = numCells; cellIndex < numTableColumns; cellIndex++) {
    tableFootRow.appendChild(summaryCell.cloneNode(true));
  }
}
export function toggleInsertion() {
  if (isInserting()) {
    deactivateTableFoot();
  } else {
    activateForInsertion();
  }
}

/* report summary in table foot */
export function isReportingSummary(): boolean {
    return tableFootRow.classList.contains(summaryClass);
}
function updateRowCount() {
  summaryCell.textContent = `Count: ${tableDataManager.rowCount}`;
}
let firstTimeReportSummary: boolean = true;
function autoupdateSummary() {
  if (firstTimeReportSummary) {
    firstTimeReportSummary = false;
    tableDataManager.afterScrollUpdateTaskQueue.tasks.push({
      work: () => {
        // update count if necessary
        if (isTableFootActive() && isReportingSummary()) {
          updateRowCount();
        }
      },
      isRecurring: true
    });
  }
}
function activateForSummary() {
  if (isInserting()) {
    // clear children of first <td>
    while (summaryCell.firstElementChild) {
      summaryCell.lastElementChild.remove();
    }
    deactivateTableFoot();
  }

  activateTableFoot();
  autoupdateSummary();
  tableFootRow.classList.add(summaryClass);
  // transform to a single <td> that spans over all columns

  summaryCell.colSpan = numTableColumns;
  const numCells = tableFootRow.cells.length;
  for (let cellIndex = 1; cellIndex < numCells; cellIndex++) {
    tableFootRow.lastElementChild.remove();
  }

  updateRowCount();
}

export function toggleRowCount() {
  if (isReportingSummary()) {
    deactivateTableFoot();
  } else {
    activateForSummary();
  }
}
