import { tableDataManager } from '../../../sheet';
import { getIdSuggestion, getIdSuggestionType } from '../../api/record-interactions';
import { getCellInTableRow } from '../../dom/navigate';
import { getColumnLabel } from '../../dom/sheet';
import { updateFuseSelect } from './suggestions';

interface HelpUsInterface {
    university: string,
    professor: string,
    emptyCell: number
}

const generateSentence = (i: HelpUsInterface) => {
    switch (i.emptyCell) {
        case 2:
            return 'Do you know when ' + i.professor + ' joined ' + i.university + '?';
        case 3:
            return 'Do you know what the subfield of ' + i.professor + ' from ' + i.university + ' is?';
        case 4:
            return 'Do you know where ' + i.professor + ' from ' + i.university + ' got their bachelor degree from?';
        case 5:
            return 'Do you know where ' + i.professor + ' from ' + i.university + ' got their doctorate degree from?';
    }
};

const helpUsModal: HTMLElement = document.getElementById('helpus-screen');
const helpUsNextButton = <HTMLButtonElement> document.getElementById('btn-helpus-next');
const helpUsModalClose = <HTMLButtonElement>document.getElementById('helpusModalClose');
const helpusText: HTMLElement = document.getElementById('helpus-text');


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
            const cellValue = getCellInTableRow(rowEle, col)?.textContent.trim();
            if (!cellValue) {
                return [shuffled[row], col];
            }
        }
    }
    return [];
}

function generateSubmitButton (colIndex: number) {
    //fuse ??
    this.fuseSelect.mount(element => this.mountFuseSelect(element));
    updateFuseSelect(this.fuseSelect, getIdSuggestion(this.cellElement), getIdSuggestionType(getColumnLabel(colIndex)));
}

function openModal() {
    helpUsModal.style.display = 'block';
    const emptyCell: number[] = getEmptyCell();
    if (emptyCell.length != 2) return; // prob should generate error statement
    const rowEle = tableDataManager.source[emptyCell[0]].element_ as HTMLTableRowElement;
    const col = emptyCell[1];
    const profName = getCellInTableRow(rowEle, 0)?.textContent.trim();
    const profUniversity = getCellInTableRow(rowEle, 1)?.textContent.trim();
    const info : HelpUsInterface = {university: profUniversity, professor: profName, emptyCell: col};
    updateHelpusHTML(generateSentence(info));
    // generateSubmitButton(col);
}

export async function activateHelpUs() {
    openModal();
}

helpUsNextButton.addEventListener('click', function(event: MouseEvent) {
    openModal();
}, true);


helpUsModalClose.addEventListener('click', function(event: MouseEvent) {
    helpUsModal.style.display = 'none';
    event.stopPropagation();
}, true);
