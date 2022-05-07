/**
 * @module
 * input form suggestions
 */

import { getEditSuggestionURL, getNewRowValuesURL } from '../../api/endpoints';
import { getIdSuggestionType } from '../../api/record-interactions';
import { getColumnLabel } from '../../dom/sheet';

//import { getJSON } from '../../api/requests';

export interface Option {
  suggestion: string;
  prevSugg: number;
}

export function convertArrayOption(options: Array<Option>): Array<string> {
  const suggestions: Array<string> = options.map(function(i: any) {
      return i.suggestion;
  });
  return suggestions;
}

export function convertArrayPrevSuggestions(options: Array<Option>): Array<string> {
  const suggestions: Array<string> = options.map(function(i: any) {
      if(i.prevSugg) {
        return i.suggestion;
      }
  });
  return suggestions;
}

export function getAddNewRowValuesURL(columnIndex: number) {
  const idSuggestionType = getIdSuggestionType(getColumnLabel(columnIndex));
  return getNewRowValuesURL(idSuggestionType);
}

export function getEditValuesURL(idSuggestion: number) {
  return getEditSuggestionURL(idSuggestion);
}
