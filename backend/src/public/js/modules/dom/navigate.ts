import { isTableCell } from './types';


/* from child to parent */

/**
 * Find the table row that encloses the specified element (including the element itself).
 *
 * @param {HTMLElement} element - An HTML Element that is the descendant of a table row.
 * @return {HTMLTableRowElement} An table row element that is closest to current element in its ancestor tree.
 */
export function getEnclosingTableRow(element: HTMLElement): HTMLTableRowElement {
  return element.closest('tr') as HTMLTableRowElement;
}

/**
 * Find the table cell that encloses the specified element (including the element itself).
 *
 * @param {HTMLElement} element - An HTML Element that is the descendant of a table cell.
 * @return {HTMLTableCellElement} An table cell element that is closest to current element in its ancestor tree.
 */
export function getEnclosingTableCell(element: HTMLElement): HTMLTableCellElement {
  while (element) {
    if (isTableCell(element)) {
      return element as HTMLTableCellElement;
    }
    element = element.parentElement;
  }
  return null;
}

/* from parent to child */
export function getCellInTableRow(tableRowElement: HTMLTableRowElement, cellIndex: number): HTMLTableCellElement | null {
  return tableRowElement.cells[cellIndex];
}

/* navigate between siblings */

export function getTopTableRow(tableRowElement: HTMLTableRowElement): HTMLTableRowElement | undefined {
  return tableRowElement.previousElementSibling as HTMLTableRowElement;
}
export function getDownTableRow(tableRowElement: HTMLTableRowElement): HTMLTableRowElement | undefined {
  return tableRowElement.nextElementSibling as HTMLTableRowElement;
}

export function getLeftTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  return tableCellElement.previousElementSibling as HTMLTableCellElement;
}
export function getRightTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  return tableCellElement.nextElementSibling as HTMLTableCellElement;
}
export function getUpTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  const cellIndex = tableCellElement.cellIndex;
  const topTableRow = getTopTableRow(getEnclosingTableRow(tableCellElement));
  if (!topTableRow) {
    return null;
  }
  return getCellInTableRow(topTableRow, cellIndex);
}
export function getDownTableCellElement(tableCellElement: HTMLTableCellElement): HTMLTableCellElement | null {
  const cellIndex = tableCellElement.cellIndex;
  const downTableRow = getDownTableRow(getEnclosingTableRow(tableCellElement));
  if (!downTableRow) {
    return null;
  }
  return getCellInTableRow(downTableRow, cellIndex);
}
