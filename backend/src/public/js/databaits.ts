import { getEnclosingTableRow } from './modules/dom/navigate';
import { recordDataBaitCreate } from './modules/api/record-interactions';

let idRow: string = undefined;

const dataBaitModal: HTMLElement = document.getElementById('databait-screen');
const dataBaitText: HTMLElement = document.getElementById('databait');
const dataBaitModalClose: HTMLElement = document.getElementById('dataBaitModalClose');
const tweetBtn = <HTMLButtonElement>document.getElementById('btn-databait-tweet');
const createSimilarBtn = <HTMLButtonElement>document.getElementById('btn-databait-similar');
const createRandomBtn = <HTMLButtonElement>document.getElementById('btn-databait-random');

const databaitLinks = document.querySelectorAll('a.databait-url');
databaitLinks.forEach( (element,i) => {
    element.addEventListener('click', (e) => {
        console.log(e);
        console.log(i);
        console.log(element.getAttribute('data-col'));
        console.log('done');
    });
});

dataBaitModalClose.addEventListener('click', function(event: MouseEvent) {
    dataBaitModal.style.display = 'none';
    event.stopPropagation();
}, true);

tweetBtn.addEventListener('click', function() {
    console.log('tweetBtn');
    // recordDataBaitTweet() // similar
}, true);
createSimilarBtn.addEventListener('click', function() {
    console.log('createSimilarBtn');
    // recordDataBaitCreate() // similar
}, true);
createRandomBtn.addEventListener('click', function() {
    console.log('createRandomBtn');
    // recordDataBaitCreate() // random
}, true);

function getDataBaitValues(tableCellElement: HTMLTableCellElement) {
    const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
    idRow = tableRow.getAttribute('data-id');
}

function updateDataBaitHTML(databait: string) {
    dataBaitText.innerHTML = ``;
}

function escKeyListener(event: KeyboardEvent) {
    if(event.key === 'Escape'){
		closeModal();
	}
}

function activateKeyListener() {
    document.addEventListener('keydown', (event) => escKeyListener(event));
}

function deactivateKeyListener() {
    document.removeEventListener('keydown', (event) => escKeyListener(event));
}

function openModal() {
    activateKeyListener();
    dataBaitModal.style.display = 'block';
}

function closeModal() {
    deactivateKeyListener();
    dataBaitModal.style.display = 'none';
}

export function activaterDataBait(tableCellElement: HTMLTableCellElement) {
   console.log(tableCellElement);
   openModal();
}