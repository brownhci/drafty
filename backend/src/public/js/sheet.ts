let currentActiveTableEntry: null | HTMLElement = null;
const classForClickedTableEntry = "clicked";

function tableEntryOnClick(clickedTableEntry: HTMLElement) {
  if (currentActiveTableEntry) {
    currentActiveTableEntry.classList.remove(classForClickedTableEntry);
    currentActiveTableEntry = null;
  }
  clickedTableEntry.classList.add(classForClickedTableEntry);
  currentActiveTableEntry = clickedTableEntry;

}

const tableElement = document.getElementById("sheet");
// register listeners
tableElement.addEventListener("click", function(event: Event) {
  const target = event.target as HTMLElement;
  const tagName = target.tagName;
  if (tagName === "TD") {
    tableEntryOnClick(target);
  }
});