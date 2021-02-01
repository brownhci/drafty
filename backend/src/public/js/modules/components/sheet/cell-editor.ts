/**
 * @module
 *
 * Input editor are a floating window that offers user the ability to edit table cell.
 */

import { verifyEdit } from "./edit-validation";
import { StatusMode, tableFoot } from "./table-foot";
import { FuseSelect } from "../../fuse/sheet-fuse";
import { initializeFuseSelect, updateFuseSelect } from "./suggestions";
import { alignElementHorizontally } from "./align";
import { activeClass, inputtingClass, invalidClass, userEditClass } from "../../constants/css-classes";
import { getViewportHeight, getViewportWidth } from "../../utils/length";
import { debounce } from "../../utils/debounce";
import { getColumnLabel, getTableRow, isColumnAutocompleteOnly, isTableCellEditable, setTableDataText, tableScrollContainer } from "../../dom/sheet";
import { getRightTableCellElement } from "../../dom/navigate";
import { getIdSuggestion, getIdSuggestionType, recordCellEdit } from "../../api/record-interactions";
import { tableDataManager, updateActiveTableCellElement } from "../../../sheet";

class CellEditor {
  private readonly formElement = document.getElementById("table-cell-input-form") as HTMLFormElement;
  /** everything except the CSRF input is contained inside this element */
  private readonly formContainerElement = this.formElement.lastElementChild;
  public readonly formInputElement = document.getElementById("table-cell-input-entry") as HTMLInputElement;
  private readonly inputInvalidFeedbackElement = document.getElementById("table-cell-input-feedback") as HTMLElement;

  cellElement: HTMLTableCellElement;

  /** click to go to the associated cell */
  private readonly locateCellButtonElement = document.getElementById("locate-cell") as HTMLButtonElement;
  /** whether the location element is shown in the input editor */

  /** a flag indicates whether the form will automatically deactivate when cell is no longer reachable by scrolling */
  private willFormDeactivateWhenCellNoLongerReachable: boolean = false;

  fuseSelect: FuseSelect;

  get isActive(): boolean {
    return this.formElement.classList.contains(activeClass);
  }

  private get isLocateCellActive(): boolean {
    return this.locateCellButtonElement.classList.contains(activeClass);
  }

  get formInput(): string {
    return this.formInputElement.value;
  }
  set formInput(value: string) {
    this.formInputElement.value = value;
    //this.resizeFormToFitText(value, 108); // sw: this gets called twice
  }

  private get formWidth(): number {
    return this.formElement.offsetWidth;
  }
  /**
   * Form width is lowerbounded by the target cell's width
   *
   * @param {number} width - A new width to set.
   */
  private set formWidth(width: number) {
    const cellWidth = this.cellElement ? this.cellElement.offsetWidth : 0;
    this.formElement.style.width = `${Math.max(cellWidth, width)}px`;
  }

  private get buttonHeight(): number {
    return this.isLocateCellActive? this.locateCellButtonElement.offsetHeight: 0;
  }

  private mouseMoveStartX: number = 0;
  private mouseMoveStartY: number = 0;

  private formElementXShift: number = 0;
  private formElementYShift: number = 0;

  /**
   * A flag used to signal the cell editor is being moved.
   */
  isRepositioning: boolean = false;

  numTimesHelpWasShown: number = 0;

  constructor() {
    this.initializeEventListeners();
    this.fuseSelect = initializeFuseSelect(this.formInputElement, element => this.mountFuseSelect(element));
  }

  /**
   * Determines whether the form should be repositioned according to mouse movement.
   * Reposition will start when the mouse target
   *
   *    + is a descendant of the form element
   *    + is neither the Return To Cell button nor the cell input
   *    + is not a descendant of autocompletion container
   */
  private willStartReposition(target: HTMLElement) {
    if(target === this.formInputElement || target === this.locateCellButtonElement) {
      return false;
    }

    if (this.fuseSelect.rootContainer.contains(target)) {
      return false;
    }

    return true;
  }

  private focusFormInput() {
    this.formInputElement.focus({ preventScroll: true });
  }

  private mountFuseSelect(element: HTMLElement) {
    this.formContainerElement.insertBefore(element, this.formContainerElement.lastElementChild);
  }

