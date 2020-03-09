// ARROW KEY not functioning when scrolling off screen

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

/* first table row: column labels */
const columnSearchRowIndex = 1;
const tableColumnSearchs: HTMLTableRowElement = tableRowElements[columnSearchRowIndex] as HTMLTableRowElement;
const tableColumnSearchQueries: Map<number, RegExp> = new Map();
function updateTableColumnSearchQuery(columnIndex: number, query: string) {
  if (query == "") {
    tableColumnSearchQueries.delete(columnIndex);
  } else {
    tableColumnSearchQueries.set(columnIndex, new RegExp(query, "i"));
  }
}

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

function isTableCellInRenderedDataSections(tableCellElement: HTMLTableCellElement): boolean {
  // rendered table cell will have a <table> ancestor
  return tableCellElement.closest("table") !== null;
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
function getFirstDataRowIndex() {
  return dataSectionFillerTop.rowIndex + 1;
}
function getDataElementsFromDataSection(dataSection: HTMLTemplateElement | HTMLTableSectionElement) {
  if (isTableBody(dataSection)) {
    return dataSection.getElementsByTagName("tr");
  } else if (isTemplate(dataSection)) {
    return (dataSection as HTMLTemplateElement).content.querySelectorAll("tr");
  }
  throw new Error("unrecognized HTMLelement passed to getDataRowsFromDataSection, expecting <template> or <tbody>");
}
function getDataSection(dataSectionElement: HTMLTableRowElement | HTMLTableCellElement): HTMLTableSectionElement {
  return dataSectionElement.closest("tbody");
}
function getDataSectionTemplateIndex(dataSection: HTMLElement): number {
  const dataSectionSid = dataSection.dataset.sid;
  return sidToTemplateIndex.get(dataSectionSid);
}
function getDataElementsFromDataSections(dataSections: HTMLCollection | Array<HTMLTemplateElement>, selector="tr"): Array<HTMLElement> {
  const dataElements = [];
  for (const dataSection of dataSections) {
    dataElements.push(...getDataElementsFromDataSection(dataSection as HTMLTemplateElement));
  }
  return dataElements as Array<HTMLElement>;
}

function getRecordIndex(tableCellElement: HTMLTableCellElement): number {
  const dataSection = getDataSection(tableCellElement);
  const templateIndex = getDataSectionTemplateIndex(dataSection);
  const numDataElementsInPreviousDataSections = templateIndex * numTableRowsInDataSection;
  const sectionIndex = getRowIndexInSection(getTableRow(tableCellElement));
  return sectionIndex + numDataElementsInPreviousDataSections;
}
function getRecordIndexFromLocateCellElement() {
  const displayedIndex: string = tableCellInputFormLocateCellRowElement.textContent;
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
  return getCellInTableRow(tableColumnSearchs, index);
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
function getTableDataText(tableCellElement: HTMLTableCellElement) {
  return tableCellElement.textContent;
}
function getTableCellInputFormLocateRowIndex(): number | null {
  const rowIndex: string = tableCellInputFormLocateCellRowElement.textContent;
  if (rowIndex) {
    return Number.parseInt(rowIndex);
  } else {
    return null;
  }
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
  return Number.parseInt(getTableRow(tableCellElement).id);
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
    .catch(error => console.error("Network error when posting interaction", error));

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

// unique identifier generation
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
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
}
function updateTableCellInputFormLocation(targetHTMLTableCellElement: HTMLTableCellElement) {
  // row index
  /* since recordIndex is 0-based */
  const recordIndex = getRecordIndex(targetHTMLTableCellElement);
  tableCellInputFormLocateCellRowElement.textContent = `${recordIndex + 1}`;
  // column index
  const colIndex = getColumnIndex(targetHTMLTableCellElement);
  const columnLabelText = getColumnLabelText(getColumnLabel(colIndex - 1));
  tableCellInputFormLocateCellColElement.textContent = columnLabelText;
}
function restoreTableCellInputFormLocation() {
  if (tableCellInputFormLocationActive && tableCellInputFormTargetElement) {
    const dataRowIndex = getRecordIndex(tableCellInputFormTargetElement);
    scrollToDataRowIndex(dataRowIndex, true, () => {
      const {left: targetLeft, top: targetTop} = tableCellInputFormTargetElement.getBoundingClientRect();
      const {left: inputFormLeft, top: inputFormTop} = tableCellInputFormElement.getBoundingClientRect();
      const buttonHeight = tableCellInputFormLocateCellElement.offsetHeight;
      tableScrollContainer.scrollTop += targetTop - inputFormTop - buttonHeight;
      tableScrollContainer.scrollLeft += targetLeft - inputFormLeft;
    });
  }
}
tableCellInputFormLocateCellElement.addEventListener("click", function(event: MouseEvent) {
  restoreTableCellInputFormLocation();
  event.stopPropagation();
}, true);

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
function activateTableCellInputForm(targetHTMLTableCellElement: HTMLTableCellElement) {
  // show the form
  tableCellInputFormElement.classList.add(activeClass);

  // focus the input
  tableCellInputFormInputElement.focus({preventScroll: true});

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
 * Use this function to change the editor associated table cell.
 */
function tableCellInputFormAssignTarget(targetHTMLTableCellElement: HTMLTableCellElement, input?: string) {
  deactivateTableCellInputForm();
  deactivateTableCellInputFormLocation();
  removeSelect(tableCellInputFormAutocompleteSuggestionsSelectInfo);
  removeSelect(tableCellInputFormEditSuggestionsSelectInfo);

  if (targetHTMLTableCellElement) {
    if (!isTableCellEditable(targetHTMLTableCellElement)) {
      return;
    }

    activateTableCellInputForm(targetHTMLTableCellElement);
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
function activateTableData() {
  activeTableCellElement.classList.add(activeClass);
  updateActiveTimestamp();
  activeTableCellElement.focus();
}
function activateTableHead() {
  const index = activeTableCellElement.cellIndex;
  if (isColumnLabel(activeTableCellElement)) {
    const columnSearch = getColumnSearch(index);
    columnSearch.classList.add(activeAccompanyClass);
  } else if (isColumnSearch(activeTableCellElement)) {
    const columnLabel = getColumnLabel(index);
    columnLabel.classList.add(activeAccompanyClass);
  }
  activeTableCellElement.classList.add(activeClass);
  activeTableCellElement.focus();
}
function activateTableCol() {
  const index = activeTableCellElement.cellIndex;
  const tableColElement = getTableColElement(index);
  if (tableColElement) {
    activeTableColElement = tableColElement;
    activeTableColElement.classList.add(activeClass);
  }
}
function activateTableCellElement(tableCellElement: HTMLTableCellElement) {
  activeTableCellElement = tableCellElement;
  if (isTableData(tableCellElement)) {
    activateTableData();
    // record whether this table cell is editable
    isTableCellEditable(tableCellElement);
  } else if (isTableHead(tableCellElement)) {
    activateTableHead();
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
  event.stopPropagation();
}
let lastSortButtonClicked: HTMLButtonElement;
function tableCellSortButtonOnClick(buttonElement: HTMLButtonElement, event: MouseEvent) {
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
  const dataElements = getDataElementsFromDataSections(tableDataSectionsRendered);
  if (buttonElement.classList.contains(clickClass)) {
    if (buttonElement.classList.contains(descendingClass)) {
      // ascending sort
      buttonElement.classList.remove(descendingClass);
      const comparator = constructTableRowComparator(columnIndex, (text1, text2) => text1.localeCompare(text2));
      reinitializeTableDataScrollManagerBySorting(comparator, dataElements);
    } else {
      // descending sort
      buttonElement.classList.add(descendingClass);
      const comparator = constructTableRowComparator(columnIndex, (text1, text2) => text2.localeCompare(text1));
      reinitializeTableDataScrollManagerBySorting(comparator, dataElements);
    }
  } else {
    // ascending sort
    buttonElement.classList.add(clickClass);
    const comparator = constructTableRowComparator(columnIndex, (text1, text2) => text1.localeCompare(text2));
    reinitializeTableDataScrollManagerBySorting(comparator, dataElements);
  }

  event.stopPropagation();
}
tableElement.addEventListener("click", function(event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnClick(target as HTMLTableCellElement, event);
  } else if (isTableCellSortButton(target)) {
    tableCellSortButtonOnClick(target as HTMLButtonElement, event);
  }
}, true);


tableCellInputFormInputSaveButtonElement.addEventListener("click", function() {
   quitTableCellInputForm(true);
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
function copyElementTextToTextarea(tableCellElement: HTMLTableCellElement) {
  clipboardTextarea.value = tableCellElement.textContent;
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
      // copy single table cell
      copyElementTextToTextarea(tableCellElement);
      elementToHighlight = tableCellElement;
      recordCopyCell(tableCellElement);
    }

    copyTextareaToClipboard();
    makeElementCopyTarget(elementToHighlight);
    event.consumed = true;
  }
  // ignore when only C is pressed
}

function tableDataElementOnInput(tableDataElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  const input = event.key;
  if (input.length === 1) {
    tableCellInputFormAssignTarget(tableDataElement, input);
  } else {
    tableCellInputFormAssignTarget(tableDataElement);
  }
  event.consumed = true;
}
let columnSearchFilteringTimeoutId: number | null = null;
function tableColumnSearchElementOnInput(tableColumnSearchInputElement: HTMLInputElement, tableColumnSearchElement: HTMLTableCellElement, event: Event) {
  const query = tableColumnSearchInputElement.value;
  updateTableColumnSearchQuery(tableColumnSearchElement.cellIndex, query);
  if (columnSearchFilteringTimeoutId) {
    window.clearTimeout(columnSearchFilteringTimeoutId);
  }
  columnSearchFilteringTimeoutId = window.setTimeout(filterTableDataSectionsByQueries, 400); // sw - 400ms is the default value used in old Vaadin 8 version
}
function filterTableDataSectionsByQueries() {
  if (tableColumnSearchQueries.size === 0) {
    // restore to all data elements
    if (activeComparator) {
      reinitializeTableDataScrollManagerBySorting(activeComparator, tableDataElements);
    } else {
      initializeTableDataScrollManager(defaultDataSections, true, false);
    }
  } else {
    const filterFunction = constructTableRowFilter(tableColumnSearchQueries);
    reinitializeTableDataScrollManagerByFiltering(filterFunction, tableDataElements);
  }
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
    updateTableColumnSearchQuery(tableColumnSearchElement.cellIndex, columnSearchInput.value);
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

  event.preventDefault();
  event.stopPropagation();
}
tableElement.addEventListener("keydown", function(event: KeyboardEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnKeyDown(target as HTMLTableCellElement, event);
  } else if (isInput(target)) {
    // inputing on column search
    const columnSearch = target.closest("th.column-search");
    if (columnSearch) {
      const tableColumnSearchElement: HTMLTableCellElement = columnSearch as HTMLTableCellElement;
      tableColumnSearchElementOnKeyDown(tableColumnSearchElement, event);
    }
  }
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
}, true);

tableElement.addEventListener("input", function(event: Event) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isInput(target)) {
    // inputing on column search
    const columnSearch = target.closest("th.column-search");
    if (columnSearch) {
      const tableColumnSearchElement: HTMLTableCellElement = columnSearch as HTMLTableCellElement;
      tableColumnSearchElementOnInput(target as HTMLInputElement, tableColumnSearchElement, event);
    }
  }
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
});
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
});
tableElement.addEventListener("mouseup", tableHeadOnMouseUp);

