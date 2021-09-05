import { getCellInTableRow, getRightTableCellElement } from "./navigate";
import { isInput } from "./types";
import { columnLabelClass, columnLabelTextClass, columnSearchClass, columnSortButtonClass } from "../constants/css-classes";
import { measureTextWidth } from "../utils/length";
import { recordDataBaitVisit } from "../api/record-interactions";

/* <table> */
export const tableElement: HTMLTableElement = document.getElementById("table") as HTMLTableElement;
/* the container inside which the table can be scrolled */
export const tableScrollContainer: HTMLElement = tableElement.parentElement;
/* <thead> */
export const tableHeadElement: HTMLTableSectionElement = tableElement.tHead;
/* unused */
export const tableHeadSearchElement: HTMLTableSectionElement = document.getElementById("column-search-row") as HTMLTableSectionElement;
/* top header row */
export const tableHeadTopRowElement: HTMLTableSectionElement = document.getElementById("column-label-row") as HTMLTableSectionElement;
/* <tbody> */
export const tableBodyElement: HTMLTableSectionElement = document.getElementById("view") as HTMLTableSectionElement;
/* <tfoot> */
export const tableFootElement: HTMLTableSectionElement = tableElement.tFoot;
/* <tr>s */
export const tableRowElements: HTMLCollection = tableElement.rows;
/* first table row: column labels */
export const columnLabelRowIndex: number = 0;
export const tableColumnLabels: HTMLTableRowElement = tableRowElements[columnLabelRowIndex] as HTMLTableRowElement;

export const numTableColumns: number = tableColumnLabels.children.length;

/* second table row: column searches */
export const columnSearchRowIndex = 1;
export const tableColumnSearches: HTMLTableRowElement = tableRowElements[columnSearchRowIndex] as HTMLTableRowElement;

/* <col>s */
export const tableColElements: HTMLCollection = tableElement.getElementsByTagName("col");

export function getTableRow(tableCellElement: HTMLTableCellElement): HTMLTableRowElement {
  return tableCellElement.parentElement as HTMLTableRowElement;
}
export function getRowIndex(tableCellElement: HTMLTableCellElement): number {
  return getTableRow(tableCellElement).rowIndex;
}
export function getRowIndexInSection(tableRowElement: HTMLTableRowElement): number {
  return tableRowElement.sectionRowIndex;
}

export function isFirstTableCell(tableCellElement: HTMLTableCellElement): boolean {
  return tableCellElement.cellIndex === 0;
}
export function isLastTableCell(tableCellElement: HTMLTableCellElement): boolean {
  return getRightTableCellElement(tableCellElement) === null;
}
export function isColumnLabel(element: HTMLElement): boolean {
  return element && element.classList.contains(columnLabelClass);
}
export function getColumnLabel(index: number): HTMLTableCellElement {
  return getCellInTableRow(tableColumnLabels, index);
}
export function* getTableCellElementsInRow(tableRowElement: HTMLTableRowElement) {
  yield* tableRowElement.cells;
}
export function* getColumnLabels() {
  for (const columnLabel of getTableCellElementsInRow(tableColumnLabels)) {
    yield columnLabel;
  }
}
export function isColumnLabelSortButton(element: HTMLElement): boolean {
  return element && element.classList.contains(columnSortButtonClass);
}
export function getColumnLabelSortButton(columnLabel: HTMLTableCellElement): HTMLButtonElement {
  return columnLabel.querySelector(`.${columnSortButtonClass}`);
}
export function getColumnLabelText(columnLabel: HTMLTableCellElement): string {
  return columnLabel.querySelector(`.${columnLabelTextClass}`).textContent;
}
export function* getColumnLabelTexts() {
  for (const columnLabel of getColumnLabels()) {
    yield getColumnLabelText(columnLabel as HTMLTableCellElement);
  }
}
export function getLongestColumnTextWidth(): number {
  let textWidth = Number.NEGATIVE_INFINITY;
  for (const columnLabelText of getColumnLabelTexts()) {
    textWidth = Math.max(textWidth, measureTextWidth(columnLabelText));
  }
  return textWidth;
}
export function isColumnSearch(element: HTMLElement): boolean {
  return element && element.classList.contains(columnSearchClass);
}
export function getColumnSearch(index: number): HTMLTableCellElement {
  return getCellInTableRow(tableColumnSearches, index);
}
export function isColumnSearchInput(element: HTMLElement): boolean {
  return isInput(element) && isColumnSearch(element.parentElement);
}
export function getColumnSearchInput(columnSearch: HTMLTableCellElement): HTMLInputElement {
  return columnSearch.querySelector("input");
}
export function isColumnSearchInputFocused(): boolean {
  return isColumnSearchInput(document.activeElement as HTMLElement);
}
export function isColumnSearchFilled(columnSearch: HTMLTableCellElement): boolean {
  if (!columnSearch) {
    return false;
  }
  return getColumnSearchInput(columnSearch).value !== "";
}
/**
 * Check whether new cell value for this column is restricted to column suggestions. In other words, whether user custom value is prohibited.
 *
 * @param {HTMLTableCellElement} columnLabel - The column label of the column to check.
 */
