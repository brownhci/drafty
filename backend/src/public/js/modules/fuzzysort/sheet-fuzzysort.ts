import * as Fuzzy from "./fuzzysort";
import { Option as Opt } from "../components/sheet/suggestions";
import { fuseSelectRootContainerClass, autocompleteSuggestionClass, previousEditClass, optionContainerClass, optionClass, optionTextClass } from "../constants/css-classes";
import { activeClass } from "../constants/css-classes";
import { tableDataManager } from "../../sheet";
import { getCellInTableRow } from "../dom/navigate";

type Option = Partial<Opt>;

// sw: convert to class so it can be reused
const fuzzySortOptions = {
    threshold: -10000, // Don't return matches worse than this (higher is faster)
    limit: 100,       // Don't return more results than this (lower is faster)
    allowTypo: true,  // Allows a single transpose (false is faster)

    key: null, // For when targets are objects (see its example usage)
    keys: null, // For when targets are objects (see its example usage)
    scoreFn: null, // For use with `keys` (see its example usage)
}

export class FuzzySelect {

    private optionContainer: HTMLElement;
    longestText: string;

    rootContainer: HTMLElement;
    private mounted: boolean = false;
    options: Array<Object>;

    constructor(options: Array<Object> = []) {
        this.options = options;

        this.initializeSelect();
    }

    private initializeSelect() {
        this.rootContainer = document.createElement("div");
        this.rootContainer.classList.add(fuseSelectRootContainerClass);
        this.addOptionsContainer();
    }

    private addOptionsContainer() {
        //const optionsContainer = this.createOptionContainer();
        //this.rootContainer.appendChild(optionsContainer);
    }

    private createOptionContainer(options: Array<Object>): HTMLElement {
        const optionContainer = document.createElement("div");
        optionContainer.classList.add(optionContainerClass);
        if (options) {
            optionContainer.classList.add(activeClass);
        }

        for (let i = 0; i < options.length; i++) {

            const option: Object = options[i];
            const optionElement = document.createElement("div");
            const optionTextElement = document.createElement("span");

            optionElement.classList.add(autocompleteSuggestionClass);
            optionElement.classList.add(optionContainerClass);
            optionTextElement.classList.add(optionTextClass);

            const result: any = options[i]; // TODO: sw improve this
            optionTextElement.title = result.target;
            optionTextElement.innerHTML = Fuzzy.highlight(result, '<b>', '</b>')

            optionElement.appendChild(optionTextElement);
            optionContainer.appendChild(optionElement);
        }

        if (this.optionContainer) {
            // if there is already an option container mounted, replace the option container in DOM also
            this.optionContainer.replaceWith(optionContainer);
        }
        console.log(optionContainer)
        return this.optionContainer = optionContainer;
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
        let n: number = tableDataManager.source.length;
        let arr: Array<String> = [];
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

    async test(searchVal: string, columnIndex: number) {
        const colValues = await this.getColumn(columnIndex);
        const results: Array<Fuzzysort.Result> = Fuzzy.go(searchVal, colValues, fuzzySortOptions)

        console.log('\n');

        /*
        console.log(fuzzysort.highlight(fuzzysort.single('tt', 'test'), '*', '*'))
    
        console.log('search val and col index =', searchVal, columnIndex);
        console.log('length =', results.length);
        console.log(results[0]);
        console.log(results);
        */

        this.createOptionContainer(results)
    }
}