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
  fuseOptions?: Fuse.FuseOptions<Option>;
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

  fuse: any;
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
    fuse: null,
  };
}

const defaultConfig: SelectConfig = {
  numOptionShown: 10,
  nameKey: "name",
  priorityKey: "priority",
  fuseOptions: {
    shouldSort: true,
    findAllMatches: true,
    threshold: 1,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "name"
    ]
  }
};
function fillDefaultsToUserConfig(userConfig: SelectConfig) {
  const selectConfig = Object.assign({}, defaultConfig, userConfig);
  selectConfig.fuseOptions.keys = [selectConfig.nameKey];
  return selectConfig;
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
  targetInputElement.focus();
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
    // const optionPriorityElement = document.createElement("div");
    // optionPriorityElement.classList.add(optionPriorityClass);
    // optionPriorityElement.setAttribute("role", "progressbar");
    // optionPriorityElement.setAttribute("aria-valuemin", "0");
    // optionPriorityElement.setAttribute("aria-valuemax", "100");

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
    optionTextElement.title = text;

    // set progress bar
    // const priority: number = option[priorityKey];
    // setOptionPriorityElementStyle(priority, optionPriorityElement, selectInfo);

    // optionElement.appendChild(optionPriorityElement);
    optionElement.appendChild(optionTextElement);

    optionContainer.appendChild(getOptionElementWithOption(option, selectInfo));
  }
}

function sortOptionsByPriority(selectInfo: SelectInfo) {
  const priorityKey = selectInfo.selectConfig.priorityKey;
  selectInfo.options.sort((option1, option2) => option2[priorityKey] - option1[priorityKey]);
}
function createSelect(identifier: string, targetInputElement: HTMLInputElement, appendTo: HTMLElement, options: Array<Option>, userConfig = {}) {
  let selectInfo: SelectInfo = identifierToSelectInfo.get(identifier);
  if (!selectInfo) {
    // initialize new select info
    const selectConfig: SelectConfig = fillDefaultsToUserConfig(userConfig);
    selectInfo = initializeSelectInfo();
    selectInfo.selectConfig = selectConfig;
    selectInfo.identifier = identifier;

    selectInfo.options = options;
    selectInfo.numOptions = options.length;

    interpolatePriorities(options, selectInfo);
    sortOptionsByPriority(selectInfo);
    selectInfo.fuse = new Fuse(selectInfo.options, selectInfo.selectConfig.fuseOptions);

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
function filterSelectOptions(query: string, selectInfo: SelectInfo, updateOptionContainer = true) {
  if (!selectInfo) {
    return;
  }

  let result: Array<Option> = selectInfo.fuse.search(query);
  if (result.length === 0) {
    // use priority sorted options
    result = selectInfo.options;
  }

  if (updateOptionContainer) {
    // removing previous option elements
    while (selectInfo.optionContainer.lastChild) {
      selectInfo.optionContainer.removeChild(selectInfo.optionContainer.lastChild);
    }
    // adding back option element in sorted orders
    for (const option of result) {
      selectInfo.optionContainer.appendChild(getOptionElementWithOption(option, selectInfo));
    }
  }
}