import { StatusMode, tableFoot } from './table-foot';
import { deleteRow } from './delete-row';
import { activateDataBait } from './databaits';
import { activeTableCellElement } from '../../../sheet';
import { DatabaitCreateType, InteractionTypeDatabaitCreate } from '../../../../../types/databaits';

const deleteRowModalError: HTMLElement = document.getElementById('deleteRowModal_error');
const btnCloseModalError: HTMLElement = document.getElementById('btn-delrow-modal-close');

const navBarNewRow: HTMLElement = document.getElementById('navbar-addrow-select');
const navBarDelRow: HTMLElement = document.getElementById('navbar-delrow-select');
const navBarDidYouKnow: HTMLElement = document.getElementById('navbar-didyouknow-select');

navBarNewRow.addEventListener('click', function(event: MouseEvent) {
    tableFoot.toggle(StatusMode.Insertion);
    event.stopPropagation();
}, true);

navBarDelRow.addEventListener('click', function(event: MouseEvent) {
    if(activeTableCellElement === null || activeTableCellElement === undefined) {
        deleteRowModalError.style.display = 'block';
    } else {
        deleteRow(activeTableCellElement);
    }
    event.stopPropagation();
}, true);

navBarDidYouKnow.addEventListener('click', function(event: MouseEvent) {
    activateDataBait(activeTableCellElement,InteractionTypeDatabaitCreate.navbar_menu,DatabaitCreateType.navbar_menu);
    event.stopPropagation();
}, true);

btnCloseModalError.addEventListener('click', function(event: MouseEvent) {
    deleteRowModalError.style.display = 'none';
    event.stopPropagation();
}, true);
