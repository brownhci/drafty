import { tableDataManager } from './sheet';
import { getEnclosingTableRow } from './modules/dom/navigate';
import { recordDataBaitCreate } from './modules/api/record-interactions';
import { PassThrough } from 'stream';

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

async function getDataBaitValues(tableCellElement: HTMLTableCellElement) {
    console.log(tableCellElement);
    if (tableCellElement !== null && tableCellElement !== undefined) {
        const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
        idRow = tableRow.getAttribute('data-id');
        console.log(idRow);
    } else {
        console.log('get random row/s');
        const n: number = tableDataManager.source.length;
        console.log(n);
        console.log(Math.floor(Math.random() * n));
    }
    
    const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    const response = await fetch('http://localhost:5000/api/v1/databait/all');
    console.log(response);

    fetch('http://localhost:5000/api/v1/databait/all', options)
      .then(async response => {
          const isJson = response.headers.get('content-type')?.includes('application/json');
          const data = isJson && await response.json();
          if (!response.ok) {
              const error = (data && data.message) || response.status;
              return Promise.reject(error);
          }
          console.log(data);
      }).catch(error => {
          console.error('There was an error!', error);
      });
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
   getDataBaitValues(tableCellElement);
   openModal();
}