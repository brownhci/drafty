// Get HTML Element type
export function isTableData(element: HTMLElement): boolean {
  return element && element.tagName === "TD";
}
export function isTableHead(element: HTMLElement): boolean {
  return element && element.tagName === "TH";
}
export function isTableCell(element: HTMLElement): boolean {
  if (!element) {
    return false;
  }
  const tagName = element.tagName;
  return tagName === "TD" || tagName === "TH";
}
export function isTableBody(element: HTMLElement): boolean {
  return element && element.tagName === "TBODY";
}
export function isInput(element: HTMLElement): boolean {
  return element && element.tagName === "INPUT";
}
export function isTemplate(element: HTMLElement): boolean {
  return element && element.tagName === "TEMPLATE";
}
