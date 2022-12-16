import { tableDataManager } from '../../../sheet';
import { postNewCommentURL } from '../../api/endpoints';
import { recordCellEdit, getIdUniqueID, postHelpusStart, postHelpusEnd } from '../../api/record-interactions';
import { getCellInTableRow } from '../../dom/navigate';

enum HelpusType {
  PHD_NOTE,
  WEBSITE_NOTE,
  EMPTY_YEAR,
  EMPTY_SUBFIELD,
  EMPTY_BACHELORS,
  EMPTY_DOCTORATE,
}

const helpusDict = {0: 'PHD_NOTE', 1: 'WEBSITE_NOTE', 2: 'EMPTY_YEAR', 3: 'EMPTY_SUBFIELD', 4: 'EMPTY_BACHELORS', 5: 'EMPTY_DOCTORATE'};

interface HelpUsInterface {
  typeId: HelpusType;
  university: string;
  professor: string;
  targetCell: HTMLTableCellElement | null;
  idHelpus?: number;
}

let currHelpus: HelpUsInterface = {
  typeId: HelpusType.PHD_NOTE,
  university: '',
  professor: '',
  targetCell: null,
  idHelpus: -1,
};

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

const generateSentence = (i: HelpUsInterface) => {
  switch (i.typeId) {
    case 0:
      return `Do you know if ${i.professor} from ${i.university} is looking for PhD students for the next academic year?`;
    case 1:
      return `Do you know the URL for ${i.professor}'s website? They are a professor from ${i.university}.`;
    case 2:
      return `Do you know when ${i.professor} joined ${i.university} as a professor?`;
    case 3:
      return (
        'Do you know what the subfield of ' +
        i.professor +
        ' from ' +
        i.university +
        ' is?'
      );
    case 4:
      return (
        'Do you know where ' +
        i.professor +
        ' from ' +
        i.university +
        ' got their bachelors degree?'
      );
    case 5:
      return (
        'Do you know where ' +
        i.professor +
        ' from ' +
        i.university +
        ' got their doctorate degree?'
      );
    default:
      return 'error';
  }
};

function showThankyouScreen () {
  helpusText.innerHTML = 'Your response has been recorded. Thank you for contributing to Drafty!';
  helpusNextButton.innerHTML = 'Show me another Help Us';
  helpusDefaultInteraction.style.display = 'none';
  helpusPhdInteraction.style.display = 'none';
  helpusSubmit.style.display = 'none';
}

function updateHelpusHTML(sentence: string) {
  helpusText.innerHTML = sentence;
}

function range(size: number, startAt: number = 0): Array<number> {
  return [...Array(size).keys()].map((i) => i + startAt);
}

function shuffle(array: Array<number>) {
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
    for (let col = 2; col < 6; ++col) {
      const targetCell = getCellInTableRow(rowEle, col);
      const cellValue = targetCell!.textContent?.trim();
      if (!cellValue) {
        const profName = getCellInTableRow(rowEle, 0)?.textContent?.trim();
        const profUniversity = getCellInTableRow(
          rowEle,
          1
        )?.textContent?.trim();
        return {
          typeId: col,
          university: profUniversity!,
          professor: profName!,
          targetCell: targetCell!,
        };
      }
    }
  }
  return null;
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
    // will return 0 or 1 to randomly decide what kind of note to ask for
    const rand = Math.floor(Math.random() * 2);
    if (!targetCell.innerHTML.includes('comment-indicator'))
      return {
        typeId: rand,
        university: profUniversity!,
        professor: profName!,
        targetCell: targetCell,
      };
  }
  return null;
}

function updateInteractionDisplay(i: HelpUsInterface) {
  if (i.typeId === HelpusType.PHD_NOTE) {
    helpusDefaultInteraction.style.display = 'none';
    helpusPhdInteraction.style.display = 'flex';
  } else if (i.typeId === HelpusType.WEBSITE_NOTE) {
    helpusInput.placeholder = 'Please enter the URL...';
    helpusDefaultInteraction.style.display = 'flex';
    helpusPhdInteraction.style.display = 'none';
  } else {
    helpusInput.placeholder = 'Please enter the value here ...';
    helpusDefaultInteraction.style.display = 'flex';
    helpusPhdInteraction.style.display = 'none';
  }
}

function updateSubmitButton(i: HelpUsInterface) {
  if (i.typeId === HelpusType.PHD_NOTE) {
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
  } else if (i.typeId === HelpusType.WEBSITE_NOTE) {
    helpusSubmit.onclick = function () {
      const input = helpusInput.value;
      if (input === '') {
        alert('You need to enter a valid value.');
        return;
      }
      const note: string = 'Website at: ' + helpusInput.innerHTML;
      postNewComment(getIdUniqueID(i.targetCell!), note);
      postHelpusEnd(i.idHelpus!, helpusInput.innerHTML, 'submit');
      showThankyouScreen();
    };
  } else {
    helpusSubmit.onclick = function () {
      const input = helpusInput.value;
      if (input === '') {
        alert('You need to enter a valid value.');
        return;
      }
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
  helpusNextButton.innerHTML = 'I am not sure, but show me another';

  const rand = Math.floor(Math.random() * 2);
  rand === 0 ? (currHelpus = getEmptyCell()!) : (currHelpus = getNoCommentRow()!);
  const info = currHelpus;
  const question = generateSentence(info);
  updateHelpusHTML(question);
  updateInteractionDisplay(info);
  updateSubmitButton(info);
  postHelpusStart(helpusDict[info.typeId], getIdUniqueID(info.targetCell!), question);
}

export async function activateHelpUs() {
  openModal();
}

export function updateHelpusID (id: number) {
  currHelpus.idHelpus = id;
}

helpusModal.addEventListener('keydown', function (event: KeyboardEvent) {
  postHelpusEnd(currHelpus.idHelpus!, null, 'close');
  if (event.key === 'Escape') helpusModal.style.display = 'none';
});

helpusNextButton.addEventListener(
  'click',
  function (event: MouseEvent) {
    postHelpusEnd(currHelpus.idHelpus!, null, 'next');
    openModal();
    event.stopPropagation();
  },
  true
);

helpusCloseButton.addEventListener(
  'click',
  function (event: MouseEvent) {
    helpusModal.style.display = 'none';
    postHelpusEnd(currHelpus.idHelpus!, null, 'close');
    event.stopPropagation();
  },
  true
);

helpusCloseIcon.addEventListener(
  'click',
  function (event: MouseEvent) {
    helpusModal.style.display = 'none';
    postHelpusEnd(currHelpus.idHelpus!, null, 'close');
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