/* scroll event */
let scrollTimeoutId: number | null = null;
let shouldRerenderDataSectionsWhenScrollFinished: boolean = false;
function whenScrollFinished() {
  tableCellInputFormLocationOnScroll(event);

  const scrollAmount = tableScrollContainer.scrollTop;
  if (shouldRerenderDataSectionsWhenScrollFinished && shouldScrollAmountTriggerRerenderDataSections(scrollAmount)) {
    shouldRerenderDataSectionsWhenScrollFinished = false;
    scrollToDataRowByScrollAmount(scrollAmount);

    topFillerObserver.observe(dataSectionFillerTop);
    bottomFillerObserver.observe(dataSectionFillerBottom);
  }
}
function tableCellInputFormLocationOnScroll(event: Event) {
  activateTableCellInputFormLocation();
}
tableScrollContainer.addEventListener("scroll", function(event: Event) {
  if (scrollTimeoutId) {
    window.clearTimeout(scrollTimeoutId);
  }
  scrollTimeoutId = window.setTimeout(whenScrollFinished, 40);
}, true);

/* submit event */
tableCellInputFormElement.addEventListener("submit", function(event: Event) {
  // disable submitting
  event.preventDefault();
  return false;
});

/* input event */
tableCellInputFormInputElement.addEventListener("input", function() {
  const query = tableCellInputFormInputElement.value;
  filterSelectOptions(query, tableCellInputFormAutocompleteSuggestionsSelectInfo);
});


