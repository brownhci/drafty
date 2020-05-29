import Fuse from "./fuse";
import { Option } from "../components/sheet/suggestions";
import { fuseSelectRootContainerClass, optionContainerTitleClass, optionContainerWrapperClass, autocompleteSuggestionOptionContainerClass, previousEditOptionContainerClass, optionContainerClass, optionClass, optionTextClass } from "../constants/css-classes";
import { activeClass } from "../constants/css-classes";

interface FuseMatch {
  item: Option;
}

/* in memory cache */
const fuseOptions = {
    shouldSort: true,
    findAllMatches: true,
    threshold: 1,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "suggestion"
    ]
  };

export class FuseSelect {
  options: Array<Option>;

  autocompleteSuggestions: Set<string>;

  static autocompleteIdentifier = "Completions";
  static editIdentifier = "Previous Edits";
  static identifiers = [FuseSelect.autocompleteIdentifier, FuseSelect.editIdentifier];

  identifierToFuse: Map<string, Fuse> = new Map();
  identifierToOptionContainer: Map<string, HTMLElement> = new Map();
  identifierToOptions: Map<string, Array<Option>> = new Map();
  identifierToLongestText: Map<string, string> = new Map();

  rootContainer: HTMLElement;
  mounted: boolean = false;


  constructor(autocompleteOptions: Array<Option> = [], editOptions: Array<Option> = []) {
    this.autocompleteOptions = autocompleteOptions;
    this.editOptions = editOptions;

    FuseSelect.identifiers.forEach(identifier => this.identifierToLongestText.set(identifier, ""));

    this.initializeSelect();
  }

  get longestText(): string {
    let longestText = "";
    for (const text of this.identifierToLongestText.values()) {
      if (text.length > longestText.length) {
        longestText = text;
      }
    }

    return longestText;
  }

  get autocompleteOptions(): Array<Option> {
    return this.identifierToOptions.get(FuseSelect.autocompleteIdentifier);
  }

  set autocompleteOptions(options: Array<Option>) {
    this.identifierToOptions.set(FuseSelect.autocompleteIdentifier, options);
    this.identifierToFuse.set(FuseSelect.autocompleteIdentifier, new Fuse(this.autocompleteOptions, fuseOptions));

    const optionContainer = this.identifierToOptionContainer.get(FuseSelect.autocompleteIdentifier);
    this.hideOptionContainerWrapperIfNoOptions(optionContainer, options);
  }

  get editOptions(): Array<Option> {
    return this.identifierToOptions.get(FuseSelect.editIdentifier);
  }

  set editOptions(options: Array<Option>) {
    this.identifierToOptions.set(FuseSelect.editIdentifier, options);
    this.identifierToFuse.set(FuseSelect.editIdentifier, new Fuse(this.editOptions, fuseOptions));

    const optionContainer = this.identifierToOptionContainer.get(FuseSelect.editIdentifier);
    this.hideOptionContainerWrapperIfNoOptions(optionContainer, options);
  }

  hideOptionContainerWrapperIfNoOptions(optionContainer: HTMLElement, options: Array<Option>) {
    if (optionContainer) {
      // hide the option container wrapper when there is no options
      const optionContainerWrapper = optionContainer.parentElement;

      if (options.length) {
        optionContainerWrapper.classList.add(activeClass);
      } else {
        optionContainerWrapper.classList.remove(activeClass);
      }
    }
  }

  hasAutocompleteSuggestion(query: string): boolean {
    for (const option of this.autocompleteOptions) {
      if (option.suggestion === query) {
        return true;
      }
    }
    return false;
  }

  initializeSelect() {
    this.rootContainer = document.createElement("div");
    this.rootContainer.classList.add(fuseSelectRootContainerClass);
    this.addAutocompleteOptionsContainer();
    this.addEditOptionsContainer();
  }

  handleClickOnOption(callback: (text: string) => void) {
    this.rootContainer.addEventListener("click", function (event: MouseEvent) {
      const optionTextElement = (event.target as HTMLElement).querySelector(`.${optionTextClass}`);
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
    for (const identifier of FuseSelect.identifiers) {
      const fuse = this.identifierToFuse.get(identifier);
      const filteredOptions = fuse.search(q).map((match: FuseMatch) => match.item);

      if (filteredOptions.length > 0) {
        this.patch(identifier, filteredOptions);
      }
    }
  }

  patch(identifier: string, options: Array<Option>) {
    const optionContainer = this.identifierToOptionContainer.get(identifier);
    const optionElements = optionContainer.querySelectorAll(`.${optionClass}`);

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
      optionContainer.appendChild(this.createOptionElement(option, identifier));
    }
  }

  /**
   * Sync is used when the options changed (Javascript layer) but the updated options are not reflected in option elements (HTML layer). Applying sync will restore the sync between two layers using an in-place-patch strategy.
   *
   * @param {string} identifier - @see FuseSelect.identifiers
   * @return {void} Execution for effect only.
   */
  sync(identifier: string) {
    const options = this.identifierToOptions.get(identifier);
    this.patch(identifier, options);
  }

  syncAll() {
    for (const identifier of FuseSelect.identifiers) {
      this.sync(identifier);
    }
  }

  patchOption(optionElement: HTMLElement, option: Option) {
    const optionTextElement = optionElement.children[0] as HTMLElement;
    const text = option.suggestion;
    optionTextElement.textContent = text;
    optionTextElement.title = text;
  }

  addAutocompleteOptionsContainer() {
    const autocompleteContainer = this.createContainer(this.autocompleteOptions, FuseSelect.autocompleteIdentifier, autocompleteSuggestionOptionContainerClass);
    this.rootContainer.appendChild(autocompleteContainer);
  }

  addEditOptionsContainer() {
    const editContainer = this.createContainer(this.editOptions, FuseSelect.editIdentifier, previousEditOptionContainerClass);
    this.rootContainer.appendChild(editContainer);
  }

  createContainer(options: Array<Option>, identifier: string, containerClass: string): HTMLElement {
    const optionContainerWrapper = document.createElement("div");
    optionContainerWrapper.classList.add(optionContainerWrapperClass, containerClass);
    if (options) {
      optionContainerWrapper.classList.add(activeClass);
    }

    // create description title
    const titleElement = document.createElement("span");
    titleElement.textContent = identifier;
    titleElement.classList.add(optionContainerTitleClass);
    optionContainerWrapper.appendChild(titleElement);

    optionContainerWrapper.appendChild(this.createOptionContainer(options, identifier, containerClass));

    return optionContainerWrapper;
  }

  createOptionContainer(options: Array<Option>, identifier: string, containerClass: string): HTMLElement {
    const optionContainer = document.createElement("div");
    optionContainer.classList.add(optionContainerClass, containerClass);

    this.identifierToOptionContainer.set(identifier, optionContainer);

    for (let i = 0; i < options.length; i++) {
      const option: Option = options[i];
      optionContainer.appendChild(this.createOptionElement(option, identifier));
    }

    return optionContainer;
  }

  createOptionElement(option: Option, identifier: string): HTMLElement {
    const optionElement = document.createElement("div");
    optionElement.classList.add(optionClass);

    // create option text
    const optionTextElement = document.createElement("span");
    optionTextElement.classList.add(optionTextClass);

    const text: string = option.suggestion;
    if (text.length > this.identifierToLongestText.get(identifier).length) {
      this.identifierToLongestText.set(identifier, text);
    }

    optionTextElement.textContent = text;
    optionTextElement.title = text;

    optionElement.appendChild(optionTextElement);
    return optionElement;
  }
}
