import fuzzysort from "./fuzzysort";
import { Option as Opt } from "../components/sheet/suggestions";
import { fuseSelectRootContainerClass, autocompleteSuggestionClass, previousEditClass, optionContainerClass, optionClass, optionTextClass } from "../constants/css-classes";
import { activeClass } from "../constants/css-classes";
import { executeAtLeisure } from "../utils/defer";
import { tableDataManager, dataTemplate, tableRows } from "../../sheet";

// sw: convert to class so it can be reused
const fuzzySortOptions = {
    threshold: -1000, // Don't return matches worse than this (higher is faster)
    limit: 200,       // Don't return more results than this (lower is faster)
    allowTypo: true,  // Allwos a snigle transpoes (false is faster)

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
        const optionsContainer = this.createOptionContainer();
        this.rootContainer.appendChild(optionsContainer);
    }

    private createOptionContainer(): HTMLElement {
        const options: Array<Object> = [{suggestion:'MrMr'},{suggestion:'MrMr'}]
        const optionContainer = document.createElement("div");
        optionContainer.classList.add(optionContainerClass);
        if (options) {
            optionContainer.classList.add(activeClass);
        }
    
        for (let i = 0; i < options.length; i++) {
            const option: Object = options[i];
            const optionElement = document.createElement("div");
            const optionTextElement = document.createElement("span");
            optionTextElement.classList.add(optionTextClass);
            optionElement.appendChild(optionTextElement);
            optionContainer.appendChild(optionElement);
        }
    
        if (this.optionContainer) {
          // if there is already an option container mounted, replace the option container in DOM also
          this.optionContainer.replaceWith(optionContainer);
        }
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

    async getColumn(table: any, col: number) {
        let n: number = table.rows.length;
        let arr: Array<String> = [];

        for (let row = 0; row < n; ++row) {
            const newVal = table.rows[row].cells[col].innerHTML;
            if (!arr.includes(newVal)) {
                arr.push(newVal);
            }
        }
        arr.sort();

        return arr;
    }

   async test() {
        const colValues = await this.getColumn(tableRows, 1);
        const results2 = fuzzysort.go('mit', colValues, fuzzySortOptions)
        console.log(results2);
    }
}