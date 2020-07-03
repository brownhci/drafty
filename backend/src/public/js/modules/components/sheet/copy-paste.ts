import { cellEditor } from "./cell-editor";
import { clearCopyBuffer, copyCurrentSelectionToCopyBuffer, copyCopyBuffer, copyTextToCopyBuffer, hasCopyModifier } from "../../utils/copy";
import { hasTextSelected } from "../../utils/selection";
import { recordCellCopy, recordColumnCopy } from "../../api/record-interactions";
import { isTableData, isTableHead } from "../../dom/types";
import { getColumnLabel, getTableCellText, getTableCellTextsInColumn, getTableDataText, isColumnSearch, isColumnSearchInput, isTableCellEditable, tableElement } from "../../dom/sheet";
import { activeTableCellElement, activeTableColElement } from "../../../sheet";

const copiedClass = "copied";

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
  copyTextToCopyBuffer(getTableCellText(tableCellElement));
}
function copyTableColumnToCopyBuffer(index: number) {
  let textToCopy = "";
  for (const text of getTableCellTextsInColumn(index, true, true)) {
    textToCopy += `${text}\n`;
  }
  copyTextToCopyBuffer(textToCopy.trimRight());
}
export function tableCellElementOnCopyKeyPressed(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
  if (hasCopyModifier(event)) {
    removeCurrentCopyTarget();
    clearCopyBuffer();

    let elementToHighlight;
    if (activeTableColElement) {
      // copy entire column
      const columnIndex: number = activeTableCellElement.cellIndex;
      copyTableColumnToCopyBuffer(columnIndex);
      elementToHighlight = activeTableColElement;
      recordColumnCopy(getColumnLabel(columnIndex));
    } else if (!(isColumnSearch(tableCellElement))) {
      if (hasTextSelected(tableCellElement)) {
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
      }

      // regain focus
      elementToHighlight.focus();
    }

    copyCopyBuffer();
    makeElementCopyTarget(elementToHighlight);
    event.consumed = true;
  }
  // ignore when only C is pressed
}

/* keyboard event */

// paste event
function tableCellElementOnPaste(tableCellElement: HTMLTableCellElement, text: string) {
  // invoke edit editor
  cellEditor.activateForm(tableCellElement);
  cellEditor.formInput = text;
}
export function tableCellElementOnPasteKeyPressed(tableCellElement: HTMLTableCellElement, event: ConsumableKeyboardEvent) {
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
