import { StatusMode, tableFoot } from './table-foot';
import { deleteRow } from './delete-row';
import { activateDataBait } from './databaits';
import { activeTableCellElement } from '../../../sheet';
import { DatabaitCreateType, InteractionTypeDatabaitCreate } from '../../../../../types/databaits';

const navBar: HTMLElement = document.getElementById('navbar-nav');

const deleteRowModalError: HTMLElement = document.getElementById('deleteRowModal_error');
const btnCloseModalError: HTMLElement = document.getElementById('btn-delrow-modal-close');

const navBarNewRow: HTMLElement = document.createElement('li');
navBarNewRow.className = 'navbar-item';
navBarNewRow.innerHTML = `
                        <li class="nav-item">
                            <a href="#" class="nav-label">
                                <span id="navbar-addrow">
                                    Add Row
                                </span>
                            </a>
                        </li>`;

const navBarDelRow: HTMLElement = document.createElement('li');
navBarDelRow.className = 'navbar-item';
navBarDelRow.innerHTML = `
                        <li class="nav-item">
                            <a href="#" class="nav-label">
                                <span id="navbar-delrow">
                                    Delete Row
                                </span>
                            </a>
                        </li>`;

const navBarEditHistory: HTMLElement = document.createElement('li');
navBarEditHistory.className = 'navbar-item';
navBarEditHistory.innerHTML = `
                        <li class="nav-item">
                            <a href="/csprofessors/edit_history" class="nav-label">
                                <span id="navbar-credits">
                                    Edit History
                                </span>
                            </a>
                        </li>`;

const navBarDidYouKnow: HTMLElement = document.createElement('li');
navBarDidYouKnow.className = 'navbar-item';
navBarDidYouKnow.innerHTML = `
                        <li class="nav-item">
                            <a href="#" class="nav-label">
                                <span id="navbar-didyouknow">
                                    Did you know
                                </span>
                            </a>
                        </li>`;

navBar.appendChild(navBarEditHistory);
navBar.appendChild(navBarNewRow);
navBar.appendChild(navBarDelRow);
navBar.appendChild(navBarDidYouKnow);

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
