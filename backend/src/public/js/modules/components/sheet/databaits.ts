import { getColumnLabel, getColumnLabelText } from '../../dom/sheet';
import { getEnclosingTableRow } from '../../dom/navigate';
import { recordDataBaitCreate, recordDataBaitWindowClosed } from '../../api/record-interactions';
import { DatabaitCreateType, InteractionTypeDatabaitCreate, DatabaitAction }  from '../../../../../types/databaits';

interface Databait {
    idDatabait: string | number,
    sentence: string,
    labels: Array<string>,
    columns: Array<string>
}

// eslint-disable-next-line prefer-const
let databaitCurrent: Databait = {
    idDatabait: '',
    sentence: '',
    labels: [],
    columns: []
};

interface urlBase { // used for random
    idInteractionType: InteractionTypeDatabaitCreate,
    idDatabaitCreateType: DatabaitCreateType
}

interface urlSimilar extends urlBase {
    idUniqueId: string | number,
    value: string | number,
    rowValues: Record<string, string | number> 
}

//let idRow: string = undefined;

const dataBaitModal: HTMLElement = document.getElementById('databait-screen');
const dataBaitText: HTMLElement = document.getElementById('databait-text');
const dataBaitModalClose: HTMLElement = document.getElementById('dataBaitModalClose');
const tweetBtn = <HTMLButtonElement>document.getElementById('btn-databait-tweet');
const createSimilarBtn = <HTMLButtonElement>document.getElementById('btn-databait-similar');
const createRandomBtn = <HTMLButtonElement>document.getElementById('btn-databait-random');

//const databaitLoadingMsg: string = `Creating something awesome...`;

//const apiUrlAll: string = '/api-dyk/v1/databait/all';
//const apiUrlType = (type: string): string => { return `/api-dyk/v1/databait/${type}`; };
const apiUrlRandom: string = '/api-dyk/v1/databait/random';
const apiUrlSimilar: string = '/api-dyk/v1/databait/similar';

const databaitLinks = document.querySelectorAll('a.databait-url');
databaitLinks.forEach( (element,i) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    element.addEventListener('click', (e) => {
        console.log(element.textContent);
        console.log(element.getAttribute('data-col'));
        console.log('done');
    });
});

function updateDataBaitHTML(databait: string) {
    dataBaitText.innerHTML = databait;
}

dataBaitModalClose.addEventListener('click', function(event: MouseEvent) {
    dataBaitModal.style.display = 'none';
    recordDataBaitWindowClosed(databaitCurrent.idDatabait);
    event.stopPropagation();
}, true);

tweetBtn.addEventListener('click', function() {
    console.log('tweetBtn');
    // recordDataBaitTweet()
}, true);
createSimilarBtn.addEventListener('click', function() {
    console.log('createSimilarBtn');
    // recordDataBaitCreate() // similar
}, true);
createRandomBtn.addEventListener('click', function() {
    console.log('createRandomBtn');
    const baseUrl: urlBase = { idInteractionType: InteractionTypeDatabaitCreate.modal_random, idDatabaitCreateType: DatabaitCreateType.modal_random };
    getDatabait(apiUrlRandom, baseUrl);
}, true);

function createUrlDataJSON(urlData: urlBase | urlSimilar): string {
    let url: string = '';
    let i = 0;
    for (const [k, v] of Object.entries(urlData)) {
        let urlValue = v;
        let urlParam = '&';
        if(i === 0) { urlParam = '?'; }
        // SW: TODOY
        if(k === 'rowValues') {
            urlValue = JSON.stringify({'rowValues':urlValue});
        } 
        url += `${urlParam}${k}=${urlValue}`;
        // if k is rowValues we'll need to make something more complicated

        i++;
    }
    return url;
}

async function getDatabait(apiUrl: string, urlData: urlBase | urlSimilar) {
    console.log(`apiUrl = ${apiUrl}`);
    // `/api-dyk/v1/databait/random?idInteractionType=36&idDatabaitCreateType=9`
    const url: string = `${apiUrl}${createUrlDataJSON(urlData)}`;
    const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    fetch(url, options)
    .then(response => { return response.json(); })
    .then(data => {
       /* DO SOMETHING HERE :) */
       //console.log(data[0]);
       const databait = data[0];
       databaitCurrent.idDatabait = databait.idDatabait;
       databaitCurrent.sentence = databait.sentence;
       databaitCurrent.labels = databait.labels;
       databaitCurrent.columns = databait.columns;
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
async function updateRowValues(tableRowChildren: HTMLCollection) {
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
    return candidateFields;
}

function openModal() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    activateKeyListener();
    dataBaitModal.style.display = 'block';
}

function createUrlSimilar(tableCellElement: HTMLTableCellElement, baseUrl: urlBase) {
    candidateFields = {};
    const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
    const idRow = tableRow.getAttribute('data-id');
    candidateFields = updateRowValues(tableRow.children); // 
    const urlSimilar: urlSimilar = {
        idInteractionType: baseUrl.idInteractionType,
        idDatabaitCreateType: baseUrl.idDatabaitCreateType,
        idUniqueId: idRow,
        value: tableCellElement.innerText,
        rowValues: candidateFields
    };
    return urlSimilar;
}

export async function activateDataBait(tableCellElement: HTMLTableCellElement, idInteractionType: InteractionTypeDatabaitCreate, idDatabaitCreateType: DatabaitCreateType) {
    const baseUrl: urlBase = { idInteractionType: idInteractionType, idDatabaitCreateType: idDatabaitCreateType };
    if (idDatabaitCreateType === DatabaitCreateType.navbar_menu) {
        // user has a cell selected
        if (tableCellElement !== null && tableCellElement !== undefined) {
            getDatabait(apiUrlSimilar, createUrlSimilar(tableCellElement, baseUrl));
        } else {
            getDatabait(apiUrlRandom, baseUrl);
        }
    } else if (idDatabaitCreateType === DatabaitCreateType.modal_random) {
        getDatabait(apiUrlRandom, baseUrl);
    } else if (idDatabaitCreateType === DatabaitCreateType.modal_like) {
        // need a row of data from the previous databait, or just push in the same values
        // and generate a random one
        //getDatabait(apiUrlSimilar, createUrlSimilar(tableCellElement, baseUrl));
    } else if (idDatabaitCreateType === DatabaitCreateType.right_click) {
        getDatabait(apiUrlRandom, baseUrl);
    } else if (idDatabaitCreateType === DatabaitCreateType.edit) {
        getDatabait(apiUrlSimilar, createUrlSimilar(tableCellElement, baseUrl));
    } else if (idDatabaitCreateType === DatabaitCreateType.new_row) {
        // tableCellElement needs to be a cell in the new row created
        //getDatabait(apiUrlSimilar, createUrlSimilar(tableCellElement, baseUrl));
    }
    openModal();
}

function closeModal() {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    deactivateKeyListener();
    // record databait modal exit
    //recordDataBaitWindowClosed(idDatabait);
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
