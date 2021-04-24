import fuzzysort from "fuzzysort";
import { Option as Opt } from "../components/sheet/suggestions";
import { fuseSelectRootContainerClass, autocompleteSuggestionClass, previousEditClass, optionContainerClass, optionClass, optionTextClass } from "../constants/css-classes";
import { activeClass } from "../constants/css-classes";
import { tableDataManager } from "../../sheet";
import { getCellInTableRow } from "../dom/navigate";

type Option = Partial<Opt>;

// sw: convert to class so it can be reused
const fuzzySortOptions = {
    threshold: -10000,  // Don't return matches worse than this (higher is faster)
    limit: 100,         // Don't return more results than this (lower is faster)
    allowTypo: true,    // Allows a single transpose (false is faster)

    key: "",      // For when targets are objects (see its example usage)
    keys: [] as string[],     // For when targets are objects (see its example usage)
    //scoreFn: null,  // For use with `keys` (see its example usage)
    // comment scoreFn to avoid TS errors
};

export class FuzzySelect {

    private optionContainer: HTMLElement;
    longestText: string;

    rootContainer: HTMLElement;
    private mounted: boolean = false;
    options: Fuzzysort.Results;

    constructor(options: Fuzzysort.Results = null) {
        this.options = options;
        this.initializeSelect();
    }

    private initializeSelect() {
        this.rootContainer = document.createElement("div");
        this.rootContainer.classList.add(fuseSelectRootContainerClass);
        this.addOptionsContainer();
    }

    private addOptionsContainer() {
        const optionsContainer = this.createOptionContainer(this.options);
        this.rootContainer.appendChild(optionsContainer);
    }

    private createOptionContainer(options: Fuzzysort.Results): HTMLElement {
        const optionContainer = document.createElement("div");
        optionContainer.classList.add(optionContainerClass);
        if (options) {
            optionContainer.classList.add(activeClass);
        }

        for (let i = 0; i < options.length; i++) {

            const option: Record<string, any> = options[i];
            const optionElement = document.createElement("div");
            const optionTextElement = document.createElement("span");

            optionElement.classList.add(autocompleteSuggestionClass);
            optionElement.classList.add(optionContainerClass);
            optionTextElement.classList.add(optionTextClass);

            const result: any = options[i]; // TODO: sw improve this
            optionTextElement.title = result.target;
            optionTextElement.innerHTML = fuzzysort.highlight(result, "<b>", "</b>");

            optionElement.appendChild(optionTextElement);
            optionContainer.appendChild(optionElement);
        }

        if (this.optionContainer) {
            // if there is already an option container mounted, replace the option container in DOM also
            this.optionContainer.replaceWith(optionContainer);
        }
        console.log(optionContainer);
        return this.optionContainer = optionContainer;
    }

    handleClickOnOption(callback: (text: string) => void) {
        this.rootContainer.addEventListener("click", function (event: MouseEvent) {
            let optionTextElement = (event.target as HTMLElement);

            if (optionTextElement.nodeName === "B") {
                // sw: this handles when someone clicks on a bold letter
                // when clicking on bold letter it return <b>some text</b> instead of the 
                // div required element containing the 'fuse-select-option' css class
                optionTextElement = optionTextElement.parentElement.parentElement.querySelector(`.${optionTextClass}`);
            } else if (!optionTextElement.classList.contains(optionTextClass)) {
                optionTextElement = optionTextElement.querySelector(`.${optionTextClass}`);
            }

            if (optionTextElement) {
                callback(optionTextElement.textContent);
                // the "click" event is fully handled here
                event.stopPropagation();
            }
        });
    }

    mount(mountMethod: (element: HTMLElement) => void, forceMount: boolean = false) {
        if (!this.mounted || forceMount) {
            mountMethod(this.rootContainer);
            this.mounted = true;
        }
    }

    unmount() {
        this.rootContainer.remove();
        this.mounted = false;
    }

    async getColumn(col: number) {
        const n: number = tableDataManager.source.length;
        const arr: Array<string> = [];
        for (let row = 0; row < n; ++row) {
            const rowEle = tableDataManager.source[row].element_ as HTMLTableRowElement;
            const cellValue = getCellInTableRow(rowEle, col).innerHTML;
            if (!arr.includes(cellValue)) {
                arr.push(cellValue);
            }
        }
        arr.sort();
        return arr;
    }

    async query(searchVal: string, columnIndex: number) {
        const colValues = await this.getColumn(columnIndex);
        const results: Fuzzysort.Results = fuzzysort.go(searchVal, colValues, fuzzySortOptions);
        this.createOptionContainer(results);
    }
}