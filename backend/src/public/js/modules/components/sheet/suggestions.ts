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

const optionCache = new LocalStorageCache(5 * 60 * 1000);
function optionCacheKeyFunction(idSuggestionType: string): string {
  return `column${idSuggestionType}-cell-suggestions`;
}
function getColumnSuggestions(idSuggestionType: string): Array<Option> {
  return optionCache.retrieve(optionCacheKeyFunction(idSuggestionType)) as Array<Option>;
}

/**
 * Fetch suggestions from database for a particular table cell.
 *
 * @async
 * @param {number} idSuggestion - The id suggestion of a particular table cell.
 * @returns {Promise<Array<Suggestion>>} A promise which resolves to an array of Option objects.
 */
export async function fetchSuggestions(idSuggestion: number): Promise<Array<Option>> {
  const url = getEditSuggestionURL(idSuggestion);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Network error when fetching suggestions", error);
  }
}

/**
 * Suggestions will be filtered (empty string suggestion will be removed) and de-duplicated (only previous edit suggestion will be kept if both present).
 *
 * @param {Array<Option>} suggestions - An array of suggestions returned from the server
 * @returns {Array<Option>} An array containing the filtered suggestions.
 */
function parseSuggestions(suggestions: Array<Option>): Array<Option> {
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
  const idSuggestionTypeString = idSuggestionType.toString();
  let options = getColumnSuggestions(idSuggestionTypeString);
  if (!options) {
    // cannot retrieve unexpired autocomplete suggestions from local storage, create an empty placeholder for now
    options = [];
  }
  fuseSelect.options = options;

  fuseSelect.sync();

  fetchSuggestions(idSuggestion).then(suggestions => {
    const options = parseSuggestions(suggestions);
    optionCache.store(optionCacheKeyFunction(idSuggestionTypeString), options);

    fuseSelect.options = options;

    fuseSelect.sync();
    callback();
  });
}
