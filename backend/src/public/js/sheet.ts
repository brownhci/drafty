// TODO ARROW KEY not functioning when scrolling off screen
// TODO paste event handling
// TODO add new row
// TODO record number out of sync after sorting

const activeClass = "active";
const activeAccompanyClass = "active-accompany";
/* this interface is used to detect double click (two clicks within short interval specified by {@link recentTimeLimit} */
interface ActiveHTMLTableCellElement extends HTMLTableCellElement {
  lastActiveTimestamp?: number;
}
const recentTimeLimit = 1000;

/* which table cell (either a table head or a table data) element is currently active */
let activeTableCellElement: null | ActiveHTMLTableCellElement = null;
/**
 * renew the timestamp on the active table cell element.
 */
function updateActiveTimestamp() {
  activeTableCellElement.lastActiveTimestamp = Date.now();
}

/* which table column is active: a table column is activated when associated head is clicked */
let activeTableColElement: null | HTMLTableColElement = null;

// copying
const copiedClass = "copied";
/* which table cell element (either a table head or a table data) was copied */
let copyTarget: null | HTMLTableCellElement | HTMLTableColElement = null;

// DOM Elements
const tableElement: HTMLTableElement = document.getElementById("table") as HTMLTableElement;
const tableScrollContainer: HTMLElement = tableElement.parentElement;

/* <tr>s */
const tableRowElements: HTMLCollection = tableElement.rows;
/* first table row: column labels */
const columnLabelsRowIndex: number = 0;
const tableColumnLabels: HTMLTableRowElement = tableRowElements[columnLabelsRowIndex] as HTMLTableRowElement;

const numTableColumns: number = tableColumnLabels.children.length;

/* first table row: column labels */
const columnSearchRowIndex = 1;
const tableColumnSearches: HTMLTableRowElement = tableRowElements[columnSearchRowIndex] as HTMLTableRowElement;

const tableRowHeight = tableColumnLabels.clientHeight;

/* <col>s */
const tableColElements: HTMLCollection = tableElement.getElementsByTagName("col");

// measure text width
/* the element used to measure text width */
const textWidthMeasureElement: HTMLElement = document.getElementById("text-width-measure");
/**
 * Changing the text content of textWidthMeasureElement and measure element width.
 *
 * @param {string} text - the text whose width will be measured.
 * @returns {number} The text width.
 */
function measureTextWidth(text: string): number {
  textWidthMeasureElement.textContent = text;
  return textWidthMeasureElement.offsetWidth;
}

// platform
/**
 * Tells whether the browser runs on a Mac.
 *
 * @returns {boolean} Whether the browser runs on a Mac.
 */
function isMac() {
  const platform = window.navigator.platform;
  return platform.includes("Mac");
}
const onMac: boolean = isMac();

// Get HTML Element type
function isTableData(element: HTMLElement): boolean {
  return element && element.tagName === "TD";
}
function isTableHead(element: HTMLElement): boolean {
  return element && element.tagName === "TH";
}
function isTableCell(element: HTMLElement): boolean {
  if (!element) {
    return false;
  }
  const tagName = element.tagName;
  return tagName === "TD" || tagName === "TH";
}
function isTableCellSortButton(element: HTMLElement): boolean {
  return element && element.classList.contains("sort-btn");
}
function isInput(element: HTMLElement): boolean {
  return element && element.tagName === "INPUT";
}
function isTableBody(element: HTMLElement): boolean {
  return element && element.tagName === "TBODY";
}
function isTemplate(element: HTMLElement): boolean {
  return element && element.tagName === "TEMPLATE";
}
function isColumnLabel(element: HTMLElement): boolean {
  return element && element.classList.contains("column-label");
}
function isColumnSearch(element: HTMLElement): boolean {
  return  element && element.classList.contains("column-search");
}
function isColumnSearchInput(element: HTMLElement): boolean {
  return element && isColumnSearch(element.parentElement);
}
function isColumnSearchInputFocus(): boolean {
  return isColumnSearchInput(document.activeElement as HTMLElement);
}
function isTableCellTextSelected(tableCellElement: HTMLTableCellElement): boolean {
   const selection = window.getSelection();
   if (!selection) {
     return false;
   }
   const range = selection.getRangeAt(0);
   if (!range) {
     return false;
   }
  const textNode = range.commonAncestorContainer;
  if (!textNode) {
    return false;
  }

  return textNode.parentElement === tableCellElement;
}

function isTableCellEditable(tableCellElement: HTMLTableCellElement) {
  if (tableCellElement.contentEditable === "false") {
    return false;
  }
  const columnLabel = getColumnLabel(tableCellElement.cellIndex);
  const columnLabelText = getColumnLabelText(columnLabel);
  if (!isTableData(tableCellElement) && columnLabelText === "Last Updated By" || columnLabelText === "Last Updated") {
    tableCellElement.contentEditable = "false";
    return false;
  }

  tableCellElement.contentEditable = "true";
  return true;
}

// getters
function getTableRow(tableCellElement: HTMLTableCellElement): HTMLTableRowElement {
  return tableCellElement.parentElement as HTMLTableRowElement;
}
function getRowIndex(tableCellElement: HTMLTableCellElement): number {
  return getTableRow(tableCellElement).rowIndex;
}
function getRowIndexInSection(tableRowElement: HTMLTableRowElement): number {
  return tableRowElement.sectionRowIndex;
}
function getDataElementIndex(tableCellElement: HTMLTableCellElement): number {
  const numDataElementsInPreviousDataSections = tableDataManager.numElementNotRenderedAbove;
  const sectionIndex = getRowIndexInSection(getTableRow(tableCellElement));
  return sectionIndex + numDataElementsInPreviousDataSections;
}
function getDataIndexFromLocateCellElement() {
  const displayedIndex: string = tableCellInputFormLocateCellRowElement.textContent;
  if (!displayedIndex) {
    return null;
  }
  return Number.parseInt(displayedIndex) - 1;
}
function getColumnIndex(tableCellElement: HTMLTableCellElement): number {
  // since we do not have row label
  return tableCellElement.cellIndex + 1;
}
function getCellInTableRow(tableRowElement: HTMLTableRowElement, cellIndex: number): HTMLTableCellElement | null {
  return tableRowElement.cells[cellIndex];
}
function getColumnLabel(index: number): HTMLTableCellElement {
  return getCellInTableRow(tableColumnLabels, index);
}
function getColumnLabelText(columnLabel: HTMLTableCellElement): string {
  return columnLabel.textContent;
}
function getColumnSearch(index: number): HTMLTableCellElement {
  return getCellInTableRow(tableColumnSearches, index);
}
function getColumnSearchInput(columnSearch: HTMLTableCellElement): HTMLInputElement {
  return columnSearch.querySelector("input");
}
function getTopTableRow(tableRowElement: HTMLTableRowElement): HTMLTableRowElement | undefined {
  return tableRowElement.previousElementSibling as HTMLTableRowElement;
}
function getDownTableRow(tableRowElement: HTMLTableRowElement): HTMLTableRowElement | undefined {
  return tableRowElement.nextElementSibling as HTMLTableRowElement;
}
function getTableDataText(tableCellElement: HTMLTableCellElement) {
  return tableCellElement.textContent;
}
function setTableDataText(tableCellElement: HTMLTableCellElement, text: string) {
  return tableCellElement.textContent = text;
}
function getTableRowCellValues(tableRowElement: HTMLTableRowElement): Array<string> {
  return Array.from(tableRowElement.cells).map(getTableDataText);
}

function getLeftTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  return tableCellElement.previousElementSibling as HTMLTableCellElement;
}
function getRightTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  return tableCellElement.nextElementSibling as HTMLTableCellElement;
}
function getUpTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  const cellIndex = tableCellElement.cellIndex;
  const topTableRow = getTopTableRow(getTableRow(tableCellElement));
  if (!topTableRow) {
    return null;
  }
  return getCellInTableRow(topTableRow, cellIndex);
}
function getDownTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  const cellIndex = tableCellElement.cellIndex;
  const downTableRow = getDownTableRow(getTableRow(tableCellElement));
  if (!downTableRow) {
    return null;
  }
  return getCellInTableRow(downTableRow, cellIndex);
}
function getAutocompleteSuggestionsContainer(): HTMLElement {
  return tableCellInputFormElement.querySelector(`.${optionContainerClass}`);
}

/**
 * Gets the <col> element for the specified column index.
 */
function getTableColElement(index: number): HTMLTableColElement | undefined {
  return tableColElements[index] as HTMLTableColElement;
}
/**
 * Gets the table cell elements for the specified column index.
 *
 * @param {number} index - Index of column.
 * @param {boolean} [skipColumnSearch = false] - whether skip column search in yielded elements.
 * @yields {HTMLTableCellElement} Table cells in the specified column.
 */
function* getTableCellElementsInColumn(index: number, skipColumnSearch = false) {
  for (let i = 0; i < tableRowElements.length; i++) {
    const tableRow = tableRowElements[i] as HTMLTableRowElement;
    if (skipColumnSearch && i === columnSearchRowIndex) {
      // skip over column search row
      continue;
    }
    yield getCellInTableRow(tableRow, index);
  }
}

