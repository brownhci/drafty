import Fuse from "./fuse";
import { Option } from "../components/sheet/suggestions";
import { fuseSelectRootContainerClass, autocompleteSuggestionClass, previousEditClass, optionContainerClass, optionClass, optionTextClass } from "../constants/css-classes";
import { activeClass } from "../constants/css-classes";

/* in memory cache */
const fuseOptions: Fuse.IFuseOptions<Option> = {
    includeMatches: true,
    shouldSort: true,
    findAllMatches: true,
    keys: [
      "suggestion"
    ]
  };

export class FuseSelect {
  private _options: Array<Option>;
  get options(): Array<Option> {
    return this._options;
  }
  set options(options: Array<Option>) {
    this.longestText = "";
    this.suggestions = new Set();
    options.forEach(option => {
      const suggestion = option.suggestion;
      this.suggestions.add(suggestion);
      if (suggestion.length > this.longestText.length) {
        this.longestText = suggestion;
      }
    });

    this._options = options;
    this.fuse = new Fuse(this.options, fuseOptions);
    this.hideOptionContainerIfNoOptions();
  }
  private suggestions: Set<string>;

  private fuse: Fuse<Option, Fuse.IFuseOptions<Option>>;
  private optionContainer: HTMLElement;
  longestText: string;

  private rootContainer: HTMLElement;
  private mounted: boolean = false;

  constructor(options: Array<Option> = []) {
    this.options = options;

    this.initializeSelect();
  }

  private hideOptionContainerIfNoOptions() {
    if (this.optionContainer) {
      // hide the option container wrapper when there is no options
      if (this.options.length) {
        this.optionContainer.classList.add(activeClass);
      } else {
        this.optionContainer.classList.remove(activeClass);
      }
    }
  }

  hasSuggestion(query: string): boolean {
    return this.suggestions.has(query);
  }

  private initializeSelect() {
    this.rootContainer = document.createElement("div");
    this.rootContainer.classList.add(fuseSelectRootContainerClass);
    this.addOptionsContainer();
  }

  handleClickOnOption(callback: (text: string) => void) {
    this.rootContainer.addEventListener("click", function (event: MouseEvent) {
      let optionTextElement = (event.target as HTMLElement);
      if (!optionTextElement.classList.contains(optionTextClass)) {
        optionTextElement = optionTextElement.querySelector(`.${optionTextClass}`);
      }

      if (optionTextElement) {
        callback(optionTextElement.textContent);
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

  /**
   * This function causes out-of-sync between view layer (HTML layer) and model layer (Javascript layer) as it filters the options using fuse.js and only rendering the filtered options.
   *
   * @param {string} q - The user inputted query.
   */
  query(q: string) {
    const fuseResult: Array<Fuse.FuseResult<Option>> = this.fuse.search(q);
    const filteredOptions = fuseResult.map(match => match.item);

    if (filteredOptions.length > 0) {
      this.patch(filteredOptions);
      const optionTextElements = this.optionContainer.querySelectorAll(`.${optionTextClass}`);
      for (let i = 0; i < optionTextElements.length; i++) {
        const matches = fuseResult[i].matches;
        this.highlightMatchCharacter(optionTextElements[i] as HTMLElement, matches);
      }
    } else {
      // render initial options
      this.sync();
    }
  }

  private highlightMatchCharacter(optionTextElement: HTMLElement, matches: ReadonlyArray<Fuse.FuseResultMatch>) {
    const text = optionTextElement.textContent;
    const matchedPositions: Set<number> = new Set();
    for (const match of matches) {
      for (const indices of match.indices) {
        const [startIndex, endIndex] = indices;
        for (let i = startIndex; i <= endIndex; i++) {
          matchedPositions.add(i);
        }
      }
    }

    optionTextElement.textContent = "";
    const textLength = text.length;
    let i = 0;
    let rangeStart: number = null;
    // last range's end index (exclusive)
    let lastRangeEnd: number = 0;
    while (i < textLength) {
      if (matchedPositions.has(i)) {
        if (rangeStart !== null) {
          // continuation of a matched range
        } else {
          // finish a non-matched range
          const textNode = document.createTextNode(text.slice(lastRangeEnd, i));
          optionTextElement.appendChild(textNode);
          rangeStart = i;
        }
      } else {
        if (rangeStart !== null) {
          // finish a matched range
          const range = document.createElement("b");
          range.textContent = text.slice(rangeStart, i);
          optionTextElement.appendChild(range);
          rangeStart = null;
          lastRangeEnd = i;
        } else {
          // continuation of a non-matched range
        }
      }
      i++;
    }
    if (rangeStart === null) {
      // last unmatched range
      const textNode = document.createTextNode(text.slice(lastRangeEnd));
      optionTextElement.appendChild(textNode);
    } else {
      // last matched range
      const range = document.createElement("b");
      range.textContent = text.slice(rangeStart);
      optionTextElement.appendChild(range);
    }
  }

  private patch(options: Array<Option>) {
    const optionElements = this.optionContainer.querySelectorAll(`.${optionClass}`);
    const numOptions = options.length;

    let optionIndex = 0;
    for (const optionElement of optionElements) {
      if (optionIndex < numOptions) {
        // in place patch
        this.patchOption(optionElement as HTMLElement, options[optionIndex]);
      } else {
        // trim exceeding elements
        optionElement.remove();
      }
      optionIndex++;
    }

    for (; optionIndex < numOptions; optionIndex++) {
      const option = options[optionIndex];
      this.optionContainer.appendChild(this.createOptionElement(option));
    }
  }

  /**
   * Sync is used when the options changed (Javascript layer) but the updated options are not reflected in option elements (HTML layer). Applying sync will restore the sync between two layers using an in-place-patch strategy.
   *
   * @return {void} Execution for effect only.
   */
  sync() {
    this.patch(this.options);
  }

  private patchOption(optionElement: HTMLElement, option: Option) {
    const optionTextElement = optionElement.children[0] as HTMLElement;
    const text = option.suggestion;
    optionTextElement.textContent = text;
    optionTextElement.title = text;
    if (option.prevSugg) {
      optionElement.classList.add(previousEditClass);
      optionElement.classList.remove(autocompleteSuggestionClass);
    } else {
      optionElement.classList.remove(previousEditClass);
      optionElement.classList.add(autocompleteSuggestionClass);
    }
  }

  private addOptionsContainer() {
    const optionsContainer = this.createOptionContainer(this.options);
    this.rootContainer.appendChild(optionsContainer);
  }

  private createOptionContainer(options: Array<Option>): HTMLElement {
    const optionContainer = document.createElement("div");
    optionContainer.classList.add(optionContainerClass);
    if (options) {
      optionContainer.classList.add(activeClass);
    }

    for (let i = 0; i < options.length; i++) {
      const option: Option = options[i];
      optionContainer.appendChild(this.createOptionElement(option));
    }

    return this.optionContainer = optionContainer;
  }

  private createOptionElement(option: Option): HTMLElement {
    const optionElement = document.createElement("div");
    const suggestionClass = option.prevSugg ? previousEditClass : autocompleteSuggestionClass;
    optionElement.classList.add(optionClass, suggestionClass);

    // create option text
    const optionTextElement = document.createElement("span");
    optionTextElement.classList.add(optionTextClass);

    const text: string = option.suggestion;

    optionTextElement.textContent = text;
    optionTextElement.title = text;

    optionElement.appendChild(optionTextElement);
    return optionElement;
  }
}
