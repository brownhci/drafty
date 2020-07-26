import { activeClass } from "../../constants/css-classes";
import { numTableColumns, tableElement, tableFootElement } from "../../dom/sheet";
import { tableDataManager } from ".././../../sheet";


/**
 * Describes what `statusTableRow` is used for
 */
export enum StatusMode {
  /** `statusTableRow` is used for assisting `insertionTableRow` */
  Insertion = "insertion",
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

  private insertionInputs: HTMLCollection = this.insertionTableRow.getElementsByTagName("input");

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
          break;
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
  /** show in the status table row, used for discarding the data inputted for the new row */
  private insertionDiscardButton: HTMLButtonElement = document.createElement("button");

  constructor() {
    this.statusTableCell.colSpan = numTableColumns;
    // Idle is the initial mode, supplement its class
    this.statusTableRow.classList.add(StatusMode.Idle);

    // button initialization
    this.insertionConfirmButton.type = "button";
    this.insertionConfirmButton.id = "confirm-newrow";
    this.insertionConfirmButton.textContent = "Confirm";
    this.insertionDiscardButton.type = "button";
    this.insertionDiscardButton.id = "discard-newrow";
    this.insertionDiscardButton.textContent = "Discard";

    tableElement.addEventListener("click", (event: MouseEvent) => {
      const target: HTMLElement = event.target as HTMLElement;
      if (this.isInserting) {
        if (target === this.insertionDiscardButton) {
          this.discardInputValues();
        } else if (target === this.insertionConfirmButton) {
          // TODO confirm
        }
      }
    }, true);
  }

  private updateRowCount() {
    this.statusTableCell.textContent = `Count: ${tableDataManager.rowCount}`;
  }

  private discardInputValues() {
    for (const inputElement of this.insertionInputs) {
      (inputElement as HTMLInputElement).value = "";
    }
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
   *    the status will be restored to `StatusMode.Idle` status.
   *
   * If after the status has updated and before the status is restored, another call to `setStatusTimeout`
   *    happens, table footer will be set to the new status and its status will be restored after the
   *    new timeout expires.
   *
   * @param {StatusMode} statusMode - A status mode to set to.
   * @param {number} timeout - See the timeout argument in {@link Window.setTimeout}.
   *    This defines how long the table footer will be in the specified status.
   */
  setStatusTimeout(statusMode: StatusMode, timeout: number) {
    if (this.isInserting) {
      // disable status update when inserting a new row
      return;
    }

    this.statusMode = statusMode;
    window.clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => this.statusMode = StatusMode.Idle, timeout);
  }
}

export const tableFoot = new TableFoot();
