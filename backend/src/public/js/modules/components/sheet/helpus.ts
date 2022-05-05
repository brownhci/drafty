import { tableDataManager } from '../../../sheet';
import { getCellInTableRow } from '../../dom/navigate';

enum CellType {
    JoinYear = 'joinyear',
    Subfield = 'subfield',
    Bachelors = 'bachelors',
    Doctorate = 'doctorate'
}

interface HelpUsInterface {
    university: string,
    professor: string,
    emptyCell: CellType
}

const sample: HelpUsInterface = {
    university: 'Brown University',
    professor: 'Jeff Huang',
    emptyCell: CellType.Bachelors,
};

const generateSentence = (i: HelpUsInterface) => {
    return 'Do you know where ' + i.professor + ' from ' + i.university + ' got their ' + i.emptyCell + '?';
};

const helpUsModal: HTMLElement = document.getElementById('helpus-screen');
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
        for (let col = 2; row < 6; ++col) {
            const cellValue = getCellInTableRow(rowEle, col).textContent.trim();
            if (!cellValue) {
                console.log(`${row} and $ is super awesome`);
                console.log(row + ' ' + col);
                return [row, col];
            }
        }
    }
    return [];
}

function openModal() {
    helpUsModal.style.display = 'block';
    getEmptyCell();
    updateHelpusHTML(generateSentence(sample));
}

export async function activateHelpUs() {
    openModal();
}

helpUsModalClose.addEventListener('click', function(event: MouseEvent) {
    helpUsModal.style.display = 'none';
    event.stopPropagation();
}, true);
