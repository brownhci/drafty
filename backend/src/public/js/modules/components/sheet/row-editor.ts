import { activeClass } from "../../constants/css-classes";
import { tableBodyElement, tableColumnLabels, tableElement, numTableColumns } from "../../dom/sheet";


class RowEditor {
  private rowEditorContainer: HTMLTableSectionElement;
  private rowEditor: HTMLTableRowElement;

  private get rowWidth(): number {
    return tableBodyElement.clientWidth;
  }

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.rowEditorContainer = document.createElement("tbody");
    this.rowEditorContainer.id = "row-editor-container";
    tableElement.appendChild(this.rowEditorContainer);

    this.rowEditor = document.createElement("tr");
    this.rowEditor.id = "row-editor";
    this.rowEditorContainer.appendChild(this.rowEditor);

    this.initializeCells(numTableColumns);
  }

  private initializeCells(numCells: number) {
    const numExistingCells = this.rowEditor.cells.length;

    if (numCells > numExistingCells) {
      for (let cellIndex = numExistingCells; cellIndex < numCells; cellIndex++) {
        this.rowEditor.appendChild(document.createElement("td"));
      }
    } else if (numCells < numExistingCells) {
      for (let cellIndex = numCells; cellIndex < numExistingCells; cellIndex++) {
        this.rowEditor.lastElementChild.remove();
      }
    }
  }

  private setCellWidths() {
    const columnLabels = tableColumnLabels.cells;
    const cells = this.rowEditor.cells;
    const numCells = cells.length;
    for (let cellIndex = 0; cellIndex < numCells; cellIndex++) {
      cells[cellIndex].style.width = `${columnLabels[cellIndex].clientWidth}px`;
    }
  }

  activate() {
    this.rowEditor.classList.add(activeClass);
    this.setCellWidths();
  }

  deactivate() {
    this.rowEditor.classList.remove(activeClass);
  }
}

// export const rowEditor = new RowEditor();
