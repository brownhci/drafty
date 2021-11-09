/**
 * @module
 * This handles the individual inputs for add new row.
 */
import { alignElementHorizontally, placeElementAdjacently } from "./align";
import { editSuggestionManager } from "./suggestions";
import { getEditSuggestionURL } from "../../api/endpoints";
import { getIdSuggestion } from "../../api/record-interactions";
import { activeClass } from "../../constants/css-classes";
import { getCellInTableRow, getEnclosingTableCell } from "../../dom/navigate";
import { tableFootElement } from "../../dom/sheet";
import { isInput } from "../../dom/types";
import { FuseSelect } from "../../fuse/sheet-fuse";
import { debounce } from "../../utils/debounce";
import { tableDataManager, updateActiveTableCellElement } from "../../../sheet";

interface Option {
    suggestion: string;
}

class CellEditNewRow {
    private container: HTMLElement = document.getElementById("cell-editor-new-row");

    private target: HTMLTableCellElement;
    private inputElement: HTMLInputElement;

    private fuseSelect: FuseSelect = new FuseSelect();

    get isActive(): boolean {
        return this.container.classList.contains(activeClass);
    }

    private get suggestionIdentifier(): number {
        const columnIndex = this.target.cellIndex;
        const firstRow = tableDataManager.source[0].element_ as HTMLTableRowElement;
        return getIdSuggestion(getCellInTableRow(firstRow, columnIndex) as HTMLTableCellElement);
    }

    private get suggestionFetchURL() {
        const identifier = this.suggestionIdentifier;
        return getEditSuggestionURL(identifier);
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
                this.inputElement.dispatchEvent(new Event("input"));
                this.deactivate();
            }
        });
        this.fuseSelect.mount(element => this.container.appendChild(element));

        tableFootElement.addEventListener("infocus", debounce(this.inputHandler)), true;
        tableFootElement.addEventListener("input", debounce(this.inputHandler)), true;
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

    activate(target: HTMLTableCellElement) {
        this.target = target;
        this.inputElement = target.querySelector("input");

        this.updateFuseSelect().then(() => {
            this.fuseSelect.query(this.inputElement.value);
        });
        document.body.addEventListener("click", this.handleBodyClick, true);
    }

    deactivate() {
        this.container.classList.remove(activeClass);
        document.body.removeEventListener("click", this.handleBodyClick, true);
    }

    handleBodyClick(event: Event) {
        const target = event.target as HTMLElement;
        if (cellEditNewRow.isActive && target !== this.inputElement) {
            cellEditNewRow.deactivate();
        }
    }

    private async getSuggestions(
        handlerForCachedSuggestions?: (options: Array<Option>) => void,
        handlerForPulledSuggestions?: (options: Array<Option>) => void
    ) {
        return await editSuggestionManager.get(this.suggestionFetchURL, this.suggestionIdentifier.toString(), handlerForCachedSuggestions, (options) => {
            options = options.filter(option => option.suggestion !== "");
            handlerForPulledSuggestions(options);
        });
    }

    private async updateFuseSelect() {
        return await this.getSuggestions(
            // handles initial keystroke
            options => {
                this.fuseSelect.options = options ? options : [];
                this.fuseSelect.sync();
                this.align();
            },
            // handles other inputs
            options => {
                if (options === null || options.length === 0) {
                    // no autocomplete options to show
                    this.deactivate();
                } else {
                    this.fuseSelect.options = options;
                    this.fuseSelect.sync();
                    this.container.classList.add(activeClass);
                    this.align();
                }
            }
        );
    }

    private align() {
        //const longestText = this.fuseSelect.longestText;
        //this.containerWidth = measureTextWidth(longestText) + 88; // sw: kills performance
        this.containerWidth = cellEditNewRow.inputElement.offsetWidth + 80;

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

export const cellEditNewRow = new CellEditNewRow();