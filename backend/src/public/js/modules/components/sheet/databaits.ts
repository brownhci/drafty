import { getColumnIndex, getColumnLabel, getColumnLabelText } from '../../dom/sheet';
import { getEnclosingTableRow } from '../../dom/navigate';
import { recordDatabaitNextAction, recordDatabaitTweetNextAction } from '../../api/record-interactions';
import { DatabaitCreateType, InteractionTypeDatabaitCreate, DatabaitAction }  from '../../../../../types/databaits';
import { getJSON } from '../../api/requests';
import { postTweet } from '../../api/endpoints';

interface Databait {
    idDatabait: string | number,
    sentence: string,
    labels: Array<string>,
    columns: Array<string>,
    candidate_values: Record<string, Array<string>>,
    idDatabaitTweet: string | number,
    tweetURL: string,
    tweetActive: boolean,
}

// eslint-disable-next-line prefer-const
let databaitCurrent: Databait = {
    idDatabait: '',
    sentence: '',
    labels: [],
    columns: [],
    candidate_values: {},
    idDatabaitTweet: '',
    tweetURL: '',
    tweetActive: false
};

interface urlBase { // used for random
    idInteractionType: InteractionTypeDatabaitCreate,
    idDatabaitCreateType: DatabaitCreateType,
    idSession: string | number
}

interface urlSimilar extends urlBase {
    idUniqueId: string | number,
    value: string | number,
    rowValues:  Record<string, Array<string | number>>  //string
}

async function getIdSession() {
    const idSession = await getJSON('/usrsession');
    return idSession;
}

const dataBaitTitle: HTMLElement = document.getElementById('databait-modal-title');
const dataBaitModal: HTMLElement = document.getElementById('databait-screen');
const dataBaitText: HTMLElement = document.getElementById('databait-text');
const dataBaitModalClose = <HTMLButtonElement>document.getElementById('dataBaitModalClose');
const tweetBtn = <HTMLButtonElement>document.getElementById('btn-databait-tweet');
const createSimilarBtn = <HTMLButtonElement>document.getElementById('btn-databait-similar');
const createRandomBtn = <HTMLButtonElement>document.getElementById('btn-databait-random');
const conntributionMessage = <HTMLSpanElement>document.getElementById('databait-contribution-confirmation');
const loadingHTML: string = `Creating something awesome...`;
const apiUrlRandom: string = '/api-dyk/v1/databait/random';
const apiUrlSimilar: string = '/api-dyk/v1/databait/similar';

const cssClassColSearch = 'dyk-col-search';
const dataColSearch = 'data-colsearch';

function getSearchInputElement(col: string | number): HTMLInputElement {
    return document.getElementById(`column-search-input${col}`) as HTMLInputElement;
}

function addClickListenersToDatabaitsValues() {
    const databaitLinks = dataBaitText.getElementsByClassName(cssClassColSearch);
    for (let i = 0; i < databaitLinks.length; i++) {
        const element: HTMLElement = databaitLinks[i] as HTMLElement;
        element.addEventListener('click', function(event: MouseEvent) {
            const colPos = element.getAttribute(dataColSearch);
            const searchInputElement: HTMLInputElement = getSearchInputElement(colPos);
            searchInputElement.value = element.textContent;
            const eventInput = new Event('input');
            searchInputElement.dispatchEvent(eventInput);
            dataBaitModal.style.display = 'none';
            recordDatabaitNextAction(databaitCurrent.idDatabait, DatabaitAction.select_value_search, searchInputElement.value);
            if(databaitCurrent.tweetActive) {
                recordDatabaitTweetNextAction(databaitCurrent.idDatabaitTweet, DatabaitAction.select_value_search);
            }
            event.stopPropagation();
        }, true);
    }
}

function convertSentenceToHTML(sentenceOld: string, candidateValues: Record<string, Array<string>>) {
    let sentence: string = sentenceOld;
    for (const column in candidateValues) {
        candidateValues[column].forEach(value => {
            const col_pos = getColumnIndex(column);
            sentence = sentence.replace(value, `<span class="${cssClassColSearch}" ${dataColSearch}="${col_pos}">${value}</span>`);
        });
    }
    return sentence;
}

function updateDatabaitHTML(databait: string) {
    dataBaitText.innerHTML = databait;
}

function resetContributionMessageHTML() {
    conntributionMessage.innerHTML = '';
    dataBaitTitle.innerHTML = 'Did you know?';
}

function addContributionMessageHTML() {
    conntributionMessage.innerHTML = 'Thank you, your contribution will be added in a few minutes.';
    dataBaitTitle.innerHTML = 'Thank you, did you know?';
}

