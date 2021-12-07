// Get HTML Element type
export function isTableData(element: HTMLElement): boolean {
  return element && element.tagName === 'TD';
}
export function isTableHead(element: HTMLElement): boolean {
  return element && element.tagName === 'TH';
}
export function isTableCell(element: HTMLElement): boolean {
  if (!element) {
    return false;
  }
  const tagName = element.tagName;
  return tagName === 'TD' || tagName === 'TH';
}
export function isTableBody(element: HTMLElement): boolean {
  return element && element.tagName === 'TBODY';
}
// sw does not work
export function isTableFoot(element: HTMLElement): boolean {
  return element && element.tagName === 'TFOOT';
}
export function isColumnSearchInput(element: HTMLElement): boolean {
  if (element.id.includes('column-search-input')) {
    return element && element.tagName === 'INPUT';
  } else {
    return false;
  }
}
export function isNewRowInput(element: HTMLElement): boolean {
  if (element.id.includes('add-new-row-input')) {
    return element && element.tagName === 'INPUT';
  } else {
    return false;
  }
}
export function isInput(element: HTMLElement): boolean {
  return element && element.tagName === 'INPUT';
}
export function isButton(element: HTMLElement): boolean {
  return element && element.tagName === 'BUTTON';
}
export function isTemplate(element: HTMLElement): boolean {
  return element && element.tagName === 'TEMPLATE';
}
