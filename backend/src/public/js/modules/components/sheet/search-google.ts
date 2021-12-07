import { getEnclosingTableRow } from '../../dom/navigate';
import { recordGoogleSearch } from '../../api/record-interactions';

// sw: TODO - mark in DB which columns someone should search by
function buildGoogleSearchURL(tableRow: HTMLTableRowElement) {
    // https://www.google.com/search?hl=en&q=jeff+huang+brown+university
    let url: string = 'https://www.google.com/search?hl=en&q=';
    for(const cell of tableRow.cells) {
        url += cell.textContent.replace(/\s+/g,'+') + '+';
    }
    return url;
}

export function openGoogleSearch(tableCellElement: HTMLTableCellElement) {
    //console.log("Search Google",tableCellElement);
    const tableRow: HTMLTableRowElement = getEnclosingTableRow(tableCellElement);
    const url: string = buildGoogleSearchURL(tableRow);
    window.open(url);
    // record in DB
    const idSuggestion = tableCellElement.id;
    const idRow = tableRow.getAttribute('data-id');
    recordGoogleSearch(idSuggestion,idRow,tableRow);
}