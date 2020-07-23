import { placeElementInViewport } from "./align";
import { copyTableCellElement, pasteToTableCellElement } from "./copy-paste";
import { activeClass } from "../../constants/css-classes";
import { isButton } from "../../dom/types";
import { activeTableCellElement, activateTableCol } from "../../../sheet";


const tableDataContextMenu: HTMLElement = document.getElementById("table-data-contextmenu");
const columnLabelContextMenu: HTMLElement = document.getElementById("column-label-contextmenu");
const contextMenuClass = "contextmenu";

function getMenuItemAction(element: HTMLElement): string {
  return (element.closest("button") as HTMLElement).innerText;
}
export function isContextMenuButton(element: HTMLElement) {
  return isButton(element) && element.parentElement.classList.contains(contextMenuClass);
}
export function activateTableDataContextMenu(event: MouseEvent) {
  tableDataContextMenu.classList.add(activeClass);
  placeElementInViewport(tableDataContextMenu, event.clientX, event.clientY);
}
export function deactivateTableDataContextMenu() {
  tableDataContextMenu.classList.remove(activeClass);
}
export function activateColumnLabelContextMenu(event: MouseEvent) {
  columnLabelContextMenu.classList.add(activeClass);
  placeElementInViewport(columnLabelContextMenu, event.clientX, event.clientY);
}
export function deactivateColumnLabelContextMenu() {
  columnLabelContextMenu.classList.remove(activeClass);
}

// event handler
tableDataContextMenu.addEventListener("click", function(event: MouseEvent) {
  console.log(event.target);
  switch (getMenuItemAction(event.target as HTMLElement)) {
    case "Copy":
      copyTableCellElement(activeTableCellElement);
      break;
    case "Paste":
      pasteToTableCellElement(activeTableCellElement);
      break;
    case "Insert row":
      // TODO insert new row
      break;
  }
  deactivateTableDataContextMenu();
  event.stopPropagation();
}, true);
columnLabelContextMenu.addEventListener("click", function(event: MouseEvent) {
  console.log(event.target);
  switch (getMenuItemAction(event.target as HTMLElement)) {
    case "Copy column":
      activateTableCol();
      // fallthrough
    case "Copy":
      copyTableCellElement(activeTableCellElement);
      break;
    case "Distribution":
      break;
  }
  deactivateColumnLabelContextMenu();
  event.stopPropagation();
}, true);
