// TODO ARROW KEY not functioning when scrolling off screen
// TODO add new row

/* Force screen zoom to 100% - otherwise cell input form will flash when selecting the first few rows */
// https://stackoverflow.com/questions/1713771/how-to-detect-page-zoom-level-in-all-modern-browsers/5078596#5078596
const scale: string = "scale(1)";
document.body.style.webkitTransform =  scale;    // Chrome, Opera, Safari
//document.body.style.msTransform     =   scale;   // IE 9 :: sw getting a TS error saying this doesn't exist
document.body.style.transform       = scale;     // General
document.body.style.zoom = "1"; // 100%

/* which table column is active: a table column is activated when associated head is clicked */
let activeTableColElement: null | HTMLTableColElement = null;

// DOM Elements
const tableElement: HTMLTableElement = document.getElementById("table") as HTMLTableElement;
const tableScrollContainer: HTMLElement = tableElement.parentElement;

/* <tr>s */
const tableRowElements: HTMLCollection = tableElement.rows;
/* first table row: column labels */
const columnLabelRowIndex: number = 0;
const tableColumnLabels: HTMLTableRowElement = tableRowElements[columnLabelRowIndex] as HTMLTableRowElement;

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
function isFirstTableCell(tableCellElement: HTMLTableCellElement): boolean {
  return tableCellElement.cellIndex === 0;
}
function isLastTableCell(tableCellElement: HTMLTableCellElement): boolean {
  return getRightTableCellElement(tableCellElement) === null;
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
function isColumnSearchInputFocused(): boolean {
  return isColumnSearchInput(document.activeElement as HTMLElement);
}
function isColumnSearchFilled(columnSearch: HTMLTableCellElement): boolean {
  if (!columnSearch) {
    return false;
  }
  return getColumnSearchInput(columnSearch).value !== "";
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
function isTableCellTextSelected(tableCellElement: HTMLTableCellElement): boolean {
   const selection = window.getSelection();
   if (!selection) {
     return false;
   }
   if (selection.toString() === "") {
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
  if (columnLabel.contentEditable === "false") {
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
function* getTableCellElementsInRow(tableRowElement: HTMLTableRowElement) {
  yield* tableRowElement.cells;
}
/**
 * Gets the table cell elements for the specified column index.
 *
 * @param {number} index - Index of column.
 * @param {boolean} [skipColumnSearch = false] - whether skip column search in yielded elements.
 * @param {boolean} [skipColumnSearch = true] - whether skip column label in yielded elements.
 * @yields {HTMLTableCellElement} Table cells in the specified column.
 */
function* getTableCellElementsInColumn(index: number, skipColumnLabel: boolean = false, skipColumnSearch = true) {
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
    yield getCellInTableRow(tableRow, index);
  }
}

function* getTableCellTextsInColumn(index: number, skipColumnLabel: boolean = false, skipColumnSearch = true) {
  for (const tableCellElement of getTableCellElementsInColumn(index, skipColumnLabel, skipColumnSearch)) {
    if (!tableCellElement) {
      continue;
    }
    if (isColumnLabel(tableCellElement)) {
      yield getColumnLabelText(tableCellElement);
    } else if (isColumnSearch(tableCellElement)) {
      yield getColumnSearchInput(tableCellElement).value;
    } else {
      yield getTableDataText(tableCellElement);
    }
  }
}

function getIdUniqueID(tableCellElement: HTMLTableCellElement): number {
  return Number.parseInt(getTableRow(tableCellElement).dataset.id);
}
function getIdSuggestion(tableCellElement: HTMLTableCellElement): number {
  return Number.parseInt(tableCellElement.id);
}
function getIdSuggestionType(columnLabel: HTMLTableCellElement) {
  const idSuggestionType = columnLabel.dataset.idSuggestionType;
  if (idSuggestionType) {
    return Number.parseInt(idSuggestionType);
  }
  return null;
}
function getIdSearchType(columnSearch: HTMLTableCellElement) {
  return 1;
}
/**
 * This corresponds to the `multiSearchValues` field in database which is represented as
 * idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
 * where two pipes `||` separates diffrent column search and `|` separates information about a column search
 */
function getSearchValues(): string {
  const searchValues = [];
  for (const columnSearch of getTableCellElementsInRow(tableColumnSearches)) {
    if (isColumnSearchFilled(columnSearch)) {
      const idSuggestionType = getIdSuggestionType(getColumnLabel(columnSearch.cellIndex));
      const idSearchType = getIdSearchType(columnSearch);
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

function recordEdit(tableCellElement: HTMLTableCellElement, textContent: string) {
  // supply enough fields to update database entry for table cell

  recordInteraction("/suggestions/new", {
    "idUniqueID": getIdUniqueID(tableCellElement),
    "idSuggestion": getIdSuggestion(tableCellElement),
    "suggestion": textContent,
  }, (response) => {
    response.json().then(idSuggestion => {
      tableDataManager.updateCellInRenderingView(tableCellElement.id, (datum) => {
        datum.id = idSuggestion.toString();
        datum.textContent = textContent;
      }, true);
    });
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

function recordSearch(columnSearch: HTMLTableCellElement, isFullSearch: boolean) {
  const columnIndex: number = columnSearch.cellIndex;
  const columnLabel: HTMLTableCellElement = getColumnLabel(columnIndex);
  const columnSearchInput: HTMLInputElement = getColumnSearchInput(columnSearch);
  const matchedValues = [...new Set(getTableCellTextsInColumn(columnIndex, true, true))].join("|");
  /* sw - will need
    const idSuggestionType: number|string
    const isMulti: number
    const isFromUrl: number // sw feature not implemented yet
    const value: string
    const matchedValues: string: a pipe delimited list of unique values from that column that matched the input
    const multiSearchValues: string idSuggestionType|idSearchType|value||idSuggestionType|idSearchType|value
  */
  const url = isFullSearch ? "/search-full" : "/search-partial";
  recordInteraction(url, {
    idSuggestionType: getIdSuggestionType(columnLabel),
    isMulti: Number(isMultipleColumnSearchInputFilled()),
    isFromUrl: 0,
    value: columnSearchInput.value,
    matchedValues,
    multiSearchValues: getSearchValues(),
  });
}

function recordSort(columnIndex: number , sortingDirection: number) {
  const columnLabel: HTMLTableCellElement = getColumnLabel(columnIndex);
  const url = "/sort";
  recordInteraction(url, {
    idSuggestionType: getIdSuggestionType(columnLabel),
    isAsc: (1 - sortingDirection)
  });
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

// welcome screen
const welcomeScreenElement: HTMLElement = document.getElementById("welcome-screen");
function showWelcomeScreen() {
  welcomeScreenElement.classList.add(TableStatusManager.activeClass);
  welcomeScreenElement.setAttribute("aira-hidden", "false");
}
function hideWelcomeScreen() {
  welcomeScreenElement.classList.remove(TableStatusManager.activeClass);
  welcomeScreenElement.setAttribute("aira-hidden", "true");
}
function setWelcomeScreenCookie() {
  document.cookie = "usage-policy-accepted=true;max-age=3153600000;samesite=strict";
}
function showWelcomeScreenWhenCookieNotSet() {
  if (!document.cookie.includes("usage-policy-accepted=true")) {
    showWelcomeScreen();
  }
}
welcomeScreenElement.addEventListener("click", function(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target.dataset.dismiss === "modal") {
    setWelcomeScreenCookie();
    hideWelcomeScreen();
  }
  event.stopPropagation();
  event.preventDefault();
}, true);

// input editor
/* input editor element */
const tableCellInputFormElement: HTMLFormElement = document.getElementById("table-cell-input-form") as HTMLFormElement;
const tableCellInputFormCSRFInput: HTMLInputElement = tableCellInputFormElement.querySelector("input[name='_csrf']");
function isTableCellInputFormActive() {
  return tableCellInputFormElement.classList.contains(TableStatusManager.activeClass);
}
/* the input element in the input editor */
const tableCellInputFormInputElement: HTMLInputElement = document.getElementById("table-cell-input-entry") as HTMLInputElement;
const tableCellInputFormInputSaveButtonElement: HTMLButtonElement = document.getElementById("table-cell-input-save") as HTMLButtonElement;
/* the target element the input editor is associated with */

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
  const resizeWidth = measureTextWidth(text) + 120;
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

  // sw: fixing double entry bug: it happens before: createEditSuggestionsContainer
  if(tableCellInputFormInputElement.value.length === 2) {
    if(tableCellInputFormInputElement.value.charAt(0) === tableCellInputFormInputElement.value.charAt(1)) {
      tableCellInputFormInputElement.value = tableCellInputFormInputElement.value.charAt(0)
    }
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
  const currentColumnWidth = tableCellElement.clientWidth;
  const newColumnWidth = Math.max(getMinimumAllowedColumnWidth(index), currentColumnWidth + resizeAmount);

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
function resizeVisualCueMininumX(tableCellElement: HTMLTableCellElement) {
  const elementLeft = tableCellElement.getBoundingClientRect().left;
  const index = tableCellElement.cellIndex;
  return elementLeft + getMinimumAllowedColumnWidth(index);
}
function repositionResizeVisualCue(newXPos: number) {
  resizeVisualCue.style.left = `${newXPos}px`;
}
function updateResizeVisualCuePosition(tableCellElement: HTMLTableCellElement, newXPos: number, nearLeftBorder?: boolean) {
  let minX: number;
  if (nearLeftBorder) {
    minX = resizeVisualCueMininumX(getLeftTableCellElement(tableCellElement));
  } else {
    // near right border
    minX = resizeVisualCueMininumX(tableCellElement);
  }

  repositionResizeVisualCue(Math.max(minX, newXPos));
}
function activateResizeVisualCue() {
  resizeVisualCue.classList.add(TableStatusManager.activeClass);
}
function deactivateResizeVisualCue() {
  resizeVisualCue.classList.remove(TableStatusManager.activeClass);
}

// events
let lastSortButtonClicked: HTMLButtonElement;

type TextSortingFunction = (s1: string, s2: string) => number;
enum SortingDirection {
  ASCENDING,
  DESCENDING,
}
function addColumnSorter(columnIndex: number, sortingDirection: SortingDirection, order: number = columnIndex, recordSortInteraction: boolean = true) {
  let sorter: TextSortingFunction;
  if (sortingDirection === SortingDirection.ASCENDING) {
    sorter = (text1, text2) => text1.localeCompare(text2);
  } else {
    sorter = (text1, text2) => text2.localeCompare(text1);
  }
  tableDataManager.addSorter(columnIndex, sorter, order);
  if (recordSortInteraction) {
    recordSort(columnIndex, sortingDirection);
  }
}

function tableCellSortButtonOnClick(buttonElement: HTMLButtonElement, recordSort: boolean = true) {
  const clickClass = "clicked";
  const descendingClass = "desc";

  if (lastSortButtonClicked && lastSortButtonClicked !== buttonElement) {
    lastSortButtonClicked.classList.remove(clickClass, descendingClass);
    // remove all existing sorters since a single sorter system is employed
    // refresh view  is deferred since addSorter will soon trigger a refresh
    // thereby reduce the painting cost
    tableDataManager.clearSorter(false);
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
      addColumnSorter(columnIndex, SortingDirection.ASCENDING, undefined, recordSort);
    } else {
      // descending sort
      buttonElement.classList.add(descendingClass);
      addColumnSorter(columnIndex, SortingDirection.DESCENDING, undefined, recordSort);
    }
  } else {
    // ascending sort
    buttonElement.classList.add(clickClass);
    addColumnSorter(columnIndex, SortingDirection.ASCENDING, undefined, recordSort);
  }
}
tableElement.addEventListener("click", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableStatusManager.tableCellElementOnClick(target as HTMLTableCellElement, event);
  } else if (isTableCellSortButton(target)) {
    tableCellSortButtonOnClick(target as HTMLButtonElement);
  }
  event.stopPropagation();
}, true);


tableCellInputFormInputSaveButtonElement.addEventListener("click", function(event) {
   tableStatusManager.quitTableCellInputForm(true);
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
  for (const text of getTableCellTextsInColumn(index,true, true)) {
    clipboardTextarea.value += `${text}\n`;
  }
  clipboardTextarea.value = clipboardTextarea.value.trimRight();
}

// paste event
function tableCellElementOnPaste(tableCellElement: HTMLTableCellElement, text: string) {
  // disable paste
  // invoke edit editor
  // tableStatusManager.tableCellInputFormAssignTarget(tableCellElement, text, true);
}
function tableCellElementOnPasteKeyPressed(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  if (isTableHead(tableCellElement)) {
    return;
  }
  if (!hasCopyModifier(event)) {
    return;
  }
  // handle potential CTRL+v or CMD+v
  if (navigator.clipboard) {
    navigator.clipboard.readText().then(text => {
      tableCellElementOnPaste(tableCellElement, text);
    });
    event.consumed = true;
  } else {
    const copyTarget = tableStatusManager.copyTarget;
    if (!copyTarget) {
      return;
    }

    if (!isTableData(copyTarget)) {
      return;
    }

    const text = getTableDataText(copyTarget as HTMLTableCellElement);
    tableCellElementOnPaste(tableCellElement, text);
    event.consumed = true;
  }
}
tableElement.addEventListener("paste", function (event: ClipboardEvent) {
  const pasteContent = event.clipboardData.getData("text");
  const target: HTMLElement = event.target as HTMLElement;
  if(isColumnSearchInput(target)) {
    const targetInput: HTMLInputElement = event.target as HTMLInputElement;
    targetInput.value = pasteContent;
    targetInput.dispatchEvent(new Event("input"));
  } else if (isTableData(target) && isTableCellEditable(target as HTMLTableCellElement)) {
    tableCellElementOnPaste(target as HTMLTableCellElement, pasteContent);
  }
  event.preventDefault();
  event.stopPropagation();
}, true);

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
  columnSearchFilteringTimeoutId = window.setTimeout(() => {
    recordSearch(tableColumnSearchElement, false);
    updateTableColumnFilter(tableColumnSearchElement.cellIndex, tableColumnSearchInputElement.value);
  }, 400);
}

function tableColumnSearchElementOnChange(tableColumnSearchInputElement: HTMLInputElement, tableColumnSearchElement: HTMLTableCellElement) {
  recordSearch(tableColumnSearchElement, true);
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
    tableStatusManager.tableDataElementOnInput(tableCellElement, event);
  }
}
tableElement.addEventListener("keydown", function(event: KeyboardEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableStatusManager.tableCellElementOnKeyDown(target as HTMLTableCellElement, event);
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

tableCellInputFormElement.addEventListener("keydown", function(event: KeyboardEvent) {
  if (isTableCellInputFormActive()) {
    tableStatusManager.tableCellInputFormOnKeyDown(event);
  }
});

// mouse event handlers
let isRepositioningTableCellInputForm = false;
tableCellInputFormElement.addEventListener("mousedown", function(event: MouseEvent) {
  tableStatusManager.activateTableCellInputFormLocation();
  isRepositioningTableCellInputForm = true;
  event.stopPropagation();
}, {passive: true, capture: true});
let tableCellInputFormElementXShift: number = 0;
let tableCellInputFormElementYShift: number = 0;
function tableCellInputFormElementOnMouseMove(event: MouseEvent) {
  const {movementX: xShift, movementY: yShift } = event;
  // debounce
  tableCellInputFormElementXShift += xShift;
  tableCellInputFormElementYShift += yShift;

  //console.log('tableCellInputFormElementOnMouseMove - ' + tableCellInputFormElementXShift + ' :: ' + tableCellInputFormElementYShift);
  tableCellInputFormElement.style.transform = `translate(${tableCellInputFormElementXShift}px, ${tableCellInputFormElementYShift}px)`;
}
tableCellInputFormElement.addEventListener("mousemove", function(event: MouseEvent) {
  if (isRepositioningTableCellInputForm) {
    tableCellInputFormElementOnMouseMove(event);
  }
});
function tableCellInputFormElementOnMouseUp() {
  isRepositioningTableCellInputForm = false;
  tableCellInputFormInputElement.focus({preventScroll: true});
}
tableCellInputFormElement.addEventListener("mouseup", function(event: MouseEvent) {
  if (isRepositioningTableCellInputForm) {
    tableCellInputFormElementOnMouseUp();
  }
});


/* for handling complete searches */
let lastColumnSearchIndex: number = -1;
let lastColumnSearchRecorded: boolean = true;
tableElement.addEventListener("input", function(event: Event) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isInput(target)) {
    // inputting on column search
    const columnSearch = target.closest("th.column-search");
    if (columnSearch) {
      const tableColumnSearchElement: HTMLTableCellElement = columnSearch as HTMLTableCellElement;
      lastColumnSearchIndex = tableColumnSearchElement.cellIndex;
      lastColumnSearchRecorded = false;
      tableColumnSearchElementOnInput(target as HTMLInputElement, tableColumnSearchElement);
    }
  }
  event.stopPropagation();
}, true);

tableElement.addEventListener("blur", function(event: Event) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isInput(target)) {
    const columnSearch = target.closest("th.column-search");
    if (columnSearch) {
      const tableColumnSearchElement: HTMLTableCellElement = columnSearch as HTMLTableCellElement;
      // only recording full search when completing a previous partial search
      if(tableColumnSearchElement.cellIndex === lastColumnSearchIndex && lastColumnSearchRecorded === false) {
        lastColumnSearchRecorded = true;
        tableColumnSearchElementOnChange(target as HTMLInputElement, tableColumnSearchElement);
      }
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
function removeNearBorderStatus() {
  for (const element of tableColumnLabels.querySelectorAll(`.${nearLeftBorderClass}`)) {
    element.classList.remove(nearLeftBorderClass);
  }
  for (const element of tableColumnLabels.querySelectorAll(`.${nearRightBorderClass}`)) {
    element.classList.remove(nearRightBorderClass);
  }
}
const resizingBorderClass = "resize-border";
function isResizingTableHeadBorder() {
  return tableColumnLabels.classList.contains(resizingBorderClass);
}
function startResizingBorderOnTableHead(tableCellElement: ResizableHTMLTableCellElement, event: MouseEvent) {
  tableColumnLabels.classList.add(resizingBorderClass);
  tableCellElement.startMouseX = event.clientX;
}
function finishResizingBorderOnTableHead(event: MouseEvent) {
  const startMouseX = tableCellElementUnderMouse.startMouseX;
  if (isNaN(startMouseX)) {
    return;
  } else {
    tableCellElementUnderMouse.startMouseX = undefined;
  }
  const finishMouseX = event.clientX;
  const resizeAmount = finishMouseX - startMouseX;
  if (resizeAmount !== 0) {
    if (nearElementLeftBorder(tableCellElementUnderMouse)) {
      updateTableCellElementWidth(getLeftTableCellElement(tableCellElementUnderMouse), resizeAmount);
    } else {
      updateTableCellElementWidth(tableCellElementUnderMouse, resizeAmount);
    }
  }
}
function updateTableCellElementUnderMouse(tableCellElement: HTMLTableCellElement) {
  if (tableCellElementUnderMouse) {
    removeNearBorderStatus();
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
    removeNearBorderStatus();
  } else if (distanceFromLeftBorder <= distanceConsideredNearToBorder && distanceFromLeftBorder < distanceFromRightBorder && !isFirstTableCell(tableCellElement)) {
    // near left border
    tableCellElement.classList.add(nearLeftBorderClass);
    getLeftTableCellElement(tableCellElement).classList.add(nearRightBorderClass);
  } else if (distanceFromRightBorder <= distanceConsideredNearToBorder && distanceFromRightBorder <= distanceFromLeftBorder && !isLastTableCell(tableCellElement)) {
    // near right border
    tableCellElement.classList.add(nearRightBorderClass);
    getRightTableCellElement(tableCellElement).classList.add(nearLeftBorderClass);
  }
}
function tableHeadOnMouseMove(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (isResizingTableHeadBorder()) {
    // reposition visual cue
    updateResizeVisualCuePosition(tableCellElementUnderMouse, event.clientX, nearElementLeftBorder(tableCellElementUnderMouse));
  } else {
    if (tableCellElement !== tableCellElementUnderMouse) {
      // different element under mouse move
      updateTableCellElementUnderMouse(tableCellElement);
    }
    // handle mouse move to element border
    handleMouseMoveNearElementBorder(tableCellElement, event);
  }

}
function tableHeadOnMouseDown(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (tableCellElementUnderMouse !== tableCellElement) {
    updateTableCellElementUnderMouse(tableCellElement);
  }

  // when near a border, start resizing
  if (isColumnLabel(tableCellElementUnderMouse)) {
    if (nearElementLeftBorder(tableCellElementUnderMouse) || nearElementRightBorder(tableCellElementUnderMouse)) {
      startResizingBorderOnTableHead(tableCellElementUnderMouse, event);
      updateResizeVisualCuePosition(tableCellElementUnderMouse, event.clientX, nearElementLeftBorder(tableCellElementUnderMouse));
      activateResizeVisualCue();
    }
  }
}
function tableHeadOnMouseUp(event: MouseEvent) {
  if (isResizingTableHeadBorder()) {
    finishResizingBorderOnTableHead(event);
  }
  deactivateResizeVisualCue();
  tableColumnLabels.classList.remove(resizingBorderClass);
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
  } else if (isRepositioningTableCellInputForm) {
    tableCellInputFormElementOnMouseMove(event);
  }
  event.stopPropagation();
}, {passive: true, capture: true});
tableElement.addEventListener("mouseup", function(event: MouseEvent) {
  if (isRepositioningTableCellInputForm) {
    // stop moving the input form editor
  tableCellInputFormElementOnMouseUp();
  } else {
    tableHeadOnMouseUp(event);
  }
  event.stopPropagation();
}, {passive: true, capture: true});


// scroll
/* scroll event */
let scrollTimeoutId: number | null = null;
function whenScrollFinished() {
  tableStatusManager.tableCellInputFormLocationOnScroll();
  // detect out of sync and rerendering
  tableDataManager.refreshRenderingViewIfNeeded();
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
  //console.log('tableCellInputFormInputElement.addEventListener - input - ' + tableCellInputFormInputElement.value);
  filterSelectOptions(tableCellInputFormInputElement.value, tableCellInputFormAutocompleteSuggestionsSelectInfo);
  event.stopPropagation();
}, { passive: true});


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
interface IndexedDatum {
  childIndex: number;
  datum: Datum;
}

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

  /** from datum id (cell id) to datum (only for datum in view) */
  datumIdToDatum: Map<string, IndexedDatum> = new Map();
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

    this.datumIdToDatum.clear();
    this.dataIdToChildIndex.clear();

    this.childrenIndex = childrenIndex;
    this.childrenView = this.childrenIndex.map((dataIndex, childIndex) => {
      const data: Data = this.store[dataIndex];
      const dataid: string = data.id;
      for (const [datumid, datum] of data.datumIdToDatum) {
        this.datumIdToDatum.set(datumid, {datum, childIndex});
      }
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

  getDatumByDatumId(datumid: string): Datum {
    //console.log('getDatumByDatumId - ' + datumid)
    const indexedDatum: IndexedDatum = this.datumIdToDatum.get(datumid);
    //console.log('getDatumByDatumId - after ' + indexedDatum)

    if (indexedDatum) {
      return indexedDatum.datum;
    } else {
      return null;
    }
  }

  getChildIndexByDatumId(datumid: string): number {
    const indexedDatum: IndexedDatum = this.datumIdToDatum.get(datumid);
    if (indexedDatum) {
      return indexedDatum.childIndex;
    } else {
      return null;
    }
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
        dataElement.patch(datums[datumIndex] as DatumLike);
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
  datumIdToDatum: Map<string, Datum> = new Map();

  constructor(id: string, datums: Array<Datum>) {
    this.id = id;
    this.datums = datums;
    datums.forEach((datum) => this.datumIdToDatum.set(datum.id, datum));
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
  contentEditable: string;
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

  get contentEditable() {
    return this.element.contentEditable;
  }

  set contentEditable(contentEditable: string) {
    this.element.contentEditable = contentEditable;
  }

  constructor(element: HTMLTableCellElement = undefined) {
    if (element) {
      this.element = element;
    } else {
      this.element = document.createElement("td");
      this.element.tabIndex = -1;
    }
  }

  remove() {
    this.element.remove();
  }

  patch(datum: DatumLike) {
    this.id = datum.id;
    this.textContent = datum.textContent;
    this.className = datum.className;
    this.contentEditable = datum.contentEditable;
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
  contentEditable: string;

  constructor(id: string, textContent: string, className: string, contentEditable: string) {
    this.id = id;
    this.textContent = textContent;
    this.className = className;
    this.contentEditable = contentEditable;
  }

  static from(datum: DatumLike) {
    return new Datum(datum.id, datum.textContent, datum.className, datum.contentEditable);
  }

  toDataCellElement(): DataCellElement {
    const dataCellElement = new DataCellElement();
    dataCellElement.id = this.id;
    dataCellElement.textContent = this.textContent;
    dataCellElement.className = this.className;
    dataCellElement.contentEditable = this.contentEditable;
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

type ViewChangeHandler = () => void;
class TableDataManager {
  tableElement: HTMLTableElement;

  dataCollection: DataCollection;
  dataSectionElement: DataSectionElement;

  /* callback */
  /** a callback executed when old view is about to leave */
  beforeViewUpdate: ViewChangeHandler;
  /** a callback executed when new view finished rendering */
  afterViewUpdate: ViewChangeHandler;

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
    this.beforeViewUpdate();
    this.dataSectionElement.patch(dataCollection);
    this.afterViewUpdate();
  }

  setViewToRender(dataCollection: DataCollectionLike = this.defaultView, numElementNotRenderedAbove: number = 0, numElementNotRenderedBelow: number = undefined) {
    this.viewToRender = dataCollection;
    this.numElementNotRenderedAbove = numElementNotRenderedAbove;
    this.numElementNotRenderedBelow = numElementNotRenderedBelow;
  }

  constructor(
    tableElement: HTMLTableElement,
    dataSource: HTMLElement | DataCollections | DataCollection | DataSectionElement | DataSectionElements,
    scrollTarget: HTMLElement,
    elementHeight: number,
    beforeViewUpdate: ViewChangeHandler = () => undefined,
    afterViewUpdate: ViewChangeHandler = () => undefined) {
    this.beforeViewUpdate = beforeViewUpdate;
    this.afterViewUpdate = afterViewUpdate;

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
    this.topSentinelObserver = new IntersectionObserver((entries) => this.sentinelReachedHandler(entries), {
      "threshold": [0, 0.25, 0.5, 0.75, 1],
    });
    this.bottomSentinelObserver = new IntersectionObserver((entries) => this.sentinelReachedHandler(entries), {
      "threshold": [0, 0.25, 0.5, 0.75, 1],
    });
  }

  activateSentinelObservers() {
    if (!this.shouldLazyLoad) {
      return;
    }
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

  clearSorter(refreshViewImmediately: boolean = true) {
    if (this.dataCollection.clearSorter() && refreshViewImmediately) {
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

  isCellInRenderingView(cellid: string): boolean {
    if (!cellid) {
      return false;
    }
    return Boolean(this.dataCollection.getDatumByDatumId(cellid));
  }

  /**
   * Makes change to a Datum (data layer) and control whether the change will be reflected in the view layer (actual HTML Element encapsulated by DataCellElement).
   */
  updateCellInRenderingView(cellid: string, handler: (datum: Datum) => void, shouldRefreshCurrentView: boolean = true) {
    //console.log('updateCellInRenderingView - cellid = ' + cellid)

    const datum: Datum = this.dataCollection.getDatumByDatumId(cellid);
    handler(datum);
    if (shouldRefreshCurrentView) {
      this.refreshCurrentView();
    }
  }

  getElementIndexByCellId(cellid: string): number {
    return this.dataCollection.getChildIndexByDatumId(cellid);
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
  putElementInRenderingView(elementIndex: number, indexInRenderingView: number = this.numElementRendered / 2, scrollIntoViewOptions: ScrollIntoViewOptions = { block: "center", inline: "start"}) {
    this.deactivateObservers();
    let dataElement = this.getElementInRenderingView(elementIndex) as HTMLElement;

    if (!dataElement) {
      // put element in view
      const numElementToShiftDown: number = elementIndex - indexInRenderingView - this.renderedFirstElementIndex;
      this.shiftRenderingView(numElementToShiftDown);
      dataElement = this.getElementInRenderingView(elementIndex) as HTMLElement;
    }

    if (scrollIntoViewOptions) {
      dataElement.scrollIntoView(scrollIntoViewOptions);
    }

    this.activateObservers();
  }

  putElementInRenderingViewByDataId(dataid: string): boolean {
    const childIndex: number = this.dataCollection.getChildIndexByDataId(dataid);
    if (childIndex === undefined) {
      // data element not in data collection, scroll failed
      return false;
    }
    this.putElementInRenderingView(childIndex);
    return true;
  }

  putElementInRenderingViewByCellId(cellid: string): boolean {
    const elementIndex: number = this.getElementIndexByCellId(cellid);
    if (elementIndex === undefined) {
      // data element not in data collection, scroll failed
      return false;
    }
    this.putElementInRenderingView(elementIndex);
    return true;
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

  /**
   * Usually execute after a change is made to DataCollection (data layer) and before the change is reflected in the DataSectionElement (view layer)
   * Will cause the view layer to reflect the changes made to rendering slice of DataCollection
   */
  refreshCurrentView() {
    console.log('refreshCurrentView()')
    this.updateRenderingView(this.renderedFirstElementIndex);
  }

  updateRenderingView(startIndex: number) {
    //console.log('updateRenderingView()')

    this.deactivateObservers();
    const end: number = startIndex + this.numElementToRender;
    this.setViewToRender({
      children: this.dataCollection.slice(startIndex, end)
    }, startIndex);
    this.activateObservers();
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


/* this interface is used to detect double click (two clicks within short interval specified by {@link recentTimeLimit} */
interface ActiveHTMLTableCellElement extends HTMLTableCellElement {
  lastActiveTimestamp?: number;
}
type CopyTarget = HTMLTableColElement | HTMLTableCellElement;

class TableStatusManager {
  static activeClass = "active";
  static activeAccompanyClass = "active-accompany";
  static recentTimeLimit = 1000;

  // copying
  static copiedClass = "copied";

  constructor() {
    tableCellInputFormLocateCellElement.addEventListener("click", (event: MouseEvent) => {
      this.restoreTableCellInputFormLocation();
      event.stopPropagation();
    });

  }

  /** which table cell (either a table head or a table data) element is currently active */
  activeTableCellElementId: string = null;
  /** which table cell element (either a table head or a table data) was copied */
  copyTargetId: string = null;

  get copyTarget(): CopyTarget {
    if (!this.copyTargetId) {
      return null;
    }
    return document.getElementById(this.copyTargetId) as CopyTarget;
  }

  set copyTarget(copyTarget: CopyTarget) {
    if (copyTarget) {
      this.copyTargetId = copyTarget.id;
    } else {
      this.copyTargetId = null;
    }
  }

  removeCurrentCopyTarget() {
    const copyTarget: CopyTarget = this.copyTarget;
    if (copyTarget) {
      copyTarget.classList.remove(TableStatusManager.copiedClass);
      this.copyTarget = null;
    }
  }

  makeElementCopyTarget(element: HTMLTableCellElement | HTMLTableColElement) {
    this.copyTarget = element;
    element.classList.add(TableStatusManager.copiedClass);
  }

  tableCellElementOnCopy(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
    if (hasCopyModifier(event)) {
      this.removeCurrentCopyTarget();
      clearClipboardTextarea();

      let elementToHighlight;
      if (activeTableColElement) {
        // copy entire column
        const columnIndex: number = this.activeTableCellElement.cellIndex;
        copyTableColumnToTextarea(columnIndex);
        elementToHighlight = activeTableColElement;
        recordCopyColumn(getColumnLabel(columnIndex));
      } else if (!(isColumnSearch(tableCellElement))) {
        if (isTableCellTextSelected(tableCellElement)) {
          // copy selected part
          copyTextToTextarea(window.getSelection().toString());
        } else {
          // copy single table cell
          copyElementTextToTextarea(tableCellElement);
        }
        elementToHighlight = tableCellElement;
        if (isTableData(tableCellElement)) {
          // do not record copy on table head element
          recordCopyCell(tableCellElement);
        }

        // regain focus
        elementToHighlight.focus();
      }

      copyTextareaToClipboard();
      this.makeElementCopyTarget(elementToHighlight);
      event.consumed = true;
    }
    // ignore when only C is pressed
  }

  get activeTableCellElement(): ActiveHTMLTableCellElement {
    if (!this.activeTableCellElementId) {
      return null;
    }
    return document.getElementById(this.activeTableCellElementId) as ActiveHTMLTableCellElement;
  }

  set activeTableCellElement(tableCellElement: ActiveHTMLTableCellElement) {
    if (tableCellElement) {
      this.activeTableCellElementId = tableCellElement.id;
    } else {
      this.activeTableCellElementId = null;
    }
  }

  /**
   * renew the timestamp on the active table cell element.
   */
  updateActiveTimestamp() {
    this.activeTableCellElement.lastActiveTimestamp = Date.now();
  }

  /**
   * Whether the table data is activated recently.
   */
  isTableDataLastActivatedRecently() {
    const activeTableCellElement = this.activeTableCellElement;
    if (activeTableCellElement === null) {
      return false;
    }

    if (activeTableCellElement.lastActiveTimestamp === null) {
      return false;
    }

    return Date.now() - activeTableCellElement.lastActiveTimestamp <= TableStatusManager.recentTimeLimit;
  }

  isClickOnActiveElement(tableCellElement: HTMLTableCellElement) {
    return tableCellElement === this.activeTableCellElement;
  }

  activeElementOnRepeatedClick(event: MouseEvent) {
    const activeTableCellElement = this.activeTableCellElement;
    if (!activeTableCellElement) {
      return;
    }
    if (isTableData(activeTableCellElement)) {
      if (this.isTableDataLastActivatedRecently()) {
        this.tableCellInputFormAssignTarget(activeTableCellElement);
        activeTableCellElement.lastActiveTimestamp = null;
        recordDoubleClickOnCell(activeTableCellElement);
      } else {
        this.updateActiveTimestamp();
      }
    } else if (isTableHead(activeTableCellElement)) {
      this.activeTableHeadOnRepeatedClick(event);
    }
  }

  activeTableHeadOnRepeatedClick(event: MouseEvent) {
    if (activeTableColElement) {
      // table column is active, deactivate column and focus only on table head
      this.deactivateTableCol();
    } else {
      // only activate table column at repeated click (after even number of clicks)
      this.activateTableCol();
    }
  }
  /* activate */
  activateTableData(shouldUpdateTimestamp=true, shouldGetFocus=true) {
    const activeTableCellElement = this.activeTableCellElement;
    activeTableCellElement.classList.add(TableStatusManager.activeClass);
    if (shouldUpdateTimestamp) {
      this.updateActiveTimestamp();
    }
    if (shouldGetFocus) {
      activeTableCellElement.focus({preventScroll: true});
    }
  }
  activateTableHead(shouldGetFocus=true) {
    const activeTableCellElement = this.activeTableCellElement;
    const index = activeTableCellElement.cellIndex;
    if (isColumnLabel(activeTableCellElement)) {
      const columnSearch = getColumnSearch(index);
      columnSearch.classList.add(TableStatusManager.activeAccompanyClass);
    } else if (isColumnSearch(activeTableCellElement)) {
      const columnLabel = getColumnLabel(index);
      columnLabel.classList.add(TableStatusManager.activeAccompanyClass);
    }
    activeTableCellElement.classList.add(TableStatusManager.activeClass);
    if (shouldGetFocus) {
      activeTableCellElement.focus({preventScroll: true});
    }
  }
  activateTableCol() {
    const index = this.activeTableCellElement.cellIndex;
    const tableColElement = getTableColElement(index);
    if (tableColElement) {
      activeTableColElement = tableColElement;
      activeTableColElement.classList.add(TableStatusManager.activeClass);
    }
  }
  activateTableCellElement(tableCellElement: HTMLTableCellElement, shouldUpdateTimestamp=true, shouldGetFocus=true) {
    this.activeTableCellElement = tableCellElement;
    if (isTableData(tableCellElement)) {
      this.activateTableData(shouldUpdateTimestamp, shouldGetFocus);
      // record whether this table cell is editable
      isTableCellEditable(tableCellElement);
    } else if (isTableHead(tableCellElement)) {
      this.activateTableHead(shouldGetFocus);
    }
  }

  /* deactivate */
  deactivateTableData() {
    const activeTableCellElement = this.activeTableCellElement;
    activeTableCellElement.classList.remove(TableStatusManager.activeClass);
    activeTableCellElement.lastActiveTimestamp = null;
  }
  deactivateTableHead() {
    const index = this.activeTableCellElement.cellIndex;
    const columnLabel = getColumnLabel(index);
    const columnSearch = getColumnSearch(index);
    columnLabel.classList.remove(TableStatusManager.activeClass);
    columnSearch.classList.remove(TableStatusManager.activeClass);
    columnLabel.classList.remove(TableStatusManager.activeAccompanyClass);
    columnSearch.classList.remove(TableStatusManager.activeAccompanyClass);
  }
  deactivateTableCol() {
    if (activeTableColElement) {
      activeTableColElement.classList.remove(TableStatusManager.activeClass);
      activeTableColElement = null;
    }
  }
  deactivateTableCellElement() {
    const activeTableCellElement = this.activeTableCellElement;
    if (isTableData(activeTableCellElement)) {
      this.deactivateTableData();
    } else if (isTableHead(activeTableCellElement)) {
      this.deactivateTableHead();
      this.deactivateTableCol();
    }
    this.activeTableCellElement = null;
  }

  /**
   * @public
   * Use this function to change table cell element to ensure previous active element is properly deactivated
   */
  updateActiveTableCellElement(tableCellElement: HTMLTableCellElement | null, shouldGetFocus: boolean = true) {
    if (!tableCellElement) {
      return;
    }

    if (this.activeTableCellElement) {
      this.deactivateTableCellElement();
      // remove input form
      this.deactivateTableCellInputForm();
    }

    this.activateTableCellElement(tableCellElement, undefined, shouldGetFocus);
  }

  // input editor exit
  quitTableCellInputForm(saveContent = false) {
    const activeTableCellElement = this.activeTableCellElement;
    if (saveContent) {
      this.saveTableCellInputForm();
      // move to next cell to allow continuous edit
      if (activeTableCellElement) {
        const nextCell = getRightTableCellElement(activeTableCellElement);
        if (nextCell) {
          this.updateActiveTableCellElement(nextCell);
        }
      }
    }

    this.tableCellInputFormAssignTarget(null);
  }

  /* click event */
  tableCellElementOnClick(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
    if (this.isClickOnActiveElement(tableCellElement)) {
      // handle repeated click differently
      this.activeElementOnRepeatedClick(event);
    } else {
      this.updateActiveTableCellElement(tableCellElement);
      recordClickOnCell(tableCellElement);
    }
    event.preventDefault();
  }

  tableCellElementOnKeyDown(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
    event.consumed = false;
    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        this.updateActiveTableCellElement(getDownTableCellElement(tableCellElement));
        event.consumed = true;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        this.updateActiveTableCellElement(getUpTableCellElement(tableCellElement));
        event.consumed = true;
        break;
      case "Left": // IE/Edge specific value
      case "ArrowLeft":
        this.updateActiveTableCellElement(getLeftTableCellElement(tableCellElement));
        event.consumed = true;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
      case "Tab": // handle Tab as a pressing Right arrow
        this.updateActiveTableCellElement(getRightTableCellElement(tableCellElement));
        event.consumed = true;
        break;
      case "c": // handle potential CTRL+c or CMD+c
        this.tableCellElementOnCopy(tableCellElement, event);
        break;
      case "v":
        tableCellElementOnPasteKeyPressed(tableCellElement, event);
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
    if (event.consumed) {
      event.preventDefault();
    } else {
      tableCellElementOnInput(event);
    }
  }

  tableCellInputFormOnKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "Esc": // IE/Edge specific value
      case "Escape":
        this.quitTableCellInputForm(false);
        break;
      case "Enter":
        this.quitTableCellInputForm(true);
        break;

    }
    event.stopPropagation();
  }

  /* restore */
  restoreActiveTableCellElement() {
    const activeTableCellElement = this.activeTableCellElement;
    if (!activeTableCellElement) {
      return;
    }

    if (isTableHead(activeTableCellElement)) {
      // no need to recover active element since table header is the active element (will not disappear because of scrolling)
      return;
    }

    const shouldGetFocus: boolean = !isColumnSearchInputFocused();
    // active element is in view: tableDataSectionRendered
    this.activateTableCellElement(activeTableCellElement, false, shouldGetFocus);
  }

  restoreCopyTarget() {
    const recoveredCopyTarget = this.copyTarget;
    if (recoveredCopyTarget) {
      // copy target is in view
      this.makeElementCopyTarget(recoveredCopyTarget as HTMLTableCellElement);
      return;
    }
  }

  static inputtingClass = "inputting";
  tableCellInputFormTargetElementId: string = null;

  get tableCellInputFormTargetElement(): HTMLTableCellElement {
    if (!this.tableCellInputFormTargetElementId) {
      return null;
    }
    return document.getElementById(this.tableCellInputFormTargetElementId) as HTMLTableCellElement;
  }

  set tableCellInputFormTargetElement(tableCellElement: HTMLTableCellElement) {
    if (tableCellElement) {
      this.tableCellInputFormTargetElementId = tableCellElement.id;
    } else {
      this.tableCellInputFormTargetElementId = null;
    }
  }


  activateTableCellInputFormLocation() {
    if (isTableCellInputFormActive() && !tableCellInputFormLocationActive) {
      tableCellInputFormLocateCellElement.classList.add(TableStatusManager.activeClass);
      tableCellInputFormLocationActive = true;
      // reposition the tableCellInputFormElement
      const buttonHeight = tableCellInputFormLocateCellElement.offsetHeight;
      const formTop = parseFloat(tableCellInputFormElement.style.top);
      tableCellInputFormElement.style.top = `${formTop - buttonHeight}px`;
    }
  }
  deactivateTableCellInputFormLocation() {
    tableCellInputFormLocateCellElement.classList.remove(TableStatusManager.activeClass);
    tableCellInputFormLocationActive = false;
  }

  updateTableCellInputFormLocation(targetHTMLTableCellElement: HTMLTableCellElement) {
    // row index
    /* since recordIndex is 0-based */
    const elementIndex = tableDataManager.getElementIndexByCellId(targetHTMLTableCellElement.id);
    tableCellInputFormLocateCellRowElement.textContent = `${elementIndex + 1}`;
    // column index
    const colIndex = getColumnIndex(targetHTMLTableCellElement);
    const columnLabelText = getColumnLabelText(getColumnLabel(colIndex - 1));
    tableCellInputFormLocateCellColElement.textContent = columnLabelText;
  }

  restoreTableCellInputFormLocation() {
    if (tableCellInputFormLocationActive) {
      if (tableDataManager.putElementInRenderingViewByCellId(this.tableCellInputFormTargetElementId)) {
        this.alignTableCellInputForm(this.tableCellInputFormTargetElement);
        // clear cumulative shift so that next shifting of input form can start afresh
        //console.log('restoreTableCellInputFormLocation');
        tableCellInputFormElementXShift = 0;
        tableCellInputFormElementYShift = 0;
      }
    }
  }

  activateTableCellInputForm(targetHTMLTableCellElement: HTMLTableCellElement, getFocus: boolean = true) {
    // show the form
    tableCellInputFormElement.classList.add(TableStatusManager.activeClass);

    // focus the input
    if (getFocus) {
      tableCellInputFormInputElement.focus({preventScroll: true});
    }

    // highlight the table head
    const cellIndex = targetHTMLTableCellElement.cellIndex;
    const columnLabel: HTMLTableCellElement = getColumnLabel(cellIndex);
    if (columnLabel) {
      columnLabel.classList.add(TableStatusManager.inputtingClass);
    }

    // highlight the target cell
    targetHTMLTableCellElement.classList.add(TableStatusManager.inputtingClass);
    this.tableCellInputFormTargetElement = targetHTMLTableCellElement;
  }

  /**
   * @public
   * Use this function to change the editor associated table cell.
   */
  tableCellInputFormAssignTarget(targetHTMLTableCellElement: HTMLTableCellElement, input?: string, getFocus: boolean = true) {
    // ignore if input on table head
    if (isTableHead(targetHTMLTableCellElement)) {
      return;
    }

    this.deactivateTableCellInputForm();
    this.deactivateTableCellInputFormLocation();

    // sw: reset val to avoid double entry bug
    // sw: if you call in removeSelect() gives es-lint err
    tableCellInputFormInputElement.value = ''; 
    removeSelect(tableCellInputFormElement);

    if (targetHTMLTableCellElement) {
      if (!isTableCellEditable(targetHTMLTableCellElement)) {
        return;
      }

      this.activateTableCellInputForm(targetHTMLTableCellElement, getFocus);
      updateTableCellInputFormInput(targetHTMLTableCellElement, input); // remove this no double value on input
      attachSuggestions(targetHTMLTableCellElement);

      this.updateTableCellInputFormLocation(targetHTMLTableCellElement);
      this.alignTableCellInputForm(targetHTMLTableCellElement);
    }
  }

  alignTableCellInputForm(targetHTMLTableCellElement: HTMLTableCellElement) {
    // set position
    const {left, top} = targetHTMLTableCellElement.getBoundingClientRect();
    tableCellInputFormElement.style.transform = "";
    this.positionTableCellInputForm(left, top);
  }

  /**
   * Repositions the input form editor
   *
   * @arg {number} left - the new form left (as left in tableCellInputFormElement.getBoundingClientRect())
   * @arg {number} top - the new form top
   * @arg {boolean = false} topAsEntireFormTop - if true, then the top refers to top in tableCellInputFormElement.getBoundingClientRect(); if false, then the top refers to the form top below the tableCellInputFormLocateCellElement.
   */
  positionTableCellInputForm(left: number, top: number, topAsEntireFormTop=false) {
    if (left !== undefined) {
      tableCellInputFormElement.style.left = `${left}px`;
    }
    if (top !== undefined) {
      if (topAsEntireFormTop) {
        tableCellInputFormElement.style.top = `${top}px`;
      } else {
        const buttonHeight = tableCellInputFormLocateCellElement.offsetHeight;
        tableCellInputFormElement.style.top = `${top - buttonHeight}px`;
      }
    }

    const bounding = tableCellInputFormElement.getBoundingClientRect();

    if (bounding.top < 0) {
      //console.log('Top is out of viewport');
    }
    if (bounding.left < 0) {
      //console.log('Left side is out of viewport');
    }

    if (bounding.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
      //console.log('Bottom is out of viewport');
      const newTop = document.documentElement.clientHeight - bounding.height - 80;
      tableCellInputFormElement.style.top = `${newTop}px`;
    }

    if (bounding.right > (window.innerWidth || document.documentElement.clientWidth)) {
      //console.log('Right side is out of viewport');
      const newLeft = document.documentElement.clientWidth - bounding.width;
      tableCellInputFormElement.style.left = `${newLeft}px`;
    }
  }

  saveTableCellInputForm() {
    const tableCellInputFormTargetElement = this.tableCellInputFormTargetElement;
    const text = tableCellInputFormInputElement.value;
    if (tableCellInputFormTargetElement) {
      // call backend api to send user submission
      recordEdit(tableCellInputFormTargetElement, text);
    }
  }

  tableCellInputFormLocationOnScroll() {
    this.activateTableCellInputFormLocation();
  }

  deactivateTableCellInputForm() {
    const tableCellInputFormTargetElement = this.tableCellInputFormTargetElement;
    if (isTableCellInputFormActive()) {
      // hide the form
      tableCellInputFormElement.classList.remove(TableStatusManager.activeClass);

      // unhighlight the table head
      const columnLabel: HTMLTableCellElement = tableColumnLabels.querySelector(`.${TableStatusManager.inputtingClass}`);
      if (columnLabel) {
        columnLabel.classList.remove(TableStatusManager.inputtingClass);
      }

      // unhighlight the target cell
      if (tableCellInputFormTargetElement) {
        this.tableCellInputFormTargetElement = null;
      }
    }
  }

  tableDataElementOnInput(tableDataElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
    const input = event.key;
    if (input.length === 1) {
      this.tableCellInputFormAssignTarget(tableDataElement, input);
    } else {
      this.tableCellInputFormAssignTarget(tableDataElement);
    }
    event.consumed = true;
  }

  restoreTableCellInputFormTargetElement() {
    const tableCellInputFormTargetElement = this.tableCellInputFormTargetElement;
    if (tableCellInputFormTargetElement) {
      const getFocus: boolean = !isColumnSearchInputFocused();
      // form target is in view
      this.tableCellInputFormAssignTarget(tableCellInputFormTargetElement, undefined, getFocus);
    } else {
      if (!isTableCellInputFormActive()) {
        return;
      }

      if (tableDataManager.isCellInRenderingView(this.tableCellInputFormTargetElementId)) {
        // row index
        const elementIndex = tableDataManager.getElementIndexByCellId(this.tableCellInputFormTargetElementId);
        tableCellInputFormLocateCellRowElement.textContent = `${elementIndex + 1}`;
      } else {
        // the target element has moved out of view
        this.tableCellInputFormAssignTarget(null);
      }
    }
  }

  restoreStatus() {
    this.restoreActiveTableCellElement();
    this.restoreCopyTarget();
    this.restoreTableCellInputFormTargetElement();
  }
}
const tableStatusManager: TableStatusManager = new TableStatusManager();
const tableDataManager = new TableDataManager(tableElement, document.getElementById("table-data"), tableScrollContainer, tableRowHeight, undefined, () => tableStatusManager.restoreStatus());
showWelcomeScreenWhenCookieNotSet();
// sort on University A-Z
tableCellSortButtonOnClick(tableElement.querySelectorAll(".sort-btn")[1] as HTMLButtonElement, false);