function getIdUniqueID(tableCellElement: HTMLTableCellElement): number {
  return Number.parseInt(getTableRow(tableCellElement).dataset.id);
}
function getIdSuggestion(tableCellElement: HTMLTableCellElement): number {
  return Number.parseInt(tableCellElement.id);
}
function getIdSuggestionType(columnLabel: HTMLTableCellElement) {
  const idSuggestionType = columnLabel.id;
  if (idSuggestionType) {
    return Number.parseInt(idSuggestionType);
  }
  return null;
}

// Record Interaction
function recordInteraction(url: string, data: Record<string, any>) {
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
    })
    .catch(error => console.error("Network error when posting interaction: ", error));
}

function recordEdit(tableCellElement: HTMLTableCellElement) {
  // supply enough fields to update database entry for table cell

  recordInteraction("/suggestions/new", {
    "idUniqueID": getIdUniqueID(tableCellElement),
    "idSuggestion": getIdSuggestion(tableCellElement),
    "suggestion": tableCellElement.textContent,
  });
}

function recordClickOnCell(tableCellElement: HTMLTableCellElement) {
  if (isTableData(tableCellElement)) {
    // only record click on table data now
    const tableRow: HTMLTableRowElement = getTableRow(tableCellElement);
    const rowValues = getTableRowCellValues(tableRow);

    const idSuggestion = getIdSuggestion(tableCellElement);
    recordInteraction("/click", {idSuggestion, rowValues});
  }
}

function recordDoubleClickOnCell(tableCellElement: HTMLTableCellElement) {
  const tableRow: HTMLTableRowElement = getTableRow(tableCellElement);
  const rowValues = getTableRowCellValues(tableRow);

  const idSuggestion = getIdSuggestion(tableCellElement);
  recordInteraction("/click-double", {idSuggestion, rowValues});
}

function recordCopyCell(tableCellElement: HTMLTableCellElement) {
  const idSuggestion = getIdSuggestion(tableCellElement);
  recordInteraction("/copy-cell", {idSuggestion});
}

function recordCopyColumn(columnLabel: HTMLTableCellElement) {
  const idSuggestionType = getIdSuggestionType(columnLabel);
  recordInteraction("/copy-column", {idSuggestionType});
}

function recordSearchPartial() {
  const isPartial: number = 1;
  /* sw - will need
    const idSuggestionType: number|string
    const isMulti: number
    const isFromUrl: number // sw feature not implemented yet
    const value: string
    const matchedValues: string
    const multiSearchValues: string
  */
  recordInteraction("/search-partial", {});
}

function recordSearchFull() {
  /* sw - will need
    const idSuggestionType: number|string
    const isMulti: number
    const isFromUrl: number // sw feature not implemented yet
    const value: string
    const matchedValues: string
    const multiSearchValues: string
  */
  recordInteraction("/search-full", {});
}


// width conversion
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

// input editor
const inputtingClass = "inputting";
/* input editor element */
const tableCellInputFormElement: HTMLFormElement = document.getElementById("table-cell-input-form") as HTMLFormElement;
const tableCellInputFormCSRFInput: HTMLInputElement = tableCellInputFormElement.querySelector("input[name='_csrf']");
function isTableCellInputFormActive() {
  return tableCellInputFormElement.classList.contains(activeClass);
}
/* the input element in the input editor */
const tableCellInputFormInputElement: HTMLInputElement = document.getElementById("table-cell-input-entry") as HTMLInputElement;
const tableCellInputFormInputSaveButtonElement: HTMLButtonElement = document.getElementById("table-cell-input-save") as HTMLButtonElement;
/* the target element the input editor is associated with */
let tableCellInputFormTargetElement: HTMLTableCellElement | null = null;

let tableCellInputFormAutocompleteSuggestionsSelectInfo: SelectInfo | null = null;
let tableCellInputFormEditSuggestionsSelectInfo: SelectInfo | null = null;

// input editor location
/* the location element */
const tableCellInputFormLocateCellElement: HTMLButtonElement = document.getElementById("locate-cell") as HTMLButtonElement;
/* the row index element in the location element */
const tableCellInputFormLocateCellRowElement: HTMLSpanElement = document.getElementById("locate-cell-associated-row") as HTMLSpanElement;
/* the column index element in the location element */
const tableCellInputFormLocateCellColElement: HTMLSpanElement = document.getElementById("locate-cell-associated-col") as HTMLSpanElement;
const tableCellInputFormLocateCellIcon: HTMLElement = document.getElementById("locate-cell-icon");
/* whether the location element is shown in the input editor */
let tableCellInputFormLocationActive: boolean = false;

const tableCellInputFormInputContainer: HTMLElement = tableCellInputFormLocateCellElement.parentElement;

