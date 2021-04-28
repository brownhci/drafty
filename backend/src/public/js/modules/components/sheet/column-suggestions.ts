/**
 * @module
 * As the name implies, this module provides autocomplete suggestions for a column. Therefore, it is different from {@link ./suggestions.ts} in that it does not bias a specific cell.
 */
import { alignElementHorizontally, placeElementAdjacently } from "./align";
import { columnSuggestionManager, editSuggestionManager } from "./suggestions";
import { getColumnSuggestionURL, getEditSuggestionURL } from "../../api/endpoints";
import { getIdSuggestion, getIdSuggestionType } from "../../api/record-interactions";
import { activeClass } from "../../constants/css-classes";
import { getCellInTableRow, getEnclosingTableCell } from "../../dom/navigate";
import { getColumnLabel, isColumnSearchInput, tableHeadSearchElement, tableFootElement } from "../../dom/sheet";
import { isInput } from "../../dom/types";
import { FuseSelect } from "../../fuse/sheet-fuse";
import { FuzzySelect } from "../../fuzzy/sheet-fuzzy";
import { debounce } from "../../utils/debounce";
import { tableDataManager, updateActiveTableCellElement } from "../../../sheet";

interface Option {
  suggestion: string;
}

class ColumnSuggestions {
  private container: HTMLElement = document.getElementById("column-suggestions");

  private target: HTMLTableCellElement;
  private inputElement: HTMLInputElement;

  private fuseSelect: FuseSelect = new FuseSelect();
  private fuzzySelect: FuzzySelect = new FuzzySelect();

  get isActive(): boolean {
    return this.container.classList.contains(activeClass);
  }

  /**
   * If suggestions are used for column search, then lower quality suggestions are acceptable.
   */
  private get isSuggestionsForColumnSearch(): boolean {
    return isColumnSearchInput(this.inputElement);
  }

  private get suggestionIdentifier(): number {
    const columnIndex = this.target.cellIndex;
    if (this.isSuggestionsForColumnSearch) {
      const columnLabel = getColumnLabel(columnIndex);
      return getIdSuggestionType(columnLabel);
    } else {
      const firstRow = tableDataManager.source[0].element_ as HTMLTableRowElement;
      return getIdSuggestion(getCellInTableRow(firstRow, columnIndex) as HTMLTableCellElement);
    }
  }

  private get suggestionFetchURL() {
    const identifier = this.suggestionIdentifier;
    if (this.isSuggestionsForColumnSearch) {
      return getColumnSuggestionURL(identifier);
    } else {
      return getEditSuggestionURL(identifier);
    }
  }

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

    /*
    this.fuseSelect.handleClickOnOption((text: string) => {
      // this dictates what happens when an autocompletion option is clicked
      if (this.inputElement) {
        this.inputElement.value = text;
        this.inputElement.dispatchEvent(new Event("input"));
        this.deactivate();
      }
    });
    this.fuseSelect.mount(element => this.container.appendChild(element));
    */

    this.fuzzySelect.handleClickOnOption((text: string) => {
      // this dictates what happens when an autocompletion option is clicked
      if (this.inputElement) {
        this.inputElement.value = text;
        this.inputElement.dispatchEvent(new Event("input"));
        this.deactivate();
      }
    });
    this.fuzzySelect.mount(element => this.container.appendChild(element));