function activateCtrls() {
    if(!databaitCurrent.tweetActive) {
        tweetBtn.disabled = false;
    }
    createSimilarBtn.disabled = false;
    createRandomBtn.disabled = false;
}

function deactivateCtrls() {
    tweetBtn.disabled = true;
    createSimilarBtn.disabled = true;
    createRandomBtn.disabled = true;
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
            // API expects only 1 value per column
            candidateFields[columnLabelText] = cellValue;
        }
    }
    return candidateFields;
}

async function createUrlSimilar(tableCellElement: HTMLTableCellElement, baseUrl: urlBase) {
    const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
    const idRow = tableRow.getAttribute('data-id');
    candidateFields = await updateRowValues(tableRow.children); // 
    const urlSimilar: urlSimilar = {
        idInteractionType: baseUrl.idInteractionType,
        idDatabaitCreateType: baseUrl.idDatabaitCreateType,
        idSession: baseUrl.idSession,
        idUniqueId: idRow,
        value: tableCellElement.innerText,
        rowValues: candidateFields
    };
    return urlSimilar;
}

async function createUrlSimilarExistingDatabait(databait: Databait, baseUrl: urlBase) {

    //candidateFields = await updateRowValues(tableRow.children); // 
    const urlSimilar: urlSimilar = {
        idInteractionType: baseUrl.idInteractionType,
        idDatabaitCreateType: baseUrl.idDatabaitCreateType,
        idSession: baseUrl.idSession,
        idUniqueId: '',
        value: '',
        rowValues: databait.candidate_values
    };
    return urlSimilar;
}

function createBodyDataJSON(urlData: urlBase | urlSimilar) {
    // eslint-disable-next-line prefer-const
    let bodyData: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(urlData)) {
        bodyData[k] = v;
    }
    return bodyData;
}

async function postDatabait(apiUrl: string, urlData: urlBase | urlSimilar) {
    deactivateCtrls();
    const bodyData = JSON.stringify(createBodyDataJSON(urlData));
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyData
    };
    fetch(apiUrl, options)
    .then(response => { return response.json(); })
    .then(data => {
       /* DO SOMETHING HERE :) */
       //console.log(data[0]);
       const databait = data[0];
       databaitCurrent.idDatabait = databait.idDatabait;
       databaitCurrent.sentence = databait.sentence;
       databaitCurrent.labels = databait.labels;
       databaitCurrent.columns = databait.columns;
       databaitCurrent.candidate_values = databait.candidate_values;
       databaitCurrent.idDatabaitTweet = '';
       databaitCurrent.tweetActive = false;
       databaitCurrent.tweetURL = '';
       updateDatabaitHTML(convertSentenceToHTML(databait.sentence, databait.candidate_values));
       addClickListenersToDatabaitsValues();
       activateCtrls();
     }).catch(error => {
        console.error(error);
        dataBaitText.innerHTML = `Oh we are sorry, there was an issue creating a new did you know. Please try again.`;
        activateCtrls();
        tweetBtn.disabled = false;
     });
}

async function postDatabaitTweet(idDatabait: string | number, sentence: string, labels: Array<string>, datasetname: string = 'csprofessors') {
    const tableCellInputFormCSRFInput: HTMLInputElement = document.querySelector('input[name=\'_csrf\']');
    const bodyData = {
        idDatabait: idDatabait,
        sentence: sentence,
        labels: labels,
        datasetname: datasetname,
        '_csrf': tableCellInputFormCSRFInput.value
    };
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
    };
    fetch(postTweet(), options)
    .then(response => { return response.json(); })
    .then(data => {
       /* DO SOMETHING HERE :) */
       //console.log(data);
       databaitCurrent.idDatabaitTweet = data.idDatabaitTweet;
       databaitCurrent.tweetActive = true;
       databaitCurrent.tweetURL = data.tweetURL;
       window.open(data.tweetURL, '_blank');
       activateCtrls();
     }).catch(error => {
        console.error(error);
        dataBaitText.innerHTML = `Oh we are so sorry, something went wrong with the tweet. :(`;
        activateCtrls();
     });
}

dataBaitModalClose.addEventListener('click', function(event: MouseEvent) {
    dataBaitModal.style.display = 'none';
    recordDatabaitNextAction(databaitCurrent.idDatabait, DatabaitAction.window_closed);
    if(databaitCurrent.tweetActive) {
        recordDatabaitTweetNextAction(databaitCurrent.idDatabaitTweet, DatabaitAction.window_closed);
    }
    event.stopPropagation();
}, true);

