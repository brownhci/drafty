import { tableDataManager } from '../../../sheet';
import { postNewCommentURL } from '../../api/endpoints';
import { recordCellEdit, getIdUniqueID, postHelpusStart, postHelpusClosed, postHelpusAnswered, postHelpusShowAnother } from '../../api/record-interactions';
import { getCellInTableRow } from '../../dom/navigate';

const helpUsOptionIDs = [
  'PHD_NOTE', 
  'WEBSITE_NOTE', 
  'EMPTY_YEAR', 
  'EMPTY_SUBFIELD', 
  'EMPTY_BACHELORS', 
  'EMPTY_DOCTORATE',
  'FUN_NOTE'
] as const;

type HelpUsOptionID = typeof helpUsOptionIDs[number];

type HelpUsOption = {
  id: HelpUsOptionID;
  active: boolean;
  comment: boolean;
  sentence?: string;
  placeholder?: string;
}

const helpUsOptions: Record<HelpUsOptionID, HelpUsOption> = {
  PHD_NOTE: {id: 'PHD_NOTE', active: true, comment: true, sentence: '', placeholder: ''},
  WEBSITE_NOTE: {id: 'WEBSITE_NOTE', active: true, comment: true, sentence: '', placeholder: 'Please enter the URL...'},
  EMPTY_YEAR: {id: 'EMPTY_YEAR', active: true, comment: false, sentence: '', placeholder: 'Please enter the 4-digit year...'},
  EMPTY_SUBFIELD: {id: 'EMPTY_SUBFIELD', active: false, comment: false, sentence: '', placeholder: 'Please enter the university name...'},
  EMPTY_BACHELORS: {id: 'EMPTY_BACHELORS', active: false, comment: false, sentence: '', placeholder: 'Please enter the university name...'},
  EMPTY_DOCTORATE: {id: 'EMPTY_DOCTORATE', active: false, comment: false, sentence: '', placeholder: 'Please enter the university name...'},
  FUN_NOTE: {id: 'FUN_NOTE', active: true, comment: true, sentence: '', placeholder: 'Please enter a fun fact about this professor...'},
} as const;

interface HelpUsInterface {
  helpUsOptionID: HelpUsOptionID;
  university: string;
  professor: string;
  targetCell: HTMLTableCellElement | null;
  idHelpus?: number;
}

let currHelpus: HelpUsInterface = {
  helpUsOptionID: helpUsOptions.PHD_NOTE.id,
  university: '',
  professor: '',
  targetCell: null,
  idHelpus: -1,
};

const generateSentence = (i: HelpUsInterface) => {
  switch (i.helpUsOptionID) {
    case helpUsOptions.PHD_NOTE.id:
      return `Do you know if ${i.professor} from ${i.university} is looking for PhD students for the next academic year?`;
    case helpUsOptions.WEBSITE_NOTE.id:
      return `Do you know the URL for ${i.professor}'s website? They are a professor from ${i.university}.`;
    case helpUsOptions.EMPTY_YEAR.id:
      return `Do you know when ${i.professor} joined ${i.university} as a professor?`;
    case helpUsOptions.EMPTY_SUBFIELD.id:
      return (
        `Do you know what the subfield of ${i.professor} from ${i.university} is?`
      );
    case helpUsOptions.EMPTY_BACHELORS.id:
      return (
        `Do you know where ${i.professor} from ${i.university} got their bachelors degree?`
      );
    case helpUsOptions.EMPTY_DOCTORATE.id:
      return (
        `Do you know where ${i.professor} from ${i.university} got their doctorate degree?`
      );
    case helpUsOptions.FUN_NOTE.id:
        return (
          `Please share a fun fact or something interesting about ${i.professor} from ${i.university}.`
        );
    default:
      return `Oh we are so sorry, something went wrong! Please try again. :)`;
  }
};

function getRandomHelpUsOption(): HelpUsOptionID {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const key = (shuffle(Object.keys(helpUsOptions)) as Array<HelpUsOptionID>).find(key => helpUsOptions[key].active === true);
  return key!;
}

function getRandomHelpUsOptionComment(): HelpUsOptionID {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const key = (shuffle(Object.keys(helpUsOptions)) as Array<HelpUsOptionID>).find(key => helpUsOptions[key].active === true && helpUsOptions[key].comment === true);
  return key!;
}

const helpusModal = <HTMLElement>document.getElementById('helpus-screen');
const helpusNextButton = <HTMLButtonElement>(
  document.getElementById('btn-helpus-next')
);
const helpusCloseButton = <HTMLButtonElement>(
  document.getElementById('helpusModalClose')
);
const helpusCloseIcon = <HTMLButtonElement>(
  document.getElementById('helpus-close')
);
const helpusText = <HTMLElement>document.getElementById('helpus-text');
const helpusSubmit = <HTMLButtonElement>(
  document.getElementById('btn-helpus-submit')
);
const helpusInput = <HTMLInputElement>document.getElementById('helpus-input');
const helpusDefaultInteraction = <HTMLDivElement>(
  document.getElementById('helpus-default-interaction')
);
const helpusPhdInteraction = <HTMLDivElement>(
  document.getElementById('helpus-phd-interaction')
);

