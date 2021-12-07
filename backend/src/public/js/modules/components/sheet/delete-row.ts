import { getEnclosingTableRow } from '../../dom/navigate';
import { recordRowDelete } from '../../api/record-interactions';
import { StatusMode, tableFoot } from './table-foot';

let idRow: string = undefined;

const deleteRowModal: HTMLElement = document.getElementById('deleteRowModal');
const deleteRowLabel: HTMLElement = document.getElementById('row-label');
const deleteModalClose: HTMLElement = document.getElementById('deleteModalClose');
const deleteRowComment = <HTMLTextAreaElement>document.getElementById('deleteRowComment');
const submitBtn = <HTMLButtonElement>document.getElementById('btn-delrow-modal-close');

const submitDelRow: string = `<i class="fas fa-times"></i> Submit to Remove Row`;
const needReasonDelRow: string = `Please enter a reason first`;

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
    tableFoot.setStatusTimeout(StatusMode.DeleteSuccess, 4000);
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
    }
}