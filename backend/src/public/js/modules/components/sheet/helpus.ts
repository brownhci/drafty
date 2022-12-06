import { tableDataManager } from '../../../sheet';
import { postNewCommentURL } from '../../api/endpoints';
import { recordCellEdit, getIdUniqueID } from '../../api/record-interactions';
import { getCellInTableRow } from '../../dom/navigate';

enum HelpusType {
  PHD_NOTE,
  WEBSITE_NOTE,
  EMPTY_YEAR,
  EMPTY_SUBFIELD,
  EMPTY_BACHELORS,
  EMPTY_DOCTORATE,
}

interface HelpUsInterface {
  typeId: HelpusType;
  university: string;
  professor: string;
  targetCell: HTMLTableCellElement;
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
//disable submit button when cell not filled out
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


// function disableSubmitButton () {
//   helpusInput.innerHTML === '' ? helpusSubmit.disabled = true : helpusSubmit.disabled = false;
// }

// helpusInput.onkeyup = disableSubmitButton;

// const defaultDisplay = `
// Yes!
// <input type="text" id="helpus-input" placeholder="enter value here..." style="align-items: flex-start; margin: 0em 1em; border: none; border-bottom: 2px solid #1089ff;">
// </input>
// `;

// const websiteDisplay = `
// Yes!
// <input type="text" id="helpus-input" placeholder="https://..." style="align-items: flex-start; margin: 0em 1em; border: none; border-bottom: 2px solid #1089ff;">
// </input>
// `;

// const phDDisplay= `
// <div id= "helpus-button-wrapper" style="display: flex; font-size: 16px; color: #1089ff; justify-content: center; align-items: center; margin: 1em; outline: none;}">
//   <input type="button" value="Yes, they are!" id="helpus-phd-yes" class="btn btn btn-outline-primary btn-block" style="width: 8em; align-items: flex-start; margin: 0.5em 0.25em 0.5em 0em;">
//   </input>
//   <input type="button" value="No, not now." id="helpus-phd-no" class="btn btn btn-outline-primary btn-block" style="width: 8em; align-items: flex-start; margin: 0.5em 0.25em 0.5em 0em;">
//   </input>
// </div>`;

const generateSentence = (i: HelpUsInterface) => {
  switch (i.typeId) {
    case 0:
      return (
        `Do you know if ${i.professor} from ${i.university} is looking for PhD students for the next academic year?`
      );
    case 1:
      return (
        `Do you know the personal website for ${i.professor} from ${i.university}?`
      );
    case 2:
      return (
        'Do you know when ' +
        i.professor +
        ' joined ' +
        i.university +
        ' as a professor?'
      );
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
  const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
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
    helpusInput.placeholder = 'https:// ...';
    helpusDefaultInteraction.style.display = 'flex';
    helpusPhdInteraction.style.display = 'none';
  } else {
    helpusInput.placeholder = 'enter value here ...';
    helpusDefaultInteraction.style.display = 'flex';
    helpusPhdInteraction.style.display = 'none';
  }
}

function updateSubmitButton(i: HelpUsInterface) {
  if (i.typeId === HelpusType.PHD_NOTE) {
    helpusSubmit.onclick = function (event: MouseEvent) {
      postNewComment(
        getIdUniqueID(i.targetCell),
        'This professor is looking for PhD students to start in the next academic year.'
      );
      event.stopPropagation();
    };
  } else if (i.typeId === HelpusType.WEBSITE_NOTE) {
    helpusSubmit.onclick = function (event: MouseEvent) {
      const input = helpusInput.value;
      console.log(getIdUniqueID(i.targetCell));
      console.log(input);
      if (input === '') {
        alert ('You need to enter a valid value.');
        return;
      }
      const note: string = 'Website at: ' + helpusInput.innerHTML;
      console.log(note);
      console.log(getIdUniqueID(i.targetCell));
      postNewComment(getIdUniqueID(i.targetCell), note);
      event.stopPropagation();
    };
  } else {
    helpusSubmit.onclick = function (event: MouseEvent) {
      const input = helpusInput.value;
      console.log(input);
      if (input === '') {
        alert ('You need to enter a valid value.');
        return;
      }
      recordCellEdit(i.targetCell, helpusInput.innerHTML);
      event.stopPropagation();
    };
  }
}

function openModal() {
  helpusModal.style.display = 'block';
  helpusInput.value = '';
  const rand = Math.floor(Math.random() * 2);
  let info: HelpUsInterface;
  rand === 0 ? (info = getEmptyCell()!) : (info = getNoCommentRow()!);
  updateHelpusHTML(generateSentence(info));
  updateInteractionDisplay(info);
  updateSubmitButton(info);
}

export async function activateHelpUs() {
  openModal();
}

helpusModal.addEventListener('keydown', function (event: KeyboardEvent) {
  if (event.key === 'Escape') helpusModal.style.display = 'none';
});

helpusNextButton.addEventListener(
  'click',
  function (event: MouseEvent) {
    openModal();
    event.stopPropagation();
  },
  true
);

helpusCloseButton.addEventListener(
  'click',
  function (event: MouseEvent) {
    helpusModal.style.display = 'none';
    event.stopPropagation();
  },
  true
);

helpusCloseIcon.addEventListener(
  'click',
  function (event: MouseEvent) {
    helpusModal.style.display = 'none';
    event.stopPropagation();
  },
  true
);