const helpusYesRadio = <HTMLInputElement>(
  document.getElementById('helpus-phd-yes')
);

const helpusNoRadio = <HTMLInputElement>(
  document.getElementById('helpus-phd-no')
);

function updateHelpusHTML(sentence: string) {
  console.log(`updateHelpusHTML -> ${sentence}`);
  helpusText.innerHTML = sentence;
}

function showThankyouScreen () {
  console.log(`Show Thank You Screen`);
  updateHelpusHTML(`Your response has been recorded. Thank you for contributing to Drafty!`);
  helpusNextButton.innerHTML = 'Show me another Help Us';
  helpusDefaultInteraction.style.display = 'none';
  helpusPhdInteraction.style.display = 'none';
  helpusSubmit.style.display = 'none';
}

function range(size: number, startAt: number = 0): Array<number> {
  return [...Array(size).keys()].map((i) => i + startAt);
}

function shuffle(array: Array<any>) {
  let currentIndex = array.length;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function postNewComment(idrow: string | number, comment: string) {
  const tableCellInputFormCSRFInput: HTMLInputElement = document.querySelector(
    'input[name=\'_csrf\']'
  )!;
  let url = '';
  const urlRegex =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
  if (comment.includes('https://')) {
    const idx = comment.indexOf('https://');
    const substring = comment.substring(idx);
    url = substring.replace(/\n/g, ' ').split(' ')[0];
    let tag = '';
    if (urlRegex.test(url)) {
      tag = '<a href=' + url + '>' + url + '</a>';
      comment = comment.replace(url, tag);
    }
  }
  const bodyData = {
    idrow: idrow,
    comment: comment,
    _csrf: tableCellInputFormCSRFInput.value,
  };
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  };
  fetch(postNewCommentURL(), options)
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      console.error(error);
    });
}


function getNoCommentRow(helpUsOptionID: HelpUsOptionID): HelpUsInterface {
  const n: number = tableDataManager.source.length;
  const arr = range(n);
  const shuffled = shuffle(arr);
  for (let row = 0; row < n; ++row) {
    const rowEle = tableDataManager.source[shuffled[row]].element_ as HTMLTableRowElement;
    const targetCell = rowEle.firstChild as HTMLTableCellElement;
    const profName = getCellInTableRow(rowEle, 0)?.textContent?.trim();
    const profUniversity = getCellInTableRow(rowEle, 1)?.textContent?.trim();
    if (!targetCell.innerHTML.includes('comment-indicator'))
      return {
        helpUsOptionID: helpUsOptionID,
        university: profUniversity!,
        professor: profName!,
        targetCell: targetCell,
        idHelpus: -1
      };
  }
  // nothing found so grab first random row
  const rowEle = tableDataManager.source[shuffled[0]].element_ as HTMLTableRowElement;
  const targetCell = rowEle.firstChild as HTMLTableCellElement;
  const profName = getCellInTableRow(rowEle, 0)?.textContent?.trim();
  const profUniversity = getCellInTableRow(rowEle, 1)?.textContent?.trim();
  return {
    helpUsOptionID: helpUsOptionID,
    university: profUniversity!,
    professor: profName!,
    targetCell: targetCell,
    idHelpus: -1
  };
}

function getEmptyCell(col: number = 2): HelpUsInterface {
  const n: number = tableDataManager.source.length;
  const arr = range(n);
  const shuffled = shuffle(arr);
  for (let row = 0; row < n; ++row) {
    const rowEle = tableDataManager.source[shuffled[row]]
      .element_ as HTMLTableRowElement;
    const targetCell = getCellInTableRow(rowEle, col);
    const cellValue = targetCell!.textContent?.trim();
    if (!cellValue) {
      const profName = getCellInTableRow(rowEle, 0)?.textContent?.trim();
      const profUniversity = getCellInTableRow(
        rowEle,
        1
      )?.textContent?.trim();
      return {
        helpUsOptionID: helpUsOptions.EMPTY_YEAR.id,
        university: profUniversity!,
        professor: profName!,
        targetCell: targetCell!,
        idHelpus: -1
      };
    }
  }
  return getNoCommentRow(getRandomHelpUsOptionComment());
}

function closeModal() {
  postHelpusClosed(currHelpus.idHelpus!);
  helpusModal.style.display = 'none';
}

function updateInteractionDisplay(i: HelpUsInterface) {
  if (i.helpUsOptionID === helpUsOptions.PHD_NOTE.id) {
    helpusDefaultInteraction.style.display = 'none';
    helpusPhdInteraction.style.display = 'block';
  } else {
    helpusDefaultInteraction.style.display = 'flex';
    helpusPhdInteraction.style.display = 'none';
  }
  helpusInput.placeholder = helpUsOptions[i.helpUsOptionID].placeholder!;
}

