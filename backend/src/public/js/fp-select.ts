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
}
type Option = Record<string, any>;
interface SelectInfo {
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
};

function fillDefaultsToUserConfig(userConfig: SelectConfig) {
  return Object.assign({}, defaultConfig, userConfig);
}
function interpolatePriorities(options: Array<Option>, selectConfig: SelectConfig, selectInfo: SelectInfo) {
  const priorityKey = selectConfig.priorityKey;
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

}
function createOptionContainer(options: Array<Option>, selectConfig: SelectConfig, selectInfo: SelectInfo) {
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

function sortOptionsByPriority(options: Array<Option>, selectConfig: SelectConfig, selectInfo: SelectInfo) {
  const priorityKey = selectConfig.priorityKey;
  options.sort((option1, option2) => option2[priorityKey] - option1[priorityKey]);
  selectInfo.options = options;
}
function createSelect(identifier: string, targetInputElement: HTMLInputElement, options: Array<Option>, userConfig = {}) {
  let selectInfo: SelectInfo = identifierToSelectInfo.get(identifier);
  if (!selectInfo) {
    // initialize new select info
    const selectConfig: SelectConfig = fillDefaultsToUserConfig(userConfig);
    selectInfo = initializeSelectInfo();
    selectInfo.numOptions = options.length;

    interpolatePriorities(options, selectConfig, selectInfo);
    sortOptionsByPriority(options, selectConfig, selectInfo);

    createOptionContainer(options, selectConfig, selectInfo);
    // register created select info under identifier
    identifierToSelectInfo.set(identifier, selectInfo);
  }

  // append select info after input element
  selectInfo.targetInputElement = targetInputElement;
  targetInputElement.after(selectInfo.optionContainer);
  return selectInfo;
}
function removeSelect(targetInputElement: HTMLInputElement) {
  const selectElement = targetInputElement.nextElementSibling;
  if (selectElement && selectElement.classList.contains(optionContainerClass)) {
    selectElement.remove();
  }
}