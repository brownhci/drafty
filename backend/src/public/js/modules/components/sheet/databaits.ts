import { getColumnLabel, getColumnLabelText } from '../../dom/sheet';
import { getEnclosingTableRow } from '../../dom/navigate';
import { recordDataBaitCreate } from '../../api/record-interactions';

//let idRow: string = undefined;

const dataBaitModal: HTMLElement = document.getElementById('databait-screen');
const dataBaitText: HTMLElement = document.getElementById('databait-text');
const dataBaitModalClose: HTMLElement = document.getElementById('dataBaitModalClose');
const tweetBtn = <HTMLButtonElement>document.getElementById('btn-databait-tweet');
const createSimilarBtn = <HTMLButtonElement>document.getElementById('btn-databait-similar');
const createRandomBtn = <HTMLButtonElement>document.getElementById('btn-databait-random');

const databaitLoadingMsg: string = `Creating something awesome...`;

const apiUrlAll: string = '/api-dyk/v1/databait/all';
const apiUrlType = (type: string): string => { return `/api-dyk/v1/databait/${type}`; };
const apiUrlRandom: string = '/api-dyk/v1/databait/random';
const apiUrlSimilar: string = '/api-dyk/v1/databait/similar';

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

async function postDatabait(apiUrl: string, bodyData: any) {
    console.log(`apiUrl = ${apiUrl}`);
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyData
    };
    fetch(apiUrl, options)
    .then(response => { return response.json(); })
    .then(data => {
       /* DO SOMETHING HERE :) */
       console.log(data[0]);
       const databait = data[0];
       updateDataBaitHTML(databait.sentence);
     }).catch(error => console.error(error));
}

async function getDatabait(apiUrl: string, bodyData: any) {
    console.log(`apiUrl = ${apiUrl}`);
    const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    fetch(`/api-dyk/v1/databait/random?idInteractionType=36&idDatabaitCreateType=9`, options)
    .then(response => { return response.json(); })
    .then(data => {
       /* DO SOMETHING HERE :) */
       console.log(data[0]);
       const databait = data[0];
       updateDataBaitHTML(databait.sentence);
     }).catch(error => console.error(error));
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
    //console.log('candidateFields:');
    //console.log(candidateFields);
    return candidateFields;
}
async function getDataBaitValues(tableCellElement: HTMLTableCellElement) {
    candidateFields = {};
    let bodyData: string = '';
    // sw: need to 

    if (tableCellElement !== null && tableCellElement !== undefined) {
        const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
        //idRow = tableRow.getAttribute('data-id');
        candidateFields = await updateCandidateFields(tableRow.children);
        bodyData = JSON.stringify({'fields':candidateFields});
    } else {
        console.log('get random row/s');
        bodyData = JSON.stringify({'idInteractionType':'36', 'idDatabaitCreateType':'9'});
    }

    getDatabait(apiUrlRandom,bodyData);
}

function updateDataBaitHTML(databait: string) {
    dataBaitText.innerHTML = databait;
}

function openModal() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    activateKeyListener();
    dataBaitModal.style.display = 'block';
}

function closeModal() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
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