    tableHeadSearchElement.addEventListener("focus", debounce(this.inputHandler)), true;
    tableHeadSearchElement.addEventListener("input", debounce(this.inputHandler)), true;
  }

  focusHandler(event: Event) {
    const target = event.target as HTMLElement;
    if (columnSuggestions.isActive && target !== columnSuggestions.inputElement) {
      columnSuggestions.deactivate(); // another element receives focus
    }
    if (isInput(target)) {
      const tableCellElement = getEnclosingTableCell(target);
      if (tableCellElement) {
        updateActiveTableCellElement(tableCellElement, false);
      }
    }
  }

  inputHandler(event: Event) {
    const target = event.target as HTMLElement;
    if (columnSuggestions.isActive && target === columnSuggestions.inputElement) {
      // the input for searching, filter the suggestions

      // FUZZY new
      columnSuggestions.fuzzySelect.query(columnSuggestions.inputElement.value, columnSuggestions.target.cellIndex);

      if (!columnSuggestions.isSuggestionsForColumnSearch) {
        // if the suggestion window is for column search, then no need to re-align
        columnSuggestions.align();
      }
    }
  }

  activate(target: HTMLTableCellElement) {
    this.target = target;
    this.inputElement = target.querySelector("input");
    // activate and align column-suggestions element
    this.container.classList.add(activeClass);
    this.align();
    // perform query
    this.fuzzySelect.query(this.inputElement.value, this.target.cellIndex);
    /*
    this.updateFuseSelect().then(() => {
      this.fuseSelect.query(this.inputElement.value);
    });
    */
    document.body.addEventListener("click", this.handleBodyClick, true);
  }

  deactivate() {
    this.container.classList.remove(activeClass);
    document.body.removeEventListener("click", this.handleBodyClick, true);
  }

  callLog(val: string) {
    console.log(val);
  }

  handleBodyClick(event: Event) {
    const target = event.target as HTMLElement;
    if (columnSuggestions.isActive && target !== this.inputElement) {
      columnSuggestions.deactivate();
    }
  }

  private async getSuggestions(
    handlerForCachedSuggestions?: (options: Array<Option>) => void,
    handlerForPulledSuggestions?: (options: Array<Option>) => void
  ) {
    const forColumnSearch: boolean = this.isSuggestionsForColumnSearch;
    const suggestionManager = forColumnSearch ? columnSuggestionManager : editSuggestionManager;
    return await suggestionManager.get(this.suggestionFetchURL, this.suggestionIdentifier.toString(), handlerForCachedSuggestions, (options) => {
      handlerForPulledSuggestions(options);
    });
  }

  private async updateFuseSelect() {
    //this.fuzzySelect.query(this.inputElement.value, this.target.cellIndex);

    return await this.getSuggestions(
      /*
      options => {
        this.fuzzySelect.query(this.inputElement.value, this.target.cellIndex);
        this.align();
      }
      */


      options => {
        this.fuseSelect.options = options ? options : [];
        //console.log('options 1 ')
        this.fuseSelect.sync();
        this.align();
      },
      options => {
        if (options === null || options.length === 0) {
          // no autocomplete options to show
          this.deactivate();
        } else {
          //console.log('options 2 ')
          this.fuseSelect.options = options;
          this.fuseSelect.sync();
          this.container.classList.add(activeClass);
          this.align();
        }
      }
    );
  }

  private align() {
    this.containerWidth = columnSuggestions.inputElement.offsetWidth + 80;

    const targetDimensions = this.inputElement.getBoundingClientRect();
    alignElementHorizontally(this.container, targetDimensions);
    placeElementAdjacently(this.container, targetDimensions);
  }

  /**
   * Checks whether a provided suggestion is one of the column suggestions for the specified column.
   *
   * @param {string} suggestion - The suggestion to test.
   * @param {number} columnIndex - The index of the column whose suggestions are tested.
   * @param {HTMLInputElement} [inputElement] - If the provided suggestion comes from a <input> element, provides the input so that if the current column suggestions window is attached to the specified input, the test can be shortened to simply searching the suggestion in `this.fuseSelect`.
   */
  async hasSuggestion(suggestion: string, columnIndex: number, inputElement?: HTMLInputElement): Promise<boolean> {
    if (inputElement && this.inputElement === inputElement) {
      return this.fuseSelect.hasSuggestion(suggestion);
    }

    return new Promise(resolve => {
      this.getSuggestions(
        options => resolve(options.some(option => option.suggestion === suggestion)),
        options => resolve(options.some(option => option.suggestion === suggestion))
      );
    });
  }
}

export const columnSuggestions = new ColumnSuggestions();
