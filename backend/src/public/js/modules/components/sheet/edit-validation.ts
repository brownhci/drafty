/**
 * @module
 *
 * This module verifies edit's validity.
 */

import { getValidationRuleURL } from '../../api/endpoints';
import { getJSON } from '../../api/requests';
import { LocalStorageCache } from '../../utils/local-storage';


/** A LocalStorage cache to store validation rule, valid for 1 day */
const storage: LocalStorageCache = new LocalStorageCache(24 * 60 * 60 * 1000);
const storageKey = 'validation-rule';
const validationRuleMap: Map<number, RegExp> = new Map();
interface ValidationRule {
  idSuggestionType: number;
  regex: string;
}

function initializeRuleMap(ruleData: Array<ValidationRule>) {
    for (const {idSuggestionType, regex} of ruleData) {
      validationRuleMap.set(idSuggestionType, new RegExp(regex));
    }
}
function initialize() {
  // retrieve from storage
  const ruleData = storage.retrieve(storageKey);
  if (ruleData) {
    // loaded from cache
    initializeRuleMap(ruleData);
    return;
  }

  // initialize from server
  getJSON(getValidationRuleURL()).then(ruleData => {
    storage.store(storageKey, ruleData);
    initializeRuleMap(ruleData);
  });
}
initialize();


export function verifyEdit(edit: string, idSuggestionType: number): boolean {
  const rule: RegExp = validationRuleMap.get(idSuggestionType);
  if (rule) {
    return rule.test(edit);
  }
  return true;
}
