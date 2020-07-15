import { placeElementInViewport } from "./align";
import { copyTableCellElement, pasteToTableCellElement } from "./copy-paste";
import { activeClass } from "../../constants/css-classes";
import { isButton } from "../../dom/types";
import { activeTableCellElement } from "../../../sheet";


const tableDataContextMenu: HTMLElement = document.getElementById("table-data-contextmenu");
const contextMenuClass = "contextmenu";

function getMenuItemAction(element: HTMLElement): string {
  return (element.closest("button") as HTMLElement).innerText;
}
export function isContextMenuButton(element: HTMLElement) {
  return isButton(element) && element.parentElement.classList.contains(contextMenuClass);
}
export function activateTableDataContextMenu(event: MouseEvent) {
  placeElementInViewport(tableDataContextMenu, event.clientX, event.clientY);
  tableDataContextMenu.classList.add(activeClass);
}
export function deactivateTableDataContextMenu() {
  tableDataContextMenu.classList.remove(activeClass);
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
  }
  deactivateTableDataContextMenu();
  event.stopPropagation();
}, true);
