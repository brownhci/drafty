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
  return  tableFootRow.classList.contains(activeClass);
}
export function reportSummary(summary: string) {
  tableFootRow.classList.add(summaryClass);
  tableFootRow.firstElementChild.textContent = summary;
}
export function isReportingSummary(): boolean {
    return tableFootRow.classList.contains(summaryClass);
}
export function toggleRowCount() {
  if (isReportingSummary()) {
    deactivateTableFoot();
  } else {
    activateTableFoot();
    reportSummary(`Count: ${tableDataManager.rowCount}`);
  }
}
