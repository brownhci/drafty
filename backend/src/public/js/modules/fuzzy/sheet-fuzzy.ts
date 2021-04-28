import fuzzysort from "fuzzysort";
//import { Option as Opt } from "../components/sheet/suggestions";
import { fuseSelectRootContainerClass, autocompleteSuggestionClass, previousEditClass, optionContainerClass, optionClass, optionTextClass } from "../constants/css-classes";
import { activeClass } from "../constants/css-classes";
import { tableDataManager } from "../../sheet";
import { getCellInTableRow } from "../dom/navigate";

// sw: convert to class so it can be reused
const fuzzySortOptions = {
    threshold: -10000,  // Don't return matches worse than this (higher is faster)
    limit: 100,         // Don't return more results than this (lower is faster)
    allowTypo: true,    // Allows a single transpose (false is faster)

    key: "",      // For when targets are objects (see its example usage)
    keys: [] as string[],     // For when targets are objects (see its example usage)
    // scoreFn: null,  // For use with `keys` (see its example usage)
    // comment scoreFn to avoid TS errors
};
fuzzySortOptions.key = null;
fuzzySortOptions.keys = null;

export class FuzzySelect {
    private options: Fuzzysort.Results;

    /**
    * @returns The count of suggestions that are actually rendered.
    */
    get activeSuggestionCount(): number {
        return this.optionContainer.childElementCount;
    }

    private suggestions: Set<string>;
    private suggestionsLookup: Set<string>;

    private optionContainer: HTMLElement;
    longestText: string;

    rootContainer: HTMLElement;
    private mounted: boolean = false;

    constructor(options: Fuzzysort.Results = fuzzysort.go("", [], fuzzySortOptions)) {
        this.options = options;
        this.initializeSelect();
    }

    hasSuggestion(query: string): boolean {
        return this.suggestionsLookup.has(query.toLowerCase());
    }

    private initializeSelect() {
        this.rootContainer = document.createElement("div");
        this.rootContainer.classList.add(fuseSelectRootContainerClass);
        this.addOptionsContainer();
    }

    private hideOptionContainerIfNoOptions() {
        if (this.optionContainer) {
            // hide the option container wrapper when there are no options
            if (this.options.total) {
                this.optionContainer.classList.add(activeClass);
            } else {
                this.optionContainer.classList.remove(activeClass);
            }
        }
    }

    private addOptionsContainer() {
        const optionsContainer = this.createNewResultsContainer(this.options);
        this.rootContainer.appendChild(optionsContainer);
    }

    private createOptionContainer(options: any): HTMLElement {
        const optionContainer = document.createElement("div");
        optionContainer.classList.add(optionContainerClass);
        if (options) {
            optionContainer.classList.add(activeClass);
        }
        return optionContainer;
    }

    private createOptionElement(): HTMLElement {
        const optionElement = document.createElement("div");
        optionElement.classList.add(optionClass);
        optionElement.classList.add(autocompleteSuggestionClass);
        return optionElement;
    }

    private createOptionText(): HTMLElement {
        const optionTextElement = document.createElement("span");
        optionTextElement.classList.add(optionTextClass);
        return optionTextElement;
    }

    private createNewResultsContainer(options: Fuzzysort.Results): HTMLElement {
        const optionContainer = this.createOptionContainer(options);

        for (let i = 0; i < options.total; i++) {
            const optionElement = this.createOptionElement();
            const optionTextElement = this.createOptionText();

            const option: Fuzzysort.Result = options[i];
            optionTextElement.title = option.target;
            optionTextElement.innerHTML = option.target;
            //optionTextElement.innerHTML = fuzzysort.highlight(option, "<b>", "</b>");

            optionElement.appendChild(optionTextElement);
            optionContainer.appendChild(optionElement);
        }

        // not working
        if (this.optionContainer) {
            // if there is already an option container mounted, 
            // replace the option container in DOM also
            this.optionContainer.replaceWith(optionContainer);
        }

        // working
        this.rootContainer.replaceWith(optionContainer);

        return this.optionContainer = optionContainer;
    }

    private createDefaultResultsContainer(options: Array<string>) {
        const optionContainer = this.createOptionContainer(options);

        for (let i = 0; i < options.length; i++) {
            const optionElement = this.createOptionElement();
            const optionTextElement = this.createOptionText();

            const option: string = options[i];
            optionTextElement.title = option;
            optionTextElement.innerHTML = option;

            optionElement.appendChild(optionTextElement);
            optionContainer.appendChild(optionElement);
        }

        // not working
        if (this.optionContainer) {
            // if there is already an option container mounted, 
            // replace the option container in DOM also
            this.optionContainer.replaceWith(optionContainer);
        }

        // working
        this.rootContainer.replaceWith(optionContainer);
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
        console.log("new search... at column = " + col);
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
        const colValues: Array<string> = await this.getColumn(columnIndex);
        const results: Fuzzysort.Results = fuzzysort.go(searchVal, colValues, fuzzySortOptions);
        console.log(`results total = ${results.total}`);
        if (results.total > 0) {
            this.createNewResultsContainer(results);
        } else {
            this.createDefaultResultsContainer(colValues);
        }
    }
}