// Dynamic loading of table data
let tableDataSections: Array<HTMLTemplateElement> | HTMLCollection;
let tableDataElements: Array<HTMLElement>;

/* load node from template */
const sidToTemplate: Map<string, HTMLTemplateElement> = new Map();
const sidToTemplateIndex: Map<string, number> = new Map();
function transformDataSectionToNode(template: HTMLTemplateElement, templateIndex: number, sid?: string) {
  if (!sid) {
    sid = (template.content.firstElementChild as HTMLElement).dataset.sid;
    if (!sid) {
      sid = uuidv4();

      for (const child of template.content.children) {
        (child as HTMLElement).dataset.sid = sid.toString();
      }
    }
  }

  sidToTemplate.set(sid, template);
  sidToTemplateIndex.set(sid, templateIndex);

  const node = template.content.cloneNode(true);
  return node;
}

function countMatchedElementsInDataSection(template: HTMLTemplateElement) {
  return getDataElementsFromDataSection(template).length;
}

/**
 * Counts how many elements match the selector in templates.
 *
 * @param {DOMString} [selector = 'tr'] - A DOMString containing one or more selectors to match. This string must be a valid CSS selector string
 * @param {boolean} [dataSectionHasSameStructure = true] - whether the data sections has the same structure so the number of elements matched for one section applies to the other sections. Specifying this element to true will decrease the computation cost.
 * @returns {number} How many matched elements are found among all templates.
 */
function countMatchedElementsInAllDataSections(selector = "tr", dataSectionHasSameStructure = true): number {
  const numDataSections = tableDataSections.length;
  if (!numDataSections) {
    return 0;
  }

  if (dataSectionHasSameStructure) {
    const template: HTMLTemplateElement = tableDataSections[0] as HTMLTemplateElement;
    return countMatchedElementsInDataSection(template) * numDataSections;
  }

  // count matched elements in every data section
  let numMatchedElements = 0;
  for (const tableDataSection of tableDataSections) {
    numMatchedElements += countMatchedElementsInDataSection((tableDataSection as HTMLTemplateElement));
  }
  return numMatchedElements;
}

function getDataSectionIndexByDataRowIndex(dataRowIndex: number) {
  return Math.floor(dataRowIndex / numTableRowsInDataSection);
}

