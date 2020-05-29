/**
 * @file input form suggestions
 */

import { LocalStorageCache } from "../../utils/local-storage";
import { getEditSuggestionURL } from "../../constants/endpoints";
import { FuseSelect } from "../../fuse/sheet-fuse";

export interface Option {
  suggestion: string;
  confidence: number;
  prevSugg: number;
}

const autocompleteOptionCache = new LocalStorageCache(5 * 60 * 1000);

const previousEditsKeyName: string = "previousEdit";
const autocompleteSuggestionsKeyName: string = "autocompleteSuggestions";

/**
 * Fetch suggestions from database for a particular table cell.
 *
 * @async
 * @param {number} idSuggestion - The id suggestion of a particular table cell.
 * @returns {Promise<Array<Suggestion>>} A promise which resolves to an array of Option objects.
 */
async function fetchSuggestions(idSuggestion: number): Promise<Array<Option>> {
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
 * The suggestions returned from server including
 *   + previous edits (prevSugg === 1)
 *   + autocomplete suggestions (prevSugg === 0)
 * which are identified by the prevSugg value
 *
 * @param {Array<Option>} suggestions - An array of suggestions returned from the server
 * @returns {Record<string, Array<Option>>} An object containing where previous edits and autocomplete suggestions are separated
 */
function parseSuggestions(suggestions: Array<Option>): Record<string, Array<Option>> {
  const parsedSuggestions: Record<string, Array<Option>> = {
    [previousEditsKeyName]: [],
    [autocompleteSuggestionsKeyName]: []
  };

  for (const suggestion of suggestions) {
    if (suggestion.prevSugg === 1) {
      if (suggestion.suggestion !== "") {
        // avoid empty string showing as previous edit
        parsedSuggestions[previousEditsKeyName].push(suggestion);
      }
    } else {
      parsedSuggestions[autocompleteSuggestionsKeyName].push(suggestion);
    }
  }

  return parsedSuggestions;
}

export const fuseSelect: FuseSelect = new FuseSelect();
export function initializeFuseSelect(inputElement: HTMLInputElement, mountMethod: (element: HTMLElement) => void) {
  fuseSelect.handleClickOnOption((text: string) => {
    inputElement.value = text;
    inputElement.dispatchEvent(new Event("input"));
    inputElement.focus();
  });
  fuseSelect.mount(mountMethod);
}

/**
 * If last fetched suggestions are still valid, gets suggestions from local storage.
 * Otherwise, fetch suggestions from database and store the fetched suggestions in local storage.
 *
 * @async
 * @param {string} idSuggestion - @see sheet.ts:getIdSuggestion
 * @param {string} idSuggestionType - @see sheet.ts:getIdSuggestionType
 * @param {string} callback - A callback executed after the fetched suggestions are used.

 */
export function updateFuseSelect(idSuggestion: number, idSuggestionType: number, callback: () => void = () => undefined) {
  const idSuggestionTypeString = idSuggestionType.toString();
  let autocompleteOptions = autocompleteOptionCache.retrieve(idSuggestionTypeString) as Array<Option>;
  if (!autocompleteOptions) {
    // cannot retrieve unexpired autocomplete suggestions from local storage, create an empty placeholder for now
    autocompleteOptions = [];
  }
  fuseSelect.autocompleteOptions = autocompleteOptions;

  fuseSelect.editOptions = [];
  fuseSelect.syncAll();

  fetchSuggestions(idSuggestion).then(suggestions => {
      const {[previousEditsKeyName]: editOptions, [autocompleteSuggestionsKeyName]: autocompleteOptions} = parseSuggestions(suggestions);
    autocompleteOptionCache.store(idSuggestionTypeString, autocompleteOptions);
    fuseSelect.autocompleteOptions = autocompleteOptions;

    fuseSelect.editOptions = editOptions;
    fuseSelect.syncAll();

    callback();
  });
}
