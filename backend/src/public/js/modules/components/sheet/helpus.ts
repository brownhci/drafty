import { tableDataManager } from '../../../sheet';
import { recordCellEdit } from '../../api/record-interactions';
import { getCellInTableRow } from '../../dom/navigate';


enum HelpusType {
    EMPTYCELL,
    EMPTYCOMMENT
}

interface HelpUsInterface {
    typeId: HelpusType,
    university: string,
    professor: string,
    emptyCell?: number
}

const generateSentence = (i: HelpUsInterface) => {
if (i.typeId === 0){
    switch (i.emptyCell) {
        case 2:
            return 'Do you know when ' + i.professor + ' joined ' + i.university + ' as a professor?';
        case 3:
            return 'Do you know what the subfield of ' + i.professor + ' from ' + i.university + ' is?';
        case 4:
            return 'Do you know where ' + i.professor + ' from ' + i.university + ' got their bachelors degree?';
        case 5:
            return 'Do you know where ' + i.professor + ' from ' + i.university + ' got their doctorate degree?';
        default: 
            return 'error';
    }
} else {
    const rand = Math.floor(Math.random() * 2);
    switch (rand) {
        case 0:
            return 'Do you know if ' + i.professor + ' from ' + i.university + ' is looking for PhD students?';
        case 1:
            return 'Do you know the personal website for ' + i.professor + ' from ' + i.university + '?';
        default: 
            return 'error';
        }
    }
};

const helpusModal = <HTMLElement> document.getElementById('helpus-screen');
const helpusNextButton = <HTMLButtonElement> document.getElementById('btn-helpus-next');
const helpusModalClose = <HTMLButtonElement>document.getElementById('helpusModalClose');
const helpusText = <HTMLElement>document.getElementById('helpus-text');
//disable submit button when cell not filled out
const helpusSubmit = <HTMLButtonElement>document.getElementById('btn-helpus-submit');
const helpusInput = <HTMLElement> document.getElementById('helpus-input');


function updateHelpusHTML(sentence: string) {
    helpusText.innerHTML = sentence;
}


function range(size:number, startAt:number = 0):Array<number> {
    return [...Array(size).keys()].map(i => i + startAt);
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
        array[randomIndex], array[currentIndex]];
    }
    return array;
}

function getEmptyCell() {
    const n: number = tableDataManager.source.length;
    const arr = range(n);
    const shuffled = shuffle(arr);
    for (let row = 0; row < n; ++row) {
        const rowEle = tableDataManager.source[shuffled[row]].element_ as HTMLTableRowElement;
        for (let col = 2; col < 6; ++col) {
            const cellValue = getCellInTableRow(rowEle, col)!.textContent?.trim();
            if (!cellValue) {
                return [shuffled[row], col];
            }
        }
    }
    return [];
}

function getNoCommentRow() : HelpUsInterface | null {
    const n: number = tableDataManager.source.length;
    const arr = range(n);
    const shuffled = shuffle(arr);
    for (let row = 0; row < n; ++row) {
        const rowEle = tableDataManager.source[shuffled[row]].element_ as HTMLTableRowElement;
        const targetCell = rowEle.firstChild as HTMLTableCellElement;
        const profName = getCellInTableRow(rowEle, 0)?.textContent?.trim();
        const profUniversity = getCellInTableRow(rowEle, 1)?.textContent?.trim();
        if (!targetCell.innerHTML.includes('comment-indicator')) return {typeId: 1, university: profUniversity!, professor: profName!};
    }
    return null;
}

function updateCellInfo (rowElement: HTMLTableRowElement, col: number) {
    const cellElement = getCellInTableRow(rowElement, col);
    cellElement ? recordCellEdit(cellElement, helpusInput.innerHTML) : console.log('error');
}

function openModal() {
    helpusModal.style.display = 'block';
    console.log(getNoCommentRow());
    const emptyCell: number[] = getEmptyCell();
    if (emptyCell.length != 2) return; // prob should generate error statement
    const rowEle = tableDataManager.source[emptyCell[0]].element_ as HTMLTableRowElement;
    const col = emptyCell[1];
    const profName = getCellInTableRow(rowEle, 0)?.textContent?.trim();
    const profUniversity = getCellInTableRow(rowEle, 1)?.textContent?.trim();
    const info : HelpUsInterface = {typeId: 0, university: profUniversity!, professor: profName!, emptyCell: col};
    const commentInfo : HelpUsInterface = getNoCommentRow()!;
    //updateHelpusHTML(generateSentence(info));
    updateHelpusHTML(generateSentence(commentInfo));
    helpusSubmit.addEventListener('click', function(event: MouseEvent) {
        updateCellInfo(rowEle, col);
        event.stopPropagation();
    }, true);
}

export async function activateHelpUs() {
    openModal();
}

helpusNextButton.addEventListener('click', function(event: MouseEvent) {
    openModal();
    event.stopPropagation();
}, true);


helpusModalClose.addEventListener('click', function(event: MouseEvent) {
    helpusModal.style.display = 'none';
    event.stopPropagation();
}, true);