function getSurroundingDataSectionIndexes(targetDataSectionIndex: number): Array<number> {
  const lastDataSectionIndex = tableDataSections.length - 1;
  const rightEndCapacity = lastDataSectionIndex - targetDataSectionIndex;
  const leftEndCapacity = targetDataSectionIndex;
  const shouldAllocateToLeftEndMore: boolean = leftEndCapacity > rightEndCapacity;

  let numDataSectionsNeeded = numDataSectionsToRender - 1;
  const numDataSectionsNeededSmallerEnd = Math.floor(numDataSectionsNeeded / 2);
  const numDataSectionsNeededLargerEnd = numDataSectionsNeeded - numDataSectionsNeededSmallerEnd;

  let leftEndAllocated, rightEndAllocated;
  if (shouldAllocateToLeftEndMore) {
    rightEndAllocated = Math.min(numDataSectionsNeededSmallerEnd, rightEndCapacity);
    numDataSectionsNeeded -= rightEndAllocated;
    leftEndAllocated = Math.min(numDataSectionsNeeded, leftEndCapacity);
  } else {
    leftEndAllocated = Math.min(numDataSectionsNeededSmallerEnd, leftEndCapacity);
    numDataSectionsNeeded -= leftEndAllocated;
    rightEndAllocated = Math.min(numDataSectionsNeeded, rightEndCapacity);
  }

  const leftEndIndex = targetDataSectionIndex - leftEndAllocated;
  const rightEndIndex = targetDataSectionIndex + rightEndAllocated;

  const sectionIndexes = [];
  for (let index = leftEndIndex; index <= rightEndIndex; index++) {
    sectionIndexes.push(index);
  }
  return sectionIndexes;
}

// scroll
/**
 * Gets the table row index of a rendered table data row using the first rendered table row as reference.
 *
 * @param {number} dataRowIndex - the row index of the table data in all data sections' rows.
 * @returns The calculated HTML table row index. Only valid if the data row is actually rendered.
 */
function translateFromDataRowIndexToTableRowIndex(dataRowIndex: number): number {
  const firstRenderedDataRowIndex = numTableRowsNotDisplayedAbove;
  const dataRowIndexDifference = dataRowIndex - firstRenderedDataRowIndex;

  const firstRenderedDataRowTableRowIndex = getFirstDataRowIndex();
  return firstRenderedDataRowTableRowIndex + dataRowIndexDifference;
}
function translateFromTableRowIndexToDataRowIndex(tableRowIndex: number): number {
  const firstRenderedDataRowTableRowIndex = getFirstDataRowIndex();
  const recordIndex = tableRowIndex - firstRenderedDataRowTableRowIndex;
  return translateFromRenderedRecordIndexToDataRowIndex(recordIndex);
}
function translateFromRenderedRecordIndexToDataRowIndex(recordIndex: number): number {
  const firstRenderedDataRowIndex = numTableRowsNotDisplayedAbove;
  return firstRenderedDataRowIndex + recordIndex;
}
function scrollToDataRowIndex(dataRowIndex: number, scrollIntoView: boolean = false, callback: (tableRow: HTMLTableRowElement) => void = () => undefined) {
  const dataSectionIndex = getDataSectionIndexByDataRowIndex(dataRowIndex);

  // determine whether the data section containing the data row is rendered
  let dataSectionRendered = false;
  let renderedTableDataSectionTemplateIndex;
  for (const renderedTableDataSection of tableDataSectionsRendered) {
    renderedTableDataSectionTemplateIndex = getDataSectionTemplateIndex(<HTMLElement> renderedTableDataSection);
    if (renderedTableDataSectionTemplateIndex === dataSectionIndex) {
      dataSectionRendered = true;
    }
  }

  // put data row in rendered data sections if not already
  if (!dataSectionRendered) {
    // replace current rendered data sections
    const dataSectionIndexesToRender = getSurroundingDataSectionIndexes(dataSectionIndex);
    const lastDataSectionIndexToRender = dataSectionIndexesToRender[dataSectionIndexesToRender.length - 1];
    const documentFragment = buildDocumentFragmentWithNonoverlappingDataSections(dataSectionIndexesToRender);
    // renderedTableDataSectionTemplateIndex will hold the last rendered data section template index
    // while lastDataSectionIndexToRender will hold the last data section to render
    const numDataSectionsShiftedAbove = lastDataSectionIndexToRender - renderedTableDataSectionTemplateIndex;
    renderDataSections(numDataSectionsShiftedAbove, documentFragment);
  }

  // scroll into view
  const rowIndex = translateFromDataRowIndexToTableRowIndex(dataRowIndex);
  const tableRow = tableRowElements[rowIndex] as HTMLTableRowElement;
  if (scrollIntoView) {
    tableRow.scrollIntoView(true);
  }

  if (callback) {
    callback(tableRow);
  }
}

function scrollToDataRowByScrollAmount(scrollAmount: number) {
  const firstTableRowOffsetTop = dataSectionFillerTop.offsetTop;
  // if the scroll amount has not exceeded the first table row element, for example, scroll to very top
  // consider as if scroll to first table row element
  const distanceFromFirstTableRow = Math.max(scrollAmount - firstTableRowOffsetTop, 0);
  let dataRowIndex = Math.floor(distanceFromFirstTableRow / tableRowHeight);
  dataRowIndex = Math.min(dataRowIndex, tableDataElements.length - 1);
  scrollToDataRowIndex(dataRowIndex, true);
}

