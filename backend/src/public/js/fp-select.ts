const originalIndexKey = "original-index";

const optionContainerClass = "fp-select-options";
const optionClass = "fp-select-option";
const optionPriorityClass = "fp-select-option-priority";
const optionTextClass = "fp-select-option-text";

const identifierToSelectInfo: Map<string, SelectInfo> = new Map();

interface SelectConfig {
  numOptionShown?: number;
  nameKey?: string;
  priorityKey?: string;
  scoreKey?: string;
}
type Option = Record<string, any>;
interface SelectInfo {
  identifier: string;

  selectConfig: SelectConfig;

  targetInputElement: HTMLInputElement;

  optionContainer: HTMLElement;
  optionElements: Array<HTMLElement>;

  options: Array<Option>;
  numOptions: number;

  longestText: string;
  longestTextLength: number;

  minPriority: number;
  maxPriority: number;
  priorityRange: number;
  priorityInterpolator: (priority: number) => number;
}
function initializeSelectInfo(): SelectInfo {
  return {
    identifier: null,
    selectConfig: null,
    targetInputElement: null,
    optionContainer: null,
    optionElements: [],
    options: [],
    numOptions: null,
    longestText: null,
    longestTextLength: null,
    minPriority: null,
    maxPriority: null,
    priorityRange: null,
    priorityInterpolator: null,
  };
}

const defaultConfig: SelectConfig = {
  numOptionShown: 10,
  nameKey: "name",
  priorityKey: "priority",
  scoreKey: "score",
};
const defaultScoreFunction = (query: string, option: Option, selectInfo: SelectInfo) => {
  query = query.toLowerCase();
  const queryLength: number = query.length;
  const nameKey: string = selectInfo.selectConfig.nameKey;
  const optionText: string = option[nameKey].toLowerCase();
  const optionTextLength: number = optionText.length;

  // computes edit distance
  const editDistance = new Map();
  for (let r = 0; r <= optionTextLength; r++) {
    editDistance.set(`${r},0`, r);
  }
  for (let c = 0; c <= queryLength; c++) {
    editDistance.set(`0,${c}`, c);
  }
  for (let r = 1; r <= optionTextLength; r++) {
    for (let c = 1; c <= queryLength; c++) {
      const costFromUpperCell = editDistance.get(`${r - 1},${c}`) + 1;
      const costFromLeftCell = editDistance.get(`${r},${c - 1}`) + 1;
      const differentChar = optionText.charAt(r - 1) !== query.charAt(c - 1);
      const costFromUpperLeftCell = editDistance.get(`${r - 1},${c - 1}`) + differentChar;
      editDistance.set(`${r},${c}`, Math.min(costFromUpperCell, costFromLeftCell, costFromUpperLeftCell));
    }
  }
  return -editDistance.get(`${optionTextLength},${queryLength}`);
};

function fillDefaultsToUserConfig(userConfig: SelectConfig) {
  return Object.assign({}, defaultConfig, userConfig);
}
function interpolatePriorities(options: Array<Option>, selectInfo: SelectInfo) {
  const priorityKey = selectInfo.selectConfig.priorityKey;
  let minPriority: number = null;
  let maxPriority: number = null;
  for (let i = 0; i < selectInfo.numOptions; i++) {
    const option = options[i];
    option[originalIndexKey] = i;

    const priority: number = option[priorityKey];
    if (minPriority === null || priority < minPriority) {
      minPriority = priority;
    }
    if (maxPriority === null || priority > maxPriority) {
      maxPriority = priority;
    }
  }
  const priorityRange = maxPriority - minPriority;
  selectInfo.minPriority = minPriority;
  selectInfo.maxPriority = maxPriority;
  selectInfo.priorityRange = priorityRange;
  selectInfo.priorityInterpolator = (priority: number) => (priority - minPriority + 1) / (priorityRange + 1) * 100;
}

function getOptionElementWithOption(option: Option, selectInfo: SelectInfo): HTMLElement {
  const originalIndex: number = option[originalIndexKey];
  return selectInfo.optionElements[originalIndex];
}

