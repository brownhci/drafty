/* eslint-disable quotes */
import { recordCellClick, recordCellDoubleClick } from './modules/api/record-interactions';
import { activeClass, activeAccompanyClass } from './modules/constants/css-classes';
import './modules/components/welcome-screen';
import './modules/components/sheet/navbar';
import './modules/components/sheet/comments/';
import './modules/components/sheet/databaits';
import './modules/components/sheet/helpus';
import './modules/components/sheet/delete-row';
import { tableHeadOnMouseDown, tableHeadOnMouseMove } from './modules/components/sheet/resize-column';
import { activateSortPanel, deactivateSortPanel, tableCellSortButtonOnClick } from './modules/components/sheet/column-sort-panel';
import { cellEditor } from './modules/components/sheet/cell-editor-fuzzy';
import './modules/components/sheet/column-search';
import { columnSuggestions } from './modules/components/sheet/column-suggestions';
import { activateColumnLabelContextMenu, activateTableDataContextMenu, deactivateColumnLabelContextMenu, deactivateTableDataContextMenu } from './modules/components/sheet/contextmenu';
import { tableCellElementOnCopyKeyPressed, tableCellElementOnPasteKeyPressed } from './modules/components/sheet/copy-paste';
import { StatusMode, tableFoot } from './modules/components/sheet/table-foot';
import { TabularView } from './modules/components/sheet/tabular-view';
import { getLeftTableCellElement, getRightTableCellElement, getUpTableCellElement, getDownTableCellElement } from './modules/dom/navigate';
import { tableElement, tableHeadTopRowElement, tableBodyElement, getColumnLabel, getTableDataText, isColumnLabelSortButton, isColumnLabel, isColumnSearch, isTableCellEditable, getColumnSearch, getTableColElement, checkUrlForSearchParams } from './modules/dom/sheet';
import { isInput, isTableData, isTableHead, isTableCell, isColumnSearchInput } from './modules/dom/types';
import { cellEditNewRow } from './modules/components/sheet/cell-editor-new-row';
import { activateCommentIcon, activateCommentSection, changeCommentLabel } from './modules/components/sheet/comments/';
// import { getCommentsURL } from './modules/api/endpoints';

/* // testing function logic
const startTime = performance.now();

// your normal code that might take too long

const duration = performance.now() - startTime;
console.log(`someMethodIThinkMightBeSlow took ${duration}ms`);
*/

export const tableDataManager = new TabularView(document.getElementById('table-data'), tableBodyElement);

/* which table column is active: a table column is activated when associated head is clicked */
export let activeTableColElement: HTMLTableColElement = null;

/* this interface is used to detect double click (two clicks within short interval specified by {@link recentTimeLimit} */
interface ActiveHTMLTableCellElement extends HTMLTableCellElement {
  lastActiveTimestamp?: number;
}
const recentTimeLimit: number = 1000;

export const contributionTimeout: number = 2000;

export let activeTableCellElement: ActiveHTMLTableCellElement = null;
/* activate */

function activateCellEditor() {
  cellEditor.formInput = getTableDataText(activeTableCellElement).trim();
  cellEditor.activateForm(activeTableCellElement);
  activeTableCellElement.lastActiveTimestamp = null;
}

const editCaretId: string = 'edit-caret';
const editCaret: string = `
    <span id="${editCaretId}">
      <i class="fas fa-caret-square-down"></i>
    </span>
`;

