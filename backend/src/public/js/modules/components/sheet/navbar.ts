import { StatusMode, tableFoot } from "./table-foot";

const navBarAddRow: HTMLElement = document.getElementById("navbar-addrow");

navBarAddRow.addEventListener("click", function(event: MouseEvent) {
    tableFoot.toggle(StatusMode.Insertion);
    event.stopPropagation();
}, true);