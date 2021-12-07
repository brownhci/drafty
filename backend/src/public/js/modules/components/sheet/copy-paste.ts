import { cellEditor } from './cell-editor';
import { StatusMode, tableFoot } from './table-foot';
import { clearCopyBuffer, copyCurrentSelectionToCopyBuffer, copyCopyBuffer, copyTextToCopyBuffer, hasCopyModifier, getCopyBuffer } from '../../utils/copy';
import { hasTextSelected } from '../../utils/selection';
import { recordCellCopy, recordColumnCopy, recordPaste } from '../../api/record-interactions';
import { isTableData, isTableHead } from '../../dom/types';
import { getColumnLabel, getTableCellText, getTableDataText, isColumnLabel, isColumnSearchInput, isTableCellEditable, tableElement } from '../../dom/sheet';
import { activeTableCellElement, activeTableColElement, tableDataManager } from '../../../sheet';

const copiedClass = 'copied';

type CopyTarget = HTMLTableColElement | HTMLTableCellElement;
let copyTarget: CopyTarget = null;
function makeElementCopyTarget(element: HTMLTableCellElement | HTMLTableColElement) {
  copyTarget = element;
  element.classList.add(copiedClass);
}

function removeCurrentCopyTarget() {
  if (copyTarget) {
    copyTarget.classList.remove(copiedClass);
    copyTarget = null;
  }
}

interface ConsumableKeyboardEvent extends KeyboardEvent {
  consumed?: boolean;
}
function copyCellTextToCopyBuffer(tableCellElement: HTMLTableCellElement) {
  copyTextToCopyBuffer(getTableCellText(tableCellElement), tableCellElement.id);
}
function copyTableColumnToCopyBuffer(index: number) {
  let textToCopy = '';

  for (const viewModel of tableDataManager.fullView) {
    const tableRow = viewModel.element_ as HTMLTableRowElement;
    const text = tableRow.cells[index].textContent;
    textToCopy += `${text}\n`;
  }
  const id: string = ''; //sw: bc this was a copy column operation
  copyTextToCopyBuffer(textToCopy.trimRight(),id);
}
export function copyTableCellElement(tableCellElement: HTMLTableCellElement, ignoreSelection: boolean = true) {
  removeCurrentCopyTarget();
  clearCopyBuffer();

  let elementToHighlight;
  if (activeTableColElement) {
    // copy entire column
    const columnIndex: number = activeTableCellElement.cellIndex;
    copyTableColumnToCopyBuffer(columnIndex);
    elementToHighlight = activeTableColElement;
    copyCopyBuffer();
    recordColumnCopy(getColumnLabel(columnIndex));
    tableFoot.setStatusTimeout(StatusMode.ColumnCopy, 1000);
    makeElementCopyTarget(elementToHighlight);
  } else if (isTableData(tableCellElement) || isColumnLabel(tableCellElement)) {
    if (!ignoreSelection && hasTextSelected(tableCellElement)) {
      // copy selected part
      copyCurrentSelectionToCopyBuffer();
    } else {
      // copy single table cell
      copyCellTextToCopyBuffer(tableCellElement);
    }
    elementToHighlight = tableCellElement;
    if (isTableData(tableCellElement)) {
      // do not record copy on table head element
      recordCellCopy(tableCellElement);
      // report in table footer that a cell was copied
      tableFoot.setStatusTimeout(StatusMode.CellCopy, 2000);
    }

    // regain focus
    copyCopyBuffer();
    elementToHighlight.focus();
    makeElementCopyTarget(elementToHighlight);
  }
}
export function tableCellElementOnCopyKeyPressed(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  if (hasCopyModifier(event)) {
    copyTableCellElement(tableCellElement, false);
    event.consumed = true;
  }
  // ignore when only C is pressed
}

/* keyboard event */

// paste event
function tableCellElementOnPaste(tableCellElement: HTMLTableCellElement, text: string) {
  const pasteVal = text;
  const pasteCellVal = tableCellElement.innerText;
  const pasteCellIdSuggestion = tableCellElement.id;
  const copyCellVal = getCopyBuffer().value;
  const copyCellIdSuggestion = getCopyBuffer().name;
  recordPaste(pasteVal, pasteCellVal, pasteCellIdSuggestion, copyCellVal, copyCellIdSuggestion);

  cellEditor.activateForm(tableCellElement, text);
}
export function pasteToTableCellElement(tableCellElement: HTMLTableCellElement) {
  if (navigator.clipboard) {
    navigator.clipboard.readText().then(text => {
      tableCellElementOnPaste(tableCellElement, text);
    });
  } else {
    if (!copyTarget) {
      return;
    }

    if (!isTableData(copyTarget)) {
      return;
    }

    const text = getTableDataText(copyTarget as HTMLTableCellElement);
    tableCellElementOnPaste(tableCellElement, text);
  }
}
export function tableCellElementOnPasteKeyPressed(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  if (isTableHead(tableCellElement)) {
    return;
  }
  if (!hasCopyModifier(event)) {
    return;
  }
  // handle potential CTRL+v or CMD+v
  pasteToTableCellElement(tableCellElement);
  event.consumed = true;
}
tableElement.addEventListener('paste', function (event: ClipboardEvent) {
  const pasteContent = event.clipboardData.getData('text');
  const target: HTMLElement = event.target as HTMLElement;
  if(isColumnSearchInput(target) || tableFoot.isNewRowInsertionInput(target)) {
    const targetInput: HTMLInputElement = event.target as HTMLInputElement;
    targetInput.value = pasteContent;
    targetInput.dispatchEvent(new Event('input')); 
  } else if (isTableData(target) && isTableCellEditable(target as HTMLTableCellElement)) {
    tableCellElementOnPaste(target as HTMLTableCellElement, pasteContent); 
  }
  event.preventDefault();
  event.stopPropagation();
}, true);
