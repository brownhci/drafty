/**
 * @module
 * This handles the individual inputs for add new row.
 */
import { alignElementHorizontally, placeElementAdjacently } from './align';
import { activeClass } from '../../constants/css-classes';
import { getEnclosingTableCell } from '../../dom/navigate';
import { tableFootElement } from '../../dom/sheet';
import { isInput } from '../../dom/types';
import { FuzzySelect } from '../../fuzzy/sheet-fuzzy';
import { updateActiveTableCellElement } from '../../../sheet';
import { getJSON } from '../../api/requests';
import { convertArrayOption, getAddNewRowValuesURL } from './suggestions';

class CellEditNewRow {
    private container: HTMLElement = document.getElementById('cell-editor-new-row');

    private target: HTMLTableCellElement;
    private inputElement: HTMLInputElement;

    private fuzzySelect: FuzzySelect = new FuzzySelect();
    private options: Array<string>;

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
        this.fuzzySelect.isNewRow = true;
        this.fuzzySelect.handleClickOnOption((text: string) => {
            // this dictates what happens when an autocompletion option is clicked
            if (this.inputElement) {
                this.inputElement.value = text;
                this.inputElement.dispatchEvent(new Event('input'));
                this.deactivate();
            }
        });
        this.fuzzySelect.mount(element => this.container.appendChild(element));
        tableFootElement.addEventListener('infocus', event => this.inputHandler(event, this.options));
        tableFootElement.addEventListener('input', event => this.inputHandler(event, this.options));
    }


    focusHandler(event: Event) {
        const target = event.target as HTMLElement;
        if (cellEditNewRow.isActive && target !== cellEditNewRow.inputElement) {
            cellEditNewRow.deactivate(); // another element receives focus
        }

        if (isInput(target)) {
            const tableCellElement = getEnclosingTableCell(target);
            if (tableCellElement) {
                updateActiveTableCellElement(tableCellElement, false);
            }
        }
    }

    inputHandler(event: Event, options: Array<string>) {
        const target = event.target as HTMLElement;
        if (cellEditNewRow.isActive && target === cellEditNewRow.inputElement) {
            cellEditNewRow.fuzzySelect.queryNewRow(cellEditNewRow.inputElement.value, options);
            cellEditNewRow.align();
        }
    }

    async activate(target: HTMLTableCellElement) {
        this.target = target;
        this.inputElement = target.querySelector('input');
        const newRowValuesURL = getAddNewRowValuesURL(this.target.cellIndex);
        this.options = await this.fetchNewRowValues(newRowValuesURL);
        this.fuzzySelect.queryNewRow(this.inputElement.value, this.options);
        document.body.addEventListener('click', this.handleBodyClick, true);
    }

    deactivate() {
        this.container.classList.remove(activeClass);
        document.body.removeEventListener('click', this.handleBodyClick, true);
    }

    handleBodyClick(event: Event) {
        const target = event.target as HTMLElement;
        if (cellEditNewRow.isActive && target !== this.inputElement) {
            cellEditNewRow.deactivate();
        }
    }

    private async fetchNewRowValues(url: string): Promise<Array<string>> {
        const suggestionTypeValues = await getJSON(url);
        if (!suggestionTypeValues) {
            return null;
        }
        const suggestions: Array<string> = convertArrayOption(suggestionTypeValues);
        if(suggestionTypeValues.length > 0) {
            this.container.classList.add(activeClass);
            this.align();
        }
        return suggestions;
    }

    private align() {
        this.containerWidth = cellEditNewRow.inputElement.offsetWidth + 80;
        const targetDimensions = this.inputElement.getBoundingClientRect();
        alignElementHorizontally(this.container, targetDimensions);
        placeElementAdjacently(this.container, targetDimensions, false);
    }

    /**
     * Checks whether a provided suggestion is one of the column suggestions for the specified column.
     */
    async hasSuggestion(suggestion: string): Promise<boolean> {
        if(this.options) {
            return this.options.includes(suggestion);
        } else {
            return false;
        }
    }
}

export const cellEditNewRow = new CellEditNewRow();