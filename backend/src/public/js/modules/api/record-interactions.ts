/**
 * @module
 * This module contains functions to record interactions on sheet.
 */

import { getEnclosingTableRow } from "../dom/navigate";
import { isTableData } from "../dom/types";
import { getTableRowCellValues, getTableCellTextsInColumn, getTableCellElementsInRow, tableColumnSearches, isColumnSearchFilled, getColumnLabel, getColumnSearchInput } from "../dom/sheet";
import { postCellClickURL, postCellDoubleClickURL, postCellCopyURL, postColumnCopyURL, postColumnSortURL, postColumnPartialSearchURL, postColumnCompleteSearchURL, postNewRowURL } from "./endpoints";

const tableCellInputFormCSRFInput: HTMLInputElement = document.querySelector("input[name='_csrf']");

export function getIdUniqueID(tableCellElement: HTMLTableCellElement): number {
  return Number.parseInt(getEnclosingTableRow(tableCellElement).dataset.id);
}
export function getIdSuggestion(tableCellElement: HTMLTableCellElement): number {
  return Number.parseInt(tableCellElement.id);
}
export function getIdSuggestionType(columnLabel: HTMLTableCellElement) {
  const idSuggestionType = columnLabel.dataset.idSuggestionType;
  if (idSuggestionType) {
    return Number.parseInt(idSuggestionType);
  }
  return null;
}
export function getIdSearchType(): number {
  return 1;
}

/**
 * This corresponds to the `multiSearchValues` field in database which is represented as
 * idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
 * where two pipes `||` separates different column search and `|` separates information about a column search
 */
function getSearchValues(): string {
  const searchValues = [];
  for (const columnSearch of getTableCellElementsInRow(tableColumnSearches)) {
    if (isColumnSearchFilled(columnSearch)) {
      const idSuggestionType = getIdSuggestionType(getColumnLabel(columnSearch.cellIndex));
      const idSearchType = getIdSearchType();
      const value = getColumnSearchInput(columnSearch).value;
      const searchValue = `${idSuggestionType}|${idSearchType}|${value}`;
      searchValues.push(searchValue);
    }
  }
  return searchValues.join("||");
}

// Record Interaction
function recordInteraction(url: string, data: Record<string, any>, responseHandler: (response: Response) => void = () => undefined) {
  data["_csrf"] = tableCellInputFormCSRFInput.value;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(response => {
      if (!response.ok) {
        console.error(`${response.status}: ${response.statusText}`);
      }
      responseHandler(response);
    })
    .catch(error => console.error("Network error when posting interaction: ", error));
}

export function recordCellEdit(tableCellElement: HTMLTableCellElement, textContent: string) {
  // supply enough fields to update database entry for table cell

  recordInteraction("/suggestions/new", {
    "idUniqueID": getIdUniqueID(tableCellElement),
    "idSuggestion": getIdSuggestion(tableCellElement),
    "suggestion": textContent,
  });
}

export function recordCellClick(tableCellElement: HTMLTableCellElement) {
  if (isTableData(tableCellElement)) {
    // only record click on table data now
    const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
    const rowValues = getTableRowCellValues(tableRow);

    const idSuggestion = getIdSuggestion(tableCellElement);
    recordInteraction(postCellClickURL(), {idSuggestion, rowValues});
  }
}

export function recordRowInsertion(rowValues: Array<string>, successHandler: (response: Response) => void = () => undefined) {
  recordInteraction(postNewRowURL(), { rowValues }, successHandler);
}

export function recordCellDoubleClick(tableCellElement: HTMLTableCellElement) {
  const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
  const rowValues = getTableRowCellValues(tableRow);

  const idSuggestion = getIdSuggestion(tableCellElement);
  recordInteraction(postCellDoubleClickURL(), {idSuggestion, rowValues});
}

export function recordCellCopy(tableCellElement: HTMLTableCellElement) {
  const idSuggestion = getIdSuggestion(tableCellElement);
  recordInteraction(postCellCopyURL(), {idSuggestion});
}

export function recordColumnCopy(columnLabel: HTMLTableCellElement) {
  const idSuggestionType = getIdSuggestionType(columnLabel);
  recordInteraction(postColumnCopyURL(), {idSuggestionType});
}

function isMultipleColumnSearchInputFilled(limit: number = 2): boolean {
  let n = 0;
  for (const columnSearch of getTableCellElementsInRow(tableColumnSearches)) {
    if (isColumnSearchFilled(columnSearch)) {
      n++;
      if (n >= limit) {
        return true;
      }
    }
  }
  return false;
}
export function recordColumnSearch(columnSearch: HTMLTableCellElement, isFullSearch: boolean) {
  const columnIndex: number = columnSearch.cellIndex;
  const columnLabel: HTMLTableCellElement = getColumnLabel(columnIndex);
  const columnSearchInput: HTMLInputElement = getColumnSearchInput(columnSearch);
  const matchedValues = [...new Set(getTableCellTextsInColumn(columnIndex, true, true))].join("|");
  /*
    const idSuggestionType: number|string
    const isMulti: number
    const isFromUrl: number // sw feature not implemented yet
    const value: string
    const matchedValues: string: a pipe delimited list of unique values from that column that matched the input
    const multiSearchValues: string idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
  */
  const url = isFullSearch ? postColumnCompleteSearchURL() : postColumnPartialSearchURL();
  recordInteraction(url, {
    idSuggestionType: getIdSuggestionType(columnLabel),
    isMulti: Number(isMultipleColumnSearchInputFilled()),
    isFromUrl: 0,
    value: columnSearchInput.value,
    matchedValues,
    multiSearchValues: getSearchValues(),
  });
}

export function recordColumnSort(columnIndex: number , sortingDirection: number) {
  const columnLabel: HTMLTableCellElement = getColumnLabel(columnIndex);
  recordInteraction(postColumnSortURL(), {
    idSuggestionType: getIdSuggestionType(columnLabel),
    isAsc: (1 - sortingDirection)
  });
}
