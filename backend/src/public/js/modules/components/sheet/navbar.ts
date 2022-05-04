import { StatusMode, tableFoot } from './table-foot';
import { deleteRow, deleteRowModalErrorActivate } from './delete-row';
import { activateDatabait } from './databaits';
import { activateHelpUs } from './helpus';
import { activeTableCellElement } from '../../../sheet';
import { DatabaitCreateType, InteractionTypeDatabaitCreate } from '../../../../../types/databaits';

const navBarNewRow: HTMLElement = document.getElementById('navbar-addrow-select');
const navBarDelRow: HTMLElement = document.getElementById('navbar-delrow-select');
const navBarDidYouKnow: HTMLElement = document.getElementById('navbar-didyouknow-select');
const navBarHelpUs: HTMLElement = document.getElementById('navbar-helpus-select');
const navBarNewRowMobile: HTMLElement = document.getElementById('navbar-addrow-select-mobile');
const navBarDelRowMobile: HTMLElement = document.getElementById('navbar-delrow-select-mobile');
const navBarDidYouKnowMobile: HTMLElement = document.getElementById('navbar-didyouknow-select-mobile');

function newRowSelected(event: MouseEvent) {
    event.preventDefault();
    tableFoot.toggle(StatusMode.Insertion);
    event.stopPropagation();
}
navBarNewRow.addEventListener('click', function(event: MouseEvent) {
    newRowSelected(event);
}, true);
navBarNewRowMobile.addEventListener('click', function(event: MouseEvent) {
    newRowSelected(event);
}, true);

function deleteRowSelected(event: MouseEvent) {
    event.preventDefault();
    if(activeTableCellElement === null || activeTableCellElement === undefined) {
        deleteRowModalErrorActivate();
    } else {
        deleteRow(activeTableCellElement);
    }
    event.stopPropagation();
}
navBarDelRow.addEventListener('click', function(event: MouseEvent) {
    deleteRowSelected(event);
}, true);
navBarDelRowMobile.addEventListener('click', function(event: MouseEvent) {
    deleteRowSelected(event);
}, true);


function didYouKnowSelect(event: MouseEvent) {
    event.preventDefault();
    activateDatabait(activeTableCellElement,InteractionTypeDatabaitCreate.navbar_menu,DatabaitCreateType.navbar_menu);
    event.stopPropagation();
}
navBarDidYouKnow.addEventListener('click', function(event: MouseEvent) {
    didYouKnowSelect(event);
}, true);
navBarDidYouKnowMobile.addEventListener('click', function(event: MouseEvent) {
    didYouKnowSelect(event);
}, true);

function helpUsSelect(event: MouseEvent) {
    event.preventDefault();
    // activateDatabait(activeTableCellElement,InteractionTypeDatabaitCreate.navbar_menu,DatabaitCreateType.navbar_menu);
    activateHelpUs(activeTableCellElement);
    event.stopPropagation();
}
navBarHelpUs.addEventListener('click', function(event: MouseEvent) {
    helpUsSelect(event);
}, true);
