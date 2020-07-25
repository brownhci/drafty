import { FilterFunction } from "./table-data-manager/ViewFunction";
import { updateTableColumnSearchWidth } from "./column-width";
import { recordColumnSearch } from "../../api/record-interactions";
import { getTableCellText, isColumnSearchInput, tableElement } from "../../dom/sheet";
import { debounce } from "../../utils/debounce";
import { tableDataManager } from "../../../sheet";

let lastSearchColumnIndex: number;
/** indicates whether last search is a full search or a partial search ( */
let isLastSearchPartial: boolean = false;

function updateTableColumnFilter(columnIndex: number, query: string) {
  if (query == "") {
    tableDataManager.deleteFilterFunction(columnIndex);
  } else {
    const queryRegex = new RegExp(query, "i");
    const filter: FilterFunction<HTMLElement> = element => queryRegex.test(getTableCellText((element as HTMLTableRowElement).cells[columnIndex]));
    tableDataManager.addFilterFunction(columnIndex, filter);
  }
}

/* handling partial searches */
tableElement.addEventListener("input", debounce((event: Event) => {
  const target = event.target as HTMLElement;
  if (isColumnSearchInput(target)) {
    // inputting on column search
    const columnSearch = target.parentElement as HTMLTableCellElement;
    lastSearchColumnIndex = columnSearch.cellIndex;
    isLastSearchPartial = true;
    recordColumnSearch(columnSearch, false);
    updateTableColumnFilter(lastSearchColumnIndex, (target as HTMLInputElement).value);
    updateTableColumnSearchWidth(columnSearch);
  }
  event.stopPropagation();
}), true);


/* handling complete searches */
tableElement.addEventListener("blur", function(event: Event) {
  const target: HTMLElement = event.target as HTMLElement;
  if (isColumnSearchInput(target)) {
    const columnSearch = target.parentElement as HTMLTableCellElement;
    // only recording full search when completing a previous partial search
    if(columnSearch.cellIndex === lastSearchColumnIndex && isLastSearchPartial) {
      isLastSearchPartial = false;
      recordColumnSearch(columnSearch, true);
    }
  }
  event.stopPropagation();
}, true);
