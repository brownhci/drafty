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

export function getNewRowValuesURL(idSuggestionType: number) {
  return `/suggestions/fornewrow?idSuggestion=${idSuggestionType}`;
}

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

export function postDatabaitCreate() {
  return '/databait-create';
}

export function postSearchColVisit() {
  return 'searchcol-visit';
}

export function postTweet() {
  return '/databaits/tweet';
}

export function postTweetNextAction() {
  return '/databaits/tweet/next';
}

export function postDatabaitNextAction() {
  return '/databaits/next';
}

export function postDatabaitVisit() {
  return '/databaits/visit';
}
// comments
export function getCommentsURL(idRow: string | number) {
  return `/comments/row/${idRow}`;
}

export function postNewCommentURL() {
  return '/comments/new';
}

export function postCommentVoteUpURL() {
  return '/comments/vote/update/up';
}

export function postCommentVoteDownURL() {
  return '/comments/vote/update/down';
}