function setOptionPriorityElementStyle(priority: number, optionPriorityElement: HTMLElement, selectInfo: SelectInfo) {
  const proportion: number = selectInfo.priorityInterpolator(priority);
  optionPriorityElement.style.width = `${proportion}%`;
  optionPriorityElement.setAttribute("aria-valuenow", `${proportion}`);
}
function optionElementOnClick(optionElement: HTMLElement, selectInfo: SelectInfo) {
  const optionTextElement = optionElement.querySelector(`.${optionTextClass}`);
  const text = optionTextElement.textContent;
  const targetInputElement = selectInfo.targetInputElement;
  targetInputElement.value = text;
  targetInputElement.dispatchEvent(new Event("input"));
}
function createOptionContainer(options: Array<Option>, selectInfo: SelectInfo) {
  const selectConfig = selectInfo.selectConfig;
  const optionContainer = document.createElement("div");
  optionContainer.classList.add(optionContainerClass);
  selectInfo.optionContainer = optionContainer;
  optionContainer.addEventListener("click", function(event: MouseEvent) {
    const target: HTMLElement= event.target as HTMLElement;
    const optionElement: HTMLElement = target.closest(`.${optionClass}`) as HTMLElement;
    if (optionElement) {
      optionElementOnClick(optionElement, selectInfo);
    }
  });

  const nameKey = selectConfig.nameKey;
  const priorityKey = selectConfig.priorityKey;
  for (let i = 0; i < selectInfo.numOptions; i++) {
    const option: Option = options[i];

    // create option
    const optionElement = document.createElement("div");
    optionElement.classList.add(optionClass);
    selectInfo.optionElements.push(optionElement);

    // create option priority
    const optionPriorityElement = document.createElement("div");
    optionPriorityElement.classList.add(optionPriorityClass);
    optionPriorityElement.setAttribute("role", "progressbar");
    optionPriorityElement.setAttribute("aria-valuemin", "0");
    optionPriorityElement.setAttribute("aria-valuemax", "100");

    // create option text
    const optionTextElement = document.createElement("span");
    optionTextElement.classList.add(optionTextClass);
    const text: string = option[nameKey];
    const textLength = text.length;
    if (selectInfo.longestTextLength === null || selectInfo.longestTextLength < textLength) {
      selectInfo.longestText = text;
      selectInfo.longestTextLength = textLength;
    }
    optionTextElement.textContent = text;

    const priority: number = option[priorityKey];
    setOptionPriorityElementStyle(priority, optionPriorityElement, selectInfo);

    optionElement.appendChild(optionPriorityElement);
    optionElement.appendChild(optionTextElement);

    optionContainer.appendChild(getOptionElementWithOption(option, selectInfo));
  }
}

function sortOptionsByPriority(options: Array<Option>, selectInfo: SelectInfo) {
  const priorityKey = selectInfo.selectConfig.priorityKey;
  options.sort((option1, option2) => option2[priorityKey] - option1[priorityKey]);
  selectInfo.options = options;
}
function sortOptionsByScore(selectInfo: SelectInfo) {
  const scoreKey = selectInfo.selectConfig.scoreKey;
  selectInfo.options.sort((option1, option2) => option2[scoreKey] - option1[scoreKey]);
}
function createSelect(identifier: string, targetInputElement: HTMLInputElement, appendTo: HTMLElement, options: Array<Option>, userConfig = {}) {
  let selectInfo: SelectInfo = identifierToSelectInfo.get(identifier);
  if (!selectInfo) {
    // initialize new select info
    const selectConfig: SelectConfig = fillDefaultsToUserConfig(userConfig);
    selectInfo = initializeSelectInfo();
    selectInfo.selectConfig = selectConfig;
    selectInfo.identifier = identifier;
    selectInfo.numOptions = options.length;

    interpolatePriorities(options, selectInfo);
    sortOptionsByPriority(options, selectInfo);

    createOptionContainer(options, selectInfo);
    // register created select info under identifier
    identifierToSelectInfo.set(identifier, selectInfo);
  }

  // append select info after input element
  selectInfo.targetInputElement = targetInputElement;

  appendTo.appendChild(selectInfo.optionContainer);
  return selectInfo;
}
function removeSelect(selectInfo: SelectInfo) {
  if (selectInfo) {
    selectInfo.optionContainer.remove();
  }
}

/**
 * Reorder options based on the computed score from query
 *
 * @param {string} query - User provided query.
 * @param {SelectInfo} selectInfo - contains information about the select element.
 * @param {Function} scoreFunction - computes score using string similarity and priority, score will be used to reorder the options.
 * @param {boolean} updateOptionContainer - whether the DOM will be modified, default to true.
 */
function filterSelectOptions(query: string, selectInfo: SelectInfo, scoreFunction = defaultScoreFunction, updateOptionContainer = true) {
  if (!selectInfo) {
    return;
  }

  const scoreKey = selectInfo.selectConfig.scoreKey;
  for (const option of selectInfo.options) {
    const score = scoreFunction(query, option, selectInfo);
    option[scoreKey] = score;
  }

  sortOptionsByScore(selectInfo);

  if (updateOptionContainer) {
    // removing previous option elements
    while (selectInfo.optionContainer.lastChild) {
      selectInfo.optionContainer.removeChild(selectInfo.optionContainer.lastChild);
    }
    // adding back option element in sorted orders
    for (const option of selectInfo.options) {
      selectInfo.optionContainer.appendChild(getOptionElementWithOption(option, selectInfo));
    }
  }
}