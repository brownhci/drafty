/**
 * @module
 * input form suggestions
 */

import { LocalStorageCache } from "../../utils/local-storage";
import { getEditSuggestionURL } from "../../api/endpoints";
import { FuseSelect } from "../../fuse/sheet-fuse";

export interface Option {
  suggestion: string;
  confidence: number;
  prevSugg: number;
}

type Transformer = (options: Array<Option>) => Array<Option>;

export class SuggestionManager {
  /** Default transformation is to sort suggestion alphabetically */
  static readonly defaultTransformer: Transformer = (options) => {
    options.sort((option1, option2) => option1.suggestion.localeCompare(option2.suggestion));
    return options;
  };

  /** A name (or a type) for this suggestion manager. Should be appropriate for modifying suggestions */
  readonly name: string;
  /** A transformation process to apply to pulled suggestions */
  readonly transformer: Transformer;

  /** A LocalStorage cache to store pulled suggestions */
  private readonly storage: LocalStorageCache = new LocalStorageCache(5 * 60 * 1000);

  constructor(name: string, transformer?: Transformer) {
    this.name = name;
    this.transformer = transformer ? transformer : SuggestionManager.defaultTransformer;
  }

  private getStorageKey(identifier: string): string {
    return `${this.name}#${identifier}-suggestions`;
  }
  /**
   * Retrieves an array of options from cache
   *
   * @param {string} identifier - An identifier that distinguish this collection of options from other collections.
   * @returns {Array<Option>} The array of options stored under specified identifier. Null if such collection does not exists.
   */
  private retrieve(identifier: string): Array<Option> {
    return this.storage.retrieve(this.getStorageKey(identifier)) as Array<Option>;
  }
  /**
   * Stores an array of options in cache
   *
   * @param {string} identifier - An identifier that distinguish this collection of options from other collections.
   * @param {Array<Option>} options - A collection of options associated with and will be stored under the specified identifier.
   */
  private store(identifier: string, options: Array<Option>) {
    this.storage.store(this.getStorageKey(identifier), options);
  }

  /**
   * Fetch suggestions from database.
   *
   * @async
   * @param {string} url - Endpoint to pull suggestions from.
   * @returns {Promise<Array<Suggestion>>} A promise which resolves to an array of Option objects.
   */
  private async fetch(url: string): Promise<Array<Option>> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      return this.transformer(await response.json());
    } catch (error) {
      console.error(`Network error when fetching ${this.name} suggestions`, error);
      return null;
    }
  }

  /**
   * Gets suggestions.
   *
   * @async
   * @param {string} url - Endpoint to pull suggestions from.
   * @param {string} identifier - An identifier that distinguish stored collection of options from other collections.
   * @param {(options: Array<Option>) => void} [handlerForCachedSuggestions] - A handler that will be called when cached suggestions are fetched.
   * @param {(options: Array<Option>) => void} [handlerForPulledSuggestions] - A handler that will be called when cached suggestions are pulled.
   */
  async get(
    url: string,
    identifier: string,
    handlerForCachedSuggestions?: (options: Array<Option>) => void,
    handlerForPulledSuggestions?: (options: Array<Option>) => void
  ) {
    if (handlerForCachedSuggestions) {
      handlerForCachedSuggestions(this.retrieve(identifier));
    }
    if (handlerForPulledSuggestions) {
      return await this.fetch(url).then(options => {
        this.store(identifier, options);
        handlerForPulledSuggestions(options);
      })
                                  .catch(error => console.error(error));
    }
    }
}

export const editSuggestionManager: SuggestionManager = new SuggestionManager("edit");
export const columnSuggestionManager: SuggestionManager = new SuggestionManager("column");

/**
 * Suggestions will be filtered (empty string suggestion will be removed) and de-duplicated (only previous edit suggestion will be kept if both present).
 *
 * @param {Array<Option>} suggestions - An array of suggestions returned from the server
 * @returns {Array<Option>} An array containing the filtered suggestions.
 */
function parseCellEditSuggestions(suggestions: Array<Option>): Array<Option> {
  const options: Map<string, Option> = new Map();

  for (const suggestion of suggestions) {
    const text = suggestion.suggestion;
    if (text === "") {
      continue;
    }

    if (!options.has(text) || options.get(text).prevSugg === 0) {
      options.set(text, suggestion);
    }
  }

  const parsedSuggestions = Array.from(options.values());
  parsedSuggestions.sort((suggestion1, suggestion2) => suggestion1.suggestion.localeCompare(suggestion2.suggestion));
  return parsedSuggestions;
}

export function initializeFuseSelect(inputElement: HTMLInputElement, mountMethod: (element: HTMLElement) => void): FuseSelect {
  const fuseSelect = new FuseSelect();
  fuseSelect.handleClickOnOption((text: string) => {
    inputElement.value = text;
    inputElement.dispatchEvent(new Event("input"));
    inputElement.focus();
  });
  fuseSelect.mount(mountMethod);
  return fuseSelect;
}

/**
 * If last fetched suggestions are still valid, gets suggestions from local storage.
 * Otherwise, fetch suggestions from database and store the fetched suggestions in local storage.
 *
 * @async
 * @param {FuseSelect} fuseSelect - The FuseSelect instance to be updated.
 * @param {string} idSuggestion - @see sheet.ts:getIdSuggestion
 * @param {string} idSuggestionType - @see sheet.ts:getIdSuggestionType
 * @param {string} callback - A callback executed after the fetched suggestions are used.

 */
export function updateFuseSelect(fuseSelect: FuseSelect, idSuggestion: number, idSuggestionType: number, callback: () => void = () => undefined) {
  const url = getEditSuggestionURL(idSuggestion);
  editSuggestionManager.get(
    url,
    idSuggestion.toString(),
    (options) => {
      fuseSelect.options = options ? parseCellEditSuggestions(options) : [];
      fuseSelect.sync();
    },
    (options) => {
      fuseSelect.options = options ? parseCellEditSuggestions(options) : [];
      fuseSelect.sync();
      callback();
    },
  );
}
