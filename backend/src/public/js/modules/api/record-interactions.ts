/**
 * @module
 * This module contains functions to record interactions on sheet.
 */

import { getEnclosingTableRow } from '../dom/navigate';
import { isTableData } from '../dom/types';
import { getTableRowCellValues, getTableCellTextsInColumn, getTableCellElementsInRow, tableColumnSearches, isColumnSearchFilled, getColumnLabel, getColumnSearchInput } from '../dom/sheet';
import { postCellClickURL, postCellDoubleClickURL, postPasteURL, postCellCopyURL, postColumnCopyURL, postColumnSortURL, postColumnPartialSearchURL, postColumnCompleteSearchURL, postNewRowURL, postDelRowURL, postGoogleSearchURL, postDataBaitTweet, postDataBaitVisit, postSearchColVisit, postNewCommentURL, postCommentVoteDownURL, postCommentVoteUpURL } from './endpoints';

const tableCellInputFormCSRFInput: HTMLInputElement = document.querySelector('input[name=\'_csrf\']');

export function getIdUniqueID(tableCellElement: HTMLTableCellElement): number {
  return Number.parseInt(getEnclosingTableRow(tableCellElement).dataset.id);
}
export function setIdUniqueID(tableRowElement: HTMLTableRowElement, idUniqueID: number) {
  tableRowElement.dataset.id = idUniqueID.toString();
}
export function getIdSuggestion(tableCellElement: HTMLTableCellElement): number {
  return Number.parseInt(tableCellElement.id);
}
export function setIdSuggestion(tableCellElement: HTMLTableCellElement, idSuggestion: number) {
  return tableCellElement.id = idSuggestion.toString();
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
  return searchValues.join('||');
}

// Record Interaction
type ResponseHandler = (response: Response) => void;
/**
 * @param {string} url - The server endpoint at which the interaction will be recorded.
 * @param {Record<any, any>} data - The data object sent in the post request.
 * @param {ResponseHandler} [successHandler = () => undefined] - The handler when response reports success.
 * @param {ResponseHandler} [failureHandler = console.error(`${response.status}: ${response.statusText}`)] - The handler when response reports failure. Defaults to log the error.
 */
function recordInteraction(
  url: string,
  data: Record<any, any>,
  successHandler: ResponseHandler = () => undefined,
  failureHandler: ResponseHandler = response => console.error(`${response.status}: ${response.statusText}`)) {
  data['_csrf'] = tableCellInputFormCSRFInput.value;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(response => {
    if (response.ok) {
      successHandler(response);
    } else {
      failureHandler(response);
    }
  }).catch(error => console.error('Network error when posting interaction: ', error));
}

// Get Data from Backend
/**
 * @param {string} url - The server endpoint at which the interaction will be recorded.
 * @param {Record<any, any>} data - The data object sent in the post request.
 * @param {ResponseHandler} [successHandler = () => undefined] - The handler when response reports success.
 * @param {ResponseHandler} [failureHandler = console.error(`${response.status}: ${response.statusText}`)] - The handler when response reports failure. Defaults to log the error.
 */
function getData(
  url: string,
  successHandler: ResponseHandler = () => undefined,
  failureHandler: ResponseHandler = response => console.error(`${response.status}: ${response.statusText}`)) {
  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => {
    // console.log(response.json());
    if (response.ok) {
      console.log(response.json());
      successHandler(response);
    } else {
      failureHandler(response);
    }
  }).catch(error => console.error('Network error when posting interaction: ', error));
}

export function recordCellEdit(tableCellElement: HTMLTableCellElement, textContent: string) {
  // supply enough fields to update database entry for table cell, also updates the table cell with the new `idSuggestion` value
  recordInteraction('/suggestions/new', {
    'idUniqueID': getIdUniqueID(tableCellElement),
    'idSuggestion': getIdSuggestion(tableCellElement),
    'suggestion': textContent,
  }, (response) => response.json().then(idSuggestion => setIdSuggestion(tableCellElement, idSuggestion)));
}

export function recordCellClick(tableCellElement: HTMLTableCellElement) {
  if (isTableData(tableCellElement)) {
    // only record click on table data now
    const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
    const rowValues = getTableRowCellValues(tableRow);
    const idSuggestion = getIdSuggestion(tableCellElement);
    recordInteraction(postCellClickURL(), { idSuggestion, rowValues });
  }
}

