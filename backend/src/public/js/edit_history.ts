const editHistoryTable: HTMLTableElement = document.getElementById('table-edit-history') as HTMLTableElement;

const offset = new Date().getTimezoneOffset(); // 

function cleanDateNumber(val: number, month: boolean = false) {
    let converted = val;
    if (month) {
        converted++;
    }
    if (converted >= 10) {
        return converted;
    } else {
        return `0${converted}`;
    }
}

function convertDay(val: number) {
    if (val >= 10) {
        return val;
    } else {
        return `0${val}`;
    }
}

function convertDateToLocalTimezone(date: string) {
    const myDate = new Date(date);
    const convertedDate = new Date(myDate.getTime() - offset * 60000);
    
    return convertedDate.getFullYear() + '-' + 
    cleanDateNumber(convertedDate.getMonth(), true) + '-' + 
    cleanDateNumber(convertedDate.getDate())  + ' ' + 
    cleanDateNumber(convertedDate.getHours()) + ':' + 
    cleanDateNumber(convertedDate.getMinutes());
}

console.log(editHistoryTable.rows.length);
for (let i = 1; i < editHistoryTable.rows.length; i++) {
    const row: HTMLTableRowElement = editHistoryTable.rows[i];
    row.cells[0].innerHTML = convertDateToLocalTimezone(row.cells[0].innerHTML);
}