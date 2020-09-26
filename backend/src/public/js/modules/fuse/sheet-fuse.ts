import Fuse from "./fuse";
import { Option as Opt } from "../components/sheet/suggestions";
import { fuseSelectRootContainerClass, autocompleteSuggestionClass, previousEditClass, optionContainerClass, optionClass, optionTextClass } from "../constants/css-classes";
import { activeClass } from "../constants/css-classes";
import { executeAtLeisure } from "../utils/defer";


type Option = Partial<Opt>;

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

  /**
   * @returns The count of suggestions that are actually rendered.
   */
  get activeSuggestionCount(): number {
    return this.optionContainer.childElementCount;
  }

  private suggestions: Set<string>;

  private fuse: Fuse<Option, Fuse.IFuseOptions<Option>>;
  private optionContainer: HTMLElement;
  longestText: string;

  rootContainer: HTMLElement;
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

  /**
   * This function causes out-of-sync between view layer (HTML layer) and model layer (Javascript layer) as it filters the options using fuse.js and only rendering the filtered options.
   *
   * @param {string} q - The user inputted query.
   */
  query(q: string) {
    executeAtLeisure(() => {
      const fuseResult: Array<Fuse.FuseResult<Option>> = this.fuse.search(q);

      if (fuseResult.length > 0) {
        // recreate the option container from fuse search result
        this.createOptionContainerFromFuseResult(fuseResult);
      } else {
        // render initial options
        this.sync();
      }
    });
  }

  private highlightMatchCharacter(text: string, matches: ReadonlyArray<Fuse.FuseResultMatch>): DocumentFragment {
    const highlightedTextFragment = new DocumentFragment();
    if (!matches || matches.length === 0) {
      // short circuit the highlighting when no match exists
      highlightedTextFragment.appendChild(document.createTextNode(text));
      return highlightedTextFragment;
    }

    const matchedPositions: Set<number> = new Set();
    for (const match of matches) {
      for (const indices of match.indices) {
        const [startIndex, endIndex] = indices;
        for (let i = startIndex; i <= endIndex; i++) {
          matchedPositions.add(i);
        }
      }
    }

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
          highlightedTextFragment.appendChild(textNode);
          rangeStart = i;
        }
      } else {
        if (rangeStart !== null) {
          // finish a matched range
          const range = document.createElement("b");
          range.textContent = text.slice(rangeStart, i);
          highlightedTextFragment.appendChild(range);
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
      highlightedTextFragment.appendChild(textNode);
    } else {
      // last matched range
      const range = document.createElement("b");
      range.textContent = text.slice(rangeStart);
      highlightedTextFragment.appendChild(range);
    }

    return highlightedTextFragment;
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

    if (this.optionContainer) {
      // if there is already an option container mounted, replace the option container in DOM also
      this.optionContainer.replaceWith(optionContainer);
    }
    return this.optionContainer = optionContainer;
  }

  private createOptionContainerFromFuseResult(fuseResult: Array<Fuse.FuseResult<Option>>) {
    const optionContainer = document.createElement("div");
    optionContainer.classList.add(optionContainerClass);

    // `fuseResult.length` represents the number of option to render
    if (fuseResult.length > 0) {
      optionContainer.classList.add(activeClass);
    }

    for (let i = 0; i < fuseResult.length; i++) {
      const { item: option, matches } = fuseResult[i];
      optionContainer.appendChild(this.createOptionElement(option, matches));
    }

    if (this.optionContainer) {
      // if there is already an option container mounted, replace the option container in DOM also
      this.optionContainer.replaceWith(optionContainer);
    }
    return this.optionContainer = optionContainer;
  }

  /**
   * Creates an option element.
   *
   * @param {Option} option - Represents a suggestion item.
   * @param {ReadonlyArray<Fuse.FuseResultMatch>} [matches = []] - A list of Match generated by Fuse library to highlight certain characters of suggestion content. Default to empty array signaling a `<span>` with no highlighed character.
   * @returns {HTMLElement} A created element containing the suggestion.
   */
  private createOptionElement(option: Option, matches: ReadonlyArray<Fuse.FuseResultMatch> = []): HTMLElement {
    const optionElement = document.createElement("div");
    const suggestionClass = option.prevSugg ? previousEditClass : autocompleteSuggestionClass;
    optionElement.classList.add(optionClass, suggestionClass);

    // create option text
    optionElement.appendChild(this.createOptionTextElement(option.suggestion, matches));
    return optionElement;
  }

  /**
   * Creates an option text element.
   *
   * @param {string} text - The suggestion content.
   * @param {ReadonlyArray<Fuse.FuseResultMatch>} [matches = []] - A list of Match generated by Fuse library to highlight certain characters of suggestion content. Default to empty array signaling a `<span>` with no highlighed character.
   * @returns {HTMLElement} A created element containing the suggestion.
   */
  private createOptionTextElement(text: string, matches: ReadonlyArray<Fuse.FuseResultMatch> = []): HTMLElement {
    const optionTextElement = document.createElement("span");
    optionTextElement.classList.add(optionTextClass);

    optionTextElement.title = text;
    optionTextElement.appendChild(this.highlightMatchCharacter(text, matches));

    return optionTextElement;
  }
}
