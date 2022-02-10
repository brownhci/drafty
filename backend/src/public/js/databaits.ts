import { getEnclosingTableRow } from './modules/dom/navigate';
import { recordDataBaitCreate } from './modules/api/record-interactions';

let idRow: string = undefined;

const dataBaitModal: HTMLElement = document.getElementById('databait-screen');
const dataBaitLabel: HTMLElement = document.getElementById('row-label');
const dataBaitModalClose: HTMLElement = document.getElementById('dataBaitModalClose');
const tweetBtn = <HTMLButtonElement>document.getElementById('btn-databait-tweet');
const createSimilarBtn = <HTMLButtonElement>document.getElementById('btn-databait-similar');
const createRandomBtn = <HTMLButtonElement>document.getElementById('btn-databait-random');

const databaitLinks = document.getElementsByClassName('databait-url');

function databaitLinksListener(event: Event) {
    console.log(event);
    console.log(event.target);
    const element = event.target;
}

Array.from(databaitLinks).forEach(function(element) {
    element.addEventListener('click', databaitLinksListener);
});

dataBaitModalClose.addEventListener('click', function(event: MouseEvent) {
    dataBaitModal.style.display = 'none';
    // recordDataBaitTweet() // similar
    event.stopPropagation();
}, true);

tweetBtn.addEventListener('click', function() {
    console.log('tweetBtn');
}, true);
createSimilarBtn.addEventListener('click', function() {
    console.log('createSimilarBtn');
    // recordDataBaitCreate() // similar
}, true);
createRandomBtn.addEventListener('click', function() {
    console.log('createRandomBtn');
    // recordDataBaitCreate() // random
}, true);

export function dataBait(tableCellElement: HTMLTableCellElement) {
    const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
    idRow = tableRow.getAttribute('data-id');
}