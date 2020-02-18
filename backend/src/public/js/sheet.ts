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
let lastCopiedTableCellElement: null | HTMLTableCellElement | HTMLTableColElement = null;

// DOM Elements
const tableElement: HTMLTableElement = document.getElementById("table") as HTMLTableElement;
const tableScrollContainer: HTMLElement = tableElement.parentElement;

/* <thead> */
const tableHeadElement: HTMLTableSectionElement = tableElement.tHead;
/* <tr>s */
const tableRowElements: HTMLCollection = tableElement.rows;
/* first table row: column labels */
const columnLabelsRowIndex: number = 0;
const tableColumnLabels: HTMLTableRowElement = tableRowElements[columnLabelsRowIndex] as HTMLTableRowElement;
/* first table row: column labels */
const columnSearchRowIndex = 1;
const tableColumnSearchs: HTMLTableRowElement = tableRowElements[columnSearchRowIndex] as HTMLTableRowElement;

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
  return element.tagName === "TD";
}
function isTableHead(element: HTMLElement): boolean {
  return element.tagName === "TH";
}
function isTableCell(element: HTMLElement): boolean {
  const tagName = element.tagName;
  return tagName === "TD" || tagName === "TH";
}
function isTableCellSortButton(element: HTMLElement): boolean {
  return element.classList.contains("sort-btn");
}
function isInput(element: HTMLElement): boolean {
  return element.tagName === "INPUT";
}
function isColumnLabel(element: HTMLElement): boolean {
  return element.classList.contains("column-label");
}
function isColumnSearch(element: HTMLElement): boolean {
  return element.classList.contains("column-search");
}
function isColumnSearchInput(element: HTMLElement): boolean {
  return false;
}

function isTableCellEditable(tableCellElement: HTMLTableCellElement) {
  if (tableCellElement.contentEditable === "false") {
    return false;
  }
  const columnLabel = getColumnLabel(tableCellElement.cellIndex);
  const columnLabelText = getColumnLabelText(columnLabel);
  if (columnLabelText === "Last_Updated_By" || columnLabelText === "Last_Updated") {
    tableCellElement.contentEditable = "false";
    return false;
  }

  return true;
}

