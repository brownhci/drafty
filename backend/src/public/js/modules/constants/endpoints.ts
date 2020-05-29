/**
 * @module This file stores the various server API endpoint as getter functions.
 *
 * Each function is named as:
 *    method + name + URL
 *
 * @example
 * getEditSuggestionURL
 *
 * Function parameters are query parameters whose names are simply key names
 */


export function getEditSuggestionURL(idSuggestion: number) {
  return `/suggestions/foredit?idSuggestion=${idSuggestion}`;
}
