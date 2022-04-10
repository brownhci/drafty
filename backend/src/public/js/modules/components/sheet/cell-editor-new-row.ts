/**
 * @module
 * This handles the individual inputs for add new row.
 */
import { alignElementHorizontally, placeElementAdjacently } from './align';
import { getNewRowValuesURL } from '../../api/endpoints';
import { getIdSuggestionType } from '../../api/record-interactions';
import { activeClass } from '../../constants/css-classes';
import { getEnclosingTableCell } from '../../dom/navigate';
import { getColumnLabel, tableFootElement } from '../../dom/sheet';
import { isInput } from '../../dom/types';
import { FuseSelect } from '../../fuse/sheet-fuse';
import { debounce } from '../../utils/debounce';
import { updateActiveTableCellElement } from '../../../sheet';
import { getJSON } from '../../api/requests';

interface Option {
    suggestion: string;
}

class CellEditNewRow {
    private container: HTMLElement = document.getElementById('cell-editor-new-row');

    private target: HTMLTableCellElement;
    private inputElement: HTMLInputElement;

    private fuseSelect: FuseSelect = new FuseSelect();

    get isActive(): boolean {
        return this.container.classList.contains(activeClass);
    }

    private get newRowValueFetchURL() {
        const columnIndex = this.target.cellIndex;
        const idSuggestionType = getIdSuggestionType(getColumnLabel(columnIndex));
        return getNewRowValuesURL(idSuggestionType);
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
        this.fuseSelect.isNewRow = true;
        this.fuseSelect.handleClickOnOption((text: string) => {
            // this dictates what happens when an autocompletion option is clicked
            if (this.inputElement) {
                this.inputElement.value = text;
                this.inputElement.dispatchEvent(new Event('input'));
                this.deactivate();
            }
        });
        this.fuseSelect.mount(element => this.container.appendChild(element));

        tableFootElement.addEventListener('infocus', debounce(this.inputHandler)), true;
        tableFootElement.addEventListener('input', debounce(this.inputHandler)), true;
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

    inputHandler(event: Event) {
        const target = event.target as HTMLElement;
        if (cellEditNewRow.isActive && target === cellEditNewRow.inputElement) {
            // the input for searching, filter the suggestions
            cellEditNewRow.fuseSelect.query(cellEditNewRow.inputElement.value);
            cellEditNewRow.align();
        }
    }

    async activate(target: HTMLTableCellElement) {
        //console.log(`activate autocomplete ${msg}`);
        this.target = target;
        this.inputElement = target.querySelector('input');
        
        await this.fetchNewRowValues(this.newRowValueFetchURL);
        this.fuseSelect.query(this.inputElement.value);

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

    private async fetchNewRowValues(url: string): Promise<Array<Option>> {
        const suggestions = await getJSON(url);
        if (!suggestions) {
            return null;
        }
        
        const arraySuggestionValues = Object.keys(suggestions)
            .map(function(key) {
                return suggestions[key];
            });

        const options: Array<Option> = arraySuggestionValues;
        this.fuseSelect.options = options;
        this.fuseSelect.sync();
        if(arraySuggestionValues.length > 0) {
            this.container.classList.add(activeClass);
            this.align();
        }
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
        return this.fuseSelect.hasSuggestion(suggestion);
    }
}

export const cellEditNewRow = new CellEditNewRow();