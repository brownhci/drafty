import { StatusMode, tableFoot } from "./table-foot";

const navBar: HTMLElement = document.getElementById("navbar-nav");

const deleteRowModal: HTMLElement = document.getElementById("deleteRowModal");
const btnCloseModal: HTMLElement = document.getElementById("btn-modal-close");

const navBarNewRow: HTMLElement = document.createElement("li");
navBarNewRow.className = "navbar-item";
navBarNewRow.innerHTML = `
                        <li class="nav-item">
                            <span id="navbar-addrow">
                                Add Row
                            </span>
                        </li>`;

const navBarDelRow: HTMLElement = document.createElement("li");
navBarDelRow.className = "navbar-item";
navBarDelRow.innerHTML = `
                        <li class="nav-item">
                                <span id="navbar-delrow">
                                    Del Row
                                </span>
                            </a>
                        </li>`;

const navBarEditHistory: HTMLElement = document.createElement("li");
navBarEditHistory.className = "navbar-item";
navBarEditHistory.innerHTML = `
                        <li class="nav-item">
                            <a href="/csprofessors/edit_history">
                                <span id="navbar-credits">
                                    Edit History
                                </span>
                            </a>
                        </li>`;

navBar.appendChild(navBarEditHistory);

navBar.appendChild(navBarNewRow);
navBarNewRow.addEventListener("click", function(event: MouseEvent) {
    tableFoot.toggle(StatusMode.Insertion);
    event.stopPropagation();
}, true);

navBar.appendChild(navBarDelRow);
navBarDelRow.addEventListener("click", function(event: MouseEvent) {
    deleteRowModal.style.display = "block";
    event.stopPropagation();
}, true);

btnCloseModal.addEventListener("click", function(event: MouseEvent) {
    deleteRowModal.style.display = "none";
    event.stopPropagation();
}, true);