function activateEditCaret() {
  activeTableCellElement.innerHTML += editCaret;
  const editCaretElement = document.getElementById(editCaretId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editCaretElement.addEventListener('click', (event: MouseEvent) => {
    activateCellEditor();
  });  
}
function deactivateEditCaret() {
  const editCaretElement = document.getElementById(editCaretId);
  if(editCaretElement) {
    editCaretElement.remove();
  }
}

// function activateCommentIndicator() {
//   const profNameElements: HTMLTableCellElement[] = getAllProfNameElements();
//   for (const e of profNameElements) {
//     const uniqueId = getIdUniqueID(e);
//     const commentIndicator = `<div id="comment-indicator-${uniqueId}" class="triangle-comments"/>`;
//     if (!isNaN(uniqueId)) fetch(getCommentsURL(uniqueId))
//       .then((response) => {
//         const contentType = response.headers.get('content-type');
//         if (!contentType || !contentType.includes('application/json')) {
//           throw new TypeError(`Oops, we did not get JSON!`);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         const commentIndicatorElement = document.getElementById('comment-indicator-' + uniqueId);
//         if (data.length !== 0 && !e.innerHTML.includes(commentIndicator)) {
//           e.innerHTML += commentIndicator;
//         }
//         commentIndicatorElement?.addEventListener('click', (event: MouseEvent) => {
//           activateCommentSection(uniqueId);
//           changeCommentLabel(e);
//         });
//       })
//       .catch((error) => console.error(error));
//   }
// }

/**
 * renew the timestamp on the active table cell element.
 */
function updateActiveTimestamp() {
  activeTableCellElement.lastActiveTimestamp = Date.now();
}
function activateTableData(shouldUpdateTimestamp = true, shouldGetFocus = true) {
  activeTableCellElement.classList.add(activeClass);
  if (shouldUpdateTimestamp) {
    updateActiveTimestamp();
  }
  if (shouldGetFocus) {
    activeTableCellElement.focus();
    activateEditCaret();
    if (activeTableCellElement.innerHTML.includes('comment-indicator'))  activateCommentSection();
    document.getElementById('comments')!.style.display === 'none' ? activateCommentIcon(): activateCommentSection();
    changeCommentLabel();
  }
}
function activateTableHead(shouldGetFocus = true) {
  const index = activeTableCellElement.cellIndex;
  if (isColumnLabel(activeTableCellElement)) {
    const columnSearch = getColumnSearch(index);
    columnSearch.classList.add(activeAccompanyClass);
    if (tableFoot.isInserting) {
      const tableFootCell = tableFoot.insertionTableRow.cells[index];
      tableFootCell.classList.add(activeAccompanyClass);
    }
  } else if (isColumnSearch(activeTableCellElement)) {
    const columnLabel = getColumnLabel(index);
    columnLabel.classList.add(activeAccompanyClass);
    if (tableFoot.isInserting) {
      const tableFootCell = tableFoot.insertionTableRow.cells[index];
      tableFootCell.classList.add(activeAccompanyClass);
    }
  } else if (activeTableCellElement.parentElement === tableFoot.insertionTableRow) {
    if (!tableFoot.isInserting) {
      return;
    }
    const columnSearch = getColumnSearch(index);
    columnSearch.classList.add(activeAccompanyClass);
    const columnLabel = getColumnLabel(index);
    columnLabel.classList.add(activeAccompanyClass);
  }

  activeTableCellElement.classList.add(activeClass);
  if (shouldGetFocus) {
    activeTableCellElement.focus({ preventScroll: true });
  }
}
export function activateTableCol() {
  const index = activeTableCellElement.cellIndex;
  const tableColElement = getTableColElement(index);
  if (tableColElement) {
    activeTableColElement = tableColElement;
    activeTableColElement.classList.add(activeClass);
  }
}
function activateTableCellElement(tableCellElement: HTMLTableCellElement, shouldUpdateTimestamp = true, shouldGetFocus = true) {
  activeTableCellElement = tableCellElement;
  if (isTableData(tableCellElement)) {
    activateTableData(shouldUpdateTimestamp, shouldGetFocus);
    // record whether this table cell is editable
    isTableCellEditable(tableCellElement);
  } else if (isTableHead(tableCellElement)) {
    activateTableHead(shouldGetFocus);
  }
}
/* deactivate */
function deactivateTableData() {
  deactivateEditCaret();
  activeTableCellElement.classList.remove(activeClass);
  activeTableCellElement.lastActiveTimestamp = null;
}
function deactivateTableHead() {
  const index = activeTableCellElement.cellIndex;
  const columnLabel = getColumnLabel(index);
  const columnSearch = getColumnSearch(index);
  const tableFootCell = tableFoot.insertionTableRow.cells[index];
  columnLabel.classList.remove(activeClass);
  columnSearch.classList.remove(activeClass);
  columnLabel.classList.remove(activeAccompanyClass);
  columnSearch.classList.remove(activeAccompanyClass);
  if (tableFootCell) {
    tableFootCell.classList.remove(activeClass);
    tableFootCell.classList.remove(activeAccompanyClass);
  }
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

function isClickOnActiveElement(tableCellElement: HTMLTableCellElement) {
  return tableCellElement === activeTableCellElement;
}
/**
 * Use this function to change table cell element to ensure previous active element is properly deactivated
 */
export function updateActiveTableCellElement(tableCellElement: HTMLTableCellElement, shouldGetFocus: boolean = true) {
  if (!tableCellElement) {
    return;
  }

  if (activeTableCellElement) {
    deactivateTableCellElement();
    deactivateSortPanel();
    // hide context menu
    deactivateTableDataContextMenu();
    deactivateColumnLabelContextMenu();
    // hide input form
    cellEditor.deactivateForm();
  }

  activateTableCellElement(tableCellElement, undefined, shouldGetFocus);
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

function activeTableHeadOnRepeatedClick() {
  if (activeTableColElement) {
    // table column is active, deactivate column and focus only on table head
    deactivateTableCol();
  } else {
    // only activate table column at repeated click (after even number of clicks)
    activateTableCol();
  }
}

function activeElementOnRepeatedClick() {
  if (!activeTableCellElement) {
    return;
  }
  if (isTableData(activeTableCellElement)) {
    if (isTableDataLastActivatedRecently()) {
      activateCellEditor();
      recordCellDoubleClick(activeTableCellElement);
    } else {
      updateActiveTimestamp();
    }
  } else if (isTableHead(activeTableCellElement)) {
    activeTableHeadOnRepeatedClick();
  }
}

function tableCellElementOnClick(tableCellElement: HTMLTableCellElement, event: MouseEvent) {
  if (tableCellElement.parentElement === tableFoot.statusTableRow) {
    // ignore click on status table row cell
    return;
  }

  if (isClickOnActiveElement(tableCellElement)) {
    // handle repeated click differently
    activeElementOnRepeatedClick();
  } else {
    updateActiveTableCellElement(tableCellElement);
    recordCellClick(tableCellElement);
  }
  event.preventDefault();
}

/* click event */
tableElement.addEventListener('click', function (event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnClick(target as HTMLTableCellElement, event);
  } else if (isColumnLabelSortButton(target)) {
    tableCellSortButtonOnClick(target as HTMLButtonElement);
    activateSortPanel(target);
  }
  // sw: this is stopping the click from bubbling up which hurts search
  //event.stopPropagation();
}, true);

tableElement.addEventListener('contextmenu', function (event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    if (isColumnLabel(target)) {
      updateActiveTableCellElement(target as HTMLTableCellElement);
      activateColumnLabelContextMenu(event);
      event.preventDefault();
    }
    if (isTableData(target)) {
      updateActiveTableCellElement(target as HTMLTableCellElement);
      activateTableDataContextMenu(event);
      event.preventDefault();
    }
  }
}, true);

interface ConsumableKeyboardEvent extends KeyboardEvent {
  consumed?: boolean;
}
function tableDataElementOnInput(tableDataElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  let initialSearchValue = event.key;
  if(event.key == 'Enter') {
    initialSearchValue = tableDataElement.innerText.trim();
  } else if (event.key == 'Backspace') {
    initialSearchValue = '';
  }
  cellEditor.activateForm(tableDataElement, initialSearchValue);
  event.consumed = true;
}
function tableCellElementOnInput(event: ConsumableKeyboardEvent) {
  const tableCellElement: HTMLTableCellElement = event.target as HTMLTableCellElement;
  // ignore if input on table head
  if (isTableData(tableCellElement)) {
    tableDataElementOnInput(tableCellElement, event);
  }
}

function tableCellElementOnUpKeyPressed(tableCellElement: HTMLTableCellElement) {
  let upElement = getUpTableCellElement(tableCellElement);
  if (!upElement) {
    if (tableFoot.isInserting) {
      // jump to table footer cell
      upElement = getColumnSearch(tableCellElement.cellIndex);
    }
  }

  updateActiveTableCellElement(upElement);
}

function tableCellElementOnDownKeyPressed(tableCellElement: HTMLTableCellElement) {
  if (tableCellElement.parentElement === tableFoot.insertionTableRow) {
    // prevent moving down when `tableCellElement` belongs to `insertionTableRow` since next table row is `tableFoot.statusTableRow`
    return;
  }

  let downElement = getDownTableCellElement(tableCellElement);
  if (!downElement) {
    if (isColumnSearch(tableCellElement) && tableFoot.isInserting) {
      // jump to table footer cell
      downElement = tableFoot.insertionTableRow.cells[tableCellElement.cellIndex];
    }
  }

  updateActiveTableCellElement(downElement);
}

function tableCellElementOnKeyDown(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  event.consumed = false;
  switch (event.key) {
    case 'Down': // IE/Edge specific value
    case 'ArrowDown':
      tableCellElementOnDownKeyPressed(tableCellElement);
      event.consumed = true;
      break;
    case 'Up': // IE/Edge specific value
    case 'ArrowUp':
      tableCellElementOnUpKeyPressed(tableCellElement);
      event.consumed = true;
      break;
    case 'Left': // IE/Edge specific value
    case 'ArrowLeft':
      updateActiveTableCellElement(getLeftTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case 'Right': // IE/Edge specific value
    case 'ArrowRight':
    case 'Tab': // handle Tab as a pressing Right arrow
      updateActiveTableCellElement(getRightTableCellElement(tableCellElement));
      event.consumed = true;
      break;
    case 'c': // handle potential CTRL+c or CMD+c
      tableCellElementOnCopyKeyPressed(tableCellElement, event);
      break;
    case 'v':
      tableCellElementOnPasteKeyPressed(tableCellElement, event);
      break;
    case 'a':
        tableCellElementOnPasteKeyPressed(tableCellElement, event);
        break;
    case 'Escape':
      deactivateSortPanel();
    // fallthrough
    case 'Alt':
    case 'AltLock':
    case 'CapsLock':
    case 'Control':
    case 'Fn':
    case 'FnLock':
    case 'Hyper':
    case 'Meta':
    case 'NumLock':
    case 'ScrollLock':
    case 'Shift':
    case 'Super':
    case 'Symbol':
    case 'SymbolLock':
      console.log('key down');
      console.log(event.key);
      event.consumed = true;
  }
  /*
  if (event.shiftKey) {console.log('shift is down');}
  if (event.altKey) {console.log('alt is down');}
  if (event.ctrlKey) {console.log('ctrl is down');}
  if (event.metaKey) {console.log('cmd is down');}
  */
  if (event.consumed) {
    event.preventDefault();
  } else {
    if(!event.ctrlKey && !event.metaKey) {
      tableCellElementOnInput(event);
    }
  }
}
tableElement.addEventListener('keydown', function (event: KeyboardEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableCell(target)) {
    tableCellElementOnKeyDown(target as HTMLTableCellElement, event);
  } else if (isInput(target)) {
    // if footer is open 
    if (tableFoot.statusMode === 'insertion' && !cellEditNewRow.isActive) {
      if(event.key === 'Escape') {
        tableFoot.toggle(StatusMode.Insertion);
      } else if(event.key !== 'Tab') {
        // activate new row cell editor when new character is typed
        cellEditNewRow.activate(target.parentElement as HTMLTableCellElement);
      } else {
        cellEditNewRow.deactivate();
        if(isInput(target)) {
          tableFoot.verifyInputTab(target as HTMLInputElement);
        }
      }
    }

    if (isColumnSearchInput(target)) {
      if (columnSuggestions.isActive) {
        if (event.key === 'Escape' || event.key === 'Enter') {
          // ESC pressed on column search
          columnSuggestions.deactivate();
          event.preventDefault();
        }
      } else {
        // activate column suggestions when new character is typed
        columnSuggestions.activate(target.parentElement as HTMLTableCellElement);
      }
    }
  }
  event.stopPropagation();
}, true);

/* mouse events */
tableHeadTopRowElement.addEventListener('mousedown', function (event: MouseEvent) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isTableHead(target)) {
    tableHeadOnMouseDown(target as HTMLTableCellElement, event);
  }
}, { passive: true, capture: true });
tableHeadTopRowElement.addEventListener('mousemove', function (event: MouseEvent) {
  tableHeadOnMouseMove(event);
}, { passive: true, capture: true });

// initially sort on University A-Z
tableCellSortButtonOnClick(tableElement.querySelectorAll('.sort-btn')[1] as HTMLButtonElement, false);
tableCellSortButtonOnClick(tableElement.querySelectorAll('.sort-btn')[0] as HTMLButtonElement, false);

checkUrlForSearchParams();