  private initializeEventListeners() {
    this.locateCellButtonElement.addEventListener("click", (event) => {
      if (this.isLocateCellActive) {
        const tableRow = getTableRow(this.cellElement);
        if (tableDataManager.isElementInRenderingView(tableRow)) {
          // cell is in rendering view, only alignment is needed
          this.alignTableCellInputForm();
        } else {
          // cell not in rendering view, need to put cell into rendering view before setting alignment
          if (tableDataManager.putElementInRenderingView(tableRow)) {
            tableDataManager.afterScrollUpdateTaskQueue.tasks.push({
              work: () => this.alignTableCellInputForm(),
              isRecurring: false
            });
          }
        }
      }
      event.preventDefault();
      event.stopPropagation();
    });

    tableScrollContainer.addEventListener("click", (event) => {
      if (!this.formElement.contains(event.target as HTMLElement)) {
        this.deactivateForm();
      }
    });

    tableScrollContainer.addEventListener("scroll", debounce(() => this.activateLocateCell()), { passive: true });

    this.formElement.addEventListener("submit", function(event: Event) {
      // disable submitting
      event.stopPropagation();
      event.preventDefault();
      return false;
    }, true);

    this.formElement.addEventListener("keydown", (event: KeyboardEvent) => {
      if (this.isActive) {
        switch (event.key) {
          case "Esc": // IE/Edge specific value
          case "Escape":
            this.closeForm(false);
            break;
          case "Enter":
            this.closeForm(true);
            event.preventDefault();
            break;
        }
        event.stopPropagation();
      }
    });

    this.formInputElement.addEventListener("input", (event) => {
      this.fuseSelect.query(this.formInput); // sw: TODO replace fuse
      event.stopPropagation();
    }, { passive: true });

    // mouse event handlers
    this.formElement.addEventListener("mousedown", (event: MouseEvent) => {
      this.activateLocateCell();
      if (this.willStartReposition(event.target as HTMLElement)) {
        // start repositioning if the mouse drag starts at an element inside the form but neither the return to cell button nor the input
        this.isRepositioning = true;
        // recording current client X and Y, this set a reference point
        this.mouseMoveStartX = event.clientX;
        this.mouseMoveStartY = event.clientY;
        event.preventDefault();
        event.stopPropagation();
      }
    }, { capture: true });

    tableScrollContainer.addEventListener("mousemove", debounce((event: MouseEvent) => {
      this.onMouseMove(event);
    }), { passive: true, capture: true });

    this.formElement.addEventListener("mouseup", (event: MouseEvent) => {
      this.onMouseUp(event);
      event.stopPropagation();
    }, { passive: true, capture: true });
  }

  onMouseMove(event: MouseEvent) {
    if (this.isRepositioning) {
      // shift is calculated as initial shift to reference point and subsequent shift to reference point
      const xShift = this.formElementXShift + event.clientX - this.mouseMoveStartX;
      const yShift = this.formElementYShift + event.clientY - this.mouseMoveStartY;
      this.formElement.style.transform = `translate(${xShift}px, ${yShift}px)`;
    }
  }

  onMouseUp(event: MouseEvent) {
    if (this.isRepositioning) {
      this.isRepositioning = false;
      // finalizes the shift amount since the movement has finished
      this.formElementXShift += event.clientX - this.mouseMoveStartX;
      this.formElementYShift += event.clientY - this.mouseMoveStartY;
      this.formElement.style.transform = `translate(${this.formElementXShift}px, ${this.formElementYShift}px)`;
      this.focusFormInput();
    }
  }

  /**
   * An invalid feedback indicates user input for cell is not valid.
   *
   * A possible cause is because the input must come from a set of predefined suggestions.
   *
   * @param {string} invalidFeedback - The invalid feedback to be shown underneath the input.
   */
  private activateInvalidFeedback(invalidFeedback: string) {
    this.inputInvalidFeedbackElement.textContent = invalidFeedback;
    this.inputInvalidFeedbackElement.classList.add(activeClass);
    this.formInputElement.classList.add(invalidClass);
  }

  private deactivateInvalidFeedback() {
    this.inputInvalidFeedbackElement.textContent = "";
    this.inputInvalidFeedbackElement.classList.remove(activeClass);
    this.formInputElement.classList.remove(invalidClass);
  }

  private deactivateLocateCell() {
    this.locateCellButtonElement.classList.remove(activeClass);
  }
  private activateLocateCell() {
    if (this.isActive && !this.isLocateCellActive) {
      this.locateCellButtonElement.classList.add(activeClass);
      // reposition the tableCellInputFormElement
      const formTop = parseFloat(this.formElement.style.top);
      this.formElement.style.top = `${formTop - this.buttonHeight}px`;
    }
  }

