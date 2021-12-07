/**
 * @module
 * As the name implies, this module provides autocomplete suggestions for a column. Therefore, it is different from {@link ./suggestions.ts} in that it does not bias a specific cell.
 */
import { alignElementHorizontally, placeElementAdjacently } from './align';
import { activeClass } from '../../constants/css-classes';
import { tableHeadSearchElement } from '../../dom/sheet';
import { FuzzySelect } from '../../fuzzy/sheet-fuzzy';
import { debounce } from '../../utils/debounce';

class ColumnSuggestions {
  private container: HTMLElement = document.getElementById('column-suggestions');

  private target: HTMLTableCellElement;
  private inputElement: HTMLInputElement;

  private fuzzySelect: FuzzySelect = new FuzzySelect();

  get isActive(): boolean {
    return this.container.classList.contains(activeClass);
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

    this.fuzzySelect.handleClickOnOption((text: string) => {
      console.log('handleClickOnOption()');
      // this dictates what happens when an autocompletion option is clicked
      if (this.inputElement) {
        this.inputElement.value = text;
        this.inputElement.dispatchEvent(new Event('input'));

        console.log(`deactivate --- fuzzy handle click option`);
        this.deactivate();
      }
    });

    this.fuzzySelect.mount(element => this.container.appendChild(element));

    //tableHeadSearchElement.addEventListener("click", debounce(this.clickHandler)), true;
    //tableHeadSearchElement.addEventListener("focusin", debounce(this.focusinHandler)), false;
    tableHeadSearchElement.addEventListener('input', debounce(this.inputHandler)), true;
  }

  // sw testing
  /*
  async clickHandler(event: Event) {
    console.log("clickHandler()");
    const eventTarget = event.target as HTMLElement;
    const target = eventTarget.parentElement as HTMLTableCellElement;
    await columnSuggestions.fuzzySelect.prePopulateColValues(target.cellIndex);
    columnSuggestions.activate(target);
  }
  */

  inputHandler(event: Event) {
    const target = event.target as HTMLElement;
    if (columnSuggestions.isActive && target === columnSuggestions.inputElement) {
      // the input for searching, filter the suggestions
      // FUZZY new
      columnSuggestions.fuzzySelect.query(columnSuggestions.inputElement.value, columnSuggestions.target.cellIndex);
      columnSuggestions.align();
    }
  }

  activate(target: HTMLTableCellElement) {
    this.target = target;
    this.inputElement = target.querySelector('input');
    // activate and align column-suggestions element
    this.container.classList.add(activeClass);
    this.align();
    // perform query
    this.fuzzySelect.query(this.inputElement.value, this.target.cellIndex);
    document.body.addEventListener('click', this.handleBodyClick, true);
  }

  deactivate() {
    this.container.classList.remove(activeClass);
    document.body.removeEventListener('click', this.handleBodyClick, true);
  }

  handleBodyClick(event: Event) {
    const target = event.target as HTMLElement;
    if (columnSuggestions.isActive && target !== columnSuggestions.inputElement) {
      columnSuggestions.deactivate();
    }
  }

  private align() {
    this.containerWidth = columnSuggestions.inputElement.offsetWidth + 80;
    const targetDimensions = this.inputElement.getBoundingClientRect();
    alignElementHorizontally(this.container, targetDimensions);
    placeElementAdjacently(this.container, targetDimensions);
  }
}

export const columnSuggestions = new ColumnSuggestions();
