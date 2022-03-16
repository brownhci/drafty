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


// suggestions


export function getEditSuggestionURL(idSuggestion: number) {
  return `/suggestions/foredit?idSuggestion=${idSuggestion}`;
}

export function getColumnSuggestionURL(idSuggestionType: number) {
  return `/suggestions?idSuggestionType=${idSuggestionType}`;
}

export function getValidationRuleURL() {
  return '/suggestions/validation-rule';
}

// interactions
export function postNewRowURL() {
  return '/newrow';
}

export function postDelRowURL() {
  return '/delrow';
}

export function postCellClickURL() {
  return '/click';
}

export function postCellDoubleClickURL() {
  return '/click-double';
}

export function postPasteURL() {
  return '/paste-cell';
}

export function postCellCopyURL() {
  return '/copy-cell';
}

export function postColumnCopyURL() {
  return '/copy-column';
}

export function postColumnSortURL() {
  return 'sort';
}

export function postColumnCompleteSearchURL() {
  return 'search-full';
}

export function postColumnPartialSearchURL() {
  return 'search-full';
}

export function postGoogleSearchURL() {
  return 'search-google';
}

export function postDataBaitCreate() {
  return 'databait-create';
}

export function postDataBaitTweet() {
  return 'databait-tweet';
}

export function postSearchColVisit() {
  return 'searchcol-visit';
}

export function postTweet() {
  return 'databaits/tweet';
}

export function postTweetNextAction() {
  return 'databaits/tweet/next';
}

export function postDataBaitCreated() {
  return 'databaits/create';
}

export function postDataBaitWindowClosed() {
  return 'databaits/close';
}

export function postDataBaitNextAction() {
  return 'databaits/next';
}

export function postDataBaitVisit() {
  return 'databaits/visit';
}