import { tableDataManager } from '../../../sheet';
import { postNewCommentURL } from '../../api/endpoints';
import { recordCellEdit, getIdUniqueID, postHelpusStart, postHelpusEnd } from '../../api/record-interactions';
import { getCellInTableRow } from '../../dom/navigate';

const helpUsIDs = [
  'PHD_NOTE', 
  'WEBSITE_NOTE', 
  'EMPTY_YEAR', 
  'EMPTY_SUBFIELD', 
  'EMPTY_BACHELORS', 
  'EMPTY_DOCTORATE'
] as const;

type HelpUsID = typeof helpUsIDs[number];

type HelpUsOption = {
  id: HelpUsID;
  active: boolean;
  comment: boolean;
  sentence?: string;
  placeholder?: string;
}

const helpUsOptions: Record<HelpUsID, HelpUsOption> = {
  PHD_NOTE: {id: 'PHD_NOTE', active: true, comment: true, sentence: '', placeholder: ''},
  WEBSITE_NOTE: {id: 'WEBSITE_NOTE', active: true, comment: true, sentence: '', placeholder: 'Please enter the URL...'},
  EMPTY_YEAR: {id: 'EMPTY_YEAR', active: true, comment: false, sentence: '', placeholder: 'Please enter the 4-digit year...'},
  EMPTY_SUBFIELD: {id: 'EMPTY_SUBFIELD', active: false, comment: false, sentence: '', placeholder: 'Please enter the university name here ...'},
  EMPTY_BACHELORS: {id: 'EMPTY_BACHELORS', active: false, comment: false, sentence: '', placeholder: 'Please enter the university name here ...'},
  EMPTY_DOCTORATE: {id: 'EMPTY_DOCTORATE', active: false, comment: false, sentence: '', placeholder: 'Please enter the university name here ...'},
} as const;

interface HelpUsInterface {
  helpUsID: HelpUsID;
  university: string;
  professor: string;
  targetCell: HTMLTableCellElement | null;
  idHelpus?: number;
}

let currHelpus: HelpUsInterface = {
  helpUsID: helpUsOptions.PHD_NOTE.id,
  university: '',
  professor: '',
  targetCell: null,
  idHelpus: -1,
};

const generateSentence = (i: HelpUsInterface) => {
  switch (i.helpUsID) {
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
    default:
      return `Oh we are so sorry, something went wrong! Please try again. :)`;
  }
};

function getRandomHelpUsOption() {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const key = (shuffle(Object.keys(helpUsOptions)) as Array<HelpUsID>).find(key => helpUsOptions[key].active === true);
  return key;
}