  deactivateForm() {
    this.deactivateInvalidFeedback();
    this.deactivateLocateCell();
    this.formInput = "";
    if (this.isActive) {
      this.formElement.classList.remove(activeClass);
      const columnIndex = this.cellElement.cellIndex;
      const columnLabel = getColumnLabel(columnIndex);
      if (columnLabel) {
        columnLabel.classList.remove(inputtingClass);
      }
    }
    this.cellElement = null;
    this.isRepositioning = false;
  }

  private deactivateFormWhenCellNoLongerReachable() {
    tableDataManager.afterScrollUpdateTaskQueue.tasks.push({
      work: () => {
        if (this.isActive) {
          // form is active
          const tableRow = getTableRow(this.cellElement);
          if (tableDataManager.isElementInRenderingView(tableRow)) {
            // cell in rendering view
            return;
          }
          if (!tableDataManager.isElementInPotentialView(tableRow)) {
            // cell is no longer reachable by scrolling, hide the form
            this.deactivateForm();
          }
        }
      },
      isRecurring: true
    });
  }

  /**
   * Close the cell editor.
   *
   * @param {boolean} saveEdit - Whether `this.formInput` will be saved and recorded.
   */
  closeForm(saveEdit: boolean) {
    if (saveEdit) {
      if (this.saveEdit()) {
        const cellToActivate = getRightTableCellElement(this.cellElement) || this.cellElement;
        this.deactivateForm();
        updateActiveTableCellElement(cellToActivate);
      }
    } else {
      this.cellElement.focus({ preventScroll: true });
      this.deactivateForm();
    }
  }

  activateForm(cellElement: HTMLTableCellElement, searchVal: string) {
    if (cellElement && isTableCellEditable(cellElement)) {
      if (!this.willFormDeactivateWhenCellNoLongerReachable) {
        // one-time setup for automatic deactivation of cell editor
        this.deactivateFormWhenCellNoLongerReachable();
        this.willFormDeactivateWhenCellNoLongerReachable = true;
      }

      this.cellElement = cellElement;
      const columnIndex = this.cellElement.cellIndex;
      const columnLabel = getColumnLabel(columnIndex);
      this.resizeFormToFitText(columnLabel.offsetWidth);

      this.formElement.classList.add(activeClass); // sw: shows edit input on DOM
      this.focusFormInput();

      // remount the fuse select
      this.fuseSelect.mount(element => this.mountFuseSelect(element));
      updateFuseSelect(this.fuseSelect, getIdSuggestion(this.cellElement), getIdSuggestionType(columnLabel));

      this.alignTableCellInputForm(); 
      this.showHelpWhenInactivityReached();
    }
  }

  /**
   * If the cell editor is open while no activity taken for some period of time, show help tip.
   *
   * Inactivity criterion:
   *    + `this.cellElement` does not change
   *    + `this.formInput` does not change
   */
  private showHelpWhenInactivityReached() {
    if (this.isActive && this.numTimesHelpWasShown < 5) {
      const cellElement = this.cellElement;
      const formInput = this.formInput;
      window.setTimeout(() => {
        if (this.isActive && this.cellElement === cellElement && this.formInput === formInput) {
          // inactivity
          tableFoot.setStatusTimeout(StatusMode.CellEditorHelp, 5000);
          this.numTimesHelpWasShown++;
        } else {
          this.showHelpWhenInactivityReached();
        }
      }, (5 + this.numTimesHelpWasShown * 3) * 1000);
    }
  }

