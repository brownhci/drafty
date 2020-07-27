import { columnSuggestions } from "./column-suggestions";
import { columnLabelInsertRowMenuItem } from "./contextmenu";
import { ViewModel } from "./table-data-manager/ViewModel";
import { activeClass, disabledClass, invalidClass } from "../../constants/css-classes";
import { getIdSuggestionType, recordRowInsertion, setIdSuggestion, setIdUniqueID } from "../../api/record-interactions";
import { getColumnLabels, getColumnLabel, isColumnAutocompleteOnly, numTableColumns, tableElement, tableFootElement } from "../../dom/sheet";
import { isInput } from "../../dom/types";
import { tableDataManager } from ".././../../sheet";


/**
 * Describes what `statusTableRow` is used for
 */
export enum StatusMode {
  /** `statusTableRow` is used for assisting `insertionTableRow` */
  Insertion = "insertion",
  /** `statusTableRow` is used for reporting a new row has been submitted to backend for verification */
  InsertionVerification = "insertion-verification",
  /** `statusTableRow` is used for reporting a new row has been inserted */
  InsertionSuccess = "insertion-success",
  /** `statusTableRow` is used for reporting some error that happened during insertion */
  InsertionFailure = "insertion-failure",
  /** `statusTableRow` is used for reporting row count */
  RowCount = "rowcount",
  /** `statusTableRow` is used for reporting cell copy */
  CellCopy = "cellcopy",
  /** `statusTableRow` is used for reporting column copy */
  ColumnCopy = "columncopy",
  /** `statusTableRow` is used for showing help related to cell editor */
  CellEditorHelp = "celleditor-help",
  /** `statusTableRow` is not used for anything */
  Idle = "idle"
}

class TableFoot {
  /** insertion table row is used to insert a new table row */
  insertionTableRow = tableFootElement.firstElementChild as HTMLTableRowElement;

  private insertionInputs: Array<HTMLInputElement> = Array.from(this.insertionTableRow.getElementsByTagName("input"));

  private get isValidInsertion(): boolean {
    return !this.insertionTableRow.querySelector(`.${invalidClass}`);
  }

  private idSuggestionTypes: Array<number> = [];
  private idSuggestionTypeToColumnIndex: Map<number, number> = new Map();

  /**
   * status table row is either
   *    1. report summary related to entire table like row count
   *    2. show Confirm and Cancel buttons for table row insertion
   */
  statusTableRow = tableFootElement.lastElementChild as HTMLTableRowElement;
  private statusTableCell: HTMLTableCellElement = this.statusTableRow.cells[0];
  private _statusMode: StatusMode = StatusMode.Idle;
  private firstTime: boolean = true;
  get statusMode(): StatusMode {
    return this._statusMode;
  }
  set statusMode(mode: StatusMode) {
    if (this.firstTime) {
      this.firstTime = false;
      tableDataManager.afterScrollUpdateTaskQueue.tasks.push({
        work: () => {
          switch (this.statusMode) {
            case StatusMode.RowCount:
              this.updateRowCount();
              break;
          }
        },
        isRecurring: true
      });
    }

    if (mode !== this.statusMode) {
      // set to a different status mode

      // switching class associated with `this.statusTableRow`
      this.statusTableRow.classList.remove(this.statusMode);
      this.statusTableRow.classList.add(mode);

      // handle switching from previous status mode
      switch (this.statusMode) {
        case StatusMode.Insertion:
          this.insertionTableRow.classList.remove(activeClass);
          this.insertionConfirmButton.remove();
          this.insertionDiscardButton.remove();
          this.statusTableCell.textContent = "";
          break;
        case StatusMode.InsertionVerification:
        case StatusMode.InsertionSuccess:
        case StatusMode.InsertionFailure:
        case StatusMode.RowCount:
        case StatusMode.CellCopy:
        case StatusMode.ColumnCopy:
        case StatusMode.CellEditorHelp:
          this.statusTableCell.textContent = "";
          break;
      }

      // handle switching to new status mode
      switch (mode) {
        case StatusMode.Insertion:
          this.insertionTableRow.classList.add(activeClass);
          this.statusTableCell.appendChild(this.insertionDiscardButton);
          this.statusTableCell.appendChild(this.insertionConfirmButton);
          this.insertionInputs.forEach((inputElement, columnIndex) => this.verifyInputValue(columnIndex));
          break;
        case StatusMode.RowCount:
          this.updateRowCount();
          break;
        case StatusMode.CellCopy:
          this.statusTableCell.textContent = "A cell copied";
          break;
        case StatusMode.ColumnCopy:
          this.statusTableCell.textContent = "A column copied";
          break;
        case StatusMode.InsertionFailure:
          this.statusTableCell.textContent = "Row insertion failure";
          break;
        case StatusMode.InsertionSuccess:
          // deactivate contextmenu insert row menu item since insertion has finished
          columnLabelInsertRowMenuItem.deactivate();
          // previously inputted cell values has been saved
          this.discardInputValues();
          this.statusTableCell.textContent = "A new row has been inserted";
          break;
        case StatusMode.InsertionVerification:
          this.statusTableCell.innerHTML = `
          <span>
            <span class="spinner-grow spinner-grow-sm" role="status">
            </span>
            <span>New row is being verified...</span>
          </span>
          `;
          break;
        case StatusMode.CellEditorHelp:
          this.statusTableCell.innerHTML = "Press <kbd>Enter</kbd> to save edit, <kbd>ESC</kbd> to discard edit";
          break;
      }
    }

    this._statusMode = mode;
  }