function activateTableCellInputFormLocation() {
  if (isTableCellInputFormActive() && !tableCellInputFormLocationActive) {
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
  delete tableCellInputFormLocateCellIcon.dataset.id;
}
function updateTableCellInputFormLocation(targetHTMLTableCellElement: HTMLTableCellElement) {
  // row index
  /* since recordIndex is 0-based */
  const recordIndex = getDataElementIndex(targetHTMLTableCellElement);
  tableCellInputFormLocateCellRowElement.textContent = `${recordIndex + 1}`;
  // column index
  const colIndex = getColumnIndex(targetHTMLTableCellElement);
  const columnLabelText = getColumnLabelText(getColumnLabel(colIndex - 1));
  tableCellInputFormLocateCellColElement.textContent = columnLabelText;
  // row data id
  tableCellInputFormLocateCellIcon.dataset.id = getTableRow(tableCellInputFormTargetElement).dataset.id;
}
function restoreTableCellInputFormLocation() {
  if (tableCellInputFormLocationActive && tableCellInputFormTargetElement) {
    const dataid: string = tableCellInputFormLocateCellIcon.dataset.id;
    if (tableDataManager.putElementInRenderingViewByDataId(dataid)) {
      const {left: targetLeft, top: targetTop} = tableCellInputFormTargetElement.getBoundingClientRect();
      const {left: inputFormLeft, top: inputFormTop} = tableCellInputFormElement.getBoundingClientRect();
      const buttonHeight = tableCellInputFormLocateCellElement.offsetHeight;
      tableScrollContainer.scrollTop += targetTop - inputFormTop - buttonHeight;
      tableScrollContainer.scrollLeft += targetLeft - inputFormLeft;
    }
  }
}
tableCellInputFormLocateCellElement.addEventListener("click", function(event: MouseEvent) {
  restoreTableCellInputFormLocation();
  event.stopPropagation();
});

function deactivateTableCellInputForm() {
  if (tableCellInputFormTargetElement) {
    // hide the form
    tableCellInputFormElement.classList.remove(activeClass);

    // unhighlight the table head
    const cellIndex = tableCellInputFormTargetElement.cellIndex;
    const columnLabel: HTMLTableCellElement = getColumnLabel(cellIndex);
    if (columnLabel) {
      columnLabel.classList.remove(inputtingClass);
    }

    // unhighlight the target cell
    tableCellInputFormTargetElement.classList.remove(inputtingClass);
    tableCellInputFormTargetElement = null;
  }
}
function activateTableCellInputForm(targetHTMLTableCellElement: HTMLTableCellElement, getFocus: boolean = true) {
  // show the form
  tableCellInputFormElement.classList.add(activeClass);

  // focus the input
  if (getFocus) {
    tableCellInputFormInputElement.focus({preventScroll: true});
  }

  // highlight the table head
  const cellIndex = targetHTMLTableCellElement.cellIndex;
  const columnLabel: HTMLTableCellElement = getColumnLabel(cellIndex);
  if (columnLabel) {
    columnLabel.classList.add(inputtingClass);
  }

  // highlight the target cell
  tableCellInputFormTargetElement = targetHTMLTableCellElement;
  tableCellInputFormTargetElement.classList.add(inputtingClass);
}
/**
 * Updates the text inside the input element inside the input editor and resizes the input eidtor properly.
 *
 * @param {HTMLTableCellElement} targetHTMLTableCellElement - Target HTMLTableCellElement to associate the input editor with.
 * @param {string} input - The text to initialize the input element with.
 */
function updateTableCellInputFormInput(targetHTMLTableCellElement: HTMLTableCellElement, input?: string) {
  const text = input === undefined ? getTableDataText(targetHTMLTableCellElement): input;

  tableCellInputFormInputElement.value = text;

  // resize
  const minWidth = targetHTMLTableCellElement.offsetWidth;
  const resizeWidth = measureTextWidth(text) + em2px(3);
  const width = Math.max(minWidth, resizeWidth);
  tableCellInputFormElement.style.width = `${width}px`;
}
function updateTableCellInputFormWidthToFitText(textToFit: string) {
  const textWidth = measureTextWidth(textToFit);
  const slack = 100;
  const newWidth = textWidth + slack;

  const formWidth = tableCellInputFormElement.offsetWidth;
  if (newWidth > formWidth) {
    tableCellInputFormElement.style.width = `${newWidth}px`;
  }
}

// input form suggestions
interface Suggestion {
  suggestion: string;
  confidence: number;
  prevSugg: number;
}
const previousEditsKeyName: string = "previousEdit";
const autocompleteSuggestionsKeyName: string = "autocompleteSuggestions";

/**
 * Stores current time in local storage with specified key.
 */
function storeTimestampInLocalStorage(key: string) {
  window.localStorage.setItem(key, Date.now().toString());
}
function restoreTimestampFromLocalStorage(key: string): number | null {
  const storedTimestamp: string | null = window.localStorage.getItem(key);
  if (storedTimestamp === null) {
    return null;
  }
  return Number.parseInt(storedTimestamp);
}
function storeAutocompleteSuggestionsInLocalStorage(columnLabelText: string, suggestions: Array<Suggestion>) {
  window.localStorage.setItem(columnLabelText, JSON.stringify(suggestions));
}
function restoreAutocompleteSuggestionsFromLocalStorage(columnLabelText: string): Array<Suggestion> {
  const suggestions: string | null = window.localStorage.getItem(columnLabelText);
  if (suggestions === null) {
    return [];
  }
  return JSON.parse(suggestions);
}
function getSuggestionTimestampKey(columnLabelText: string): string {
  return `timestamp-for-${columnLabelText}`;
}
const suggestionsInLocalStorageExpirationLimit = 300000;
function shouldSuggestionsInLocalStorageExpire(storedTimestamp: number) {
  return (Date.now() - storedTimestamp) > suggestionsInLocalStorageExpirationLimit;
}
/**
 * Fetch suggestions from database for a particular table cell.
 *
 * @async
 * @param {HTMLTableCellElement} columnLabel - The column label of the table cell we are fetching suggestions for.
 * @returns {Promise<Array<Suggestion>>} A promise which resolves to an array of Suggestion objects.
 */
async function fetchSuggestions(targetHTMLTableCellElement: HTMLTableCellElement): Promise<Array<Suggestion>> {
  try {
    const response = await fetch(`/suggestions/foredit?idSuggestion=${getIdSuggestion(targetHTMLTableCellElement)}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Network error when fetching suggestions", error);
  }
}

/**
 * The suggestions returned from server including
 *   + previous edits (prevSugg === 1)
 *   + autocomplete suggestions (prevSugg === 0)
 * which are identified by the prevSugg value
 *
 * @param {Array<Suggestion>} suggestions - An array of suggestions returned from the server
 * @returns {Record<string, Array<Suggestion>>} An object containing where previous edits and autocomplete suggestions are separated
 */
function parseSuggestions(suggestions: Array<Suggestion>): Record<string, Array<Suggestion>> {
  const parsedSuggestions: Record<string, Array<Suggestion>> = {
    [previousEditsKeyName]: [],
    [autocompleteSuggestionsKeyName]: []
  };

  for (const suggestion of suggestions) {
    (suggestion.prevSugg === 1 ? parsedSuggestions[previousEditsKeyName] : parsedSuggestions[autocompleteSuggestionsKeyName]).push(suggestion);
  }
  return parsedSuggestions;
}

function createAutocompleteSuggestionsContainer(autocompleteSuggestions: Array<Suggestion>, targetHTMLTableCellElement: HTMLTableCellElement, columnLabelText: string) {
  if (!autocompleteSuggestions || autocompleteSuggestions.length === 0) {
    return;
  }

  const userConfig = {
    nameKey: "suggestion",
    optionContainerClasses: ["autocomplete-suggestions"],
    targetInputElement: tableCellInputFormInputElement,
    mountMethod: (element: HTMLElement) => tableCellInputFormInputContainer.appendChild(element),
    optionContainerTitle: "Completions",
  };
  tableCellInputFormAutocompleteSuggestionsSelectInfo = createSelect(columnLabelText, autocompleteSuggestions, userConfig);
  // resize form editor
  updateTableCellInputFormWidthToFitText(tableCellInputFormAutocompleteSuggestionsSelectInfo.longestText);
}
function createEditSuggestionsContainer(editSuggestions: Array<Suggestion>, targetHTMLTableCellElement: HTMLTableCellElement) {
  if (!editSuggestions || editSuggestions.length === 0) {
    return;
  }
  const userConfig = {
    nameKey: "suggestion",
    optionContainerClasses: ["previous-edits"],
    targetInputElement: tableCellInputFormInputElement,
    mountMethod: (element: HTMLElement) => tableCellInputFormInputContainer.appendChild(element),
    optionContainerTitle: "Previous Edits",
  };

  const identifier = `${getIdSuggestion(targetHTMLTableCellElement)}`;
  tableCellInputFormEditSuggestionsSelectInfo = createSelect(identifier, editSuggestions, userConfig);
  // resize form editor
  updateTableCellInputFormWidthToFitText(tableCellInputFormEditSuggestionsSelectInfo.longestText);
  tableCellInputFormEditSuggestionsSelectInfo.optionContainer.classList.add("previous-edits");
}

/**
 * If last fetched suggestions are still valid, gets suggestions from local storage.
 * Otherwise, fetch suggestions from database and store the fetched suggestions in local storage.
 *
 * @async
 * @param {HTMLTableCellElement} columnLabel - The column label of the table cell we are fetching suggestions for.
 * @returns {Promise<Array<Suggestion>>} A promise which resolves to an array of Suggestion objects.

 */
function attachSuggestions(targetHTMLTableCellElement: HTMLTableCellElement) {
  // recover timestamp for stored autocomplete suggestions (sugggestions for a specific column)
  const columnLabel = getColumnLabel(targetHTMLTableCellElement.cellIndex);
  const columnLabelText = getColumnLabelText(columnLabel);
  const timestampKey: string = getSuggestionTimestampKey(columnLabelText);
  const storedTimestamp: number | null = restoreTimestampFromLocalStorage(timestampKey);

  if (storedTimestamp === null || shouldSuggestionsInLocalStorageExpire(storedTimestamp)) {
    // fetch new suggestions
    fetchSuggestions(targetHTMLTableCellElement).then(suggestions => {
      const {[previousEditsKeyName]: previousEditSuggestions, [autocompleteSuggestionsKeyName]: autocompleteSuggestions} = parseSuggestions(suggestions);

      // store column suggestions
      storeTimestampInLocalStorage(timestampKey);
      storeAutocompleteSuggestionsInLocalStorage(columnLabelText, autocompleteSuggestions);

      createAutocompleteSuggestionsContainer(autocompleteSuggestions, targetHTMLTableCellElement, columnLabelText);
      createEditSuggestionsContainer(previousEditSuggestions, targetHTMLTableCellElement);
    });
  } else {
    // reuse suggestions in local storage
    const autocompleteSuggestions = restoreAutocompleteSuggestionsFromLocalStorage(columnLabelText);
    createAutocompleteSuggestionsContainer(autocompleteSuggestions, targetHTMLTableCellElement, columnLabelText);

    fetchSuggestions(targetHTMLTableCellElement).then(suggestions => {
      const {[previousEditsKeyName]: previousEditSuggestions, [autocompleteSuggestionsKeyName]: autocompleteSuggestions} = parseSuggestions(suggestions);

      // store column suggestions
      storeTimestampInLocalStorage(timestampKey);
      storeAutocompleteSuggestionsInLocalStorage(columnLabelText, autocompleteSuggestions);

      createEditSuggestionsContainer(previousEditSuggestions, targetHTMLTableCellElement);
    });
  }
}

/**
 * Use this function to change the editor associated table cell.
 */
function tableCellInputFormAssignTarget(targetHTMLTableCellElement: HTMLTableCellElement, input?: string, getFocus: boolean = true) {
  deactivateTableCellInputForm();
  deactivateTableCellInputFormLocation();
  removeSelect(tableCellInputFormAutocompleteSuggestionsSelectInfo);
  removeSelect(tableCellInputFormEditSuggestionsSelectInfo);

  if (targetHTMLTableCellElement) {
    if (!isTableCellEditable(targetHTMLTableCellElement)) {
      return;
    }

    activateTableCellInputForm(targetHTMLTableCellElement, getFocus);
    updateTableCellInputFormInput(targetHTMLTableCellElement, input);
    attachSuggestions(targetHTMLTableCellElement);

    updateTableCellInputFormLocation(targetHTMLTableCellElement);
    // set position
    const {left, top} = targetHTMLTableCellElement.getBoundingClientRect();
    tableCellInputFormElement.style.left = `${left}px`;
    tableCellInputFormElement.style.top = `${top}px`;
  }
}
function saveTableCellInputForm() {
  const text = tableCellInputFormInputElement.value;
  if (tableCellInputFormTargetElement) {
    // call backend api to send user submission
    tableCellInputFormTargetElement.textContent = text;
    recordEdit(tableCellInputFormTargetElement);
  }
}

/* deactivate */
function deactivateTableData() {
  activeTableCellElement.classList.remove(activeClass);
  activeTableCellElement.lastActiveTimestamp = null;
}
function deactivateTableHead() {
  const index = activeTableCellElement.cellIndex;
  const columnLabel = getColumnLabel(index);
  const columnSearch = getColumnSearch(index);
  columnLabel.classList.remove(activeClass);
  columnSearch.classList.remove(activeClass);
  columnLabel.classList.remove(activeAccompanyClass);
  columnSearch.classList.remove(activeAccompanyClass);
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
function activateTableData(shouldUpdateTimestamp=true, shouldGetFocus=true) {
  activeTableCellElement.classList.add(activeClass);
  if (shouldUpdateTimestamp) {
    updateActiveTimestamp();
  }
  if (shouldGetFocus) {
    activeTableCellElement.focus({preventScroll: true});
  }
}
function activateTableHead(shouldGetFocus=true) {
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
function activateTableCol() {
  const index = activeTableCellElement.cellIndex;
  const tableColElement = getTableColElement(index);
  if (tableColElement) {
    activeTableColElement = tableColElement;
    activeTableColElement.classList.add(activeClass);
  }
}
function activateTableCellElement(tableCellElement: HTMLTableCellElement, shouldUpdateTimestamp=true, shouldGetFocus=true) {
  activeTableCellElement = tableCellElement;
  if (isTableData(tableCellElement)) {
    activateTableData(shouldUpdateTimestamp, shouldGetFocus);
    // record whether this table cell is editable
    isTableCellEditable(tableCellElement);
  } else if (isTableHead(tableCellElement)) {
    activateTableHead(shouldGetFocus);
  }
}
/**
 * Use this function to change table cell element to ensure previous active element is properly deactivated
 */
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

/**
 * Whether the table data is activated recently.
 */
function isTableDataLastActivatedRecently() {
  if (activeTableCellElement === null) {
    return false;
  }

  if (activeTableCellElement.lastActiveTimestamp === null) {
    return false;
  }

  return Date.now() - activeTableCellElement.lastActiveTimestamp <= recentTimeLimit;
}

function clickOnActiveElement(tableCellElement: HTMLTableCellElement) {
  return tableCellElement === activeTableCellElement;
}

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
    if (isTableDataLastActivatedRecently()) {
      tableCellInputFormAssignTarget(activeTableCellElement);
      activeTableCellElement.lastActiveTimestamp = null;
      recordDoubleClickOnCell(activeTableCellElement);
    } else {
      updateActiveTimestamp();
    }
  } else if (isTableHead(activeTableCellElement)) {
    activeTableHeadOnRepeatedClick(event);
  }
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
function updateTableColumnWidthToFitText(tableColumnSearchElement: HTMLTableCellElement, tableColumnSearchInputElement: HTMLInputElement) {
  const textLength = measureTextWidth(tableColumnSearchInputElement.value);
  const padding = 24;
  const slack = 44;
  const estimatedTextWidth = textLength + slack + padding;

  const currentTextWidthCanFit = tableColumnSearchInputElement.offsetWidth;
  if (estimatedTextWidth > currentTextWidthCanFit) {
    const index = tableColumnSearchElement.cellIndex;
    const newColumnWidth = estimatedTextWidth + padding;
    updateTableColumnWidth(index, `${newColumnWidth}px`);
  }
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

// input editor exit
function quitTableCellInputForm(saveContent = false) {
  if (saveContent) {
    saveTableCellInputForm();
    // move to next cell to allow continuous edit
    if (activeTableCellElement) {
      const nextCell = getRightTableCellElement(activeTableCellElement);
      if (nextCell) {
        updateActiveTableCellElement(nextCell);
      }
    }
  }

  tableCellInputFormAssignTarget(null);
  if (activeTableCellElement) {
    activeTableCellElement.focus({preventScroll: true});
  }
}
// events
/* click event */
function tableCellElementOnClick(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (clickOnActiveElement(tableCellElement)) {
    // handle repeated click differently
    activeElementOnRepeatedClick(event);
  } else {
    updateActiveTableCellElement(tableCellElement);
    recordClickOnCell(tableCellElement);
  }
  event.preventDefault();
}
let lastSortButtonClicked: HTMLButtonElement;

type TextSortingFunction = (s1: string, s2: string) => number;
enum SortingDirection {
  ASCENDING,
  DESCENDING,
}
function addColumnSorter(columnIndex: number, sortingDirection: SortingDirection, order: number = columnIndex) {
  let sorter: TextSortingFunction;
  if (sortingDirection === SortingDirection.ASCENDING) {
    sorter = (text1, text2) => text1.localeCompare(text2);
  } else {
    sorter = (text1, text2) => text2.localeCompare(text1);
  }
  tableDataManager.addSorter(columnIndex, sorter, order);
}

function tableCellSortButtonOnClick(buttonElement: HTMLButtonElement) {
  const clickClass = "clicked";
  const descendingClass = "desc";

  if (lastSortButtonClicked && lastSortButtonClicked !== buttonElement) {
    lastSortButtonClicked.classList.remove(clickClass, descendingClass);
  }
  lastSortButtonClicked = buttonElement;

  const columnIndex = (buttonElement.parentElement as HTMLTableDataCellElement).cellIndex;
  // '' => 'clicked' => 'clicked desc' => 'clicked'
  // since we are sorting on the current displayed data elements, we need to collect
  // data elements from rendered table data sections
  if (buttonElement.classList.contains(clickClass)) {
    if (buttonElement.classList.contains(descendingClass)) {
      // ascending sort
      buttonElement.classList.remove(descendingClass);
      addColumnSorter(columnIndex, SortingDirection.ASCENDING);
    } else {
      // descending sort
      buttonElement.classList.add(descendingClass);
      addColumnSorter(columnIndex, SortingDirection.DESCENDING);
    }
  } else {
    // ascending sort
    buttonElement.classList.add(clickClass);
      addColumnSorter(columnIndex, SortingDirection.ASCENDING);
  }

}
tableElement.addEventListener("click", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnClick(target as HTMLTableCellElement, event);
  } else if (isTableCellSortButton(target)) {
    tableCellSortButtonOnClick(target as HTMLButtonElement);
  }
  event.stopPropagation();
}, true);


tableCellInputFormInputSaveButtonElement.addEventListener("click", function(event) {
   quitTableCellInputForm(true);
   event.preventDefault();
   event.stopPropagation();
});

/* keyboard event */
interface ConsumableKeyboardEvent extends KeyboardEvent {
  consumed?: boolean;
}
/** copy **/
function initializeClipboardTextarea() {
  const textarea = document.createElement("textarea");
  textarea.id = "clipboard-textarea";
  textarea.readOnly = true;
  textarea.tabIndex = -1;
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
function removeCurrentCopyTarget() {
  if (copyTarget) {
    copyTarget.classList.remove(copiedClass);
    copyTarget = null;
  }
}
function makeElementCopyTarget(element: HTMLTableCellElement | HTMLTableColElement) {
  copyTarget = element;
  element.classList.add(copiedClass);
}
function hasCopyModifier(event: KeyboardEvent) {
  if (onMac) {
    return event.metaKey;
  } else {
    return event.ctrlKey;
  }
}
function copyTextToTextarea(text: string) {
  clipboardTextarea.value = text;
}
function copyElementTextToTextarea(tableCellElement: HTMLTableCellElement) {
  copyTextToTextarea(tableCellElement.textContent);
}
function copyTableColumnToTextarea(index: number) {
  for (const tableCellElement of getTableCellElementsInColumn(index, true)) {
    clipboardTextarea.value += `${tableCellElement.textContent}\n`;
  }
  clipboardTextarea.value = clipboardTextarea.value.trimRight();
}
function tableCellElementOnCopy(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  if (hasCopyModifier(event)) {
    removeCurrentCopyTarget();
    clearClipboardTextarea();

    let elementToHighlight;
    if (activeTableColElement) {
      // copy entire column
      const columnIndex: number = activeTableCellElement.cellIndex;
      copyTableColumnToTextarea(columnIndex);
      elementToHighlight = activeTableColElement;
      recordCopyColumn(getColumnLabel(columnIndex));
    } else if (!(isColumnSearch(tableCellElement))) {
      if (isTableCellTextSelected) {
        // copy selected part
        copyTextToTextarea(window.getSelection().toString());
      } else {
        // copy single table cell
        copyElementTextToTextarea(tableCellElement);
      }
      elementToHighlight = tableCellElement;
      recordCopyCell(tableCellElement);
    }

    copyTextareaToClipboard();
    makeElementCopyTarget(elementToHighlight);
    event.consumed = true;
  }
  // ignore when only C is pressed
}
// function tableCellElementOnPaste(event: ClipboardEvent) {
//   console.log("here2");
//   const pasteContent = (event.clipboardData || window.clipboardData).getData("text");
//   console.log(pasteContent);
//   event.preventDefault();
// }
// [> paste event <]
// tableElement.addEventListener("paste", function (event: ClipboardEvent) {
//   const target: HTMLElement = event.target as HTMLElement;
//   if (isTableData(target) && isTableCellEditable(target as HTMLTableCellElement)) {
//     tableCellElementOnPaste(event);
//   }
//   event.stopPropagation();
// }, true);


function tableDataElementOnInput(tableDataElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  const input = event.key;
  if (input.length === 1) {
    tableCellInputFormAssignTarget(tableDataElement, input);
  } else {
    tableCellInputFormAssignTarget(tableDataElement);
  }
  event.consumed = true;
}

type FilterFunction = (s: string) => boolean;
function constructTableRowFilter(query: string): FilterFunction {
  const queryRegex = new RegExp(query, "i");
  return (cellText: string) => queryRegex.test(cellText);
}
function updateTableColumnFilter(columnIndex: number, query: string) {
  if (query == "") {
    tableDataManager.deleteFilter(columnIndex);
  } else {
    const filter: FilterFunction = constructTableRowFilter(query);
    tableDataManager.addFilter(columnIndex, filter);
  }
}
let columnSearchFilteringTimeoutId: number | null = null;
function tableColumnSearchElementOnInput(tableColumnSearchInputElement: HTMLInputElement, tableColumnSearchElement: HTMLTableCellElement) {
  if (columnSearchFilteringTimeoutId) {
    window.clearTimeout(columnSearchFilteringTimeoutId);
  }
  columnSearchFilteringTimeoutId = window.setTimeout(() => updateTableColumnFilter(tableColumnSearchElement.cellIndex, tableColumnSearchInputElement.value), 400);
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

  updateTableColumnWidthToFitText(tableColumnSearchElement, columnSearchInput);
  event.consumed = true;
}
function tableCellElementOnInput(event: ConsumableKeyboardEvent) {
  const tableCellElement: HTMLTableCellElement = event.target as HTMLTableCellElement;
  // ignore if input on table head
  if (isTableData(tableCellElement)) {
    tableDataElementOnInput(tableCellElement, event);
  }
}
function tableCellElementOnKeyDown(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  event.consumed = false;
  switch (event.key) {
    case "Down": // IE/Edge specific value
    case "ArrowDown":
      updateActiveTableCellElement(getDownTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case "Up": // IE/Edge specific value
    case "ArrowUp":
      updateActiveTableCellElement(getUpTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case "Left": // IE/Edge specific value
    case "ArrowLeft":
      updateActiveTableCellElement(getLeftTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case "Right": // IE/Edge specific value
    case "ArrowRight":
    case "Tab": // handle Tab as a pressing Right arrow
      updateActiveTableCellElement(getRightTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case "c": // handle potential CTRL+c or CMD+c
      tableCellElementOnCopy(tableCellElement, event);
      break;
    case "v":
      if (hasCopyModifier(event)) {
        // handle potential CTRL+v or CMD+v
        event.consumed = true;
      }
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
  if (!event.consumed) {
    tableCellElementOnInput(event);
  }
}
tableElement.addEventListener("keydown", function(event: KeyboardEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnKeyDown(target as HTMLTableCellElement, event);
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

function tableCellInputFormOnKeyDown(event: KeyboardEvent) {
  switch (event.key) {
    case "Esc": // IE/Edge specific value
    case "Escape":
      quitTableCellInputForm(false);
      break;
    case "Enter":
      quitTableCellInputForm(true);
      break;

  }
  event.stopPropagation();
}

tableCellInputFormElement.addEventListener("keydown", function(event: KeyboardEvent) {
  if (isTableCellInputFormActive()) {
    tableCellInputFormOnKeyDown(event);
  }
});

tableElement.addEventListener("input", function(event: Event) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isInput(target)) {
    // inputting on column search
    const columnSearch = target.closest("th.column-search");
    if (columnSearch) {
      const tableColumnSearchElement: HTMLTableCellElement = columnSearch as HTMLTableCellElement;
      tableColumnSearchElementOnInput(target as HTMLInputElement, tableColumnSearchElement);
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
  if (isColumnLabel(tableCellElement)) {
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
  event.stopPropagation();
}, {passive: true, capture: true});
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
  event.stopPropagation();
}, {passive: true, capture: true});
tableElement.addEventListener("mouseup", function(event: MouseEvent) {
  tableHeadOnMouseUp(event);
}, {passive: true, capture: true});


// scroll
/* scroll event */
let scrollTimeoutId: number | null = null;
function tableCellInputFormLocationOnScroll() {
  activateTableCellInputFormLocation();
}
function whenScrollFinished() {
  tableCellInputFormLocationOnScroll();
  // detect out of sync and rerendering
  if (tableDataManager.refreshRenderingViewIfNeeded()) {
    console.log("successfully restored sync");
  }
}
tableScrollContainer.addEventListener("scroll", function(event: Event) {
  if (scrollTimeoutId) {
    window.clearTimeout(scrollTimeoutId);
  }
  scrollTimeoutId = window.setTimeout(whenScrollFinished, 400);
  event.stopPropagation();
}, {passive: true, capture: true});

/* submit event */
tableCellInputFormElement.addEventListener("submit", function(event: Event) {
  // disable submitting
  event.stopPropagation();
  event.preventDefault();
  return false;
}, true);

/* input event */
tableCellInputFormInputElement.addEventListener("input", function(event) {
  const query = tableCellInputFormInputElement.value;
  filterSelectOptions(query, tableCellInputFormAutocompleteSuggestionsSelectInfo);
  event.stopPropagation();
}, { passive: true});


// function restoreTableCellInputFormTargetElement() {
//   if (!tableCellInputFormTargetElement) {
//     return;
//   }
//
//   let recoveredTableCellInputFormTargetElement = getElementFromDataSectionsByID(tableCellInputFormTargetElement.id, tableDataSectionsRendered);
//   const getFocus: boolean = !isColumnSearchInputFocus();
//   if (recoveredTableCellInputFormTargetElement) {
//     // form target is in view: tableDataSectionRendered
//     activateTableCellInputForm(recoveredTableCellInputFormTargetElement as HTMLTableCellElement, getFocus);
//     return;
//   }
//
//   recoveredTableCellInputFormTargetElement = getElementFromDataSectionsByID(tableCellInputFormTargetElement.id, tableDataSections);
//   if (recoveredTableCellInputFormTargetElement) {
//     // form target is in potential view: tableDataSections
//     activateTableCellInputForm(recoveredTableCellInputFormTargetElement as HTMLTableCellElement, getFocus);
//   } else {
//     // form target not in potential view, remove input form
//     tableCellInputFormAssignTarget(null);
//   }
// }
// function restoreCopyTarget() {
//   if (!copyTarget) {
//     return;
//   }
//
//   let recoveredCopyTarget = getElementFromDataSectionsByID(copyTarget.id, tableDataSectionsRendered);
//   if (recoveredCopyTarget) {
//     // copy target is in view: tableDataSectionRendered
//     makeElementCopyTarget(recoveredCopyTarget as HTMLTableCellElement);
//     return;
//   }
//
//   recoveredCopyTarget = getElementFromDataSectionsByID(copyTarget.id, tableDataSections);
//   if (recoveredCopyTarget) {
//     // copy target is in potential view: tableDataSections
//     makeElementCopyTarget(recoveredCopyTarget as HTMLTableCellElement);
//   }
// }
// function restoreActiveTableCellElement() {
//   if (!activeTableCellElement) {
//     return;
//   }
//
//   if (isTableHead(activeTableCellElement)) {
//     // no need to recover active element since table header is the active element (will not disappear because of scrolling)
//     return;
//   }
//
//   const shouldGetFocus: boolean = !isColumnSearchInputFocus();
//   let recoveredActiveTableCellElement = getElementFromDataSectionsByID(activeTableCellElement.id, tableDataSectionsRendered);
//   if (recoveredActiveTableCellElement) {
//     // active element is in view: tableDataSectionRendered
//     activateTableCellElement(recoveredActiveTableCellElement as HTMLTableCellElement, false, shouldGetFocus);
//     return;
//   }
//
//   recoveredActiveTableCellElement = getElementFromDataSectionsByID(activeTableCellElement.id, tableDataSections);
//   if (recoveredActiveTableCellElement) {
//     // active element is in potential view: tableDataSections
//     activateTableCellElement(recoveredActiveTableCellElement as HTMLTableCellElement, false, shouldGetFocus);
//   }
// }
// function restoreDataSectionsStates() {
//   restoreActiveTableCellElement();
//   restoreCopyTarget();
//   restoreTableCellInputFormTargetElement();
// }


// HTML
class DataSectionElements {
  elements: Array<HTMLTemplateElement> | Array<HTMLTableSectionElement> | HTMLCollection;

  constructor(elements: Array<HTMLTemplateElement> | Array<HTMLTableSectionElement> | HTMLCollection = undefined) {
    if (elements) {
      this.elements = elements;
    } else {
      this.elements = [];
    }
  }

  get length(): number {
    return this.elements.length;
  }

  * getDataElements(): IterableIterator<DataElement> {
    for (const dataSectionElement of this.elements) {
      yield* new DataSectionElement(dataSectionElement as HTMLTableDataSectionElement).getDataElements();
    }
  }

  * getDataSectionElements() {
    for (const element of this.elements) {
      yield new DataSectionElement(element as HTMLTableDataSectionElement);
    }
  }

  removeRange(start: number, end: number) {
    if (end <= start) {
      // invalid range
      return;
    }

    // remove from end because HTMLCollection is live
    for (let i = end - 1; i >= start; i--) {
      this.elements[i].remove();
    }
  }
}

// JS variable
type DataCollections = Array<DataCollection>;

interface DataCollectionLike {
  children: HTMLCollection | Array<DataLike> | NodeList;
}
// HTML
type HTMLTableDataSectionElement = HTMLTemplateElement | HTMLTableSectionElement;

class DataSectionElement {
  element: HTMLTemplateElement | HTMLTableSectionElement;
  isTbody: boolean;

  constructor(element: HTMLTableDataSectionElement = undefined, asTbody: boolean = true) {
    if (element) {
      this.element = element;
    } else {
      this.element = document.createElement(asTbody ? "tbody" : "template");
    }
    this.isTbody = isTableBody(this.element);
  }

  get root(): DocumentFragment | HTMLTableSectionElement {
    if (isTableBody(this.element)) {
      return this.element as HTMLTableSectionElement;
    } else if (isTemplate(this.element)) {
      return (this.element as HTMLTemplateElement).content;
    }
  }

  querySelector(selector: string): HTMLElement {
    return this.root.querySelector(selector);
  }

  querySelectorAll(selector: string): NodeList {
    return this.root.querySelectorAll(selector);
  }

  get tableRows() {
    return this.querySelectorAll("tr");
  }

  get children() {
    return this.tableRows;
  }

  * getDataElements(): IterableIterator<DataElement> {
    for (const dataElement of this.tableRows) {
      yield new DataElement(dataElement as HTMLTableRowElement);
    }
  }

  appendChild(aChild: Node | DataElement) {
    if (aChild instanceof DataElement) {
      this.appendChild(aChild.element);
    } else {
      if (this.isTbody) {
        this.element.appendChild(aChild);
      } else {
        (this.element as HTMLTemplateElement).content.appendChild(aChild);
      }
    }
  }

  patch(dataCollection: DataCollectionLike) {
    const children = dataCollection.children;
    const numData: number = children.length;

    let dataIndex = 0;
    for (const dataElement of this.getDataElements()) {
      if (dataIndex < numData) {
        // in place patch
        dataElement.patch(children[dataIndex] as DataLike);
      } else {
        dataElement.remove();
      }
      dataIndex++;
    }

    for (; dataIndex < numData; dataIndex++) {
      const data = children[dataIndex];
      if (data instanceof Data) {
        this.appendChild(data.toDataElement());
      } else {
        this.appendChild(data as HTMLElement);
      }
    }
  }

  toDataCollection(): DataCollection {
    return DataCollection.from(this);
  }
}

// JS variable
interface OrderedTextSorter {
  order: number;
  sorter: TextSortingFunction;
}
type DataIndexSortingFunction = (d1: number, d2: number) => number;
type DataIndexFilterFunction = (d: number) => boolean;

class DataCollection {
  /**
   * Instead of an actual array, think children is a *view*.
   *
   * When returning children, `shouldRegenerateView` will be used to determine whether last view can be reused.
   *   + If `shouldRegenerateView` is true, last view can be reused. `childrenView` will be returned as the children.
   *   + If `shouldRegenerateView` is false, last `view` cannot be reused.
   *     1. `childrenIndex` will be re-compiled by applying first all the filter functions and then all the sorting functions.
   *     2. `childrenView` will be remapped from `store` using `childrenIndex`.
   *     3. `shouldRegenerateView` will be set to false to enable caching.
   *     4. `childrenView` will be returned as `children`
   */

  /** store of underlying data elements */
  store: Array<Data>
  /** indexes of data element of current children view */
  childrenIndex: Array<number>;
  /** current children view */
  childrenView: Array<Data>
  /** whether current children view needs to be regenrated */
  shouldRegenrateView: boolean = true;

  dataIdToChildIndex: Map<string, number> = new Map();

  cellIndexToSorter: Map<number, OrderedTextSorter> = new Map();
  cellIndexToFilter: Map<number, FilterFunction> = new Map();

  constructor(children: Array<Data>) {
    this.children = children;
  }

  [Symbol.iterator]() {
    return this.children.values();
  }

  get children(): Array<Data> {
    if (this.shouldRegenrateView) {
      this.regenerateView();
    }
    return this.childrenView;
  }

  set children(children: Array<Data>) {
    this.store = children;
    this.shouldRegenrateView = true;
  }

  get length(): number {
    return this.children.length;
  }

  get numCell(): number {
    const firstChild: Data = this.children[0];
    if (!firstChild) {
      return null;
    }
    return firstChild.length;
  }

  get sorter(): DataIndexSortingFunction {
    const numSorter: number = this.cellIndexToSorter.size;
    if (numSorter === 0) {
      return null;
    }

    const sorters: Array<[number, OrderedTextSorter]> = [...this.cellIndexToSorter];
    sorters.sort((s1, s2) => s1[1].order - s2[1].order);

    return (dataIndex1, dataIndex2) => {
      const d1Cells = this.store[dataIndex1].cells;
      const d2Cells = this.store[dataIndex2].cells;

      // apply text sorting functions sequentially by order
      let sorterIndex = 0;
      while (sorterIndex < numSorter) {
        const [cellIndex, {sorter}] = sorters[sorterIndex];
        const sorterResult = sorter(d1Cells[cellIndex].textContent, d2Cells[cellIndex].textContent);
        if (sorterResult !== 0) {
          // two entries are ordered after applying current sorter
          return sorterResult;
        }
        // need to apply next sorter
        sorterIndex++;
      }

      return 0;
    };
  }

  addSorter(cellIndex: number, sorter: TextSortingFunction, order: number = cellIndex) {
    this.cellIndexToSorter.set(cellIndex, { order, sorter });
    return this.shouldRegenrateView = true;

  }

  deleteSorter(cellIndex: number): boolean {
    if (this.cellIndexToSorter.delete(cellIndex)) {
      return this.shouldRegenrateView = true;
    }

    return false;
  }

  clearSorter(): boolean {
    if (this.cellIndexToSorter.size === 0) {
      return false;
    }

    this.cellIndexToSorter.clear();
    return this.shouldRegenrateView = true;
  }

  get filter(): DataIndexFilterFunction {
    const numFilter: number = this.cellIndexToFilter.size;
    if (numFilter === 0) {
      return null;
    }

    return (dataIndex) => {
      const cells = this.store[dataIndex].cells;

      for (const [cellIndex, filter] of this.cellIndexToFilter) {
        const cellText: string = cells[cellIndex].textContent;
        if (!filter(cellText)) {
          // not satisfying current filter
          return false;
        }
        // try next filter
      }

      return true;
    };
  }

  addFilter(cellIndex: number, filter: FilterFunction) {
    this.cellIndexToFilter.set(cellIndex, filter);
    return this.shouldRegenrateView = true;
  }

  deleteFilter(cellIndex: number): boolean {
    if (this.cellIndexToFilter.delete(cellIndex)) {
      return this.shouldRegenrateView = true;
    }

    return false;
  }

  clearFilter() {
    if (this.cellIndexToSorter.size === 0) {
      return false;
    }

    this.cellIndexToFilter.clear();
    return this.shouldRegenrateView = true;
  }

  regenerateView() {
    let childrenIndex = [...this.store.keys()];

    const filter: DataIndexFilterFunction = this.filter;
    if (filter) {
      childrenIndex = childrenIndex.filter(filter);
    }

    const sorter: DataIndexSortingFunction = this.sorter;
    if (sorter) {
      childrenIndex.sort(sorter);
    }

    this.dataIdToChildIndex.clear();

    this.childrenIndex = childrenIndex;
    this.childrenView = this.childrenIndex.map((dataIndex, childIndex) => {
      const data: Data = this.store[dataIndex];
      const dataid: string = data.id;
      this.dataIdToChildIndex.set(dataid, childIndex);
      return data;
    });
    this.shouldRegenrateView = false;
  }

  getData(i: number): Data {
    return this.children[i];
  }

  getChildIndexByDataId(dataid: string): number {
   return this.dataIdToChildIndex.get(dataid);
  }

  slice(begin: number = undefined, end: number = undefined) {
    return this.children.slice(begin, end);
  }

  static from(dataCollection: DataCollectionLike): DataCollection {
    const children = [];
    for (const data of dataCollection.children) {
      children.push(Data.from(data as DataLike));
    }
    return new DataCollection(children);
  }

  toDataDataSectionElement(): DataSectionElement {
    const dataSectionElement = new DataSectionElement();
    for (const data of this) {
      const dataElement: DataElement = data.toDataElement();
      dataSectionElement.appendChild(dataElement);
    }
    return dataSectionElement;
  }
}

// HTML
interface DataLike {
  id: string;
  cells: HTMLCollection | Array<DatumLike>;
}
class DataElement implements DataLike {
  element: HTMLTableRowElement;

  constructor(element: HTMLTableRowElement = undefined) {
    if (element) {
      this.element = element;
    } else {
      this.element = document.createElement("tr");
    }
  }

  get id() {
    return this.element.dataset.id;
  }

  set id(id: string) {
    this.element.dataset.id = id;
  }

  * getDataCellElements(): IterableIterator<DataCellElement> {
    for (const cellElement of this.cells) {
      yield new DataCellElement(cellElement);
    }
  }

  get cells() {
    return this.element.cells;
  }

  appendChild(aChild: Node | DataCellElement) {
    if (aChild instanceof DataCellElement) {
      this.element.appendChild(aChild.element);
    } else {
      this.element.appendChild(aChild);
    }
  }

  remove() {
    this.element.remove();
  }

  patch(data: DataLike) {
    this.id = data.id;

    const datums = data.cells;
    const numDatum: number = datums.length;

    let datumIndex = 0;
    for (const dataElement of this.getDataCellElements()) {
      if (datumIndex < numDatum) {
        // in place patch
        dataElement.patch(datums[datumIndex]);
      } else {
        dataElement.remove();
      }
      datumIndex++;
    }

    for (; datumIndex < numDatum; datumIndex++) {
      const datum = datums[datumIndex];
      if (datum instanceof Datum) {
        this.appendChild(datum.toDataCellElement());
      } else {
        this.appendChild(datum as HTMLElement);
      }
    }
  }

  isSameId(other: DataLike): boolean {
    return this.id === other.id;
  }

  toData(): Data {
    return Data.from(this);
  }
}

// JS variable
class Data implements DataLike {
  id: string;
  datums: Array<Datum>;

  constructor(id: string, datums: Array<Datum>) {
    this.id = id;
    this.datums = datums;
  }

  get length(): number {
    return this.datums.length;
  }

  /**
   * @alias datums
   */
  get cells(): Array<Datum> {
    return this.datums;
  }

  getDatum(i: number): Datum {
    return this.datums[i];
  }

  [Symbol.iterator]() {
    return this.datums.values();
  }

  static from(data: DataLike) {
    const datums = [];
    for (const tableCellElement of data.cells) {
      datums.push(Datum.from(tableCellElement as DatumLike));
    }
    return new Data(data.id, datums);
  }

  isSameId(other: DataLike): boolean {
    return this.id === other.id;
  }

  toDataElement(): DataElement {
    const dataElement = new DataElement();
    dataElement.id = this.id;
    for (const datum of this) {
      dataElement.appendChild(datum.toDataCellElement());
    }
    return dataElement;
  }
}


interface DatumLike {
  id: string;
  textContent: string;
  className: string;
}
// HTML
class DataCellElement implements DatumLike {
  element: HTMLTableCellElement;

  get id() {
    return this.element.id;
  }

  set id(id: string) {
    this.element.id = id;
  }

  get textContent() {
    return this.element.textContent;
  }

  set textContent(textContent: string) {
    this.element.textContent = textContent;
  }

  get className() {
    return this.element.className;
  }

  set className(className: string) {
    this.element.className = className;
  }

  constructor(element: HTMLTableCellElement = undefined) {
    if (element) {
      this.element = element;
    } else {
      this.element = document.createElement("td");
    }
  }

  remove() {
    this.element.remove();
  }

  patch(datum: DatumLike) {
    this.id = datum.id;
    this.textContent = datum.textContent;
    this.className = datum.className;
  }

  toDatum(): Datum {
    return Datum.from(this);
  }
}
// JS variable
class Datum implements DatumLike {
  id: string;
  textContent: string;
  className: string;

  constructor(id: string, textContent: string, className: string) {
    this.id = id;
    this.textContent = textContent;
    this.className = className;
  }

  static from(datum: DatumLike) {
    return new Datum(datum.id, datum.textContent, datum.className);
  }

  toDataCellElement(): DataCellElement {
    const dataCellElement = new DataCellElement();
    dataCellElement.id = this.id;
    dataCellElement.textContent = this.textContent;
    dataCellElement.className = this.className;
    return dataCellElement;
  }
}

enum Direction {
    Up,
    Down,
    Left,
    Right,
    Stay
}

class TableDataManager {
  tableElement: HTMLTableElement;

  dataCollection: DataCollection;
  dataSectionElement: DataSectionElement;

  /* filler */
  static fillerClass = "filler-row";
  topFiller: HTMLTableRowElement;
  static topFillerClass: string = "filler-row-top";
  topFillerObserver: IntersectionObserver;
  topFillerOffsetTop: number;
  bottomFiller: HTMLTableRowElement;
  static bottomFillerClass: string = "filler-row-bottom";
  bottomFillerObserver: IntersectionObserver;

  /* scroll */
  elementHeight: number;
  lastScrollPosition: number = 0;
  scrollTarget: HTMLElement;
  topSentinelObserver: IntersectionObserver;
  bottomSentinelObserver: IntersectionObserver;

  static numElementToEnableLazyLoad: number = 200;

  get topFillerRowIndex(): number {
    return this.topFiller.rowIndex;
  }

  get scrollPosition(): number {
    return this.scrollTarget.scrollTop;
  }

  get numElementToShift(): number {
    return Math.floor(TableDataManager.numElementToEnableLazyLoad / 2);
  }

  get shouldLazyLoad(): boolean {
    return this.numElement >= TableDataManager.numElementToEnableLazyLoad;
  }

  get numElement(): number {
    return this.dataCollection.length;
  }

  get numElementRendered(): number {
    return this.dataSectionElement.children.length;
  }

  get numElementToRender(): number {
    return Math.min(this.numElement, TableDataManager.numElementToEnableLazyLoad);
  }

  get numElementNotRenderedAbove(): number {
    return Number.parseInt(this.topFiller.dataset.numElement, 10);
  }
  set numElementNotRenderedAbove(n: number) {
    this.topFiller.dataset.numElement = n.toString();
    const fillerHeight = `${n * this.elementHeight}px`;
    this.topFiller.style.height = fillerHeight;
  }

  get reachedTop(): boolean {
    return this.numElementNotRenderedAbove === 0;
  }

  /**
   * @alias numElementNotRenderedAbove
   * First rendered data element index in this.dataCollection
   */
  get renderedFirstElementIndex(): number {
    return this.numElementNotRenderedAbove;
  }

  /**
   * This corresponds to the virtual row index of the first rendered data element. That is the hypothetical row index of this element when all data elements are rendered.
   */
  get renderedFirstElementRowIndex(): number {
    return this.elementIndexToRowIndex(this.renderedFirstElementIndex);
  }

  get numElementNotRenderedBelow(): number {
    return Number.parseInt(this.bottomFiller.dataset.numElement, 10);
  }
  set numElementNotRenderedBelow(n: number) {
    if (n === undefined) {
      n = this.numElement - this.numElementNotRenderedAbove - this.numElementRendered;
    }

    this.bottomFiller.dataset.numElement = n.toString();
    const fillerHeight = `${n * this.elementHeight}px`;
    this.bottomFiller.style.height = fillerHeight;
  }

  get reachedBottom(): boolean {
    return this.numElementNotRenderedBelow === 0;
  }

  /*
   * Last rendered data element index in this.dataCollection
   */
  get renderedLastElementIndex(): number {
    return this.renderedFirstElementIndex + this.numElementRendered - 1;
  }

  /* sentinel */
  get topSentinelIndex(): number {
    return this.getSafeIndex(Math.floor(this.numElementRendered / 4) - 1, 0, this.numElementRendered);
  }
  get topSentinel(): HTMLTableRowElement {
    return this.dataSectionElement.children[this.topSentinelIndex] as HTMLTableRowElement;
  }

  get bottomSentinelIndex(): number {
    return this.getSafeIndex(Math.floor(this.numElementRendered / 4) * 3 - 1, 0, this.numElementRendered);
  }
  get bottomSentinel(): HTMLTableRowElement {
    return this.dataSectionElement.children[this.bottomSentinelIndex] as HTMLTableRowElement;
  }

  /**
   * store current scroll position and report whether the scroll direction is going upward or downward
   */
  get scrollDirection(): Direction {
    const scrollPosition = this.scrollPosition;
    let scrollDirection;
    if (scrollPosition > this.lastScrollPosition) {
      scrollDirection = Direction.Down;
    } else if (scrollPosition === this.lastScrollPosition) {
      scrollDirection = Direction.Stay;
    } else {
      scrollDirection = Direction.Up;
    }
    this.lastScrollPosition = scrollPosition;
    return scrollDirection;
  }

  /**
   * @proxy
   */
  set dataSource(dataSource: HTMLElement | DataCollections | DataCollection | DataSectionElement | DataSectionElements) {
    if (dataSource instanceof DataSectionElements) {
      this.dataCollection = DataCollection.from({
        children: Array.from(dataSource.getDataElements())
      });
    } else if (dataSource instanceof DataSectionElement) {
      this.dataCollection = dataSource.toDataCollection();
    } else if (dataSource instanceof DataCollection) {
      this.dataCollection = dataSource;
    } else if (dataSource instanceof HTMLElement) {
      this.dataSource = new DataSectionElements(dataSource.children);
    } else {
      this.dataCollection = new DataCollection([].concat(...dataSource));
    }
  }

  /**
   * @returns A default view of first `this.numElementToRender` data elements of `this.dataCollection`
   */
  get defaultView(): DataCollectionLike {
    return {
      children: this.dataCollection.slice(0, this.numElementToRender)
    };
  }

  get viewToRender() {
    return {
      children: this.dataSectionElement.children
    };
  }

  /**
   * @proxy
   * Triggers rerendering
   */
  set viewToRender(dataCollection: DataCollectionLike) {
    this.dataSectionElement.patch(dataCollection);
  }

  setViewToRender(dataCollection: DataCollectionLike = this.defaultView, numElementNotRenderedAbove: number = 0, numElementNotRenderedBelow: number = undefined) {
    this.viewToRender = dataCollection;
    this.numElementNotRenderedAbove = numElementNotRenderedAbove;
    this.numElementNotRenderedBelow = numElementNotRenderedBelow;
  }

  constructor(tableElement: HTMLTableElement, dataSource: HTMLElement | DataCollections | DataCollection | DataSectionElement | DataSectionElements, scrollTarget: HTMLElement, elementHeight: number) {
    this.tableElement = tableElement;
    this.elementHeight = elementHeight;

    this.dataSource = dataSource;

    // set up
    this.initializeTopFiller();
    this.initializeDataSectionElement();
    this.initializeBottomFiller();

    // scroll
    this.scrollTarget = scrollTarget;
    this.numElementNotRenderedAbove = 0;
    this.numElementNotRenderedBelow = undefined;
    this.initializeSentinelObservers();

    this.activateObservers();
  }

  getSafeIndex(index: number, lowerBound: number = 0, upperBound: number = this.numElement - 1) {
    return Math.min(upperBound, Math.max(lowerBound, index));
  }

  getElementIndexByScrollAmount(scrollAmount: number = this.scrollPosition) {
    const elementOffsetTop: number = Math.max(0, scrollAmount - this.topFillerOffsetTop);
    return this.getSafeIndex(Math.floor(elementOffsetTop / this.elementHeight));
  }

  initializeTopFiller() {
    this.topFiller = document.createElement("tr");
    this.topFiller.classList.add(TableDataManager.fillerClass, TableDataManager.topFillerClass);
    this.tableElement.appendChild(this.topFiller);
    this.topFillerOffsetTop = this.topFiller.offsetTop;
    this.initializeTopFillerObserver();
  }

  initializeBottomFiller() {
    this.bottomFiller = document.createElement("tr");
    this.bottomFiller.classList.add(TableDataManager.fillerClass, TableDataManager.bottomFillerClass);
    this.tableElement.appendChild(this.bottomFiller);
    this.initializeBottomFillerObserver();
  }

  initializeDataSectionElement() {
    this.dataSectionElement = new DataSectionElement(undefined, true);
    this.viewToRender = this.defaultView;
    this.tableElement.appendChild(this.dataSectionElement.element);
  }

  initializeTopFillerObserver() {
    this.topFillerObserver = new IntersectionObserver((entries) => this.fillerReachedHandler(entries), {
      "root": this.scrollTarget,
      "threshold": [0, 0.25, 0.5, 0.75, 1],
    });
  }

  initializeBottomFillerObserver() {
    this.bottomFillerObserver = new IntersectionObserver((entries) => this.fillerReachedHandler(entries), {
      "root": this.scrollTarget,
      "threshold": [0, 0.25, 0.5, 0.75, 1],
    });
  }

  initializeSentinelObservers() {
    if (!this.shouldLazyLoad) {
      return;
    }
    this.topSentinelObserver = new IntersectionObserver((entries) => this.sentinelReachedHandler(entries), {
      "threshold": [0, 0.25, 0.5, 0.75, 1],
    });
    this.bottomSentinelObserver = new IntersectionObserver((entries) => this.sentinelReachedHandler(entries), {
      "threshold": [0, 0.25, 0.5, 0.75, 1],
    });
  }

  activateSentinelObservers() {
    this.topSentinelObserver.observe(this.topSentinel);
    this.bottomSentinelObserver.observe(this.bottomSentinel);
  }

  deactivateSentinelObservers() {
    // both disconnect and unobserve are used to maximize compatibility
    this.topSentinelObserver.disconnect();
    this.bottomSentinelObserver.disconnect();
  }

  activateTopFillerObserver() {
    this.topFillerObserver.observe(this.topFiller);
  }

  activateBottomFillerObserver() {
    this.bottomFillerObserver.observe(this.bottomFiller);
  }

  activateFillerObservers() {
    this.activateTopFillerObserver();
    this.activateBottomFillerObserver();
  }

  deactivateFillerObservers() {
    this.topFillerObserver.unobserve(this.topFiller);
    this.bottomFillerObserver.unobserve(this.bottomFiller);
  }

  activateObservers() {
    this.activateFillerObservers();
    this.activateSentinelObservers();
  }

  deactivateObservers() {
    this.deactivateFillerObservers();
    this.deactivateSentinelObservers();
  }

  /* filtering */
  addFilter(cellIndex: number, filter: FilterFunction) {
    if (this.dataCollection.addFilter(cellIndex, filter)) {
      this.setViewToRender();
    }
  }

  deleteFilter(cellIndex: number) {
    if (this.dataCollection.deleteFilter(cellIndex)) {
      this.setViewToRender();
    }
  }

  clearFilter() {
    if (this.dataCollection.clearFilter()) {
      this.setViewToRender();
    }
  }

  /* sorting */
  addSorter(cellIndex: number, sorter: TextSortingFunction, order: number = cellIndex) {
    if (this.dataCollection.addSorter(cellIndex, sorter, order)) {
      this.setViewToRender();
    }
  }

  deleteSorter(cellIndex: number) {
    if (this.dataCollection.deleteSorter(cellIndex)) {
      this.setViewToRender();
    }
  }

  clearSorter() {
    if (this.dataCollection.clearSorter()) {
      this.setViewToRender();
    }
  }

  /**
   * @arg {number} elementIndex - data element's index in `this.dataCollection`.
   * @returns {number} The virtual row index of this data element if all data elements are actually rendered.
   */
  elementIndexToRowIndex(elementIndex: number): number {
    return this.topFillerRowIndex + 1 + elementIndex;
  }

  /* handlers */

  fillerReachedHandler(entries: Array<IntersectionObserverEntry>) {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRect.height > 0) {
        // the last element of the first data section is appearing into view
        this.deactivateObservers();
        const targetElementIndex = this.getElementIndexByScrollAmount(this.scrollPosition);
        const numElementToShiftDown = targetElementIndex - this.renderedFirstElementIndex;
        this.shiftRenderingView(numElementToShiftDown);
        this.activateObservers();
      }
    });
  }

  sentinelReachedHandler(entries: Array<IntersectionObserverEntry>) {
    const scrollDirection: Direction = this.scrollDirection;

    entries.forEach(entry => {
      const desiredDirection: Direction = this.topSentinel === entry.target ? Direction.Up : Direction.Down;
      if (entry.isIntersecting && entry.intersectionRect.height > 0 && scrollDirection === desiredDirection) {
        // the last element of the first data section is appearing into view
        this.deactivateObservers();
        const numElementToShiftDown: number = scrollDirection === Direction.Up ?  -this.numElementToShift : this.numElementToShift;
        this.shiftRenderingView(numElementToShiftDown);
        this.activateObservers();
      }
    });
  }

  /* rendering view */
  isElementInRenderingView(elementIndex: number): boolean {
    return elementIndex >= this.renderedFirstElementIndex && elementIndex <= this.renderedLastElementIndex;
  }

  /**
   * @arg {number} elementIndex - the element index of a data element currently inside rendeirng view.
   * @returns The desired node if it is inside rendering view. `undefined` otherwise.
   */
  getElementInRenderingView(elementIndex: number) {
    return this.dataSectionElement.children[elementIndex - this.renderedFirstElementIndex];
  }

  /**
   * Put a data element in desired position in rendering view.
   *
   * @arg {number} elementIndex - data element's index in `this.dataCollection`.
   * @arg {number} indexInRenderingView - the desired offset from the first element in rendering view. For example, if `indexInRenderingView` is 5, the specified element index will be the fifth element in rendering view. Should not exceed `this.numElementRendered`.
   * @arg {boolean = true} scrollIntoView - whether scroll the pag so that the eleement will be aligned to the top of the visible area of the scrollable container. Should set to true when element is not in rendering view already or otherwise the filler observe will cause the original position to be restored.
   */
  putElementInRenderingView(elementIndex: number, indexInRenderingView: number = this.numElementRendered / 2, scrollIntoView: boolean = true) {
    this.deactivateObservers();
    let dataElement = this.getElementInRenderingView(elementIndex) as HTMLElement;

    if (!dataElement) {
      // put element in view
      const numElementToShiftDown: number = elementIndex - indexInRenderingView - this.renderedFirstElementIndex;
      this.shiftRenderingView(numElementToShiftDown);
      dataElement = this.getElementInRenderingView(elementIndex) as HTMLElement;
    }

    if (scrollIntoView) {
      dataElement.scrollIntoView();
    }

    this.activateObservers();
  }

  putElementInRenderingViewByDataId(dataid: string) {
    const childIndex: number = this.dataCollection.getChildIndexByDataId(dataid);
    if (childIndex === undefined) {
      // data element not in data collection, scroll failed
      return false;
    }
    this.putElementInRenderingView(childIndex);
    return true;
  }

  updateRenderingView(startIndex: number) {
    this.deactivateObservers();
    const end: number = startIndex + this.numElementToRender;
    this.setViewToRender({
      children: this.dataCollection.slice(startIndex, end)
    }, startIndex);
    this.activateObservers();
  }

  refreshRenderingViewIfNeeded(): boolean {
    const elementIndex: number = this.getElementIndexByScrollAmount(this.scrollPosition);
    if (!this.isElementInRenderingView(elementIndex)) {
      // out of sync
      this.updateRenderingView(elementIndex);
      return true;
    }
    return false;
  }


  shiftRenderingView(numElementToShiftDown: number) {
    const isScrollDown: boolean = numElementToShiftDown >= 0;
    if ((isScrollDown && this.reachedBottom) || (!isScrollDown && this.reachedTop)) {
        // already reached ends, no need to shift view
      return;
    }

    const startIndex: number = this.renderedFirstElementIndex;
    const newStartIndex: number = this.getSafeIndex(startIndex + numElementToShiftDown);
    const end: number = newStartIndex + this.numElementToRender;
    this.setViewToRender({
      children: this.dataCollection.slice(newStartIndex, end)
    }, newStartIndex);
  }
}

const tableDataManager = new TableDataManager(tableElement, document.getElementById("table-data"), tableScrollContainer, tableRowHeight);
