import { LocalStorageCache } from '../../utils/local-storage';
import { measureTextWidth, em2px } from '../../utils/length';
import {getColumnLabel, getColumnLabelText, getTableColElement, tableColElements, getColumnSearchInput } from '../../dom/sheet';


const columnWidthCache = new LocalStorageCache(Number.POSITIVE_INFINITY);

function keyFunction(index: number) {
  return `columnWidth${index}`;
}
function getPreferredColumnWidth(index: number): string {
  const tableColumnElement: HTMLTableColElement = getTableColElement(index);
  if (tableColumnElement) {
    const dataWidth = tableColumnElement.dataset.width;
    return `${dataWidth}px`;
  }
  // sw: TODO - this is the local storage which never gets triggered bc the if stmt is always true
  return columnWidthCache.retrieve(keyFunction(index));
}
export function getMinimumColumnWidth(index: number) {
  const columnLabelText: string = getColumnLabelText(getColumnLabel(index));

  const textWidth: number = measureTextWidth(columnLabelText);
  const paddingWidth: number = em2px(0.75) * 2;
  const sortButtonWidth: number = 30;
  const slack: number = 80;
  return textWidth + paddingWidth + sortButtonWidth + slack;
}
function loadPreferredColumnWidths(respectMinimumColumnWidth: boolean = true) {
  let index = 0;
  for (const tableColElement of tableColElements) {
    const preferredColumnWidth: string = getPreferredColumnWidth(index);

    const tableColEl = tableColElement as HTMLTableColElement;
    if (preferredColumnWidth) {
      let columnWidth: string;
      if (respectMinimumColumnWidth) {
        columnWidth = `${Math.max(getMinimumColumnWidth(index), Number.parseFloat(preferredColumnWidth))}px`;
      } else {
        columnWidth = preferredColumnWidth;
      }
        tableColEl.style.width = columnWidth;
    } else {
      if (respectMinimumColumnWidth) {
        tableColEl.style.width = `${getMinimumColumnWidth(index)}px`;
      }
    }

    index += 1;
  }
}
loadPreferredColumnWidths();

/**
 * store column width in local storage
 */
// sw: TODO this is not working
function storeColumnWidth(index: number, columnWidth: string) {
  columnWidthCache.store(keyFunction(index), columnWidth);
}

// resize width

/**
 * Updates a table column's width
 *
 * @param {number} index - A number specifies which column's width to update.
 * @param {string} newWidth - A string represents a width.
 */
function updateTableColumnWidth(index: number, newWidth: string) {
  const tableColElement = getTableColElement(index);
  tableColElement.style.width = newWidth;
  storeColumnWidth(index, newWidth);
}

/**
 * Special case of {@link  updateTableColumnWidth}.
 */
export function updateTableColumnSearchWidth(columnSearch: HTMLTableCellElement) {
  const columnSearchInput: HTMLInputElement = getColumnSearchInput(columnSearch);
  const textLength = measureTextWidth(columnSearchInput.value);
  const padding = 24;
  const slack = 44;
  const estimatedTextWidth = textLength + slack + padding;

  const currentTextWidthCanFit = columnSearchInput.offsetWidth;
  if (estimatedTextWidth > currentTextWidthCanFit) {
    const index = columnSearch.cellIndex;
    const newColumnWidth = estimatedTextWidth + padding;
    updateTableColumnWidth(index, `${newColumnWidth}px`);
  }
}
export function updateTableCellWidth(tableCellElement: HTMLTableCellElement, resizeAmount: number) {
  if (resizeAmount === 0) {
    return;
  }

  const index = tableCellElement.cellIndex;
  // in pixels
  const currentColumnWidth = tableCellElement.clientWidth;
  const newColumnWidth = Math.max(getMinimumColumnWidth(index), currentColumnWidth + resizeAmount);

  updateTableColumnWidth(index, `${newColumnWidth}px`);
}