/* render */
const tableDataSectionsRendered: HTMLCollection = tableElement.getElementsByTagName("tbody");
let numDataSectionsToRender: number;
function removeTableDataSectionsRendered() {
    Array.from(tableDataSectionsRendered).forEach(tableDataSectionRendered => tableDataSectionRendered.remove());
}
function initializeInitialRenderedDataSections() {
  for (let dataSectionIndex = 0; dataSectionIndex < numDataSectionsToRender; dataSectionIndex++) {
    const dataSection: HTMLTemplateElement = tableDataSections[dataSectionIndex] as HTMLTemplateElement;
    const dataSectionNode = transformDataSectionToNode(dataSection, dataSectionIndex);
    tableElement.insertBefore(dataSectionNode, dataSectionFillerBottom);
  }
}
function replaceRenderedDataSections(newDataSections: Array<Element>) {
  const numTableDataSectionsRendered = tableDataSectionsRendered.length;
  for (let whichSection = 0; whichSection < numTableDataSectionsRendered; whichSection++) {
    const replacedTableDataSection = tableDataSectionsRendered[whichSection];
    const tableDataSectionToReplace = newDataSections[whichSection];
    replacedTableDataSection.replaceWith(tableDataSectionToReplace);
  }
}
function saveRenderedDataSection(renderedTableDataSection: Element) {
    const sid = (renderedTableDataSection as HTMLElement).dataset.sid;
    const template = sidToTemplate.get(sid);
    template.content.replaceChild(renderedTableDataSection.cloneNode(true), template.content.firstElementChild);
}
function buildDocumentFragmentWithNonoverlappingDataSections(templateIndexes: Array<number>): DocumentFragment {
  // save rendered data sections
  for (const renderedTableSection of tableDataSectionsRendered) {
    saveRenderedDataSection(renderedTableSection);
  }

  // building new document fragment using new data sections
  const documentFragment: DocumentFragment = new DocumentFragment();
  for (const templateIndex of templateIndexes) {
    const tableSectionToRender = tableDataSections[templateIndex] as HTMLTemplateElement;
    const dataSectionNode = transformDataSectionToNode(tableSectionToRender, templateIndex);
    documentFragment.appendChild(dataSectionNode);
  }
  return documentFragment;
}
function buildDocumentFragmentWithNextDataSections(numNextSectionsToFetch: number): DocumentFragment {
  const documentFragment: DocumentFragment = new DocumentFragment();
  const numTableDataSectionsRendered = tableDataSectionsRendered.length;

  let whichSection: number;
  let renderedTableSection;
  for (whichSection = 0; whichSection < numNextSectionsToFetch; whichSection++) {
    // save state of first several rendered data sections
    renderedTableSection = tableDataSectionsRendered[whichSection];
    saveRenderedDataSection(renderedTableSection);
  }

  for (; whichSection < numTableDataSectionsRendered; whichSection++) {
    // copy rest of rendered data sections
    renderedTableSection = tableDataSectionsRendered[whichSection];
    documentFragment.appendChild(renderedTableSection.cloneNode(true));
  }

  const nextDataSectionTemplateIndex = getDataSectionTemplateIndex(renderedTableSection as HTMLElement) + 1;

  for (let templateIndex = nextDataSectionTemplateIndex; templateIndex < nextDataSectionTemplateIndex + numNextSectionsToFetch; templateIndex++) {
    // copying over new nodes
    const tableSectionToRender = tableDataSections[templateIndex] as HTMLTemplateElement;
    const dataSectionNode = transformDataSectionToNode(tableSectionToRender, templateIndex);
    documentFragment.appendChild(dataSectionNode);
  }
  return documentFragment;
}
function buildDocumentFragmentWithPreviousDataSections(numPreviousSectionsToFetch: number): DocumentFragment {
  const documentFragment: DocumentFragment = new DocumentFragment();

  let whichSection: number;
  let renderedTableSection;
  for (whichSection = numDataSectionsToRender - 1; whichSection > numDataSectionsToRender - numPreviousSectionsToFetch; whichSection--) {
    // save state of last several rendered data sections
    renderedTableSection = tableDataSectionsRendered[whichSection];
    saveRenderedDataSection(renderedTableSection);
  }

  for (; whichSection >= 0; whichSection--) {
    // copy rest of rendered data sections
    renderedTableSection = tableDataSectionsRendered[whichSection];
    documentFragment.prepend(renderedTableSection.cloneNode(true));
  }

  const previousDataSectionTemplateIndex = getDataSectionTemplateIndex(renderedTableSection as HTMLElement) - 1;
  for (let templateIndex = previousDataSectionTemplateIndex; templateIndex > previousDataSectionTemplateIndex - numPreviousSectionsToFetch; templateIndex--) {
    // copying over new nodes
    const tableSectionToRender = tableDataSections[templateIndex] as HTMLTemplateElement;
    const dataSectionNode = transformDataSectionToNode(tableSectionToRender, templateIndex);
    documentFragment.prepend(dataSectionNode);
  }

  return documentFragment;
}

/* filler */
let dataSectionFillerTop: HTMLTableRowElement;
let dataSectionFillerBottom: HTMLTableRowElement;
const dataSectionFillerClass = "filler-row";
const dataSectionTopFillerClass = "filler-row-top";
const dataSectionBottomFillerClass = "filler-row-bottom";

