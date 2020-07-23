import { placeElementInViewport } from "./align";
import { copyTableCellElement, pasteToTableCellElement } from "./copy-paste";
import { toggleInsertion, toggleRowCount } from "./table-foot";
import { activeClass } from "../../constants/css-classes";
import { isButton } from "../../dom/types";
import { activeTableCellElement, activateTableCol } from "../../../sheet";



const tableDataContextMenu: HTMLElement = document.getElementById("table-data-contextmenu");
const columnLabelContextMenu: HTMLElement = document.getElementById("column-label-contextmenu");
const contextMenuClass = "contextmenu";

export const insertRowMenuItem: HTMLButtonElement = document.getElementById("menuitem-insert-row") as HTMLButtonElement;
export const countMenuItem: HTMLButtonElement = document.getElementById("menuitem-count") as HTMLButtonElement;

function getMenuItem(element: HTMLElement): HTMLButtonElement {
  return element.closest("button") as HTMLButtonElement;
}
function getMenuItemAction(menuItem: HTMLButtonElement): string {
  return menuItem.innerText;
}
function deactivateMenuItem(menuItem: HTMLButtonElement) {
  menuItem.classList.remove(activeClass);
}
function toggleMenuItemActiveState(menuItem: HTMLButtonElement) {
  menuItem.classList.toggle(activeClass);
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
  const menuItem = getMenuItem(event.target as HTMLElement);
  switch (getMenuItemAction(menuItem)) {
    case "Copy":
      copyTableCellElement(activeTableCellElement);
      break;
    case "Paste":
      pasteToTableCellElement(activeTableCellElement);
      break;
    case "Insert row":
      deactivateMenuItem(countMenuItem);
      toggleMenuItemActiveState(menuItem);
      toggleInsertion();
      break;
  }
  deactivateTableDataContextMenu();
  event.stopPropagation();
}, true);
columnLabelContextMenu.addEventListener("click", function(event: MouseEvent) {
  const menuItem = getMenuItem(event.target as HTMLElement);
  switch (getMenuItemAction(menuItem)) {
    case "Copy column":
      activateTableCol();
      // fallthrough
    case "Copy":
      copyTableCellElement(activeTableCellElement);
      break;
    case "Count":
      deactivateMenuItem(insertRowMenuItem);
      toggleMenuItemActiveState(menuItem);
      toggleRowCount();
      break;
    case "Distribution":
      break;
  }
  deactivateColumnLabelContextMenu();
  event.stopPropagation();
}, true);
