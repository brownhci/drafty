import { getEnclosingTableRow } from './modules/dom/navigate';
import { recordDataBaitCreate } from './modules/api/record-interactions';

let idRow: string = undefined;

const dataBaitModal: HTMLElement = document.getElementById('databait-screen');
const dataBaitLabel: HTMLElement = document.getElementById('row-label');
const dataBaitModalClose: HTMLElement = document.getElementById('dataBaitModalClose');
const tweetBtn = <HTMLButtonElement>document.getElementById('btn-databait-tweet');
const createSimilarBtn = <HTMLButtonElement>document.getElementById('btn-databait-similar');
const createRandomBtn = <HTMLButtonElement>document.getElementById('btn-databait-random');


dataBaitModalClose.addEventListener('click', function(event: MouseEvent) {
    dataBaitModal.style.display = 'none';
    event.stopPropagation();
}, true);

tweetBtn.addEventListener('click', function() {
    console.log('tweetBtn');
}, true);
createSimilarBtn.addEventListener('click', function() {
    console.log('createSimilarBtn');
}, true);
createRandomBtn.addEventListener('click', function() {
    console.log('createRandomBtn');
}, true);

export function dataBait(tableCellElement: HTMLTableCellElement) {
    const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
    idRow = tableRow.getAttribute('data-id');
}