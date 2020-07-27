import { placeElementInViewport } from "./align";
import { cellEditor } from "./cell-editor";
import { copyTableCellElement, pasteToTableCellElement } from "./copy-paste";
import { StatusMode, tableFoot } from "./table-foot";
import { activeClass } from "../../constants/css-classes";
import { isButton } from "../../dom/types";
import { activeTableCellElement, activateTableCol } from "../../../sheet";


const tableDataContextMenu: HTMLElement = document.getElementById("table-data-contextmenu");
const columnLabelContextMenu: HTMLElement = document.getElementById("column-label-contextmenu");
const contextMenuClass = "contextmenu";
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

class MenuItem {
  static readonly buttonToMenuItem: Map<HTMLButtonElement, MenuItem> = new Map();

  readonly item: HTMLButtonElement;
  /**
   * if current menu item is activated, aliased menu items will be activated
   * if current menu item is deactivated, aliased menu item will also be deactivated
   */
  readonly alias: Set<MenuItem> = new Set();
  /** if current menu item is activated, conflicted menu items will be deactivated <*/
  readonly conflicts: Set<MenuItem> = new Set();

  get action(): string {
    return this.item.innerText.trim();
  }

  constructor(item: HTMLButtonElement, alias: Iterable<MenuItem> = [], conflicts: Iterable<MenuItem> = []) {
    this.item = item;
    for (const menuItem of alias) {
      this.alias.add(menuItem);
    }
    for (const menuItem of conflicts) {
      this.conflicts.add(menuItem);
    }

    MenuItem.buttonToMenuItem.set(item, this);
  }

  static find(element: HTMLElement): MenuItem {
    if (!element) {
      return null;
    }
    if (!isButton(element)) {
      element = element.closest("button");
    }

    return this.buttonToMenuItem.get(element as HTMLButtonElement);
  }

  activate() {
    this.item.classList.add(activeClass);
    for (const menuItem of this.alias) {
      menuItem.item.classList.add(activeClass);
    }
    for (const menuItem of this.conflicts) {
      menuItem.item.classList.remove(activeClass);
    }
  }

  deactivate() {
    this.item.classList.remove(activeClass);
    for (const menuItem of this.alias) {
      menuItem.item.classList.remove(activeClass);
    }
  }

  toggle() {
    if (this.item.classList.contains(activeClass)) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  /**
   * Flags a menu item as current menu item's alias.
   *
   * @param {MenuItem} menuItem - The menu item that will be in current menu item's alias.
   * @param {boolean} [mutual = true] - Whether this alias relationship is mutual. In other words, whether current men item will be in provided menu item's alias.
   */
  addToAlias(menuItem: MenuItem, mutual: boolean = true) {
    this.alias.add(menuItem);
    if (mutual) {
      menuItem.alias.add(this);
    }
  }

  /**
   * Flags a menu item as current menu item's conflicts.
   *
   * @param {MenuItem} menuItem - The menu item that will be in current menu item's conflicts.
   * @param {boolean} [mutual = true] - Whether this conflicts relationship is mutual. In other words, whether current men item will be in provided menu item's conflicts.
   */
  addToConflicts(menuItem: MenuItem, mutual: boolean = true) {
    this.conflicts.add(menuItem);
    if (mutual) {
      menuItem.conflicts.add(this);
    }
  }
}

// menu items
// IMPORTANT a new menu item needs also be registered here
export const columnLabelButtons = columnLabelContextMenu.children;
export const columnLabelCopyMenuItem = new MenuItem(columnLabelButtons[0] as HTMLButtonElement);
export const columnLabelCopyColumnMenuItem = new MenuItem(columnLabelButtons[1] as HTMLButtonElement);
export const columnLabelInsertRowMenuItem = new MenuItem(columnLabelButtons[2] as HTMLButtonElement);
export const columnLabelCountMenuItem = new MenuItem(columnLabelButtons[3] as HTMLButtonElement);
export const columnLabelDistributionMenuItem = new MenuItem(columnLabelButtons[4] as HTMLButtonElement);

export const tableDataButtons = tableDataContextMenu.children;
export const tableDataEditMenuItem = new MenuItem(tableDataButtons[0] as HTMLButtonElement);
export const tableDataCopyMenuItem = new MenuItem(tableDataButtons[1] as HTMLButtonElement);
export const tableDataPasteMenuItem = new MenuItem(tableDataButtons[2] as HTMLButtonElement);
export const tableDataInsertRowMenuItem = new MenuItem(tableDataButtons[3] as HTMLButtonElement);

/* set up alias and conflicts */
columnLabelInsertRowMenuItem.addToAlias(tableDataInsertRowMenuItem);
columnLabelInsertRowMenuItem.addToConflicts(columnLabelCountMenuItem);
tableDataInsertRowMenuItem.addToConflicts(columnLabelCountMenuItem);

export function isContextMenuButton(element: HTMLElement) {
  return isButton(element) && element.parentElement.classList.contains(contextMenuClass);
}

// event handler
tableDataContextMenu.addEventListener("click", function(event: MouseEvent) {
  const menuItem = MenuItem.find(event.target as HTMLElement);
  switch (menuItem.action) {
    case "Edit":
      cellEditor.activateForm(activeTableCellElement);
      break;
    case "Copy":
      copyTableCellElement(activeTableCellElement);
      break;
    case "Paste":
      pasteToTableCellElement(activeTableCellElement);
      break;
    case "Insert Row":
      menuItem.toggle();
      tableFoot.toggle(StatusMode.Insertion);
      break;
  }
  deactivateTableDataContextMenu();
  event.stopPropagation();
}, true);
columnLabelContextMenu.addEventListener("click", function(event: MouseEvent) {
  const menuItem = MenuItem.find(event.target as HTMLElement);
  switch (menuItem.action) {
    case "Copy Column":
      activateTableCol();
      // fallthrough
    case "Copy":
      copyTableCellElement(activeTableCellElement);
      break;
    case "Insert Row":
      menuItem.toggle();
      tableFoot.toggle(StatusMode.Insertion);
      break;
    case "Count":
      menuItem.toggle();
      tableFoot.toggle(StatusMode.RowCount);
      break;
  }
  deactivateColumnLabelContextMenu();
  event.stopPropagation();
}, true);