export function isColumnAutocompleteOnly(columnLabel: HTMLTableCellElement) {
  return columnLabel.dataset.autocompleteOnly === "true";
}
export function isTableCellEditable(tableCellElement: HTMLTableCellElement) {
  if (tableCellElement.contentEditable === "false") {
    return false;
  }
  const columnLabel = getColumnLabel(tableCellElement.cellIndex);
  if (columnLabel.contentEditable === "false") {
    tableCellElement.contentEditable = "false";
    return false;
  }

  tableCellElement.contentEditable = "true";
  return true;
}

export function getTableDataText(tableCellElement: HTMLTableCellElement) {
  return tableCellElement.textContent;
}
export function setTableDataText(tableCellElement: HTMLTableCellElement, text: string) {
  return tableCellElement.textContent = text;
}
export function getTableRowCellValues(tableRowElement: HTMLTableRowElement): Array<string> {
  const values = [];
  for (const cell of tableRowElement.cells) {
    values.push(getTableDataText(cell as HTMLTableCellElement));
  }
  return values;
}
/**
 * Gets the <col> element for the specified column index.
 */
export function getTableColElement(index: number): HTMLTableColElement | undefined {
  return tableColElements[index] as HTMLTableColElement;
}

/**
 * Gets the table cell elements for the specified column index.
 *
 * @param {number} index - Index of column.
 * @param {boolean} [skipColumnSearch = false] - whether skip column search in yielded elements.
 * @param {boolean} [skipColumnSearch = true] - whether skip column label in yielded elements.
 * @yields {HTMLTableCellElement} Table cells in the specified column.
 */
export function* getTableCellElementsInColumn(index: number, skipColumnLabel: boolean = false, skipColumnSearch = true) {
  for (let i = 0; i < tableRowElements.length; i++) {
    const tableRow = tableRowElements[i] as HTMLTableRowElement;

    if (skipColumnLabel && i === columnLabelRowIndex) {
      // skip over column label row
      continue;
    }
    if (skipColumnSearch && i === columnSearchRowIndex) {
      // skip over column search row
      continue;
    }

    const cell = getCellInTableRow(tableRow, index);
    if (!cell) {
      // skip over column without cell at specified index
      continue;
    }

    yield cell;
  }
}

export function getTableCellText(tableCellElement: HTMLTableCellElement) {
  if (isColumnLabel(tableCellElement)) {
    return getColumnLabelText(tableCellElement);
  } else if (isColumnSearch(tableCellElement)) {
    return getColumnSearchInput(tableCellElement).value;
  } else {
    return getTableDataText(tableCellElement);
  }
}
export function* getTableCellTextsInColumn(index: number, skipColumnLabel: boolean = false, skipColumnSearch = true) {
  for (const tableCellElement of getTableCellElementsInColumn(index, skipColumnLabel, skipColumnSearch)) {
    if (!tableCellElement) {
      continue;
    }
    yield getTableCellText(tableCellElement);
  }
}

export function checkUrlForSearchParams() {
  //console.log(document.getElementById('view').childNodes.length);
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const searchInputElement: HTMLInputElement = document.getElementById(`column-search-input${urlParams.get("searchCol")}`) as HTMLInputElement;

  // check if user arrived bc of a databait
  if (urlParams.get("databaitId")) {
    let databaitSource: string = "unkown";
    if (urlParams.get("databaitSource")) {
      databaitSource = urlParams.get("databaitSource");
    }
    const databaitId: string = urlParams.get("databaitId");
    recordDataBaitVisit(databaitId, databaitSource);
  }

  // populate search column
  if (urlParams.get("searchVal")) {
    searchInputElement.value = urlParams.get("searchVal");
  }

  const checkTableDataLoaded = setInterval(function () {
    clearInterval(checkTableDataLoaded);
    if (document.getElementById("view").childNodes.length > 1) {
      if (urlParams.has("searchCol") && urlParams.has("searchVal")) {
        const eventInput = new Event("input");
        searchInputElement.dispatchEvent(eventInput);
      }
    }
  }, 100); // check every 100ms
}