const numDataSectionsWillShift = 2;
let numTableRowsInDataSection: number;
let numTableRowsNotDisplayedAbove: number;
let numTableRowsNotDisplayedBelow: number;

function initializeDataSectionFillers() {
  dataSectionFillerTop = document.createElement("tr");
  dataSectionFillerTop.classList.add(dataSectionFillerClass, dataSectionTopFillerClass);
  tableElement.appendChild(dataSectionFillerTop);

  dataSectionFillerBottom = document.createElement("tr");
  dataSectionFillerBottom.classList.add(dataSectionFillerClass, dataSectionBottomFillerClass);
  tableElement.appendChild(dataSectionFillerBottom);

  // set up intersection observer for fillers
  topFillerObserver = new IntersectionObserver(fillerReachedHandler, {
    "root": tableScrollContainer,
    "rootMargin": "20% 0px",
    "threshold": 0
  });
  topFillerObserver.observe(dataSectionFillerTop);
  bottomFillerObserver = new IntersectionObserver(fillerReachedHandler, {
    "root": tableScrollContainer,
    "rootMargin": "20% 0px",
    "threshold": 0
  });
  bottomFillerObserver.observe(dataSectionFillerBottom);
}

function adjustDataSectionFillersHeight(numElementsNotDisplayedAbove: number, numElementsNotDisplayedBelow: number, elementHeight: number) {
  const fillerAboveHeight = `${numElementsNotDisplayedAbove * elementHeight}px`;
  dataSectionFillerTop.dataset.numElements = numElementsNotDisplayedAbove.toString();
  dataSectionFillerTop.style.height = fillerAboveHeight;

  const fillerBelowHeight = `${numElementsNotDisplayedBelow * elementHeight}px`;
  dataSectionFillerBottom.dataset.numElements = numElementsNotDisplayedBelow.toString();
  dataSectionFillerBottom.style.height = fillerBelowHeight;
}

function adjustDataSectionFillersHeightForShifting(numDataSectionsShiftedAbove: number) {
  // adjust filler height
  const numTableRowsShiftedAbove = numDataSectionsShiftedAbove * numTableRowsInDataSection;
  numTableRowsNotDisplayedAbove += numTableRowsShiftedAbove;
  numTableRowsNotDisplayedBelow -= numTableRowsShiftedAbove;
  adjustDataSectionFillersHeight(numTableRowsNotDisplayedAbove, numTableRowsNotDisplayedBelow, tableRowHeight);
}

/* intersection observer */
let scrollPosition: number;
let topSentinel: HTMLElement;
let bottomSentinel: HTMLElement;
let topSentinelObserver: IntersectionObserver;
let bottomSentinelObserver: IntersectionObserver;
let topFillerObserver: IntersectionObserver;
let bottomFillerObserver: IntersectionObserver;
function getTopSentinel(renderedDataSections = tableDataSectionsRendered): HTMLElement | null {
  const firstDataSection = renderedDataSections[0];
  if (!firstDataSection) {
    return null;
  }

  const matchedElements = getDataElementsFromDataSection(firstDataSection as HTMLTableSectionElement);
  return matchedElements[matchedElements.length - 1] as HTMLElement;
}
function getBottomSentinel(renderedDataSections = tableDataSectionsRendered): HTMLElement | null {
  const lastDataSection = renderedDataSections[renderedDataSections.length - 1];
  if (!lastDataSection) {
    return null;
  }

  const matchedElements = getDataElementsFromDataSection(lastDataSection as HTMLTableSectionElement);
  return matchedElements[0] as HTMLElement;
}
function activateSentinels(newTopSentinel = getTopSentinel(), newBottomSentinel = getBottomSentinel()) {
  topSentinel = newTopSentinel;
  bottomSentinel = newBottomSentinel;
  topSentinelObserver.observe(topSentinel);
  bottomSentinelObserver.observe(bottomSentinel);
}
function deactivateSentinels() {
  if (topSentinel) {
    topSentinelObserver.unobserve(topSentinel);
  }
  if (bottomSentinel) {
    bottomSentinelObserver.unobserve(bottomSentinel);
  }
  topSentinel = null;
  bottomSentinel = null;
}
/**
 * store current scroll position and report whether the scroll direction is going upward or downward
 */
