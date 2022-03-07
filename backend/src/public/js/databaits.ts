import { tableDataManager } from './sheet';
import { getColumnLabel, getColumnLabelText } from './modules/dom/sheet';
import { getEnclosingTableRow } from './modules/dom/navigate';
import { recordDataBaitCreate } from './modules/api/record-interactions';
import { PassThrough } from 'stream';

//let idRow: string = undefined;

const dataBaitModal: HTMLElement = document.getElementById('databait-screen');
const dataBaitText: HTMLElement = document.getElementById('databait-text');
const dataBaitModalClose: HTMLElement = document.getElementById('dataBaitModalClose');
const tweetBtn = <HTMLButtonElement>document.getElementById('btn-databait-tweet');
const createSimilarBtn = <HTMLButtonElement>document.getElementById('btn-databait-similar');
const createRandomBtn = <HTMLButtonElement>document.getElementById('btn-databait-random');

const databaitLoadingMsg: string = `Creating something awesome...`;

const apiUrl: string = '/api-dyk/v1/databait/all';
const apiUrlType = (type: string): string => { return `/api-dyk/v1/databait/${type}`; };

const databaitLinks = document.querySelectorAll('a.databait-url');
databaitLinks.forEach( (element,i) => {
    element.addEventListener('click', (e) => {
        console.log(element.textContent);
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

function randomRowPosition(n: number) {
    return Math.floor(Math.random() * n);
}

async function getDatabait() {
    const bodyData = JSON.stringify({'fields':candidateFields});
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyData
    };
    fetch(apiUrl, options)
        .then(async response => {
            console.log('response...');
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson && await response.json();
            console.log('DATA', data);
            if (!response.ok) {
                const error = (data && data.message) || response.status;
                console.error('There was an error with the resp!', error);
                return Promise.reject(error);
            }
            console.log('returning DATA...');
            return data;
        }).catch(error => {
            console.error('There was an error!', error);
        });
}

/*
* 
* columnName: [cellValues...]
* 
'fields': {
        'University': ['Carnegie Mellon University', 'Brown University', 'Harvard University'],
        'SubField': ['Artificial Intelligence', 'Software Engineering', 'Databases'],
        'Doctorate': ['Harvard University','Brown University', 'Northeastern University']
    }s
*/
let candidateFields: {[index: string]:any} = {};

async function updateCandidateFields(tableRowChildren: HTMLCollection) {
    for (let i = 0; i < tableRowChildren.length; i++) {
        const columnLabelText: string = getColumnLabelText(getColumnLabel(i));
        const cellValue = tableRowChildren[i].textContent.trim();
        if (cellValue !== '' && columnLabelText !== 'FullName') {
            if(columnLabelText in candidateFields) {
                if(!candidateFields[columnLabelText].includes(cellValue)) {
                    candidateFields[columnLabelText].push(cellValue);
                }
            } else {
                candidateFields[columnLabelText] = [cellValue];
            }
        }
    }
    console.log(candidateFields);
    return candidateFields;
}

async function getRandomData() {
    const n: number = tableDataManager.source.length;
    const tableRowChildren = tableDataManager.source[randomRowPosition(n)].element_.children;
    return updateCandidateFields(tableRowChildren);
}

async function getDataBaitValues(tableCellElement: HTMLTableCellElement) {
    candidateFields = {};
    if (tableCellElement !== null && tableCellElement !== undefined) {
        const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
        //idRow = tableRow.getAttribute('data-id');
        await updateCandidateFields(tableRow.children);
    } else {
        console.log('get random row/s');
        await getRandomData();
    }
    const databaits = await getDatabait();
    console.log(databaits);
}

function updateDataBaitHTML(databait: string) {
    dataBaitText.innerHTML = ``;
}

function openModal() {
    activateKeyListener();
    dataBaitModal.style.display = 'block';
}

function closeModal() {
    deactivateKeyListener();
    dataBaitModal.style.display = 'none';
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

export function activaterDataBait(tableCellElement: HTMLTableCellElement) {
   getDataBaitValues(tableCellElement);
   openModal();
}