function updateSubmitButton(i: HelpUsInterface) {
  if (i.helpUsOptionID === helpUsOptions.PHD_NOTE.id) {
    helpusSubmit.onclick = function () {
      const answer = helpusYesRadio.checked
      ? 'This professor is looking for PhD students to start in the next academic year.'
      : 'This professor is not looking for PhD students for the next academic year.';
      postNewComment(getIdUniqueID(i.targetCell!),answer);
      postHelpusAnswered(i.idHelpus!, answer);
      showThankyouScreen();
    };
  } else if (i.helpUsOptionID === helpUsOptions.WEBSITE_NOTE.id) {
    helpusSubmit.onclick = function () {
      const note: string = `Website: ${helpusInput.innerHTML}`;
      console.log(`updateSubmitButton WEBSITE_NOTE -- SUBMIT = ${note}`);
      postNewComment(getIdUniqueID(i.targetCell!), note);
      postHelpusAnswered(i.idHelpus!, note);
      showThankyouScreen();
    };
  } else if (i.helpUsOptionID === helpUsOptions.EMPTY_YEAR.id) {
    helpusSubmit.onclick = function () {
      const year: string = helpusInput.value.trim();
      console.log(`updateSubmitButton EMPTY_YEAR -- SUBMIT = ${year}`);
      recordCellEdit(i.targetCell!, year);
      postHelpusAnswered(i.idHelpus!, year);
      showThankyouScreen();
    };
  } else if (i.helpUsOptionID === helpUsOptions.FUN_NOTE.id) {
    helpusSubmit.onclick = function () {
      const note: string = helpusInput.value.trim();
      console.log(`updateSubmitButton FUN_NOTE -- SUBMIT = ${note}`);
      recordCellEdit(i.targetCell!, note);
      postHelpusAnswered(i.idHelpus!, note);
      showThankyouScreen();
    };
  }
}

function openModal() {
  //reset
  helpusModal.style.display = 'block';
  helpusSubmit.style.display = 'block';
  helpusInput.value = '';
  helpusSubmit.disabled = true;
  helpusYesRadio.checked = false;
  helpusNoRadio.checked = false;
  helpusNextButton.innerHTML = 'I am not sure, please show me another';

  currHelpus.helpUsOptionID = getRandomHelpUsOption();
  if(!helpUsOptions[currHelpus.helpUsOptionID].comment) {
    currHelpus = getEmptyCell();
  } else {
    currHelpus = getNoCommentRow(currHelpus.helpUsOptionID);
  }
  const question = generateSentence(currHelpus);

  updateHelpusHTML(question);
  updateInteractionDisplay(currHelpus);
  updateSubmitButton(currHelpus);
  postHelpusStart(currHelpus.helpUsOptionID, getIdUniqueID(currHelpus.targetCell!), question);
}

export function activateHelpUs() {
  openModal();
}

export function updateHelpusID (id: number) {
  currHelpus.idHelpus = id;
}

helpusModal.addEventListener('keydown', function (event: KeyboardEvent) {
  if (event.key === 'Escape') closeModal();
});

helpusNextButton.addEventListener(
  'click',
  function (event: MouseEvent) {
    console.log(`helpusNextButton see another`);
    postHelpusShowAnother(currHelpus.idHelpus!);
    openModal();
    event.stopPropagation();
  },
  true
);

helpusCloseButton.addEventListener(
  'click',
  function (event: MouseEvent) {
    console.log(`helpusCloseButton click close`);
    closeModal();
    event.stopPropagation();
  },
  true
);

helpusCloseIcon.addEventListener(
  'click',
  function (event: MouseEvent) {
    console.log(`helpusCloseIcon click close`);
    closeModal();
    event.stopPropagation();
  },
  true
);

function enableSubmitButton() {
  let disable: boolean = true;
  console.log(`enableSubmitButton - is helpusSubmit disabled? ${helpusSubmit.disabled}`);
  if(currHelpus.helpUsOptionID === helpUsOptions.PHD_NOTE.id) {
    disable = !helpusYesRadio.checked && !helpusNoRadio.checked;
  } else {
    console.log(`helpusInput.value.length = ${helpusInput.value.length}`);
    // check inputs
    if(currHelpus.helpUsOptionID === helpUsOptions.EMPTY_YEAR.id) {
      disable = helpusInput.value.length !== 4;
    } else {
      disable = helpusInput.value.length < 5;
    }
  }
  // update UI
  helpusSubmit.disabled = disable;
  if(disable) {
    helpusSubmit.classList.add('disabled');
  } else {
    helpusSubmit.classList.remove('disabled');
  }
}

helpusInput.onkeyup = enableSubmitButton;
helpusYesRadio.onclick = enableSubmitButton;
helpusNoRadio.onclick = enableSubmitButton;