function trackScrollDirection() {
  const lastScrollPosition = scrollPosition;
  scrollPosition = tableScrollContainer.scrollTop;
  return scrollPosition > lastScrollPosition ? "down": "up";
}
function shiftDataSections(numDataSectionsShiftedAbove: number) {
  const isScrollDown: boolean = numDataSectionsShiftedAbove >= 0;
  const numTableRowsRemainingInScrollDirection = isScrollDown? numTableRowsNotDisplayedBelow: numTableRowsNotDisplayedAbove;
  if (numTableRowsRemainingInScrollDirection === 0) {
    return;
  }

  const documentFragmentBuilder = isScrollDown? buildDocumentFragmentWithNextDataSections: buildDocumentFragmentWithPreviousDataSections;
  const documentFragment = documentFragmentBuilder(numDataSectionsWillShift);
  renderDataSections(numDataSectionsShiftedAbove, documentFragment);
}
function renderDataSections(numDataSectionsShiftedAbove: number, documentFragment: DocumentFragment) {
  deactivateSentinels();
  adjustDataSectionFillersHeightForShifting(numDataSectionsShiftedAbove);

  // new data sections rendered
  replaceRenderedDataSections(Array.from(documentFragment.children));

  // restore active states for new data sections
  restoreDataSectionsStates();

  activateSentinels();
}
function restoreDataSectionsStates() {
  const recoveredCopyTarget = tableElement.querySelector(`.${copiedClass}`) as HTMLTableCellElement;
  if (recoveredCopyTarget && copyTarget) {
     if (recoveredCopyTarget.id === copyTarget.id) {
      // the recovered copy target is still the copy target (now a clone of it)
       makeElementCopyTarget(recoveredCopyTarget);
     } else {
       // the recovered copy target is outdated, a new copy target has been chosen when scrolling away
       recoveredCopyTarget.classList.remove(copiedClass);
     }
  }

  for (const recoveredActiveElement of tableElement.querySelectorAll(`.${activeClass}`)) {
    if (!isTableData(recoveredActiveElement as HTMLElement)) {
      continue;
    }
    if (recoveredActiveElement.id === activeTableCellElement.id) {
      // the recovered active element is still the active element (now a clone of it)
      activateTableCellElement(recoveredActiveElement as HTMLTableCellElement);
      break;
    } else {
       // the recovered active element is outdated, a new active element has been chosen when scrolling away
      recoveredActiveElement.classList.remove(activeClass);
    }
  }

  const recoveredTableCellInputFormTargetElement = tableElement.querySelector(`.${inputtingClass}`);
  if (recoveredTableCellInputFormTargetElement && tableCellInputFormTargetElement) {
    if (recoveredTableCellInputFormTargetElement.id === tableCellInputFormTargetElement.id) {
      // the recovered inputting cell element is still the inputting cell element (now a clone of it)
      tableCellInputFormTargetElement = recoveredTableCellInputFormTargetElement as HTMLTableCellElement;
    } else {
       // the recovered inputting cell element is outdated, a new inputting cell element has been chosen when scrolling away
       recoveredTableCellInputFormTargetElement.classList.remove(inputtingClass);
    }
  }
}

/**
 * Determines whether a re-render of data sections should happen.
 *
 * It should happen if
 *   + the scrollAmount is positive
 *   + the scrollAmount is zero but there are elements not displayed (inside dataSectionFillerTop)
 *
 * @param {number} scrollAmount - a nonnegative number indicating how much the target is scrolled
 * @returns {boolean} whether a re-render of data sections is necessary
 */
function shouldScrollAmountTriggerRerenderDataSections(scrollAmount: number): boolean {
  return scrollAmount > 0 || numTableRowsNotDisplayedAbove > 0;

}

function fillerReachedHandler(entries: Array<IntersectionObserverEntry>) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (shouldScrollAmountTriggerRerenderDataSections) {
        shouldRerenderDataSectionsWhenScrollFinished = true;
      }
    }
  });
}
function topSentinelReachedHandler(entries: Array<IntersectionObserverEntry>) {
  const scrollDirection = trackScrollDirection();

  entries.forEach(entry => {
    if (entry.isIntersecting && scrollDirection === "up") {
      // the last element of the first data section is appearing into view
      shiftDataSections(-numDataSectionsWillShift);
    }
  });
}
function bottomSentinelReachedHandler(entries: Array<IntersectionObserverEntry>) {
  const scrollDirection = trackScrollDirection();

  entries.forEach(entry => {
    if (entry.isIntersecting && scrollDirection === "down") {
      // the first element of the last data section is appearing into view
      shiftDataSections(numDataSectionsWillShift);
    }
  });
}
function initializeIntersectionObserver(topSentinel: HTMLElement, bottomSentinel: HTMLElement) {
  topSentinelObserver = new IntersectionObserver(topSentinelReachedHandler, {
    "root": tableScrollContainer,
    "rootMargin": "20% 0px",
    "threshold": 0,
  });
  bottomSentinelObserver = new IntersectionObserver(bottomSentinelReachedHandler, {
    "root": tableScrollContainer,
    "rootMargin": "20% 0px",
    "threshold": 0
  });
  activateSentinels(topSentinel, bottomSentinel);
}