// getters
function getRowIndex(tableCellElement: HTMLTableCellElement): number {
  // since we have both column label and column search
  const tableRow: HTMLTableRowElement = tableCellElement.parentElement as HTMLTableRowElement;
  return tableRow.rowIndex - 1;
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
  const rowIndex = tableRowElement.rowIndex;
  return tableRowElements[rowIndex - 1] as HTMLTableRowElement;
}
function getDownTableRow(tableRowElement: HTMLTableRowElement): HTMLTableRowElement | undefined {
  const rowIndex = tableRowElement.rowIndex;
  return tableRowElements[rowIndex + 1] as HTMLTableRowElement;
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
  const topTableRow = getTopTableRow(tableCellElement.parentElement as HTMLTableRowElement);
  if (!topTableRow) {
    return null;
  }
  return getCellInTableRow(topTableRow, cellIndex);
}
function getDownTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  const cellIndex = tableCellElement.cellIndex;
  const downTableRow = getDownTableRow(tableCellElement.parentElement as HTMLTableRowElement);
  if (!downTableRow) {
    return null;
  }
  return getCellInTableRow(downTableRow, cellIndex);
}
function getTableDataText(tableCellElement: HTMLTableCellElement) {
  return tableCellElement.textContent;
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
const inputingClass = "inputing";
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

let tableCellInputFormSelectInfo: SelectInfo | null = null;

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
  if (!tableCellInputFormLocationActive) {
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
  const rowIndex = getRowIndex(targetHTMLTableCellElement);
  tableCellInputFormLocateCellRowElement.textContent = `${rowIndex}`;
  // column index
  const colIndex = getColumnIndex(targetHTMLTableCellElement);
  const columnLabelText = getColumnLabelText(getColumnLabel(colIndex - 1));
  tableCellInputFormLocateCellColElement.textContent = columnLabelText;
}
function restoreTableCellInputFormLocation() {
  if (tableCellInputFormLocationActive && tableCellInputFormTargetElement) {
    const {left: targetLeft, bottom: targetBottom} = tableCellInputFormTargetElement.getBoundingClientRect();
    const {left: inputFormLeft, bottom: inputFormBottom} = tableCellInputFormElement.getBoundingClientRect();
    tableScrollContainer.scrollTop += targetBottom - inputFormBottom;
    tableScrollContainer.scrollLeft += targetLeft - inputFormLeft;
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
      columnLabel.classList.remove(inputingClass);
    }

    // unhighlight the target cell
    tableCellInputFormTargetElement.classList.remove(inputingClass);
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
    columnLabel.classList.add(inputingClass);
  }

  // highlight the target cell
  tableCellInputFormTargetElement = targetHTMLTableCellElement;
  tableCellInputFormTargetElement.classList.add(inputingClass);
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

function getIdUniqueID(tableCellElement: HTMLTableCellElement): number {
  const tableRow: HTMLTableRowElement = tableCellElement.parentElement as HTMLTableRowElement;
  return Number.parseInt(tableRow.id);
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
// input form suggestions
interface Suggestion {
  suggestion: string;
  confidence: number;
}
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
function storeSuggestionInLocalStorage(columnLabelText: string, suggestions: Array<Suggestion>) {
  window.localStorage.setItem(columnLabelText, JSON.stringify(suggestions));
}
function restoreSuggestionsFromLocalStorage(columnLabelText: string): Array<Suggestion> {
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
async function fetchSuggestions(columnLabel: HTMLTableCellElement): Promise<Array<Suggestion>> {
  const idSuggestionType: number | null = getIdSuggestionType(columnLabel);
  try {
    const response = await fetch(`/suggestions?idSuggestionType=${idSuggestionType}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Network error when fetching suggestions", error);
  }
}
/**
 * If last fetched suggestions are still valid, gets suggestions from local storage.
 * Otherwise, fetch suggestions from database and store the fetched suggestions in local storage.
 *
 * @async
 * @param {HTMLTableCellElement} columnLabel - The column label of the table cell we are fetching suggestions for.
 * @returns {Promise<Array<Suggestion>>} A promise which resolves to an array of Suggestion objects.

 */
async function getSuggestions(columnLabel: HTMLTableCellElement): Promise<Array<Suggestion>> {
  const columnLabelText = getColumnLabelText(columnLabel);
  const timestampKey: string = getSuggestionTimestampKey(columnLabelText);
  const storedTimestamp: number | null = restoreTimestampFromLocalStorage(timestampKey);
  if (storedTimestamp === null || shouldSuggestionsInLocalStorageExpire(storedTimestamp)) {
    // fetch new suggestions
    const suggestions: Array<Suggestion> = await fetchSuggestions(columnLabel);

    storeTimestampInLocalStorage(timestampKey);
    storeSuggestionInLocalStorage(columnLabelText, suggestions);
    return suggestions;
  } else {
    // reuse suggestions in local storage
    return restoreSuggestionsFromLocalStorage(columnLabelText);
  }
}
async function attachSuggestions(columnLabel: HTMLTableCellElement) {
  const userConfig = {
    nameKey: "suggestion",
  };

  const columnLabelText = getColumnLabelText(columnLabel);
  const suggestions = await getSuggestions(columnLabel);
  if (suggestions) {
    tableCellInputFormSelectInfo = createSelect(columnLabelText, tableCellInputFormInputElement, tableCellInputFormInputContainer, suggestions, userConfig);
    // resize form editor
    updateTableCellInputFormWidthToFitText(tableCellInputFormSelectInfo.longestText);
  }
}

/**
 * Use this function to change the editor associated table cell.
 */
function tableCellInputFormAssignTarget(targetHTMLTableCellElement: HTMLTableCellElement, input?: string) {
  deactivateTableCellInputForm();
  deactivateTableCellInputFormLocation();
  removeSelect(tableCellInputFormSelectInfo);

  if (targetHTMLTableCellElement) {
    if (!isTableCellEditable(targetHTMLTableCellElement)) {
      return;
    }

    activateTableCellInputForm(targetHTMLTableCellElement);
    updateTableCellInputFormInput(targetHTMLTableCellElement, input);
    const columnLabel = getColumnLabel(targetHTMLTableCellElement.cellIndex);
    attachSuggestions(columnLabel);

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
  const slack = 24;
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

  const columnIndex = (<HTMLTableCellElement> buttonElement.parentElement).cellIndex;
  // '' => 'clicked' => 'clicked desc' => 'clicked'
  if (buttonElement.classList.contains(clickClass)) {
    if (buttonElement.classList.contains(descendingClass)) {
      // ascending sort
      buttonElement.classList.remove(descendingClass);
      const comparator = constructTableRowComparator(columnIndex, (text1, text2) => text1.localeCompare(text2));
      reinitializeTableDataScrollManagerBySorting(comparator);
    } else {
      // descending sort
      buttonElement.classList.add(descendingClass);
      const comparator = constructTableRowComparator(columnIndex, (text1, text2) => text2.localeCompare(text1));
      reinitializeTableDataScrollManagerBySorting(comparator);
    }
  } else {
    // ascending sort
    buttonElement.classList.add(clickClass);
    const comparator = constructTableRowComparator(columnIndex, (text1, text2) => text1.localeCompare(text2));
    reinitializeTableDataScrollManagerBySorting(comparator);
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
  const textareaTemplate = document.createElement("template");
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
function unhighlightCopiedElement() {
  if (lastCopiedTableCellElement) {
    lastCopiedTableCellElement.classList.remove(copiedClass);
    lastCopiedTableCellElement = null;
  }
}
function highlightCopiedElement(element: HTMLTableCellElement | HTMLTableColElement) {
  lastCopiedTableCellElement = element;
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
    unhighlightCopiedElement();
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
    highlightCopiedElement(elementToHighlight);
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
function tableColumnSearchElementOnInput(tableColumnSearchElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  // focus on the input
  const columnSearchInput: HTMLInputElement = getColumnSearchInput(tableColumnSearchElement);
  const activeElement = document.activeElement;
  if (activeElement !== columnSearchInput) {
    // give focus to the column search input
    columnSearchInput.focus();
    // update the text
    columnSearchInput.value = event.key;
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
      tableColumnSearchElementOnInput(tableColumnSearchElement, event);
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
function tableCellInputFormLocationOnScroll(event: Event) {
  activateTableCellInputFormLocation();
}
tableScrollContainer.addEventListener("scroll", function(event: Event) {
  tableCellInputFormLocationOnScroll(event);
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
  filterSelectOptions(query, tableCellInputFormSelectInfo);
});


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
    .catch(error => console.error("Network error when posting edit", error));

}

function recordEdit(tableCellElement: HTMLTableCellElement) {
  // supply enough fields to update database entry for table cell

  recordInteraction("/edit", {
    "idUniqueID": getIdUniqueID(tableCellElement),
    "idSuggestion": getIdSuggestion(tableCellElement),
    "value": tableCellElement.textContent,
  });
}
function recordClickOnCell(tableCellElement: HTMLTableCellElement) {
  if (isTableData(tableCellElement)) {
    // only record click on table data now
    const tableRow: HTMLTableRowElement = tableCellElement.parentElement as HTMLTableRowElement;
    const rowValues = getTableRowCellValues(tableRow);

    const idSuggestion = getIdSuggestion(tableCellElement);
    recordInteraction("/click", {idSuggestion, rowValues});
  }
}
function recordDoubleClickOnCell(tableCellElement: HTMLTableCellElement) {
    const tableRow: HTMLTableRowElement = tableCellElement.parentElement as HTMLTableRowElement;
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

// Dynamic loading of table data
function uuidv4(): string {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

let tableDataSections: Array<HTMLTemplateElement> | HTMLCollection;
let tableDataElements: Array<HTMLElement>;

/* load node from template */
const sidToTemplate: Map<string, HTMLTemplateElement> = new Map();
const sidToTemplateIndex: Map<string, number> = new Map();
function transformDataSectionToNode(template: HTMLTemplateElement, templateIndex: number, sid?: string) {
  if (!sid) {
    sid = (<HTMLElement> template.content.firstElementChild).dataset.sid;
    if (!sid) {
      sid = uuidv4();

      for (const child of template.content.children) {
        (<HTMLElement> child).dataset.sid = sid.toString();
      }
    }
  }

  sidToTemplate.set(sid, template);
  sidToTemplateIndex.set(sid, templateIndex);

  const node = template.content.cloneNode(true);
  return node;
}
function getDataSectionTemplateIndex(dataSection: HTMLElement): number {
  const dataSectionSid = dataSection.dataset.sid;
  return sidToTemplateIndex.get(dataSectionSid);
}

function countMatchedElementsInDataSection(template: HTMLTemplateElement, selector = "tr") {
  return template.content.querySelectorAll(selector).length;
}

function getDataElementsFromDataSections(dataSections: HTMLCollection | Array<HTMLTemplateElement>, selector="tr"): Array<HTMLElement> {
  const dataElements = [];
  for (const dataSection of dataSections) {
    dataElements.push(...(<HTMLTemplateElement> dataSection).content.querySelectorAll(selector));
  }
  return dataElements as Array<HTMLElement>;
}

/**
 * Counts how many elements match the selector in templates.
 *
 * @param {DOMString} [selector = 'tr'] - A DOMString containing one or more selectors to match. This string must be a valid CSS selector string
 * @param {boolean} [dataSectonHasSameStructure = true] - whether the data sections has the same structure so the number of elements matched for one section applies to the other sections. Specifying this element to true will decrease the computation cost.
 * @returns {number} How many matched elements are found among all templates.
 */
function countMatchedElementsInAllDataSections(selector = "tr", dataSectonHasSameStructure = true): number {
  const numDataSections = tableDataSections.length;
  if (!numDataSections) {
    return 0;
  }

  if (dataSectonHasSameStructure) {
    const template: HTMLTemplateElement = tableDataSections[0] as HTMLTemplateElement;
    return countMatchedElementsInDataSection(template) * numDataSections;
  }

  // count matched elements in every data section
  let numMatchedElements = 0;
  for (const tableDataSection of tableDataSections) {
    numMatchedElements += countMatchedElementsInDataSection((<HTMLTemplateElement> tableDataSection));
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

  const firstRenderedDataRowTableRowIndex = dataSectionFillerTop.rowIndex + 1;
  return firstRenderedDataRowTableRowIndex + dataRowIndexDifference;
}
function scrollToDataRowIndex(dataRowIndex: number, callback: (tableRow: HTMLTableRowElement) => void) {
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
  tableRow.scrollIntoView();

  if (callback) {
    callback(tableRow);
  }
}

/* render */
const tableDataSectionsRendered: HTMLCollection = tableElement.getElementsByTagName("tbody");
let numDataSectionsToRender: number;
function removeRenderedDataSection(idx: number) {
  const dataSection = tableDataSectionsRendered[idx];
  if (dataSection) {
    dataSection.remove();
  }
}
function removeFirstRenderedDataSection() {
  removeRenderedDataSection(0);
}
function removeLastRenderedDataSection() {
  removeRenderedDataSection(tableDataSections.length - 1);
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
    const sid = (<HTMLElement> renderedTableDataSection).dataset.sid;
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
  const numTableDataSectionsRendered = tableDataSectionsRendered.length;

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
function getTopSentinel(renderedDataSections = tableDataSectionsRendered, selector = "tr"): HTMLElement | null {
  const firstDataSection = renderedDataSections[0];
  if (!firstDataSection) {
    return null;
  }

  const matchedElements = firstDataSection.querySelectorAll(selector);
  return matchedElements[matchedElements.length - 1] as HTMLElement;
}
function getBottomSentinel(renderedDataSections = tableDataSectionsRendered, selector = "tr"): HTMLElement | null {
  const lastDataSection = renderedDataSections[renderedDataSections.length - 1];
  if (!lastDataSection) {
    return null;
  }

  const matchedElements = lastDataSection.querySelectorAll(selector);
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
  replaceRenderedDataSections(Array.from(documentFragment.children));
  activateSentinels();
}

function topSentinelReachedHandler(entries: Array<IntersectionObserverEntry>, observer: IntersectionObserver) {
  const scrollDirection = trackScrollDirection();

  entries.forEach(entry => {
    if (entry.isIntersecting && scrollDirection === "up") {
      // the last element of the first data section is appearing into view
      shiftDataSections(-numDataSectionsWillShift);
    }
  });
}
function bottomSentinelReachedHandler(entries: Array<IntersectionObserverEntry>, observer: IntersectionObserver) {
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
  // const dataElements = [];
  // for (const dataSection of dataSections) {
  //   dataElements.push((<HTMLTemplateElement> dataSection.cloneNode(true)).content.querySelectorAll(selector));
  // }
  dataElements.sort(comparator);
  return dataElements;
}
function packDataElements(dataElements: Array<HTMLElement>, numDataElementsInSection: number): DocumentFragment {
  const documentFragment = new DocumentFragment();
  const numDataElements = dataElements.length;

  let i = 0;
  while (i < numDataElements) {
    const nextPackStartIndex = Math.min(numDataElements, i + numDataElementsInSection);
    const templateElement = document.createElement("template");
    const tableBodyElement = document.createElement("tbody");
    for (; i < nextPackStartIndex; i++) {
      tableBodyElement.appendChild(dataElements[i]);
    }
    templateElement.content.appendChild(tableBodyElement);
    documentFragment.append(templateElement);
  }

  return documentFragment;
}

function reinitializeTableDataScrollManagerBySorting(comparator: (el1: HTMLElement, el2: HTMLElement) => number) {
  sortDataElements(tableDataElements, comparator);
  const documentFragment = packDataElements(tableDataElements, numTableRowsInDataSection);
  const dataSections = documentFragment.children;
  initializeTableDataScrollManager(dataSections, true);
}

function resetTableDataScrollManager(reinitialize=true) {
  initializeTableDataScrollManager(document.getElementById("table-data").children, reinitialize);
}

function initializeTableDataScrollManager(dataSections: Array<HTMLTemplateElement> | HTMLCollection, reinitialize=false) {
  // set up variables
  tableDataSections = dataSections;
  tableDataElements = getDataElementsFromDataSections(dataSections);
  sidToTemplate.clear();
  sidToTemplateIndex.clear();

  numDataSectionsToRender = Math.min(4, tableDataSections.length);

  numTableRowsInDataSection = countMatchedElementsInDataSection((<HTMLTemplateElement> tableDataSections[0]));
  numTableRowsNotDisplayedAbove = 0;
  numTableRowsNotDisplayedBelow = (tableDataSections.length - numDataSectionsToRender) * numTableRowsInDataSection;

  scrollPosition =  tableScrollContainer.scrollTop;
  // set up filler
  if (!reinitialize) {
    initializeDataSectionFillers();
  }
  adjustDataSectionFillersHeight(0, numTableRowsNotDisplayedBelow, tableRowHeight);

  // set up initial data sections
  if (reinitialize) {
    // remove previous bound table data sections
    Array.from(tableDataSectionsRendered).forEach(tableDataSectionRendered => tableDataSectionRendered.remove());
  }
  initializeInitialRenderedDataSections();

  // set up intersection observer
  if (reinitialize) {
    deactivateSentinels();
  }
  initializeIntersectionObserver(getTopSentinel(), getBottomSentinel());
}

resetTableDataScrollManager(false);