export function recordRowInsertion(rowValues: Array<string>, idSuggestionTypes: Array<number>, successHandler?: ResponseHandler, failureHandler?: ResponseHandler) {
  recordInteraction(postNewRowURL(), {
    newRowValues: rowValues, newRowFields: idSuggestionTypes
  }, successHandler, failureHandler);
}

export function recordRowDelete(idUniqueID: string, comment: string, successHandler?: ResponseHandler, failureHandler?: ResponseHandler) {
  recordInteraction(postDelRowURL(), { idUniqueID, comment }, successHandler, failureHandler);
}

export function recordCellDoubleClick(tableCellElement: HTMLTableCellElement) {
  const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
  const rowValues = getTableRowCellValues(tableRow);
  const idSuggestion = getIdSuggestion(tableCellElement);
  recordInteraction(postCellDoubleClickURL(), { idSuggestion, rowValues });
}

export function recordCellCopy(tableCellElement: HTMLTableCellElement) {
  const idSuggestion = getIdSuggestion(tableCellElement);
  recordInteraction(postCellCopyURL(), { idSuggestion });
}

export function recordColumnCopy(columnLabel: HTMLTableCellElement) {
  const idSuggestionType = getIdSuggestionType(columnLabel);
  recordInteraction(postColumnCopyURL(), { idSuggestionType });
}

export function recordPaste(pasteVal: string, pasteCellVal: string, pasteCellIdSuggestion: string, copyCellVal: string, copyCellIdSuggestion: string) {
  recordInteraction(postPasteURL(), { pasteVal: pasteVal, pasteCellVal: pasteCellVal, pasteCellIdSuggestion: pasteCellIdSuggestion, copyCellVal: copyCellVal, copyCellIdSuggestion: copyCellIdSuggestion });
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
  const matchedValues = Array.from(new Set(getTableCellTextsInColumn(columnIndex, true, true))).join('|');
  /*
    const idSuggestionType: number|string
    const isMulti: number
    const isFromUrl: number // sw feature not implemented yet
    const value: string
    const matchedValues: string: a pipe delimited list of unique values from that column that matched the input
    const multiSearchValues: string idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
  */
  const endPointInteraction = isFullSearch ? postColumnCompleteSearchURL() : postColumnPartialSearchURL();
  recordInteraction(endPointInteraction, {
    idSuggestionType: getIdSuggestionType(columnLabel),
    isMulti: Number(isMultipleColumnSearchInputFilled()),
    isFromUrl: 0,
    value: columnSearchInput.value,
    matchedValues,
    multiSearchValues: getSearchValues(),
  });
}

export function recordColumnSort(columnIndex: number, sortingDirection: number) {
  const columnLabel: HTMLTableCellElement = getColumnLabel(columnIndex);
  recordInteraction(postColumnSortURL(), {
    idSuggestionType: getIdSuggestionType(columnLabel),
    isAsc: (1 - sortingDirection)
  });
}

export function recordGoogleSearch(idSuggestion: string, idRow: string, tableRow: HTMLTableRowElement) {
  const rowValues = getTableRowCellValues(tableRow);
  recordInteraction(postGoogleSearchURL(), {
    idSuggestion: idSuggestion,
    idRow: idRow,
    searchValues: rowValues
  });
}

export function recordDataBaitVisit(idDataBait: string, source: string) {
  recordInteraction(postDataBaitVisit(), {
    idDataBait: idDataBait,
    source: source
  });
}

export function recordDataBaitCreate(idSuggestion: string, idRow: string, tableRow: HTMLTableRowElement) {
  const rowValues = getTableRowCellValues(tableRow);
  recordInteraction(postDataBaitVisit(), {
    idSuggestion: idSuggestion,
    idRow: idRow,
    searchValues: rowValues
  });
}

export function recordDataBaitTweet(idDataBait: string) {
  recordInteraction(postDataBaitTweet(), {
    idDataBait: idDataBait
  });
}
export function recordSearchColVisit(idSuggestionType: string, value: string) {
  recordInteraction(postSearchColVisit(), {
    idSuggestionType: idSuggestionType,
    value: value
  });
}

export function postNewComment(idrow: string | number, comment: string) {
  recordInteraction(postNewCommentURL(), {
    idrow: idrow,
    comment: comment
  });
}

export function postCommentVoteUp(idComment: number, vote: string) {
  recordInteraction(postCommentVoteUpURL(), {
    idComment: idComment,
    vote: vote
  });
}

export function postCommentVoteDown(idComment: number, vote: string) {
  recordInteraction(postCommentVoteDownURL(), {
    idComment: idComment,
    vote: vote
  });
}