/* sorting */
function constructTableRowFilter(searchQueries: Map<number, RegExp>) {
  return (tableRow: HTMLTableRowElement) => {
    for (const [columnIndex, queryRegex] of searchQueries) {
      const tableRowCell: HTMLTableCellElement = getCellInTableRow(tableRow, columnIndex);
      if (tableRowCell === undefined) {
        return false;
      }
      const cellText: string = getTableDataText(tableRowCell);
      if (!queryRegex.test(cellText)) {
        return false;
      }
    }
    return true;
  };
}
function constructTableRowComparator(columnIndex: number, cellComparator: (cell1Text: string, cell2Text: string, tableCell1: HTMLTableCellElement, tableCell2: HTMLTableCellElement) => number) {
  return (tableRow1: HTMLTableRowElement, tableRow2: HTMLTableRowElement) => {
    const tableCell1 = getCellInTableRow(tableRow1, columnIndex);
    const tableCell2 = getCellInTableRow(tableRow2, columnIndex);
    const cell1Text = getTableDataText(tableCell1);
    const cell2Text = getTableDataText(tableCell2);
    return cellComparator(cell1Text, cell2Text, tableCell1, tableCell2);

  };
}
function sortDataElements(dataElements: Array<HTMLElement>, comparator: (el1: HTMLElement, el2: HTMLElement) => number) {
  dataElements.sort(comparator);
  return dataElements;
}
function packDataElements(dataElements: Array<HTMLElement>, numDataElementsInSection: number, filterFunction: (element: HTMLElement) => boolean = () => true): DocumentFragment | null {
  let numDataElementsIncluded = 0;
  const documentFragment = new DocumentFragment();
  let templateElement = document.createElement("template");
  let tableBodyElement = document.createElement("tbody");
  for (const dataElement of dataElements) {
    if (!filterFunction(dataElement)) {
      continue;
    }
    numDataElementsIncluded++;
    tableBodyElement.appendChild(dataElement.cloneNode(true));
    if (numDataElementsIncluded % numDataElementsInSection === 0) {
      // save current section
      templateElement.content.appendChild(tableBodyElement);
      documentFragment.append(templateElement);
      // use another data section
      templateElement = document.createElement("template");
      tableBodyElement = document.createElement("tbody");
    }
  }

  if (tableBodyElement.children.length > 0) {
    // save current section
    templateElement.content.appendChild(tableBodyElement);
    documentFragment.append(templateElement);
  }

  if (numDataElementsIncluded === 0) {
    return null;
  } else {
    return documentFragment;
  }
}


function clearTableDataScrollManager() {
  sidToTemplate.clear();
  sidToTemplateIndex.clear();

  numTableRowsInDataSection = countMatchedElementsInDataSection((tableDataSections[0]) as HTMLTemplateElement);
  numTableRowsNotDisplayedAbove = 0;
  numTableRowsNotDisplayedBelow = tableDataSections.length * numTableRowsInDataSection;
  adjustDataSectionFillersHeight(numTableRowsNotDisplayedAbove, numTableRowsNotDisplayedBelow, tableRowHeight);

  removeTableDataSectionsRendered();
  deactivateSentinels();
}
const numDataSectionsToEnableDataScrollManager: number = 4;
let isDataScrollManagerEnabled: boolean;
function initializeTableDataScrollManager(dataSections: Array<HTMLTemplateElement> | HTMLCollection, reinitialize=false, regenerateTableDataElements=true) {
  // set up variables
  tableDataSections = dataSections;
  if (regenerateTableDataElements) {
    tableDataElements = getDataElementsFromDataSections(dataSections);
  }

  if (tableDataSections.length > numDataSectionsToEnableDataScrollManager) {
    // there are enough data sections to enable scrolling
    numDataSectionsToRender = numDataSectionsToEnableDataScrollManager;
    isDataScrollManagerEnabled = true;
  } else {
    numDataSectionsToRender = tableDataSections.length;
    isDataScrollManagerEnabled = false;
  }

  // set up filler
  if (reinitialize) {
    clearTableDataScrollManager();
  } else {
    initializeDataSectionFillers();
  }

  numTableRowsInDataSection = countMatchedElementsInDataSection((tableDataSections[0] as HTMLTemplateElement));
  numTableRowsNotDisplayedAbove = 0;
  numTableRowsNotDisplayedBelow = (tableDataSections.length - numDataSectionsToRender) * numTableRowsInDataSection;

  scrollPosition = tableScrollContainer.scrollTop;

  adjustDataSectionFillersHeight(numTableRowsNotDisplayedAbove, numTableRowsNotDisplayedBelow, tableRowHeight);

  // set up initial data sections
  initializeInitialRenderedDataSections();

  if (isDataScrollManagerEnabled) {
    // set up intersection observer only when needed (enough data sections to scroll)
    initializeIntersectionObserver(getTopSentinel(), getBottomSentinel());
  }
}

let activeComparator: (el1: HTMLElement, el2: HTMLElement) => number | null;
function reinitializeTableDataScrollManagerBySorting(comparator: (el1: HTMLElement, el2: HTMLElement) => number, dataElements: Array<HTMLElement>) {
  activeComparator = comparator;
  sortDataElements(dataElements, comparator);
  const documentFragment = packDataElements(dataElements, numTableRowsInDataSection);
  if (documentFragment === null) {
    clearTableDataScrollManager();
  } else {
    const dataSections = documentFragment.children;
    initializeTableDataScrollManager(dataSections, true, false);
  }
}

function reinitializeTableDataScrollManagerByFiltering(filterFunction: (element: HTMLElement) => boolean, dataElements: Array<HTMLElement>) {
  const documentFragment = packDataElements(dataElements, numTableRowsInDataSection, filterFunction);
  if (documentFragment === null) {
    clearTableDataScrollManager();
  } else {
    const dataSections = documentFragment.children;
    initializeTableDataScrollManager(dataSections, true, false);
  }
}



const defaultDataSections: HTMLCollection = document.getElementById("table-data").children;
initializeTableDataScrollManager(defaultDataSections, false);