  /* sw: this is getting called twice on cell input */
  alignTableCellInputForm() {
    // reset last shifting
    this.formElement.style.transform = "";
    this.formElementXShift = 0;
    this.formElementYShift = 0;

    // configure placement
    const targetCellElement = this.cellElement;
    const cellDimensions = targetCellElement.getBoundingClientRect();
    const cellHeight = cellDimensions.height;
    let {top: cellTop, bottom: cellBottom} = cellDimensions;
    let {width: formWidth, height: formHeight} = this.formElement.getBoundingClientRect();

    const verticalScrollBarWidth = tableScrollContainer.offsetWidth - tableScrollContainer.clientWidth;
    const viewportWidth = getViewportWidth() - verticalScrollBarWidth;
    const horizontalScrollBarHeight = tableScrollContainer.offsetHeight - tableScrollContainer.clientHeight;
    const viewportHeight = getViewportHeight() - horizontalScrollBarHeight;

    const topFromPageTopLimit = tableDataManager.startFillerFromPageTop;
    // the concerned viewport is restricted to the table rows in <tbody>
    const viewportTopPadding = topFromPageTopLimit;
    const bottomFromPageTopLimit = Math.max(viewportHeight, tableDataManager.endFillerFromPageTop);

    if (formWidth > viewportWidth) {
      formWidth = viewportWidth;
      this.formElement.style.width = `${formWidth}px`;
    }

    /* set horizontal placement */
    alignElementHorizontally(this.formElement, cellDimensions);

    if (formHeight > viewportHeight) {
      this.fuseSelect.unmount();
      formHeight = this.formElement.getBoundingClientRect().height;
    }
    /**
     * set vertical placement
     * two choices for vertical placement
     *   1. top border (offset by buttonHeight) of form stick to the top border of the target cell
     *   2. bottom border of form stick to the bottom border of the target cell
     */
    const buttonHeight = this.buttonHeight;

    const cellTopFromPageTop = targetCellElement.offsetTop;
    const cellBottomFromPageTop = cellTopFromPageTop + cellHeight;
    let formTop: number;
    if (cellTopFromPageTop + formHeight - buttonHeight < bottomFromPageTopLimit) {
      // option 1
      if (cellTop < viewportTopPadding) {
        // top border of form is to the top of the viewport
        const upShiftAmount: number = viewportTopPadding - cellTop;
        cellTop += upShiftAmount;
        tableScrollContainer.scrollTop -= upShiftAmount;
      } else if (cellTop + formHeight - buttonHeight > viewportHeight) {
        // bottom border of form is to the bottom of the viewport
        const downShiftAmount: number = cellTop + formHeight - buttonHeight - viewportHeight;
        cellTop -= downShiftAmount;
        tableScrollContainer.scrollTop += downShiftAmount;
      }
      formTop = cellTop - buttonHeight;
    } else if (cellBottomFromPageTop - formHeight + buttonHeight >= topFromPageTopLimit) {
      // option 2
      if (cellBottom > viewportHeight) {
        // bottom border of form is to the bottom of the viewport
        const downShiftAmount: number = cellBottom - viewportHeight;
        cellBottom -= downShiftAmount;
        tableScrollContainer.scrollTop += downShiftAmount;
      } else if (cellBottom - formHeight + buttonHeight < viewportTopPadding) {
        // top border of form is to the top of the viewport
        const upShiftAmount: number = viewportTopPadding - (cellBottom - formHeight + buttonHeight);
        cellBottom += upShiftAmount;
        tableScrollContainer.scrollTop -= upShiftAmount;
      }
      formTop = cellBottom - formHeight + buttonHeight;
    }
    this.formElement.style.top = `${formTop}px`;
  }


  /**
   * Change `this.formWidth` in order to fully display text.
   *
   * @param {string} - The text to be fit.
   * @param {slack} - An addition term to be added on the text width. This could be used to account for padding, margin...
   */
  private resizeFormToFitText(textWidth: number, slack: number = 0) {
    //this.formWidth = measureTextWidth(text) + slack; // measureTextWidth is a huge performance hit
    this.formWidth = textWidth + slack;
  }

  /**
   * Save and record the current `this.formInput`.
   *
   * In the case where the cell's value must be one from the predefined suggestions, inputting a different value will activate the invalid feedback and saving will fail.
   *
   * @returns {boolean} Whether the saving succeeded. If saving succeeds, cleanup action like closing the form or emptying the input can be taken.
   */
  saveEdit(): boolean {
    const edit = this.formInput;
    const cellElement = this.cellElement;

    // check validity of edit
    let validationResult = true;
    let invalidFeedback: string;
    const idSuggestionType = getIdSuggestionType(getColumnLabel(cellElement.cellIndex));
    if (!verifyEdit(edit, idSuggestionType)) {
      validationResult = false;
      invalidFeedback = "Value does not pass validation";
    }
    if (isColumnAutocompleteOnly(getColumnLabel(cellElement.cellIndex))) {
      if (!this.fuseSelect.hasSuggestion(edit)) {
        validationResult = false;
        invalidFeedback = "Value must come from suggestions";
      }
    }
    if (validationResult) {
      this.deactivateInvalidFeedback();
    } else {
      this.activateInvalidFeedback(invalidFeedback);
      return false;
    }

    // save edit
    if (cellElement) {
      setTableDataText(cellElement, edit);
      // mark this cell as user edited
      cellElement.classList.add(userEditClass);
      // call backend api to send user submission
      recordCellEdit(cellElement, edit);
    }
    return true;
  }
}

export const cellEditor = new CellEditor();