  get isInserting(): boolean {
    return this.statusMode === StatusMode.Insertion;
  }

  private timeout: number;

  /** show in the status table row, used for confirming inserting the new row */
  private insertionConfirmButton: HTMLButtonElement = document.createElement("button");
  /** show in the status table row, used for show the error associated with the active input */
  private insertionErrorMessage: HTMLElement = document.createElement("span");
  /** show in the status table row, used for discarding the data inputted for the new row */
  private insertionDiscardButton: HTMLButtonElement = document.createElement("button");
  /** the HTML template for new row */
  private newRowTemplate: HTMLTableRowElement;

  constructor() {
    this.statusTableCell.colSpan = numTableColumns;
    // Idle is the initial mode, supplement its class
    this.statusTableRow.classList.add(StatusMode.Idle);

    // initialize idSuggestionTypes
    let columnIndex = 0;
    for (const columnLabel of getColumnLabels()) {
      const idSuggestionType: number = getIdSuggestionType(columnLabel);
      this.idSuggestionTypes.push(idSuggestionType);
      this.idSuggestionTypeToColumnIndex.set(idSuggestionType, columnIndex++);
    }

    // status row initialization
    /* button initialization */
    this.insertionConfirmButton.type = "button";
    this.insertionConfirmButton.id = "confirm-newrow";
    this.insertionConfirmButton.textContent = "Insert Row";
    this.insertionDiscardButton.type = "button";
    this.insertionDiscardButton.id = "discard-newrow";
    this.insertionDiscardButton.textContent = "Discard";
    /* error message initialization */
    this.insertionErrorMessage.id = "newrow-error";

    tableElement.addEventListener("click", (event: MouseEvent) => {
      const target: HTMLElement = event.target as HTMLElement;
      if (this.isInserting) {
        if (target === this.insertionDiscardButton) {
          this.discardInputValues();
        } else if (target === this.insertionConfirmButton) {
          if (this.isValidInsertion) {
            this.statusMode = StatusMode.InsertionVerification;
            const cellValues: Array<string> = this.getInputValues();
            recordRowInsertion(
              cellValues,
              this.idSuggestionTypes,
              (response: Response) => response.json().then(data => {
                const idUniqueID: number = data.idUniqueID;
                const idSuggestions: Array<number> = this.reorderIdSuggestions(data.newRowIds, data.newRowFields);
                const newRow: HTMLTableRowElement = this.prepareNewRow(idUniqueID, idSuggestions, cellValues);
                this.insertNewRow(newRow);
                this.setStatusTimeout(StatusMode.InsertionSuccess, 1000);
              }),
              () => this.setStatusTimeout(StatusMode.InsertionFailure, 1000, StatusMode.Insertion));
          }
        }
      }
    }, true);

    tableElement.addEventListener("blur", (event: Event) => {
      const target = event.target as HTMLElement;
      if (isInput(target) && this.isInserting) {
        const columnIndex = this.insertionInputs.indexOf(target as HTMLInputElement);
        if (columnIndex >= 0) {
          this.verifyInputValue(columnIndex);
        }
      }
    }, true);

    tableElement.addEventListener("focus", (event: Event) => {
      const target = event.target as HTMLElement;

      if (this.isInserting && isInput(target) && target.classList.contains(invalidClass) && this.insertionTableRow.contains(target)) {
        this.insertionErrorMessage.textContent = target.dataset.errorMessage;
        this.statusTableCell.appendChild(this.insertionErrorMessage);
      } else {
        this.insertionErrorMessage.remove();
      }
    }, true);
  }

  private updateRowCount() {
    this.statusTableCell.textContent = `Count: ${tableDataManager.rowCount}`;
  }

  private getInputValues(): Array<string> {
    return this.insertionInputs.map(inputElement => inputElement.value);
  }

  private discardInputValues() {
    for (let columnIndex = 0; columnIndex < this.insertionInputs.length; columnIndex++) {
      this.insertionInputs[columnIndex].value = "";
      this.verifyInputValue(columnIndex);
    }
  }

  private isRequiredInput(inputElement: HTMLInputElement): boolean {
    return inputElement.required;
  }

  private reportInvalidInput(inputElement: HTMLInputElement, reason: string) {
    inputElement.classList.add(invalidClass);
    inputElement.dataset.errorMessage = reason;
    this.insertionConfirmButton.classList.add(disabledClass);
  }