function getRandomHelpUsOptionComment() {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const key = (shuffle(Object.keys(helpUsOptions)) as Array<HelpUsID>).find(key => helpUsOptions[key].active === true && helpUsOptions[key].comment === true);
  return key;
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

function getEmptyCell(): HelpUsInterface | null {
  const n: number = tableDataManager.source.length;
  const arr = range(n);
  const shuffled = shuffle(arr);
  for (let row = 0; row < n; ++row) {
    const rowEle = tableDataManager.source[shuffled[row]]
      .element_ as HTMLTableRowElement;
    const col = 2; // join year --- sw should not be hardcoded
    const targetCell = getCellInTableRow(rowEle, col);
    const cellValue = targetCell!.textContent?.trim();
    if (!cellValue) {
      const profName = getCellInTableRow(rowEle, 0)?.textContent?.trim();
      const profUniversity = getCellInTableRow(
        rowEle,
        1
      )?.textContent?.trim();
      return {
        helpUsID: helpUsOptions.EMPTY_YEAR.id,
        university: profUniversity!,
        professor: profName!,
        targetCell: targetCell!,
      };
    }
  }
  return null;
}

function closeModal() {
  postHelpusEnd(currHelpus.idHelpus!, null, 'close');
  helpusModal.style.display = 'none';
}

function getNoCommentRow(): HelpUsInterface | null {
  const n: number = tableDataManager.source.length;
  const arr = range(n);
  const shuffled = shuffle(arr);
  for (let row = 0; row < n; ++row) {
    const rowEle = tableDataManager.source[shuffled[row]]
      .element_ as HTMLTableRowElement;
    const targetCell = rowEle.firstChild as HTMLTableCellElement;
    const profName = getCellInTableRow(rowEle, 0)?.textContent?.trim();
    const profUniversity = getCellInTableRow(rowEle, 1)?.textContent?.trim();
    if (!targetCell.innerHTML.includes('comment-indicator'))
      return {
        helpUsID: getRandomHelpUsOptionComment()!,
        university: profUniversity!,
        professor: profName!,
        targetCell: targetCell,
      };
  }
  return null;
}

function updateInteractionDisplay(i: HelpUsInterface) {
  if (i.helpUsID === helpUsOptions.PHD_NOTE.id) {
    helpusDefaultInteraction.style.display = 'none';
    helpusPhdInteraction.style.display = 'block';
  } else if (i.helpUsID === helpUsOptions.WEBSITE_NOTE.id) {
    helpusDefaultInteraction.style.display = 'flex';
    helpusPhdInteraction.style.display = 'none';
  } else {
    helpusDefaultInteraction.style.display = 'flex';
    helpusPhdInteraction.style.display = 'none';
  }
  helpusInput.placeholder = helpUsOptions[i.helpUsID].placeholder!;
}

function updateSubmitButton(i: HelpUsInterface) {
  if (i.helpUsID === helpUsOptions.PHD_NOTE.id) {
    helpusSubmit.onclick = function () {
      const answer = helpusYesRadio.checked
      ? 'This professor is looking for PhD students to start in the next academic year.'
      : 'This professor is not looking for PhD students right now.';
      postNewComment(
        getIdUniqueID(i.targetCell!),
        answer
      );
      postHelpusEnd(i.idHelpus!, answer, 'submit');
      showThankyouScreen();
    };
  } else if (i.helpUsID === helpUsOptions.WEBSITE_NOTE.id) {
    helpusSubmit.onclick = function () {
      const input = helpusInput.value;
      if (input === '') {
        alert('You need to enter a valid value.');
        return;
      }
      const note: string = `Website at: ${helpusInput.innerHTML}`;
      postNewComment(getIdUniqueID(i.targetCell!), note);
      postHelpusEnd(i.idHelpus!, helpusInput.innerHTML, 'submit');
      showThankyouScreen();
    };
  } else {
    helpusSubmit.onclick = function () {
      console.log(`updateSubmitButton ELSE`);
      const input = helpusInput.value;
      if (input === '') {
        alert('You need to enter a valid value.');
        return;
      }
      console.log(`updateSubmitButton ELSE -- SUBMIT`);
      recordCellEdit(i.targetCell!, helpusInput.innerHTML);
      postHelpusEnd(i.idHelpus!, helpusInput.innerHTML, 'submit');
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

  const rand = Math.floor(Math.random() * 2); // sw: what does this do? -- way too hard coded
  rand === 0 ? (currHelpus = getEmptyCell()!) : (currHelpus = getNoCommentRow()!);
  const currentHelpUs = currHelpus;
  const question = generateSentence(info);
  updateHelpusHTML(question);
  updateInteractionDisplay(info);
  updateSubmitButton(info);
  postHelpusStart(helpusDict[info.typeId], getIdUniqueID(info.targetCell!), question);
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
    postHelpusEnd(currHelpus.idHelpus!, null, 'next');
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
  if (
    helpusDefaultInteraction.style.display === 'none' &&
    helpusPhdInteraction.style.display === 'flex'
  ) {
    helpusSubmit.disabled = !helpusYesRadio.checked && !helpusNoRadio.checked;
  } else {
    helpusSubmit.disabled = helpusInput.value === '';
  }
}

helpusInput.onkeyup = enableSubmitButton;
helpusYesRadio.onclick = enableSubmitButton;
helpusNoRadio.onclick = enableSubmitButton;
