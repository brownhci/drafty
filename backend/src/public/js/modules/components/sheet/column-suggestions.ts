/**
 * @module
 * As the name implies, this module provides autocomplete suggestions for a column. Therefore, it is different from {@link ./suggestions.ts} in that it does not bias a specific cell.
 */
import { alignElementHorizontally, placeElementAdjacently } from "./align";
import { updateFuseSelect } from "./suggestions";
import { getIdSuggestion, getIdSuggestionType } from "../../api/record-interactions";
import { activeClass } from "../../constants/css-classes";
import { getCellInTableRow } from "../../dom/navigate";
import { getColumnLabel } from "../../dom/sheet";
import { FuseSelect } from "../../fuse/sheet-fuse";
import { measureTextWidth } from "../../utils/length";
import { tableDataManager } from "../../../sheet";

class ColumnSuggestions {
  private container: HTMLElement = document.getElementById("column-suggestions");

  private target: HTMLTableCellElement;
  private inputElement: HTMLInputElement;

  private fuseSelect: FuseSelect = new FuseSelect();

  private onBlur = () => this.deactivate();

  private get containerWidth(): number {
    return this.container.offsetWidth;
  }

  /**
   * Container width is lowerbounded by the target input element width
   *
   * @param {number} width - A new width to set
   */
  private set containerWidth(width: number) {
    const inputWidth = this.inputElement ? this.inputElement.offsetWidth : 0;
    this.container.style.width = `${Math.max(inputWidth, width)}px`;
  }

  constructor() {
    this.fuseSelect.handleClickOnOption((text: string) => {
      if (this.inputElement) {
        this.inputElement.value = text;
        this.inputElement.dispatchEvent(new Event("input"));
        this.inputElement.focus();
      }
    });
    this.fuseSelect.mount(element => this.container.appendChild(element));
  }

  activate(target: HTMLTableCellElement) {
    this.container.classList.add(activeClass);

    this.target = target;
    if (this.inputElement) {
      this.inputElement.removeEventListener("blur", this.onBlur);

    }
    this.inputElement = target.querySelector("input");
    this.inputElement.addEventListener("blur", this.onBlur);

    this.updateFuseSelect();
    this.align();
  }


  deactivate() {
    this.container.classList.remove(activeClass);
  }

  private updateFuseSelect() {
    const columnLabel = getColumnLabel(this.target.cellIndex);
    const idSuggestionType = getIdSuggestionType(columnLabel);
    const row = tableDataManager.fullView[0].element_ as HTMLTableRowElement;
    const idSuggestion = getIdSuggestion(getCellInTableRow(row, this.target.cellIndex));
    updateFuseSelect(this.fuseSelect, idSuggestion, idSuggestionType, () => this.align());
  }

  private align() {
    const longestText = this.fuseSelect.longestText;
    this.containerWidth = measureTextWidth(longestText) + 88;

    const targetDimensions = this.inputElement.getBoundingClientRect();
    alignElementHorizontally(this.container, targetDimensions);
    placeElementAdjacently(this.container, targetDimensions);
  }
}

export const columnSuggestions = new ColumnSuggestions();