  private async verifyInputValue(columnIndex: number): Promise<boolean> {
    const inputElement = this.insertionInputs[columnIndex];
    const inputValue = inputElement.value;
    const columnLabel = getColumnLabel(columnIndex);
    const isInputRequired = this.isRequiredInput(inputElement);
    if (isInputRequired && inputValue === "") {
      // this input must be filled, but it is left unfilled
      this.reportInvalidInput(inputElement, "This field is required");
      return false;
    }

    if (isColumnAutocompleteOnly(columnLabel)) {
      if (!isInputRequired && inputValue === "") {
        // empty input is accepted no non-required autocomplete-only input
      } else if (!await columnSuggestions.hasSuggestion(inputValue, columnIndex, inputElement)) {
        // this input's value should come from suggestion
        this.reportInvalidInput(inputElement, "Value must come from suggestions");
        return false;
      }
    }

    inputElement.classList.remove(invalidClass);
    delete inputElement.dataset.errorMessage;
    if (this.isValidInsertion) {
      // every input has passed verification
      this.insertionConfirmButton.classList.remove(disabledClass);
    }
    return true;
  }

  /**
   * Every column has an `idSuggestionType` (stored within its column label) and every cell has an `idSuggestion` (stored directly in the cell). This function reorders the provided `idSuggestions` such that the `idSuggestion` of the cell in the first column comes first, `idSuggestion` of the cell in the second column comes second, and so on.
   *
   * @param {Array<number>} idSuggestions - An array of `idSuggestion`s to be reordered.
   * @param {Array<number>} idSuggestionTypes - An array of `idSuggestionType`s used for reorder criterion since the table has a mapping between `idSuggestionType` and which column it is.
   * @return {Array<number>} The array of `idSuggestion`s reordered with respect to the column ordering.
   */
  private reorderIdSuggestions(idSuggestions: Array<number>, idSuggestionTypes: Array<number>): Array<number> {
    // reorder `idSuggestions`
    const columnIndexToIdSuggestion: Map<number, number> = new Map();
    for (let i = 0; i < idSuggestionTypes.length; i++) {
      const columnIndex = this.idSuggestionTypeToColumnIndex.get(idSuggestionTypes[i]);
      columnIndexToIdSuggestion.set(columnIndex, idSuggestions[i]);
    }
    const reorderedIdSuggestions: Array<number> = [];
    for (let columnIndex = 0; columnIndex < numTableColumns; columnIndex++) {
      reorderedIdSuggestions.push(columnIndexToIdSuggestion.get(columnIndex));
    }
    return reorderedIdSuggestions;
  }

  private prepareNewRow(idUniqueID: number, idSuggestions: Array<number>, cellValues: Array<string>): HTMLTableRowElement {
    if (!this.newRowTemplate) {
      this.newRowTemplate = tableDataManager.source[0].element_.cloneNode(true) as HTMLTableRowElement;
      delete this.newRowTemplate.dataset[ViewModel.identifierDatasetName_];
      for (const cellElement of this.newRowTemplate.cells) {
        cellElement.classList.add(StatusMode.Insertion);
      }
    }

    const row = this.newRowTemplate.cloneNode(true) as HTMLTableRowElement;
    setIdUniqueID(row, idUniqueID);
    const cells = row.cells;
    for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
      const cell = cells[cellIndex];
      setIdSuggestion(cell, idSuggestions[cellIndex]);
      cell.textContent = cellValues[cellIndex];
    }

    return row;
  }

  private insertNewRow(row: HTMLTableRowElement) {
    tableDataManager.addElement(row);
  }

  /**
   * If the table foot is at specified mode, set its mode to `StatusMode.Idle`.
   * Otherwise, set to specified mode.
   *
   * @param {StatusMode} mode - A usage mode to be toggled.
   */
  toggle(mode: StatusMode) {
    if (this.statusMode === mode) {
      this.statusMode = StatusMode.Idle;
    } else {
      this.statusMode = mode;
    }
  }

  /**
   * Set to a specified status for a certain period of time. After this period of time,
   *    the status will be restored to status specified by restoreTo.
   *
   * If after the status has updated and before the status is restored, another call to `setStatusTimeout` happens, table footer will be set to the new status and its status will be restored after the new timeout expires.
   *
   * @param {StatusMode} statusMode - A status mode to set to.
   * @param {number} timeout - See the timeout argument in {@link Window.setTimeout}.
   * @param {StatusMode} [restoreTo = StatusMode.Idle] - The status to restore to after timeout has expired.
   *    This defines how long the table footer will be in the specified status.
   */
  setStatusTimeout(statusMode: StatusMode, timeout: number, restoreTo: StatusMode = StatusMode.Idle) {
    if (this.isInserting && statusMode) {
      // disable status update when inserting a new row unless for reporting insertion success
      return;
    }

    this.statusMode = statusMode;
    window.clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => this.statusMode = restoreTo, timeout);
  }
}

export const tableFoot = new TableFoot();
