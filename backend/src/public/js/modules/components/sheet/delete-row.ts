import { getEnclosingTableRow } from '../../dom/navigate';
import { recordRowDelete } from '../../api/record-interactions';
import { activateDatabait } from './databaits';
import { DatabaitCreateType, InteractionTypeDatabaitCreate } from '../../../../../types/databaits';

let idRow: string = undefined;

const deleteRowModalError: HTMLElement = document.getElementById('deleteRowModal_error');
const errModalCloseBtn = <HTMLButtonElement>document.getElementById('btn-delrow-error-modal-close');

const deleteRowModal: HTMLElement = document.getElementById('deleteRowModal');
const deleteRowLabel: HTMLElement = document.getElementById('row-label');
const deleteModalClose: HTMLElement = document.getElementById('deleteModalClose');
const deleteRowComment = <HTMLTextAreaElement>document.getElementById('deleteRowComment');
const submitBtn = <HTMLButtonElement>document.getElementById('btn-delrow-modal-close');

const submitDelRow: string = `<i class="fas fa-times"></i> Submit to Remove Row`;
const needReasonDelRow: string = `Please enter a reason first`;


function escKeyListener(event: KeyboardEvent) {
    if(event.key === 'Escape'){
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        modalsClose();
	}
}

function activateKeyListener() {
    document.addEventListener('keydown', (event) => escKeyListener(event));
}

function deactivateKeyListener() {
    document.removeEventListener('keydown', (event) => escKeyListener(event));
}

function modalsClose() {
    deactivateKeyListener();
    deleteRowModal.style.display = 'none';
	deleteRowModalError.style.display = 'none';
}

deleteModalClose.addEventListener('click', function(event: MouseEvent) {
    deleteRowModal.style.display = 'none';
    event.stopPropagation();
}, true);

deleteRowComment.addEventListener('input', function() {
    if (deleteRowComment.value.length > 0) {
        submitBtn.innerHTML = submitDelRow;
        submitBtn.disabled = false;
    } else {
        submitBtn.innerHTML = needReasonDelRow;
        submitBtn.disabled = true;
    }
}, false);

submitBtn.addEventListener('click', function() {
    // idRow, deleteRowComment.value
    recordRowDelete(idRow, deleteRowComment.value);
    deleteRowModal.style.display = 'none';
    // sw: message in databait
    //tableFoot.setStatusTimeout(StatusMode.DeleteSuccess, contributionTimeout);
    activateDatabait(null, InteractionTypeDatabaitCreate.delete_row, DatabaitCreateType.delete_row);
}, true);

function getCSProfessorNameUniv(tableRow: HTMLTableRowElement) {
    return `${tableRow.cells[0].innerText} (${tableRow.cells[1].innerText})`;
}

export function deleteRow(tableCellElement: HTMLTableCellElement) {
    const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
    idRow = tableRow.getAttribute('data-id');
    if (window.location.pathname.includes('csprofessors')) {
        const profToDelete: string = getCSProfessorNameUniv(tableRow);
        deleteRowLabel.innerText = profToDelete;
        deleteRowModal.style.display = 'block';
        activateKeyListener();
    }
}

export function deleteRowModalErrorActivate() {
    deleteRowModalError.style.display = 'block';
    activateKeyListener();
}

errModalCloseBtn.addEventListener('click', function() {
    modalsClose();
}, true);
