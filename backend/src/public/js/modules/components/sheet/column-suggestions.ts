/**
 * @module
 * As the name implies, this module provides autocomplete suggestions for a column. Therefore, it is different from {@link ./suggestions.ts} in that it does not bias a specific cell.
 */
import { alignElementHorizontally, placeElementAdjacently } from "./align";
import { fetchSuggestions, Option } from "./suggestions";
import { getIdSuggestion, getIdSuggestionType } from "../../api/record-interactions";
import { activeClass } from "../../constants/css-classes";
import { getCellInTableRow } from "../../dom/navigate";
import { getColumnLabel, tableElement } from "../../dom/sheet";
import { FuseSelect } from "../../fuse/sheet-fuse";
import { measureTextWidth } from "../../utils/length";
import { LocalStorageCache } from "../../utils/local-storage";
import { tableDataManager } from "../../../sheet";


const optionCache = new LocalStorageCache(5 * 60 * 1000);
function optionCacheKeyFunction(idSuggestionType: string): string {
  return `column${idSuggestionType}-suggestions`;
}

class ColumnSuggestions {
  private container: HTMLElement = document.getElementById("column-suggestions");

  private target: HTMLTableCellElement;
  private inputElement: HTMLInputElement;

  private fuseSelect: FuseSelect = new FuseSelect();

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

    tableElement.addEventListener("focus", (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target !== this.inputElement) {
        // another element receives focus
        this.deactivate();
      }
    }, true);
  }

  activate(target: HTMLTableCellElement) {
    this.target = target;
    this.inputElement = target.querySelector("input");

    this.updateFuseSelect();
  }


  deactivate() {
    this.container.classList.remove(activeClass);
  }

  private parseSuggestions(suggestions: Array<Option>): Array<Option> {
    const parsedSuggestions = suggestions.filter(suggestion => suggestion.prevSugg === 0);
  parsedSuggestions.sort((suggestion1, suggestion2) => suggestion1.suggestion.localeCompare(suggestion2.suggestion));
  return parsedSuggestions;
  }

  private updateFuseSelect() {
    const columnLabel = getColumnLabel(this.target.cellIndex);
    const idSuggestionTypeString = getIdSuggestionType(columnLabel).toString();
    let options = optionCache.retrieve(optionCacheKeyFunction(idSuggestionTypeString)) as Array<Option>;
    if (!options) {
      // cannot retrieve unexpired autocomplete suggestions from local storage, create an empty placeholder for now
      options = [];
    }
    this.fuseSelect.options = options;
    this.fuseSelect.sync();
    this.align();

    const row = tableDataManager.source[0].element_ as HTMLTableRowElement;
    const idSuggestion = getIdSuggestion(getCellInTableRow(row, this.target.cellIndex));
    fetchSuggestions(idSuggestion).then(suggestions => {
      const options = this.parseSuggestions(suggestions);
      optionCache.store(optionCacheKeyFunction(idSuggestionTypeString), options);

      if (options.length === 0) {
        this.deactivate();
      } else {
        this.fuseSelect.options = options;
        this.fuseSelect.sync();
        this.container.classList.add(activeClass);
        this.align();
      }
    });
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
