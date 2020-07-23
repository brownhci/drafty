import { activeClass } from "../../constants/css-classes";
import { tableFootElement, tableFootRow } from "../../dom/sheet";
import { tableDataManager } from ".././../../sheet";


const summaryClass = "summary";
function activateTableFoot() {
  tableFootElement.classList.add(activeClass);
}
export function deactivateTableFoot() {
  tableFootElement.classList.remove(activeClass);
  tableFootRow.classList.remove(summaryClass);
}

export function isTableFootActive(): boolean {
  return  tableFootElement.classList.contains(activeClass);
}


/* report summary in table foot */
export function isReportingSummary(): boolean {
    return tableFootRow.classList.contains(summaryClass);
}
function updateRowCount() {
  reportSummary(`Count: ${tableDataManager.rowCount}`);
}
export function toggleRowCount() {
  if (isReportingSummary()) {
    deactivateTableFoot();
  } else {
    activateTableFoot();
    updateRowCount();
  }
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
export function reportSummary(summary: string) {
  autoupdateSummary();
  tableFootRow.classList.add(summaryClass);
  tableFootRow.firstElementChild.textContent = summary;
}
