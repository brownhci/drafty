import { StatusMode, tableFoot } from "./table-foot";

const navBar: HTMLElement = document.getElementById("navbar-nav");
const navBarAddRow: HTMLElement = document.createElement("li");
navBarAddRow.innerHTML = `
            <li class="nav-item">
                <span id="navbar-addrow">
                    Add Row
                </span>
             </li>
`
navBar.appendChild(navBarAddRow);

navBarAddRow.addEventListener("click", function(event: MouseEvent) {
    tableFoot.toggle(StatusMode.Insertion);
    event.stopPropagation();
}, true);