tweetBtn.addEventListener('click', async function() {
    deactivateCtrls();
    postDatabaitTweet(databaitCurrent.idDatabait, databaitCurrent.sentence, databaitCurrent.labels, 'csprofessors');
}, true);

createSimilarBtn.addEventListener('click', async function() {
    deactivateCtrls();
    const baseUrl: urlBase = { 
        idInteractionType: InteractionTypeDatabaitCreate.modal_like, idDatabaitCreateType: DatabaitCreateType.modal_like, 
        idSession: await getIdSession()
    };
    const urlSimilar: urlSimilar = await createUrlSimilarExistingDatabait(databaitCurrent, baseUrl);
    postDatabait(apiUrlSimilar, urlSimilar);
    recordDatabaitNextAction(databaitCurrent.idDatabait, DatabaitAction.modal_like);
    if(databaitCurrent.tweetActive) {
        recordDatabaitTweetNextAction(databaitCurrent.idDatabaitTweet, DatabaitAction.modal_like);
    }
}, true);

createRandomBtn.addEventListener('click', async function() {
    deactivateCtrls();
    const baseUrl: urlBase = { 
        idInteractionType: InteractionTypeDatabaitCreate.modal_random, idDatabaitCreateType: DatabaitCreateType.modal_random, 
        idSession: await getIdSession() 
    };
    postDatabait(apiUrlRandom, baseUrl);
    recordDatabaitNextAction(databaitCurrent.idDatabait, DatabaitAction.modal_random);
    if(databaitCurrent.tweetActive) {
        recordDatabaitTweetNextAction(databaitCurrent.idDatabaitTweet, DatabaitAction.modal_random);
    }
}, true);

function openModal() {
    dataBaitText.innerHTML = loadingHTML;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    activateKeyListener();
    dataBaitModal.style.display = 'block';
    dataBaitModal.focus();
}

export async function activateDatabait(tableCellElement: HTMLTableCellElement, idInteractionType: InteractionTypeDatabaitCreate, idDatabaitCreateType: DatabaitCreateType) {
    const baseUrl: urlBase = { idInteractionType: idInteractionType, idDatabaitCreateType: idDatabaitCreateType, idSession: await getIdSession()};
    resetContributionMessageHTML();
    // create a databait based on a user's interaction
    if (idDatabaitCreateType === DatabaitCreateType.navbar_menu) {
        postDatabait(apiUrlRandom, baseUrl);
    } else if (idDatabaitCreateType === DatabaitCreateType.modal_random) {
        postDatabait(apiUrlRandom, baseUrl);
    } else if (idDatabaitCreateType === DatabaitCreateType.modal_like) {
        const urlSimilar = await createUrlSimilar(tableCellElement, baseUrl);
        postDatabait(apiUrlSimilar, urlSimilar);
    } else if (idDatabaitCreateType === DatabaitCreateType.right_click) {
        const urlSimilar = await createUrlSimilar(tableCellElement, baseUrl);
        postDatabait(apiUrlSimilar, urlSimilar);
    } else if (idDatabaitCreateType === DatabaitCreateType.edit) {
        const urlSimilar = await createUrlSimilar(tableCellElement, baseUrl);
        addContributionMessageHTML();
        postDatabait(apiUrlSimilar, urlSimilar);
    } else if (idDatabaitCreateType === DatabaitCreateType.new_row) {
        // tableCellElement needs to be a cell in the new row created
        //postDatabait(apiUrlSimilar, createUrlSimilar(tableCellElement, baseUrl));
        addContributionMessageHTML();
        postDatabait(apiUrlRandom, baseUrl);
    } else if (idDatabaitCreateType === DatabaitCreateType.delete_row) {
        // it would be weird to show the data for a deleted row
        addContributionMessageHTML();
        postDatabait(apiUrlRandom, baseUrl);
    }
    openModal();
}

function closeModal() {
    dataBaitModal.style.display = 'none';
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    deactivateKeyListener();
    // record databait modal exit
    recordDatabaitNextAction(databaitCurrent.idDatabait, DatabaitAction.window_closed);
    if(databaitCurrent.tweetActive) {
        recordDatabaitTweetNextAction(databaitCurrent.idDatabaitTweet, DatabaitAction.window_closed);
    }
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

dataBaitModal.addEventListener('click', function(event: MouseEvent) {
    const element = <HTMLElement>event.target;
    if(element.id === 'databait-screen') {
        closeModal();
    }
});
